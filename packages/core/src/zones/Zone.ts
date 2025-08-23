/**
 * zone represents an instanced area in the game world
 * each player has their own instance of a zone
 * monsters do not respawn once killed
 */

import { Entity } from "../entities/Entity";
import { EventBus } from "../events/EventBus";

export interface ZoneData {
  id: string;
  name: string;
  description: string;
  level: number;
  monsterLevel: {
    min: number;
    max: number;
  };
  connections: string[]; // connected zone ids
  monsterPacks: MonsterPack[]; // initial monster spawns
}

export interface MonsterPack {
  id: string;
  monsterType: string;
  count: number;
  position: "entrance" | "middle" | "end" | "boss";
  rarity: "normal" | "magic" | "rare" | "unique";
}

export class Zone {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly level: number;
  public readonly monsterLevel: { min: number; max: number };
  public readonly connections: Set<string>;
  
  private entities: Map<string, Entity> = new Map();
  private monsterPacks: MonsterPack[];
  private cleared: boolean = false;
  private instanceId: string;
  private playerId: string;
  private eventBus?: EventBus;
  
  constructor(data: ZoneData, playerId: string) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.level = data.level;
    this.monsterLevel = data.monsterLevel;
    this.connections = new Set(data.connections);
    this.monsterPacks = [...data.monsterPacks]; // copy so we can track what's been spawned
    this.playerId = playerId;
    this.instanceId = `${data.id}-${playerId}-${Date.now()}`;
  }
  
  /**
   * get the unique instance id for this zone
   */
  getInstanceId(): string {
    return this.instanceId;
  }
  
  /**
   * add an entity to this zone
   */
  addEntity(entity: Entity): void {
    this.entities.set(entity.id, entity);
    
    if (this.eventBus) {
      this.eventBus.emitSync("zone.entity.entered", {
        zoneId: this.id,
        instanceId: this.instanceId,
        entityId: entity.id,
        entityType: entity.type
      });
    }
  }
  
  /**
   * remove an entity from this zone
   */
  removeEntity(entityId: string): boolean {
    const entity = this.entities.get(entityId);
    if (entity) {
      this.entities.delete(entityId);
      
      // check if all monsters are dead
      if (entity.type === "monster" && this.countEntitiesByType("monster") === 0) {
        this.cleared = true;
        
        if (this.eventBus) {
          this.eventBus.emitSync("zone.cleared", {
            zoneId: this.id,
            instanceId: this.instanceId,
            playerId: this.playerId
          });
        }
      }
      
      if (this.eventBus) {
        this.eventBus.emitSync("zone.entity.exited", {
          zoneId: this.id,
          instanceId: this.instanceId,
          entityId: entity.id,
          entityType: entity.type
        });
      }
      
      return true;
    }
    return false;
  }
  
  /**
   * get an entity by id
   */
  getEntity(entityId: string): Entity | undefined {
    return this.entities.get(entityId);
  }
  
  /**
   * get all entities in the zone
   */
  getEntities(): Entity[] {
    return Array.from(this.entities.values());
  }
  
  /**
   * get entities by type
   */
  getEntitiesByType(type: string): Entity[] {
    return this.getEntities().filter(e => e.type === type);
  }
  
  /**
   * count entities by type
   */
  countEntitiesByType(type: string): number {
    return this.getEntitiesByType(type).length;
  }
  
  /**
   * check if zone is connected to another
   */
  isConnectedTo(zoneId: string): boolean {
    return this.connections.has(zoneId);
  }
  
  /**
   * get initial monster packs (for spawning on first entry)
   */
  getMonsterPacks(): ReadonlyArray<MonsterPack> {
    return [...this.monsterPacks];
  }
  
  /**
   * check if zone is cleared of all monsters
   */
  isCleared(): boolean {
    return this.cleared;
  }
  
  /**
   * get progress percentage (monsters killed / total)
   */
  getProgress(): number {
    const totalMonsters = this.monsterPacks.reduce((sum, pack) => sum + pack.count, 0);
    const remainingMonsters = this.countEntitiesByType("monster");
    const killedMonsters = totalMonsters - remainingMonsters;
    
    return totalMonsters > 0 ? (killedMonsters / totalMonsters) * 100 : 100;
  }
  
  /**
   * set event bus
   */
  setEventBus(eventBus: EventBus): void {
    this.eventBus = eventBus;
  }
  
  /**
   * reset zone (for development/testing)
   */
  reset(): void {
    this.entities.clear();
    this.cleared = false;
    this.instanceId = `${this.id}-${this.playerId}-${Date.now()}`;
  }
}