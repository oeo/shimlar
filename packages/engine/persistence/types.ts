/**
 * persistence types for redis and postgresql storage
 */

// serializable player state for database storage
export interface SerializablePlayerState {
  id: string;
  name: string;
  characterClass: string;
  level: number;
  experience: number;
  currentZoneId: string;
  currentZoneInstanceId?: string;
  position: "melee" | "close" | "far";
  
  // entity component data
  stats: {
    strength: number;
    dexterity: number;
    intelligence: number;
  };
  health: {
    current: number;
    maximum: number;
    regenerationRate: number;
  };
  
  // equipment and inventory
  equipment: Record<string, any>; // serialized equipped items
  inventory: any[]; // serialized inventory items
  
  // timestamps
  createdAt: number;
  lastActiveAt: number;
}

// redis session data (fast access, temporary)
export interface GameSessionData {
  playerId: string;
  sessionId: string;
  currentZoneId: string;
  currentZoneInstanceId?: string;
  isInCombat: boolean;
  lastActivity: number;
  
  // combat state (ephemeral)
  combatState?: {
    enemies: string[];
    currentTurn: number;
    playerActions: any[];
  };
}

// postgresql schema interfaces
export interface PlayerRecord {
  id: string;
  name: string;
  character_class: string;
  level: number;
  experience: number;
  stats_data: string; // json
  health_data: string; // json
  equipment_data: string; // json
  inventory_data: string; // json
  current_zone_id: string;
  created_at: Date;
  updated_at: Date;
  last_active_at: Date;
}

export interface GameSessionRecord {
  id: string;
  player_id: string;
  session_data: string; // json
  created_at: Date;
  expires_at: Date;
}