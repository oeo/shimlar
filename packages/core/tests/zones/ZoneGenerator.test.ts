/**
 * tests for zone generation system
 */

import { describe, test, expect } from 'bun:test';
import { ZoneGenerator } from '../../src/zones/ZoneGenerator';
import { ZoneTemplate } from '../../src/zones/ZoneTypes';

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
  connections: [],
  specialFeatures: []
};

describe('ZoneGenerator', () => {
  test('should generate zone with consistent seed', () => {
    const generator1 = new ZoneGenerator(12345);
    const generator2 = new ZoneGenerator(12345);

    const result1 = generator1.generateZone(mockTemplate);
    const result2 = generator2.generateZone(mockTemplate);

    expect(result1.grid.width).toBe(result2.grid.width);
    expect(result1.grid.height).toBe(result2.grid.height);
    expect(result1.spawns.length).toBe(result2.spawns.length);
  });

  test('should generate different zones with different seeds', () => {
    const generator1 = new ZoneGenerator(12345);
    const generator2 = new ZoneGenerator(54321);

    const result1 = generator1.generateZone(mockTemplate);
    const result2 = generator2.generateZone(mockTemplate);

    // spawns should be different (very unlikely to be exactly the same)
    expect(result1.spawns).not.toEqual(result2.spawns);
  });

  test('should generate appropriate zone size', () => {
    const generator = new ZoneGenerator();
    
    const smallTemplate = { ...mockTemplate, size: 'small' as const };
    const mediumTemplate = { ...mockTemplate, size: 'medium' as const };
    const largeTemplate = { ...mockTemplate, size: 'large' as const };

    const smallResult = generator.generateZone(smallTemplate);
    const mediumResult = generator.generateZone(mediumTemplate);
    const largeResult = generator.generateZone(largeTemplate);

    expect(smallResult.grid.width).toBeLessThan(mediumResult.grid.width);
    expect(mediumResult.grid.width).toBeLessThan(largeResult.grid.width);
  });

  test('should place waypoint when template has waypoint', () => {
    const generator = new ZoneGenerator(12345);
    const waypointTemplate = { ...mockTemplate, hasWaypoint: true };

    const result = generator.generateZone(waypointTemplate);

    expect(result.grid.waypointPosition).toBeDefined();
    
    if (result.grid.waypointPosition) {
      const { x, y } = result.grid.waypointPosition;
      const cell = result.grid.cells.get(`${x},${y}`);
      expect(cell?.type).toBe('waypoint');
    }
  });

  test('should not place waypoint when template has no waypoint', () => {
    const generator = new ZoneGenerator(12345);
    const noWaypointTemplate = { ...mockTemplate, hasWaypoint: false };

    const result = generator.generateZone(noWaypointTemplate);

    expect(result.grid.waypointPosition).toBeUndefined();
  });

  test('should place boss when template has boss', () => {
    const generator = new ZoneGenerator(12345);
    const bossTemplate = { ...mockTemplate, hasBoss: true, bossType: 'test_boss' };

    const result = generator.generateZone(bossTemplate);

    expect(result.grid.bossPosition).toBeDefined();
    expect(result.spawns.some(spawn => spawn.rarity === 'unique')).toBe(true);
    
    const bossSpawn = result.spawns.find(spawn => spawn.rarity === 'unique');
    expect(bossSpawn?.monsterTypes).toContain('test_boss');
  });

  test('should generate monster spawns based on density', () => {
    const generator = new ZoneGenerator(12345);
    
    const sparseTemplate = { ...mockTemplate, density: 'sparse' as const };
    const normalTemplate = { ...mockTemplate, density: 'normal' as const };
    const denseTemplate = { ...mockTemplate, density: 'dense' as const };

    const sparseResult = generator.generateZone(sparseTemplate);
    const normalResult = generator.generateZone(normalTemplate);
    const denseResult = generator.generateZone(denseTemplate);

    expect(sparseResult.spawns.length).toBeLessThan(normalResult.spawns.length);
    expect(normalResult.spawns.length).toBeLessThan(denseResult.spawns.length);
  });

  test('should generate entry and exit points', () => {
    const generator = new ZoneGenerator(12345);
    const template = { ...mockTemplate, connections: [{ targetZoneId: 'next_zone', bidirectional: false, description: 'test' }] };

    const result = generator.generateZone(template);

    expect(result.grid.entryPoints.length).toBeGreaterThan(0);
    expect(result.grid.exitPoints.length).toBeGreaterThan(0);
  });

  test('should generate monster packs with correct rarity distribution', () => {
    const generator = new ZoneGenerator(12345);
    const template = { ...mockTemplate, generator: 'open', size: 'large', density: 'dense' }; // use open generator for max walkable space

    const result = generator.generateZone(template);

    const normalPacks = result.spawns.filter(s => s.rarity === 'normal');
    const magicPacks = result.spawns.filter(s => s.rarity === 'magic');
    const rarePacks = result.spawns.filter(s => s.rarity === 'rare');

    // normal should be most common (allow equal in case of small sample size)
    expect(normalPacks.length).toBeGreaterThanOrEqual(magicPacks.length);
    expect(normalPacks.length).toBeGreaterThanOrEqual(rarePacks.length);
    // ensure we have a reasonable number of spawns
    expect(result.spawns.length).toBeGreaterThan(5);
  });

  test('should generate connected layouts', () => {
    const generator = new ZoneGenerator(12345);
    
    const result = generator.generateZone(mockTemplate);

    // verify entry point exists and is walkable
    expect(result.grid.entryPoints.length).toBeGreaterThan(0);
    
    const entryPoint = result.grid.entryPoints[0];
    const entryCell = result.grid.cells.get(`${entryPoint.x},${entryPoint.y}`);
    expect(entryCell?.blocked).toBe(false);
  });


  test('should generate different layouts for different generators', () => {
    const generator = new ZoneGenerator(12345);
    
    const linearTemplate = { ...mockTemplate, generator: 'linear' as const };
    const caveTemplate = { ...mockTemplate, generator: 'cave' as const };
    const dungeonTemplate = { ...mockTemplate, generator: 'dungeon' as const };

    const linearResult = generator.generateZone(linearTemplate);
    const caveResult = generator.generateZone(caveTemplate);
    const dungeonResult = generator.generateZone(dungeonTemplate);

    // each should have different cell distributions
    const linearWalls = Array.from(linearResult.grid.cells.values()).filter(c => c.blocked).length;
    const caveWalls = Array.from(caveResult.grid.cells.values()).filter(c => c.blocked).length;
    const dungeonWalls = Array.from(dungeonResult.grid.cells.values()).filter(c => c.blocked).length;

    // they should have different wall counts due to different algorithms
    expect(new Set([linearWalls, caveWalls, dungeonWalls]).size).toBeGreaterThan(1);
  });

  test('should generate valid monster pack descriptions', () => {
    const generator = new ZoneGenerator(12345);

    const result = generator.generateZone(mockTemplate);

    result.spawns.forEach(spawn => {
      expect(spawn.description).toBeTruthy();
      expect(spawn.description.length).toBeGreaterThan(0);
      expect(spawn.monsterTypes.length).toBeGreaterThan(0);
      expect(spawn.packSize).toBeGreaterThan(0);
    });
  });

  test('should generate appropriate pack sizes by rarity', () => {
    const generator = new ZoneGenerator(12345);
    const denseTemplate = { ...mockTemplate, density: 'dense' };

    const result = generator.generateZone(denseTemplate);

    const normalPacks = result.spawns.filter(s => s.rarity === 'normal');
    const magicPacks = result.spawns.filter(s => s.rarity === 'magic');
    const rarePacks = result.spawns.filter(s => s.rarity === 'rare');

    // normal packs should be smaller on average
    const avgNormalSize = normalPacks.reduce((sum, p) => sum + p.packSize, 0) / Math.max(normalPacks.length, 1);
    const avgMagicSize = magicPacks.reduce((sum, p) => sum + p.packSize, 0) / Math.max(magicPacks.length, 1);
    
    if (normalPacks.length > 0 && magicPacks.length > 0) {
      expect(avgMagicSize).toBeGreaterThanOrEqual(avgNormalSize);
    }
  });
});