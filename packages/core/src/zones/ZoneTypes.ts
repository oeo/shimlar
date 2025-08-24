/**
 * types for dynamic zone generation system
 */

export interface Position {
  x: number;
  y: number;
}

export interface GridCell {
  x: number;
  y: number;
  type: CellType;
  blocked: boolean;
  discovered: boolean;
  description?: string;
  entities: string[];
  features: CellFeature[];
}

export type CellType = 
  | 'empty'      // walkable terrain
  | 'wall'       // blocks movement
  | 'exit'       // leads to another zone
  | 'waypoint'   // fast travel point
  | 'chest'      // lootable container
  | 'boss'       // boss encounter area
  | 'shrine'     // temporary buff
  | 'npc';       // non-player character

export interface CellFeature {
  type: string;
  name: string;
  description: string;
  interactive: boolean;
  used?: boolean;
  // NPC-specific fields
  npcType?: string;
  sellsCategory?: string[];
}

export interface ZoneGrid {
  cells: Map<string, GridCell>; // "x,y" -> GridCell
  width: number;
  height: number;
  entryPoints: Position[];
  exitPoints: Array<{
    position: Position;
    targetZoneId: string;
    description: string;
  }>;
  waypointPosition?: Position;
  bossPosition?: Position;
}

export interface MonsterSpawn {
  position: Position;
  packType: string;
  monsterTypes: string[];
  packSize: number;
  rarity: 'normal' | 'magic' | 'rare' | 'unique';
  affixes: string[];
  description: string;
}

export interface ZoneTemplate {
  id: string;
  name: string;
  description: string;
  level: number;
  act: number;
  zoneType: ZoneType;
  
  // generation parameters
  generator: GeneratorType;
  size: ZoneSize;
  density: MonsterDensity;
  complexity: LayoutComplexity;
  
  // content
  monsterPool: string[];
  environmentTheme: string;
  hasWaypoint: boolean;
  hasBoss: boolean;
  bossType?: string;
  
  // connections
  prerequisites: ZonePrerequisite[];
  connections: ZoneConnection[];
  
  // features
  specialFeatures: string[];
}

export type ZoneType = 'outdoor' | 'indoor' | 'town' | 'boss' | 'dungeon';
export type GeneratorType = 'linear' | 'cave' | 'dungeon' | 'maze' | 'open';
export type ZoneSize = 'small' | 'medium' | 'large';
export type MonsterDensity = 'sparse' | 'normal' | 'dense';
export type LayoutComplexity = 'simple' | 'moderate' | 'complex';

export interface ZonePrerequisite {
  type: 'zone_cleared' | 'boss_killed' | 'item_possessed' | 'level_requirement';
  value: string | number;
  description: string;
}

export interface ZoneConnection {
  targetZoneId: string;
  bidirectional: boolean;
  description: string;
}

export interface GenerationConfig {
  seed?: number;
  forceLayout?: Partial<ZoneGrid>;
  monsterOverrides?: MonsterSpawn[];
  featureOverrides?: CellFeature[];
}

export interface ZoneInstance {
  template: ZoneTemplate;
  grid: ZoneGrid;
  spawns: MonsterSpawn[];
  playerId: string;
  instanceId: string;
  createdAt: number;
  cleared: boolean;
  progress: number; // 0-100
  waypointUnlocked: boolean;
  visitedCells: Set<string>; // "x,y"
}