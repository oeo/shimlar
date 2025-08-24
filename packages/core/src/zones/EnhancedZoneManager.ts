/**
 * enhanced zone manager with dynamic generation
 */

import { ZoneGenerator } from './ZoneGenerator';
import { EventBus } from '../events/EventBus';
import { 
  ZoneTemplate, 
  ZoneInstance, 
  Position, 
  GenerationConfig,
  GridCell,
  MonsterSpawn
} from './ZoneTypes';

export class EnhancedZoneManager {
  private templates: Map<string, ZoneTemplate> = new Map();
  private instances: Map<string, ZoneInstance> = new Map(); // instanceId -> ZoneInstance
  private playerInstances: Map<string, string[]> = new Map(); // playerId -> instanceIds[]
  private generator: ZoneGenerator;
  private eventBus?: EventBus;

  constructor() {
    this.generator = new ZoneGenerator();
  }

  /**
   * register zone template
   */
  registerTemplate(template: ZoneTemplate): void {
    this.templates.set(template.id, template);
  }

  /**
   * register multiple templates
   */
  registerTemplates(templates: ZoneTemplate[]): void {
    templates.forEach(template => this.registerTemplate(template));
  }

  /**
   * create new zone instance for player
   */
  createZoneInstance(templateId: string, playerId: string, config?: GenerationConfig): ZoneInstance | undefined {
    const template = this.templates.get(templateId);
    if (!template) {
      console.error(`Zone template not found: ${templateId}`);
      return undefined;
    }

    // generate zone
    const { grid, spawns } = this.generator.generateZone(template, config);
    
    // create instance
    const instanceId = `${templateId}-${playerId}-${Date.now()}`;
    const instance: ZoneInstance = {
      template,
      grid,
      spawns,
      playerId,
      instanceId,
      createdAt: Date.now(),
      cleared: false,
      progress: 0,
      waypointUnlocked: false,
      visitedCells: new Set()
    };

    // store instance
    this.instances.set(instanceId, instance);
    
    // track player instances
    if (!this.playerInstances.has(playerId)) {
      this.playerInstances.set(playerId, []);
    }
    this.playerInstances.get(playerId)!.push(instanceId);

    // emit event
    if (this.eventBus) {
      this.eventBus.emitSync('zone.instance.created', {
        instanceId,
        templateId,
        playerId,
        zoneId: template.id
      });
    }

    return instance;
  }

  /**
   * get existing zone instance
   */
  getZoneInstance(instanceId: string): ZoneInstance | undefined {
    return this.instances.get(instanceId);
  }

  /**
   * get or create zone instance for player
   */
  getOrCreateZoneInstance(templateId: string, playerId: string): ZoneInstance | undefined {
    // check if player already has instance of this zone
    const playerInstanceIds = this.playerInstances.get(playerId) || [];
    const existingInstance = playerInstanceIds
      .map(id => this.instances.get(id))
      .find(instance => instance?.template.id === templateId);
    
    if (existingInstance) {
      return existingInstance;
    }

    // create new instance
    return this.createZoneInstance(templateId, playerId);
  }

  /**
   * move player to position in zone
   */
  movePlayerInZone(instanceId: string, newPosition: Position): { success: boolean; description: string; combat?: MonsterSpawn } {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      return { success: false, description: 'Zone instance not found' };
    }

    const cellKey = `${newPosition.x},${newPosition.y}`;
    const cell = instance.grid.cells.get(cellKey);
    
    if (!cell) {
      return { success: false, description: 'Invalid position' };
    }

    if (cell.blocked) {
      return { success: false, description: 'Path is blocked' };
    }

    // mark cell as discovered
    cell.discovered = true;
    instance.visitedCells.add(cellKey);

    // check for waypoint discovery
    if (cell.type === 'waypoint' && instance.template.hasWaypoint && !instance.waypointUnlocked) {
      instance.waypointUnlocked = true;
      
      if (this.eventBus) {
        this.eventBus.emitSync('zone.waypoint.unlocked', {
          instanceId: instance.instanceId,
          playerId: instance.playerId
        });
      }
    }

    // check for combat
    const combat = this.checkForCombat(instance, newPosition);
    
    let description = this.getCellDescription(cell);
    
    if (combat) {
      description += `\n${combat.description} blocks your path!`;
      return { success: true, description, combat };
    }

    return { success: true, description };
  }

  /**
   * get cell at position
   */
  getCellAtPosition(instanceId: string, position: Position): GridCell | undefined {
    const instance = this.instances.get(instanceId);
    if (!instance) return undefined;
    
    return instance.grid.cells.get(`${position.x},${position.y}`);
  }

  /**
   * get available directions from position
   */
  getAvailableDirections(instanceId: string, position: Position): Array<{direction: string, position: Position, description: string}> {
    const instance = this.instances.get(instanceId);
    if (!instance) return [];

    const directions = [
      { name: 'north', dx: 0, dy: -1 },
      { name: 'south', dx: 0, dy: 1 },
      { name: 'east', dx: 1, dy: 0 },
      { name: 'west', dx: -1, dy: 0 }
    ];

    const available = [];
    for (const dir of directions) {
      const newPos = { x: position.x + dir.dx, y: position.y + dir.dy };
      const cell = instance.grid.cells.get(`${newPos.x},${newPos.y}`);
      
      if (cell && !cell.blocked) {
        const description = cell.discovered ? 
          this.getCellDescription(cell) : 
          'An unexplored area';
          
        available.push({
          direction: dir.name,
          position: newPos,
          description
        });
      }
    }

    return available;
  }

  /**
   * defeat monster pack at position
   */
  defeatMonsterPack(instanceId: string, position: Position): { success: boolean; experience: number; loot: string[] } {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      return { success: false, experience: 0, loot: [] };
    }

    // find and remove monster spawn
    const spawnIndex = instance.spawns.findIndex(s => 
      s.position.x === position.x && s.position.y === position.y
    );
    
    if (spawnIndex === -1) {
      return { success: false, experience: 0, loot: [] };
    }

    const spawn = instance.spawns[spawnIndex];
    instance.spawns.splice(spawnIndex, 1);

    // calculate rewards
    const experience = this.calculateExperience(spawn);
    const loot = this.generateLoot(spawn);

    // update progress
    this.updateProgress(instance);

    // emit event
    if (this.eventBus) {
      this.eventBus.emitSync('zone.monster.defeated', {
        instanceId,
        spawn,
        experience,
        loot
      });
    }

    return { success: true, experience, loot };
  }

  /**
   * use waypoint in zone
   */
  useWaypoint(instanceId: string, targetZoneId?: string): { success: boolean; description: string; availableDestinations?: string[] } {
    const instance = this.instances.get(instanceId);
    if (!instance || !instance.waypointUnlocked) {
      return { success: false, description: 'Waypoint not available' };
    }

    if (!targetZoneId) {
      // return available destinations
      const destinations = this.getWaypointDestinations(instance.playerId);
      return { 
        success: true, 
        description: 'Waypoint activated. Choose destination:', 
        availableDestinations: destinations 
      };
    }

    // travel to target zone
    return this.travelToZone(instance.playerId, targetZoneId);
  }

  /**
   * get zone map for display
   */
  getZoneMap(instanceId: string, playerPosition?: Position): string {
    const instance = this.instances.get(instanceId);
    if (!instance) return 'Zone not found';

    return this.generateAsciiMap(instance, playerPosition);
  }

  /**
   * get zone entry position
   */
  getZoneEntryPosition(instanceId: string): Position | undefined {
    const instance = this.instances.get(instanceId);
    if (!instance || instance.grid.entryPoints.length === 0) {
      return undefined;
    }

    return instance.grid.entryPoints[0];
  }

  /**
   * check prerequisites for zone access
   */
  canAccessZone(templateId: string, playerId: string): { canAccess: boolean; missingPrerequisites: string[] } {
    const template = this.templates.get(templateId);
    if (!template) {
      return { canAccess: false, missingPrerequisites: ['Zone template not found'] };
    }

    const missing: string[] = [];
    
    for (const prereq of template.prerequisites) {
      switch (prereq.type) {
        case 'zone_cleared':
          // check if zone is cleared
          if (!this.isZoneCleared(prereq.value as string, playerId)) {
            missing.push(prereq.description);
          }
          break;
        case 'level_requirement':
          // would check player level here
          break;
        // add other prerequisite types as needed
      }
    }

    return { canAccess: missing.length === 0, missingPrerequisites: missing };
  }

  // private helper methods


  private checkForCombat(instance: ZoneInstance, position: Position): MonsterSpawn | undefined {
    return instance.spawns.find(spawn => 
      spawn.position.x === position.x && spawn.position.y === position.y
    );
  }

  private getCellDescription(cell: GridCell): string {
    let description = '';

    switch (cell.type) {
      case 'empty':
        description = 'An open area.';
        break;
      case 'waypoint':
        description = 'A waypoint pulses with mystical energy.';
        break;
      case 'exit':
        description = 'A path leads to another area.';
        break;
      case 'chest':
        description = 'A treasure chest sits here.';
        break;
      case 'hazard':
        description = cell.features[0]?.description || 'Dangerous area.';
        break;
      case 'boss':
        description = 'An ominous presence fills this area.';
        break;
      default:
        description = 'You are here.';
    }

    // add feature descriptions
    cell.features.forEach(feature => {
      if (feature.type !== 'hazard') {
        description += ` ${feature.description}`;
      }
    });

    return description;
  }

  private updateProgress(instance: ZoneInstance): void {
    const totalSpawns = instance.template.hasBoss ? 
      instance.spawns.filter(s => s.rarity === 'unique').length + 
      instance.spawns.filter(s => s.rarity !== 'unique').length :
      instance.spawns.length;
      
    const currentSpawns = instance.spawns.length;
    instance.progress = totalSpawns > 0 ? 
      ((totalSpawns - currentSpawns) / totalSpawns) * 100 : 100;

    if (instance.progress >= 100) {
      instance.cleared = true;
      
      if (this.eventBus) {
        this.eventBus.emitSync('zone.cleared', {
          instanceId: instance.instanceId,
          playerId: instance.playerId,
          templateId: instance.template.id
        });
      }
    }
  }

  private calculateExperience(spawn: MonsterSpawn): number {
    const baseExp = 10;
    let multiplier = 1;

    switch (spawn.rarity) {
      case 'magic': multiplier = 1.5; break;
      case 'rare': multiplier = 2.5; break;
      case 'unique': multiplier = 5; break;
    }

    return Math.floor(baseExp * spawn.packSize * multiplier);
  }

  private generateLoot(spawn: MonsterSpawn): string[] {
    // simplified loot generation
    const loot = [];
    
    if (spawn.rarity === 'rare' || spawn.rarity === 'unique') {
      loot.push('currency_orb');
    }
    
    if (Math.random() < 0.3) {
      loot.push('weapon');
    }
    
    if (Math.random() < 0.2) {
      loot.push('armor');
    }

    return loot;
  }

  private getWaypointDestinations(playerId: string): string[] {
    // return zones with unlocked waypoints for this player
    const destinations = [];
    const playerInstanceIds = this.playerInstances.get(playerId) || [];
    
    for (const instanceId of playerInstanceIds) {
      const instance = this.instances.get(instanceId);
      if (instance?.waypointUnlocked) {
        destinations.push(instance.template.name);
      }
    }

    return destinations;
  }

  private travelToZone(playerId: string, targetZoneId: string): { success: boolean; description: string } {
    // simplified waypoint travel
    return { 
      success: true, 
      description: `Transported to ${targetZoneId}` 
    };
  }

  private isZoneCleared(zoneId: string, playerId: string): boolean {
    const playerInstanceIds = this.playerInstances.get(playerId) || [];
    
    for (const instanceId of playerInstanceIds) {
      const instance = this.instances.get(instanceId);
      if (instance?.template.id === zoneId && instance.cleared) {
        return true;
      }
    }
    
    return false;
  }

  private generateAsciiMap(instance: ZoneInstance, playerPosition?: Position): string {
    const lines: string[] = [];
    const { width, height } = instance.grid;

    for (let y = 0; y < height; y++) {
      let line = '';
      for (let x = 0; x < width; x++) {
        const cell = instance.grid.cells.get(`${x},${y}`);
        
        if (!cell) {
          line += ' ';
          continue;
        }

        if (playerPosition && x === playerPosition.x && y === playerPosition.y) {
          line += '@';
        } else if (!cell.discovered) {
          line += '?';
        } else {
          switch (cell.type) {
            case 'wall': line += '#'; break;
            case 'empty': line += '.'; break;
            case 'waypoint': line += 'W'; break;
            case 'exit': line += 'E'; break;
            case 'chest': line += 'C'; break;
            case 'hazard': line += 'H'; break;
            case 'boss': line += 'B'; break;
            default: line += ' ';
          }
        }
      }
      lines.push(line);
    }

    return lines.join('\n');
  }

  /**
   * set event bus
   */
  setEventBus(eventBus: EventBus): void {
    this.eventBus = eventBus;
  }

  /**
   * cleanup expired instances
   */
  cleanupExpiredInstances(maxAgeMs: number = 900000): void { // 15 minutes
    const now = Date.now();
    const toDelete: string[] = [];

    this.instances.forEach((instance, instanceId) => {
      if (now - instance.createdAt > maxAgeMs) {
        toDelete.push(instanceId);
      }
    });

    toDelete.forEach(instanceId => {
      const instance = this.instances.get(instanceId);
      if (instance) {
        // remove from player tracking
        const playerInstances = this.playerInstances.get(instance.playerId);
        if (playerInstances) {
          const index = playerInstances.indexOf(instanceId);
          if (index >= 0) {
            playerInstances.splice(index, 1);
          }
        }

        this.instances.delete(instanceId);
      }
    });

    if (toDelete.length > 0 && this.eventBus) {
      this.eventBus.emitSync('zone.instances.cleaned', {
        deletedCount: toDelete.length
      });
    }
  }
}