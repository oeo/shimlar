/**
 * tests for enhanced zone manager
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import { EnhancedZoneManager } from '../../zones/EnhancedZoneManager';
import { ZoneTemplate } from '../../zones/ZoneTypes';
import { EventBus } from '../../events/EventBus';

const mockTemplate: ZoneTemplate = {
  id: 'test_zone',
  name: 'Test Zone',
  description: 'A test zone',
  level: 5,
  act: 1,
  zoneType: 'outdoor',
  generator: 'linear',
  size: 'small',
  density: 'normal',
  complexity: 'simple',
  monsterPool: ['zombie', 'skeleton'],
  environmentTheme: 'test',
  hasWaypoint: true,
  hasBoss: false,
  prerequisites: [],
  connections: [
    { targetZoneId: 'next_zone', bidirectional: true, description: 'test connection' }
  ],
  hazards: [],
  specialFeatures: []
};

const bossTemplate: ZoneTemplate = {
  ...mockTemplate,
  id: 'boss_zone',
  name: 'Boss Zone',
  hasBoss: true,
  bossType: 'test_boss'
};

describe('EnhancedZoneManager', () => {
  let manager: EnhancedZoneManager;
  let eventBus: EventBus;

  beforeEach(() => {
    manager = new EnhancedZoneManager();
    eventBus = new EventBus();
    manager.setEventBus(eventBus);
    manager.registerTemplate(mockTemplate);
    manager.registerTemplate(bossTemplate);
  });

  test('should register zone templates', () => {
    const newTemplate: ZoneTemplate = {
      ...mockTemplate,
      id: 'new_zone',
      name: 'New Zone'
    };

    manager.registerTemplate(newTemplate);
    
    // should be able to create instance of new template
    const instance = manager.createZoneInstance('new_zone', 'player1');
    expect(instance).toBeDefined();
    expect(instance?.template.id).toBe('new_zone');
  });

  test('should create zone instances', () => {
    const instance = manager.createZoneInstance('test_zone', 'player1');

    expect(instance).toBeDefined();
    expect(instance?.template.id).toBe('test_zone');
    expect(instance?.playerId).toBe('player1');
    expect(instance?.instanceId).toContain('test_zone-player1');
    expect(instance?.grid).toBeDefined();
    expect(instance?.spawns).toBeDefined();
  });

  test('should return undefined for invalid template', () => {
    const instance = manager.createZoneInstance('invalid_zone', 'player1');
    expect(instance).toBeUndefined();
  });

  test('should get or create zone instances', () => {
    const instance1 = manager.getOrCreateZoneInstance('test_zone', 'player1');
    const instance2 = manager.getOrCreateZoneInstance('test_zone', 'player1');

    expect(instance1).toBeDefined();
    expect(instance2).toBeDefined();
    expect(instance1?.instanceId).toBe(instance2?.instanceId); // should be same instance
  });

  test('should create separate instances for different players', () => {
    const instance1 = manager.createZoneInstance('test_zone', 'player1');
    const instance2 = manager.createZoneInstance('test_zone', 'player2');

    expect(instance1?.instanceId).not.toBe(instance2?.instanceId);
    expect(instance1?.playerId).toBe('player1');
    expect(instance2?.playerId).toBe('player2');
  });

  test('should move player in zone successfully', () => {
    const instance = manager.createZoneInstance('test_zone', 'player1');
    expect(instance).toBeDefined();

    const entryPos = manager.getZoneEntryPosition(instance!.instanceId);
    expect(entryPos).toBeDefined();

    const result = manager.movePlayerInZone(instance!.instanceId, entryPos!);
    expect(result.success).toBe(true);
    expect(result.description).toBeTruthy();
  });

  test('should block movement to invalid positions', () => {
    const instance = manager.createZoneInstance('test_zone', 'player1');
    expect(instance).toBeDefined();

    const invalidPos = { x: -1, y: -1 };
    const result = manager.movePlayerInZone(instance!.instanceId, invalidPos);
    expect(result.success).toBe(false);
  });

  test('should detect combat encounters', () => {
    const instance = manager.createZoneInstance('test_zone', 'player1');
    expect(instance).toBeDefined();

    // find a position with monsters
    const monsterSpawn = instance!.spawns[0];
    if (monsterSpawn) {
      const result = manager.movePlayerInZone(instance!.instanceId, monsterSpawn.position);
      expect(result.combat).toBeDefined();
      expect(result.combat?.description).toBeTruthy();
    }
  });

  test('should get available directions', () => {
    const instance = manager.createZoneInstance('test_zone', 'player1');
    expect(instance).toBeDefined();

    const entryPos = manager.getZoneEntryPosition(instance!.instanceId);
    expect(entryPos).toBeDefined();

    const directions = manager.getAvailableDirections(instance!.instanceId, entryPos!);
    expect(Array.isArray(directions)).toBe(true);
  });

  test('should defeat monster packs', () => {
    const instance = manager.createZoneInstance('test_zone', 'player1');
    expect(instance).toBeDefined();

    const initialSpawnCount = instance!.spawns.length;
    const monsterSpawn = instance!.spawns[0];
    
    if (monsterSpawn) {
      const result = manager.defeatMonsterPack(instance!.instanceId, monsterSpawn.position);
      
      expect(result.success).toBe(true);
      expect(result.experience).toBeGreaterThan(0);
      expect(Array.isArray(result.loot)).toBe(true);
      
      // spawn should be removed
      const updatedInstance = manager.getZoneInstance(instance!.instanceId);
      expect(updatedInstance!.spawns.length).toBe(initialSpawnCount - 1);
    }
  });

  test('should unlock waypoint when discovered', () => {
    const instance = manager.createZoneInstance('test_zone', 'player1');
    expect(instance).toBeDefined();

    // find waypoint position if it exists
    if (instance!.grid.waypointPosition) {
      const waypointPos = instance!.grid.waypointPosition;
      
      // move to waypoint position
      const result = manager.movePlayerInZone(instance!.instanceId, waypointPos);
      expect(result.success).toBe(true);
      
      // waypoint should now be unlocked
      const updatedInstance = manager.getZoneInstance(instance!.instanceId);
      expect(updatedInstance!.waypointUnlocked).toBe(true);
    }
  });

  test('should generate ASCII map', () => {
    const instance = manager.createZoneInstance('test_zone', 'player1');
    expect(instance).toBeDefined();

    const map = manager.getZoneMap(instance!.instanceId);
    expect(typeof map).toBe('string');
    expect(map.length).toBeGreaterThan(0);
  });

  test('should generate ASCII map with player position', () => {
    const instance = manager.createZoneInstance('test_zone', 'player1');
    expect(instance).toBeDefined();

    const entryPos = manager.getZoneEntryPosition(instance!.instanceId);
    const map = manager.getZoneMap(instance!.instanceId, entryPos);
    
    expect(map).toContain('@'); // player marker
  });

  test('should check zone access prerequisites', () => {
    const restrictedTemplate: ZoneTemplate = {
      ...mockTemplate,
      id: 'restricted_zone',
      prerequisites: [
        { type: 'zone_cleared', value: 'test_zone', description: 'Clear test zone first' }
      ]
    };
    
    manager.registerTemplate(restrictedTemplate);

    const access = manager.canAccessZone('restricted_zone', 'player1');
    expect(access.canAccess).toBe(false);
    expect(access.missingPrerequisites.length).toBeGreaterThan(0);
  });

  test('should emit events for zone creation', () => {
    let eventEmitted = false;
    
    eventBus.on('zone.instance.created', () => {
      eventEmitted = true;
    });

    manager.createZoneInstance('test_zone', 'player1');
    expect(eventEmitted).toBe(true);
  });

  test('should emit events for waypoint unlock', () => {
    let waypointEvent = false;
    
    eventBus.on('zone.waypoint.unlocked', () => {
      waypointEvent = true;
    });

    const instance = manager.createZoneInstance('test_zone', 'player1');
    expect(instance).toBeDefined();

    // find and move to waypoint to trigger unlock event
    if (instance!.grid.waypointPosition) {
      const waypointPos = instance!.grid.waypointPosition;
      manager.movePlayerInZone(instance!.instanceId, waypointPos);
      
      expect(waypointEvent).toBe(true);
    }
  });

  test('should emit events for zone cleared', () => {
    let zoneClearedEvent = false;
    
    eventBus.on('zone.cleared', () => {
      zoneClearedEvent = true;
    });

    const instance = manager.createZoneInstance('test_zone', 'player1');
    expect(instance).toBeDefined();

    // defeat all monsters
    while (instance!.spawns.length > 0) {
      const spawn = instance!.spawns[0];
      manager.defeatMonsterPack(instance!.instanceId, spawn.position);
    }

    expect(zoneClearedEvent).toBe(true);
  });

  test('should handle boss zones correctly', () => {
    const config = { seed: 12345 }; // use fixed seed for deterministic results
    const instance = manager.createZoneInstance('boss_zone', 'player1', config);
    expect(instance).toBeDefined();

    // look specifically for boss spawns (packType: 'boss')
    const bossSpawn = instance!.spawns.find(s => s.packType === 'boss');
    expect(bossSpawn).toBeDefined();
    expect(bossSpawn?.rarity).toBe('unique');
    expect(bossSpawn?.monsterTypes).toContain('test_boss');
  });

  test('should track visited cells', () => {
    const instance = manager.createZoneInstance('test_zone', 'player1');
    expect(instance).toBeDefined();

    const entryPos = manager.getZoneEntryPosition(instance!.instanceId);
    manager.movePlayerInZone(instance!.instanceId, entryPos!);

    const updatedInstance = manager.getZoneInstance(instance!.instanceId);
    expect(updatedInstance!.visitedCells.size).toBeGreaterThan(0);
  });

  test('should cleanup expired instances', () => {
    const instance = manager.createZoneInstance('test_zone', 'player1');
    expect(instance).toBeDefined();

    // manually set old creation time
    instance!.createdAt = Date.now() - 1000000; // old timestamp

    manager.cleanupExpiredInstances(900000); // 15 minutes

    // instance should be removed
    const retrievedInstance = manager.getZoneInstance(instance!.instanceId);
    expect(retrievedInstance).toBeUndefined();
  });

  test('should handle waypoint usage', () => {
    const instance = manager.createZoneInstance('test_zone', 'player1');
    expect(instance).toBeDefined();

    // manually unlock waypoint
    instance!.waypointUnlocked = true;

    const waypointResult = manager.useWaypoint(instance!.instanceId);
    expect(waypointResult.success).toBe(true);
    expect(waypointResult.availableDestinations).toBeDefined();
  });

  test('should reject waypoint usage when not unlocked', () => {
    const instance = manager.createZoneInstance('test_zone', 'player1');
    expect(instance).toBeDefined();

    const waypointResult = manager.useWaypoint(instance!.instanceId);
    expect(waypointResult.success).toBe(false);
  });

  test('should get cell at position', () => {
    const instance = manager.createZoneInstance('test_zone', 'player1');
    expect(instance).toBeDefined();

    const entryPos = manager.getZoneEntryPosition(instance!.instanceId);
    const cell = manager.getCellAtPosition(instance!.instanceId, entryPos!);
    
    expect(cell).toBeDefined();
    expect(cell?.x).toBe(entryPos?.x);
    expect(cell?.y).toBe(entryPos?.y);
  });
});