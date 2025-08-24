// @shimlar/engine - game systems and orchestration
export const version = "0.0.1";

// state management
export { useGameStore, type GameStore, type GameActions, type ExtendedGameState } from "./state/GameStore";
export { 
  type GameState, 
  type PlayerState, 
  type CombatState,
  createInitialGameState 
} from "./state/GameState";

// persistence
export { GameStateRepository } from "./persistence/GameStateRepository";
export type { 
  SerializablePlayerState, 
  GameSessionData, 
  PlayerRecord, 
  GameSessionRecord 
} from "./persistence/types";