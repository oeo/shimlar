/**
 * procedural zone generation system
 */

import { 
  ZoneTemplate, 
  ZoneGrid, 
  GridCell, 
  Position, 
  MonsterSpawn, 
  GenerationConfig,
  CellType,
  CellFeature
} from './ZoneTypes';

export class ZoneGenerator {
  private random: () => number;

  constructor(seed?: number) {
    // simple seeded random for consistent generation
    this.random = this.createSeededRandom(seed || Math.floor(Math.random() * 1000000));
  }

  /**
   * generate a complete zone from template
   */
  generateZone(template: ZoneTemplate, config?: GenerationConfig): { grid: ZoneGrid; spawns: MonsterSpawn[] } {
    if (config?.seed) {
      this.random = this.createSeededRandom(config.seed);
    }

    // generate base grid
    const grid = this.generateGrid(template);
    
    // generate monster spawns
    const spawns = this.generateMonsterSpawns(template, grid);
    
    // apply overrides if provided
    if (config?.monsterOverrides) {
      spawns.push(...config.monsterOverrides);
    }

    return { grid, spawns };
  }

  /**
   * generate zone grid based on template
   */
  private generateGrid(template: ZoneTemplate): ZoneGrid {
    const { width, height } = this.getSizeDimensions(template.size);
    const cells = new Map<string, GridCell>();
    
    // initialize empty grid
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const key = `${x},${y}`;
        cells.set(key, {
          x, y,
          type: 'empty',
          blocked: false,
          discovered: false,
          entities: [],
          features: []
        });
      }
    }

    // apply generation algorithm
    switch (template.generator) {
      case 'linear':
        this.generateLinearLayout(cells, width, height);
        break;
      case 'cave':
        this.generateCaveLayout(cells, width, height);
        break;
      case 'dungeon':
        this.generateDungeonLayout(cells, width, height);
        break;
      case 'open':
        this.generateOpenLayout(cells, width, height);
        break;
      case 'maze':
        this.generateMazeLayout(cells, width, height);
        break;
    }

    // add special locations
    const entryPoints = this.placeEntryPoints(cells, width, height);
    const exitPoints = this.placeExitPoints(template, cells, width, height);
    const waypointPosition = template.hasWaypoint ? 
      this.placeWaypoint(cells, width, height) : undefined;
    const bossPosition = template.hasBoss ? 
      this.placeBoss(cells, width, height) : undefined;

    // add features
    this.placeFeatures(template, cells, width, height);
    
    // place NPCs in towns
    if (template.zoneType === 'town' || template.specialFeatures.includes('safe_zone')) {
      this.placeNPCs(template, cells, width, height);
    }

    return {
      cells,
      width,
      height,
      entryPoints,
      exitPoints,
      waypointPosition,
      bossPosition
    };
  }

  /**
   * generate monster spawns
   */
  private generateMonsterSpawns(template: ZoneTemplate, grid: ZoneGrid): MonsterSpawn[] {
    const spawns: MonsterSpawn[] = [];
    
    // towns and safe zones should never have any monster spawns (including bosses)
    if (template.zoneType === 'town' || template.specialFeatures.includes('safe_zone')) {
      return spawns;
    }

    const walkableCells = this.getWalkableCells(grid);
    
    // exclude boss position from regular spawns
    const availableSpawnCells = walkableCells.filter(cell => {
      if (grid.bossPosition) {
        return !(cell.x === grid.bossPosition.x && cell.y === grid.bossPosition.y);
      }
      return true;
    });
    
    // calculate spawn count based on density
    const densityMultipliers = { sparse: 0.2, normal: 0.4, dense: 0.6 };
    const spawnCount = Math.floor(availableSpawnCells.length * densityMultipliers[template.density]);
    
    // select random spawn positions
    const spawnPositions = this.shuffleArray([...availableSpawnCells])
      .slice(0, spawnCount);

    for (const pos of spawnPositions) {
      const spawn = this.generateMonsterPack(template, pos);
      spawns.push(spawn);
    }

    // add boss spawn if applicable
    if (template.hasBoss && grid.bossPosition) {
      const bossSpawn = this.generateBossSpawn(template, grid.bossPosition);
      spawns.push(bossSpawn);
    }

    return spawns;
  }

  /**
   * generate individual monster pack
   */
  private generateMonsterPack(template: ZoneTemplate, position: Position): MonsterSpawn {
    // determine pack rarity
    const rarityRoll = this.random();
    let rarity: 'normal' | 'magic' | 'rare' | 'unique' = 'normal';
    if (rarityRoll < 0.01) rarity = 'unique';
    else if (rarityRoll < 0.05) rarity = 'rare';
    else if (rarityRoll < 0.2) rarity = 'magic';

    // select monsters from pool
    const packSize = this.getPackSize(rarity);
    const monsterTypes = this.selectMonsterTypes(template.monsterPool, packSize);
    
    // generate pack type
    const packTypes = ['melee', 'ranged', 'caster', 'mixed'];
    const packType = packTypes[Math.floor(this.random() * packTypes.length)];

    return {
      position,
      packType,
      monsterTypes,
      packSize,
      rarity,
      affixes: this.generateAffixes(rarity),
      description: this.generatePackDescription(monsterTypes, packSize, rarity)
    };
  }

  /**
   * linear layout - single main path with some branches
   */
  private generateLinearLayout(cells: Map<string, GridCell>, width: number, height: number): void {
    // start with all cells blocked
    cells.forEach(cell => {
      cell.type = 'wall';
      cell.blocked = true;
    });

    // create main path from left to right
    const pathY = Math.floor(height / 2);
    
    for (let x = 0; x < width; x++) {
      const cell = cells.get(`${x},${pathY}`)!;
      cell.type = 'empty';
      cell.blocked = false;
    }

    // add some branches
    const branchCount = Math.floor(width / 8);
    for (let i = 0; i < branchCount; i++) {
      const branchX = Math.floor(this.random() * (width - 2)) + 1;
      const branchLength = Math.floor(this.random() * 3) + 2;
      const direction = this.random() < 0.5 ? -1 : 1;
      
      for (let j = 1; j <= branchLength; j++) {
        const branchY = pathY + (j * direction);
        if (branchY >= 0 && branchY < height) {
          const cell = cells.get(`${branchX},${branchY}`)!;
          cell.type = 'empty';
          cell.blocked = false;
        }
      }
    }
  }

  /**
   * cave layout - organic, irregular shape
   */
  private generateCaveLayout(cells: Map<string, GridCell>, width: number, height: number): void {
    // start with all walls
    cells.forEach(cell => {
      cell.type = 'wall';
      cell.blocked = true;
    });

    // cellular automata for cave generation
    const fillPercentage = 0.45;
    
    // initial random fill
    cells.forEach(cell => {
      if (this.random() < fillPercentage) {
        cell.type = 'empty';
        cell.blocked = false;
      }
    });

    // apply cellular automata rules
    for (let iteration = 0; iteration < 5; iteration++) {
      const newCells = new Map<string, GridCell>();
      
      cells.forEach((cell, key) => {
        const neighbors = this.getNeighbors(cell.x, cell.y, cells);
        const wallCount = neighbors.filter(n => n.blocked).length;
        
        const newCell = { ...cell };
        if (wallCount > 4) {
          newCell.type = 'wall';
          newCell.blocked = true;
        } else {
          newCell.type = 'empty';
          newCell.blocked = false;
        }
        newCells.set(key, newCell);
      });
      
      // update cells
      newCells.forEach((cell, key) => cells.set(key, cell));
    }

    // ensure connectivity
    this.ensureConnectivity(cells, width, height);
  }

  /**
   * dungeon layout - rooms connected by corridors
   */
  private generateDungeonLayout(cells: Map<string, GridCell>, width: number, height: number): void {
    // start with all walls
    cells.forEach(cell => {
      cell.type = 'wall';
      cell.blocked = true;
    });

    // generate rooms
    const roomCount = Math.floor((width * height) / 200) + 3;
    const rooms: Array<{x: number, y: number, width: number, height: number}> = [];

    for (let i = 0; i < roomCount; i++) {
      let attempts = 0;
      let room;
      
      do {
        const roomWidth = Math.floor(this.random() * 6) + 4;
        const roomHeight = Math.floor(this.random() * 6) + 4;
        const roomX = Math.floor(this.random() * (width - roomWidth - 2)) + 1;
        const roomY = Math.floor(this.random() * (height - roomHeight - 2)) + 1;
        
        room = { x: roomX, y: roomY, width: roomWidth, height: roomHeight };
        attempts++;
      } while (attempts < 50 && this.roomOverlaps(room, rooms));
      
      if (attempts < 50) {
        rooms.push(room);
        this.carveRoom(room, cells);
      }
    }

    // connect rooms with corridors
    for (let i = 0; i < rooms.length - 1; i++) {
      this.carveCorridorBetweenRooms(rooms[i], rooms[i + 1], cells);
    }
  }

  /**
   * open layout - large open area with scattered obstacles
   */
  private generateOpenLayout(cells: Map<string, GridCell>, width: number, height: number): void {
    // mostly open
    cells.forEach(cell => {
      cell.type = 'empty';
      cell.blocked = false;
    });

    // add some obstacles
    const obstacleCount = Math.floor((width * height) * 0.1);
    for (let i = 0; i < obstacleCount; i++) {
      const x = Math.floor(this.random() * width);
      const y = Math.floor(this.random() * height);
      const cell = cells.get(`${x},${y}`)!;
      cell.type = 'wall';
      cell.blocked = true;
    }
  }

  /**
   * maze layout - complex pathways
   */
  private generateMazeLayout(cells: Map<string, GridCell>, width: number, height: number): void {
    // start with all walls
    cells.forEach(cell => {
      cell.type = 'wall';
      cell.blocked = true;
    });

    // recursive backtracker maze generation
    const stack: Position[] = [];
    const visited = new Set<string>();
    
    // start from random position
    const startX = 1 + Math.floor(this.random() * (width - 2));
    const startY = 1 + Math.floor(this.random() * (height - 2));
    stack.push({ x: startX, y: startY });
    
    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const key = `${current.x},${current.y}`;
      
      if (!visited.has(key)) {
        visited.add(key);
        const cell = cells.get(key)!;
        cell.type = 'empty';
        cell.blocked = false;
      }
      
      const unvisitedNeighbors = this.getUnvisitedNeighbors(current, visited, width, height);
      
      if (unvisitedNeighbors.length > 0) {
        const next = unvisitedNeighbors[Math.floor(this.random() * unvisitedNeighbors.length)];
        stack.push(next);
        
        // carve path between current and next
        const midX = Math.floor((current.x + next.x) / 2);
        const midY = Math.floor((current.y + next.y) / 2);
        const midCell = cells.get(`${midX},${midY}`)!;
        midCell.type = 'empty';
        midCell.blocked = false;
      } else {
        stack.pop();
      }
    }
  }

  // helper methods
  private getSizeDimensions(size: string): { width: number; height: number } {
    switch (size) {
      case 'small': return { width: 15, height: 15 };
      case 'medium': return { width: 25, height: 25 };
      case 'large': return { width: 35, height: 35 };
      default: return { width: 20, height: 20 };
    }
  }

  private getWalkableCells(grid: ZoneGrid): Position[] {
    const walkable: Position[] = [];
    grid.cells.forEach(cell => {
      if (!cell.blocked && cell.type === 'empty') {
        walkable.push({ x: cell.x, y: cell.y });
      }
    });
    return walkable;
  }

  private getPackSize(rarity: string): number {
    switch (rarity) {
      case 'magic': return Math.floor(this.random() * 3) + 2;
      case 'rare': return Math.floor(this.random() * 4) + 3;
      case 'unique': return 1;
      default: return Math.floor(this.random() * 3) + 1;
    }
  }

  private selectMonsterTypes(pool: string[], count: number): string[] {
    const shuffled = this.shuffleArray([...pool]);
    return shuffled.slice(0, Math.min(count, 3));
  }

  private generateAffixes(rarity: string): string[] {
    const affixPool = ['fast', 'tanky', 'regenerating', 'extra_damage', 'elemental'];
    switch (rarity) {
      case 'magic': return this.shuffleArray(affixPool).slice(0, 1);
      case 'rare': return this.shuffleArray(affixPool).slice(0, 2);
      case 'unique': return this.shuffleArray(affixPool).slice(0, 3);
      default: return [];
    }
  }

  private generatePackDescription(types: string[], size: number, rarity: string): string {
    const rarityPrefix = rarity !== 'normal' ? `${rarity} ` : '';
    const sizeText = size === 1 ? 'A' : `${size}`;
    const monsterText = types.length === 1 ? types[0] : `mixed ${types.join(', ')}`;
    return `${sizeText} ${rarityPrefix}${monsterText}`;
  }

  private placeEntryPoints(cells: Map<string, GridCell>, width: number, height: number): Position[] {
    // place entry at left edge
    for (let y = 0; y < height; y++) {
      const cell = cells.get(`0,${y}`)!;
      if (!cell.blocked) {
        return [{ x: 0, y }];
      }
    }
    return [{ x: 0, y: Math.floor(height / 2) }];
  }

  private placeExitPoints(template: ZoneTemplate, cells: Map<string, GridCell>, width: number, height: number): Array<{position: Position, targetZoneId: string, description: string}> {
    const exits = [];
    
    // place exit at right edge
    for (let y = height - 1; y >= 0; y--) {
      const cell = cells.get(`${width - 1},${y}`)!;
      if (!cell.blocked) {
        cell.type = 'exit';
        exits.push({
          position: { x: width - 1, y },
          targetZoneId: template.connections[0]?.targetZoneId || 'next_zone',
          description: 'A path leads deeper into the area'
        });
        break;
      }
    }
    
    return exits;
  }

  private placeWaypoint(cells: Map<string, GridCell>, width: number, height: number): Position {
    // place waypoint in center area
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    
    // find nearest walkable cell to center
    let minDistance = Infinity;
    let bestPosition = { x: centerX, y: centerY };
    
    cells.forEach(cell => {
      if (!cell.blocked) {
        const distance = Math.abs(cell.x - centerX) + Math.abs(cell.y - centerY);
        if (distance < minDistance) {
          minDistance = distance;
          bestPosition = { x: cell.x, y: cell.y };
        }
      }
    });
    
    const cell = cells.get(`${bestPosition.x},${bestPosition.y}`)!;
    cell.type = 'waypoint';
    
    return bestPosition;
  }

  private placeBoss(cells: Map<string, GridCell>, width: number, height: number): Position {
    // place boss at the end of the zone
    for (let x = width - 1; x >= 0; x--) {
      for (let y = 0; y < height; y++) {
        const cell = cells.get(`${x},${y}`)!;
        if (!cell.blocked) {
          cell.type = 'boss';
          return { x, y };
        }
      }
    }
    return { x: width - 1, y: Math.floor(height / 2) };
  }

  private generateBossSpawn(template: ZoneTemplate, position: Position): MonsterSpawn {
    return {
      position,
      packType: 'boss',
      monsterTypes: [template.bossType || 'zone_boss'],
      packSize: 1,
      rarity: 'unique',
      affixes: ['boss', 'extra_life', 'area_damage'],
      description: `The ${template.bossType || 'zone boss'} awaits`
    };
  }

  private placeFeatures(template: ZoneTemplate, cells: Map<string, GridCell>, width: number, height: number): void {
    // don't place chests in towns/safe zones
    if (template.zoneType === 'town' || template.specialFeatures.includes('safe_zone')) {
      return;
    }
    
    const featureCount = Math.floor((width * height) * 0.05);
    const walkableCells = Array.from(cells.values()).filter(c => !c.blocked);
    
    for (let i = 0; i < featureCount && i < walkableCells.length; i++) {
      const cell = walkableCells[Math.floor(this.random() * walkableCells.length)];
      if (cell.type === 'empty') {
        cell.type = 'chest';
        cell.features.push({
          type: 'chest',
          name: 'Treasure Chest',
          description: 'A wooden chest that might contain loot',
          interactive: true,
          used: false
        });
      }
    }
  }

  private placeNPCs(template: ZoneTemplate, cells: Map<string, GridCell>, width: number, height: number): void {
    const npcCount = Math.floor((width * height) * 0.08); // more NPCs than chests in towns
    const walkableCells = Array.from(cells.values()).filter(c => !c.blocked && c.type === 'empty');
    
    const npcTypes = [
      { type: 'weapon_vendor', name: 'Weapons Master', sells: ['weapons', 'ammunition'] },
      { type: 'armor_vendor', name: 'Armorer', sells: ['armor', 'shields'] },
      { type: 'accessory_vendor', name: 'Jeweler', sells: ['rings', 'amulets', 'belts'] },
      { type: 'flask_vendor', name: 'Alchemist', sells: ['flasks', 'potions'] },
      { type: 'general_vendor', name: 'General Merchant', sells: ['consumables', 'misc'] },
      { type: 'waypoint_master', name: 'Waypoint Master', sells: ['waypoint_scrolls'] }
    ];
    
    for (let i = 0; i < Math.min(npcCount, walkableCells.length, 6); i++) {
      const cellIndex = Math.floor(this.random() * walkableCells.length);
      const cell = walkableCells[cellIndex];
      walkableCells.splice(cellIndex, 1); // remove from available cells
      
      const npcType = npcTypes[i % npcTypes.length];
      
      cell.type = 'npc';
      cell.features.push({
        type: 'npc',
        name: npcType.name,
        description: `A friendly ${npcType.name.toLowerCase()} offering goods and services`,
        interactive: true,
        npcType: npcType.type,
        sellsCategory: npcType.sells
      });
    }
  }


  // utility methods
  private createSeededRandom(seed: number): () => number {
    let state = seed;
    return () => {
      state = (state * 9301 + 49297) % 233280;
      return state / 233280;
    };
  }

  private shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  private getNeighbors(x: number, y: number, cells: Map<string, GridCell>): GridCell[] {
    const neighbors = [];
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        const neighbor = cells.get(`${x + dx},${y + dy}`);
        if (neighbor) neighbors.push(neighbor);
      }
    }
    return neighbors;
  }

  private isConnectedToPath(cell: GridCell, cells: Map<string, GridCell>, pathY: number): boolean {
    // simple connectivity check for linear layout
    const neighbors = this.getNeighbors(cell.x, cell.y, cells);
    return neighbors.some(n => !n.blocked);
  }

  private ensureConnectivity(cells: Map<string, GridCell>, width: number, height: number): void {
    // find largest connected component and remove isolated areas
    const visited = new Set<string>();
    const components: string[][] = [];
    
    cells.forEach((cell, key) => {
      if (!cell.blocked && !visited.has(key)) {
        const component = this.floodFill(cell.x, cell.y, cells, visited);
        components.push(component);
      }
    });
    
    // keep largest component, block others
    if (components.length > 1) {
      const largest = components.reduce((prev, current) => 
        current.length > prev.length ? current : prev
      );
      
      components.forEach(component => {
        if (component !== largest) {
          component.forEach(key => {
            const cell = cells.get(key)!;
            cell.type = 'wall';
            cell.blocked = true;
          });
        }
      });
    }
  }

  private floodFill(x: number, y: number, cells: Map<string, GridCell>, visited: Set<string>): string[] {
    const stack = [`${x},${y}`];
    const component: string[] = [];
    
    while (stack.length > 0) {
      const key = stack.pop()!;
      if (visited.has(key)) continue;
      
      const cell = cells.get(key);
      if (!cell || cell.blocked) continue;
      
      visited.add(key);
      component.push(key);
      
      // add neighbors
      const [cellX, cellY] = key.split(',').map(Number);
      for (const [dx, dy] of [[0,1], [0,-1], [1,0], [-1,0]]) {
        const neighborKey = `${cellX + dx},${cellY + dy}`;
        if (!visited.has(neighborKey)) {
          stack.push(neighborKey);
        }
      }
    }
    
    return component;
  }

  private roomOverlaps(room: any, existingRooms: any[]): boolean {
    return existingRooms.some(existing => 
      !(room.x + room.width < existing.x || 
        existing.x + existing.width < room.x ||
        room.y + room.height < existing.y ||
        existing.y + existing.height < room.y)
    );
  }

  private carveRoom(room: any, cells: Map<string, GridCell>): void {
    for (let x = room.x; x < room.x + room.width; x++) {
      for (let y = room.y; y < room.y + room.height; y++) {
        const cell = cells.get(`${x},${y}`)!;
        cell.type = 'empty';
        cell.blocked = false;
      }
    }
  }

  private carveCorridorBetweenRooms(room1: any, room2: any, cells: Map<string, GridCell>): void {
    const start = { 
      x: room1.x + Math.floor(room1.width / 2), 
      y: room1.y + Math.floor(room1.height / 2) 
    };
    const end = { 
      x: room2.x + Math.floor(room2.width / 2), 
      y: room2.y + Math.floor(room2.height / 2) 
    };
    
    // carve L-shaped corridor
    let current = { ...start };
    
    // horizontal first
    while (current.x !== end.x) {
      const cell = cells.get(`${current.x},${current.y}`)!;
      cell.type = 'empty';
      cell.blocked = false;
      current.x += current.x < end.x ? 1 : -1;
    }
    
    // then vertical
    while (current.y !== end.y) {
      const cell = cells.get(`${current.x},${current.y}`)!;
      cell.type = 'empty';
      cell.blocked = false;
      current.y += current.y < end.y ? 1 : -1;
    }
  }

  private getUnvisitedNeighbors(pos: Position, visited: Set<string>, width: number, height: number): Position[] {
    const neighbors = [];
    const directions = [[0, 2], [2, 0], [0, -2], [-2, 0]];
    
    for (const [dx, dy] of directions) {
      const x = pos.x + dx;
      const y = pos.y + dy;
      
      if (x > 0 && x < width - 1 && y > 0 && y < height - 1) {
        if (!visited.has(`${x},${y}`)) {
          neighbors.push({ x, y });
        }
      }
    }
    
    return neighbors;
  }
}