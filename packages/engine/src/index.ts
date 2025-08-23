// @shimlar/engine - game systems and orchestration
export const version = "0.0.1";

// state management
export { useGameStore, type GameStore, type GameActions } from "./state/GameStore";
export { 
  type GameState, 
  type PlayerState, 
  type CombatState,
  createInitialGameState 
} from "./state/GameState";