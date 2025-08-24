/**
 * tests for zone templates and integration
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import { EnhancedZoneManager } from '../../packages/core/src/zones/EnhancedZoneManager';
import { 
  ZONE_TEMPLATES, 
  getZoneTemplate, 
  getZoneTemplatesByAct, 
  getTownZoneTemplates,
  getBossZoneTemplates 
} from '../../packages/core/src/zones/ZoneTemplates';

describe('Zone Templates', () => {
  test('should have predefined zone templates', () => {
    expect(ZONE_TEMPLATES.length).toBeGreaterThan(0);
  });

  test('should get zone template by id', () => {
    const template = getZoneTemplate('twilight_strand');
    expect(template).toBeDefined();
    expect(template?.id).toBe('twilight_strand');
    expect(template?.name).toBe('The Twilight Strand');
  });

  test('should return undefined for invalid zone id', () => {
    const template = getZoneTemplate('invalid_zone');
    expect(template).toBeUndefined();
  });

  test('should get zone templates by act', () => {
    const act1Templates = getZoneTemplatesByAct(1);
    expect(act1Templates.length).toBeGreaterThan(0);
    act1Templates.forEach(template => {
      expect(template.act).toBe(1);
    });
  });

  test('should get town zone templates', () => {
    const townTemplates = getTownZoneTemplates();
    expect(townTemplates.length).toBeGreaterThan(0);
    townTemplates.forEach(template => {
      expect(template.zoneType).toBe('town');
    });
  });

  test('should get boss zone templates', () => {
    const bossTemplates = getBossZoneTemplates();
    expect(bossTemplates.length).toBeGreaterThan(0);
    bossTemplates.forEach(template => {
      expect(template.hasBoss).toBe(true);
    });
  });

  test('should have valid template structure', () => {
    ZONE_TEMPLATES.forEach(template => {
      expect(template.id).toBeTruthy();
      expect(template.name).toBeTruthy();
      expect(template.description).toBeTruthy();
      expect(template.level).toBeGreaterThan(0);
      expect(template.act).toBeGreaterThan(0);
      expect(['outdoor', 'indoor', 'town', 'boss', 'dungeon']).toContain(template.zoneType);
      expect(['linear', 'cave', 'dungeon', 'maze', 'open']).toContain(template.generator);
      expect(['small', 'medium', 'large']).toContain(template.size);
      expect(['sparse', 'normal', 'dense']).toContain(template.density);
      expect(Array.isArray(template.monsterPool)).toBe(true);
      expect(Array.isArray(template.prerequisites)).toBe(true);
      expect(Array.isArray(template.connections)).toBe(true);
    });
  });

  test('should have proper level progression', () => {
    const act1Templates = getZoneTemplatesByAct(1);
    const act2Templates = getZoneTemplatesByAct(2);
    
    if (act1Templates.length > 0 && act2Templates.length > 0) {
      const maxAct1Level = Math.max(...act1Templates.map(t => t.level));
      const minAct2Level = Math.min(...act2Templates.map(t => t.level));
      
      expect(minAct2Level).toBeGreaterThan(maxAct1Level);
    }
  });
});

describe('Zone Template Integration', () => {
  let manager: EnhancedZoneManager;

  beforeEach(() => {
    manager = new EnhancedZoneManager();
    manager.registerTemplates(ZONE_TEMPLATES);
  });

  test('should create instances from all templates', () => {
    ZONE_TEMPLATES.forEach(template => {
      const instance = manager.createZoneInstance(template.id, 'test_player');
      expect(instance).toBeDefined();
      expect(instance?.template.id).toBe(template.id);
    });
  });

  test('should generate appropriate monster spawns for each template', () => {
    ZONE_TEMPLATES.forEach(template => {
      if (template.zoneType !== 'town') { // towns shouldn't have monsters
        const instance = manager.createZoneInstance(template.id, 'test_player');
        expect(instance).toBeDefined();
        
        if (template.density !== 'sparse' || template.hasBoss) {
          expect(instance!.spawns.length).toBeGreaterThan(0);
        }

        // check boss spawns
        if (template.hasBoss) {
          const bossSpawn = instance!.spawns.find(s => s.rarity === 'unique');
          expect(bossSpawn).toBeDefined();
        }
      }
    });
  });

  test('should respect zone size settings', () => {
    const smallZones = ZONE_TEMPLATES.filter(t => t.size === 'small');
    const mediumZones = ZONE_TEMPLATES.filter(t => t.size === 'medium');
    const largeZones = ZONE_TEMPLATES.filter(t => t.size === 'large');

    if (smallZones.length > 0 && largeZones.length > 0) {
      const smallInstance = manager.createZoneInstance(smallZones[0].id, 'test_player');
      const largeInstance = manager.createZoneInstance(largeZones[0].id, 'test_player');

      expect(smallInstance!.grid.width * smallInstance!.grid.height)
        .toBeLessThan(largeInstance!.grid.width * largeInstance!.grid.height);
    }
  });

  test('should handle town zones correctly', () => {
    const townTemplates = getTownZoneTemplates();
    
    townTemplates.forEach(template => {
      const instance = manager.createZoneInstance(template.id, 'test_player');
      expect(instance).toBeDefined();
      
      // towns should have waypoints
      expect(template.hasWaypoint).toBe(true);
      
      // towns should have minimal or no monster spawns
      const nonBossSpawns = instance!.spawns.filter(s => s.rarity !== 'unique');
      expect(nonBossSpawns.length).toBe(0);
    });
  });

  test('should generate maps for all zone types', () => {
    const generatorTypes = ['linear', 'cave', 'dungeon', 'maze', 'open'];
    
    generatorTypes.forEach(generatorType => {
      const template = ZONE_TEMPLATES.find(t => t.generator === generatorType);
      if (template) {
        const instance = manager.createZoneInstance(template.id, 'test_player');
        expect(instance).toBeDefined();
        
        const map = manager.getZoneMap(instance!.instanceId);
        expect(map).toBeTruthy();
        expect(map.length).toBeGreaterThan(0);
      }
    });
  });

  test('should validate zone connections', () => {
    ZONE_TEMPLATES.forEach(template => {
      template.connections.forEach(connection => {
        expect(connection.targetZoneId).toBeTruthy();
        expect(connection.description).toBeTruthy();
        expect(typeof connection.bidirectional).toBe('boolean');
      });
    });
  });

  test('should validate zone prerequisites', () => {
    ZONE_TEMPLATES.forEach(template => {
      template.prerequisites.forEach(prereq => {
        expect(['zone_cleared', 'boss_killed', 'item_possessed', 'level_requirement'])
          .toContain(prereq.type);
        expect(prereq.value).toBeDefined();
        expect(prereq.description).toBeTruthy();
      });
    });
  });

  test('should simulate full zone progression', () => {
    // simulate playing through twilight strand
    const instance = manager.createZoneInstance('twilight_strand', 'test_player');
    expect(instance).toBeDefined();

    const entryPos = manager.getZoneEntryPosition(instance!.instanceId);
    expect(entryPos).toBeDefined();

    // move to entry position
    let moveResult = manager.movePlayerInZone(instance!.instanceId, entryPos!);
    expect(moveResult.success).toBe(true);

    let currentPos = entryPos!;
    let stepsToExpore = 50; // safety limit

    // explore zone
    while (stepsToExpore > 0) {
      const directions = manager.getAvailableDirections(instance!.instanceId, currentPos);
      if (directions.length === 0) break;

      // try to move in first available direction
      const direction = directions[0];
      moveResult = manager.movePlayerInZone(instance!.instanceId, direction.position);
      
      if (moveResult.success) {
        currentPos = direction.position;
        
        // if there's combat, defeat the monsters
        if (moveResult.combat) {
          const defeatResult = manager.defeatMonsterPack(instance!.instanceId, currentPos);
          expect(defeatResult.success).toBe(true);
        }
      }

      stepsToExpore--;
    }

    // should have made progress
    const finalInstance = manager.getZoneInstance(instance!.instanceId);
    expect(finalInstance!.visitedCells.size).toBeGreaterThan(1);
  });

  test('should handle zone clearing properly', () => {
    // find a small zone with monsters
    const smallZone = ZONE_TEMPLATES.find(t => 
      t.size === 'small' && 
      t.zoneType !== 'town' && 
      t.density !== 'sparse'
    );
    
    if (smallZone) {
      const instance = manager.createZoneInstance(smallZone.id, 'test_player');
      expect(instance).toBeDefined();

      const initialSpawnCount = instance!.spawns.length;
      
      // defeat all monsters
      while (instance!.spawns.length > 0) {
        const spawn = instance!.spawns[0];
        const result = manager.defeatMonsterPack(instance!.instanceId, spawn.position);
        expect(result.success).toBe(true);
      }

      // zone should be cleared
      const clearedInstance = manager.getZoneInstance(instance!.instanceId);
      expect(clearedInstance!.cleared).toBe(true);
      expect(clearedInstance!.progress).toBe(100);
    }
  });
});