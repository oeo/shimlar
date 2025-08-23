/**
 * central game state management
 */

import { Entity } from "@shimlar/core";
import { Zone, ZoneManager } from "@shimlar/core";
import { EventBus } from "@shimlar/core";

export interface PlayerState {
  id: string;
  name: string;
  characterClass: string;
  level: number;
  experience: number;
  currentZoneId: string;
  currentZoneInstanceId?: string;
  position: "melee" | "close" | "far";
}

export interface CombatState {
  active: boolean;
  currentTurn: number;
  enemies: string[]; // entity ids
  playerActions: any[]; // action queue
}

export interface GameState {
  // core state
  player: PlayerState | null;
  playerEntity: Entity | null;
  currentZone: Zone | null;
  combat: CombatState | null;
  
  // game status
  isLoading: boolean;
  isPaused: boolean;
  lastSaved: number;
  
  // managers
  zoneManager: ZoneManager;
  eventBus: EventBus;
}

export function createInitialGameState(): GameState {
  const eventBus = new EventBus();
  const zoneManager = new ZoneManager();
  zoneManager.setEventBus(eventBus);
  
  return {
    player: null,
    playerEntity: null,
    currentZone: null,
    combat: null,
    isLoading: false,
    isPaused: false,
    lastSaved: 0,
    zoneManager,
    eventBus
  };
}