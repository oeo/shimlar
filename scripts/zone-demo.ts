#!/usr/bin/env bun

/**
 * script to demonstrate different zone generation types with ascii visualization
 */

import { ZoneGenerator } from '../packages/core/zones/ZoneGenerator';
import { ZoneTemplate } from '../packages/core/zones/ZoneTypes';

const createTemplate = (generator: string, size: string, name: string): ZoneTemplate => ({
  id: `demo_${generator}_${size}`,
  name: name,
  description: `A ${size} ${generator} zone for demonstration`,
  level: 5,
  act: 1,
  zoneType: 'outdoor' as const,
  generator: generator as any,
  size: size as any,
  density: 'normal',
  complexity: 'moderate',
  monsterPool: ['zombie', 'skeleton', 'rhoa'],
  environmentTheme: 'demo',
  hasWaypoint: true,
  hasBoss: false,
  prerequisites: [],
  connections: [
    { targetZoneId: 'next_zone', bidirectional: false, description: 'Path to next area' }
  ],
  specialFeatures: []
});

function generateAsciiMap(grid: any, spawns: any[]): string {
  const lines: string[] = [];
  const { width, height } = grid;

  // create spawn lookup
  const spawnLookup = new Map<string, any>();
  spawns.forEach(spawn => {
    const key = `${spawn.position.x},${spawn.position.y}`;
    spawnLookup.set(key, spawn);
  });

  console.log(`\nMap Legend:`);
  console.log(`# = Wall    . = Empty    W = Waypoint    E = Exit`);
  console.log(`M = Monster    R = Rare    U = Unique    C = Chest    N = NPC`);
  console.log(`\n`);

  for (let y = 0; y < height; y++) {
    let line = '';
    for (let x = 0; x < width; x++) {
      const cell = grid.cells.get(`${x},${y}`);
      
      if (!cell) {
        line += ' ';
        continue;
      }

      // check for monsters first
      const spawn = spawnLookup.get(`${x},${y}`);
      if (spawn) {
        switch (spawn.rarity) {
          case 'unique': line += 'U'; break;
          case 'rare': line += 'R'; break;
          default: line += 'M';
        }
      } else {
        // then check cell type
        switch (cell.type) {
          case 'wall': line += '#'; break;
          case 'empty': line += '.'; break;
          case 'waypoint': line += 'W'; break;
          case 'exit': line += 'E'; break;
          case 'chest': line += 'C'; break;
          case 'npc': line += 'N'; break;
          case 'boss': line += 'B'; break;
          default: line += ' ';
        }
      }
    }
    lines.push(line);
  }

  return lines.join('\n');
}

function printZoneStats(grid: any, spawns: any[], template: ZoneTemplate) {
  const totalCells = grid.width * grid.height;
  const walkableCells = Array.from(grid.cells.values()).filter((c: any) => !c.blocked).length;
  const wallCells = Array.from(grid.cells.values()).filter((c: any) => c.blocked).length;
  
  const normalSpawns = spawns.filter(s => s.rarity === 'normal').length;
  const magicSpawns = spawns.filter(s => s.rarity === 'magic').length;
  const rareSpawns = spawns.filter(s => s.rarity === 'rare').length;
  const uniqueSpawns = spawns.filter(s => s.rarity === 'unique').length;

  console.log(`Zone: ${template.name}`);
  console.log(`Generator: ${template.generator} | Size: ${template.size} | Grid: ${grid.width}x${grid.height}`);
  console.log(`Cells: ${totalCells} total, ${walkableCells} walkable (${Math.round(walkableCells/totalCells*100)}%), ${wallCells} walls`);
  console.log(`Spawns: ${spawns.length} total (${normalSpawns} normal, ${magicSpawns} magic, ${rareSpawns} rare, ${uniqueSpawns} unique)`);
  console.log(`Waypoint: ${grid.waypointPosition ? `(${grid.waypointPosition.x}, ${grid.waypointPosition.y})` : 'none'}`);
  console.log(`Entry: ${grid.entryPoints[0] ? `(${grid.entryPoints[0].x}, ${grid.entryPoints[0].y})` : 'none'}`);
  console.log(`Exits: ${grid.exitPoints.length} exit(s)`);
  if (grid.exitPoints.length > 0) {
    grid.exitPoints.forEach((exit, i) => {
      console.log(`  Exit ${i+1}: (${exit.position.x}, ${exit.position.y}) -> ${exit.targetZoneId}`);
    });
  }
}

async function main() {
  console.log('🗺️  Zone Generation Demo\n');
  console.log('='.repeat(80));

  const generator = new ZoneGenerator(12345); // fixed seed for consistent results
  
  const templates = [
    createTemplate('linear', 'small', 'Linear Passage'),
    createTemplate('cave', 'medium', 'Natural Cave'),
    createTemplate('dungeon', 'medium', 'Ancient Dungeon'),
    createTemplate('maze', 'small', 'Twisted Maze'),
    createTemplate('open', 'large', 'Open Plains')
  ];

  for (const template of templates) {
    const result = generator.generateZone(template);
    
    console.log('\n' + '='.repeat(80));
    printZoneStats(result.grid, result.spawns, template);
    console.log('\n' + generateAsciiMap(result.grid, result.spawns));
    console.log('='.repeat(80));
    
    // pause for readability
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // demonstrate boss zone
  console.log('\n' + '='.repeat(80));
  console.log('BOSS ZONE EXAMPLE');
  console.log('='.repeat(80));

  const bossTemplate = createTemplate('dungeon', 'small', 'Boss Lair');
  bossTemplate.hasBoss = true;
  bossTemplate.bossType = 'ancient_guardian';
  bossTemplate.density = 'dense';

  const bossResult = generator.generateZone(bossTemplate);
  printZoneStats(bossResult.grid, bossResult.spawns, bossTemplate);
  console.log('\n' + generateAsciiMap(bossResult.grid, bossResult.spawns));
  console.log('='.repeat(80));

  // demonstrate town zone
  console.log('\n' + '='.repeat(80));
  console.log('TOWN ZONE EXAMPLE (SAFE)');
  console.log('='.repeat(80));

  const townTemplate = createTemplate('dungeon', 'small', 'Peaceful Town');
  townTemplate.zoneType = 'town';
  townTemplate.specialFeatures = ['safe_zone', 'vendors'];

  const townResult = generator.generateZone(townTemplate);
  printZoneStats(townResult.grid, townResult.spawns, townTemplate);
  console.log('\n' + generateAsciiMap(townResult.grid, townResult.spawns));
  console.log('='.repeat(80));

  console.log('\n🎮 Zone generation complete! Each zone is unique and procedurally generated.');
  console.log('💡 Use different seeds to generate completely different layouts.');
}

main().catch(console.error);