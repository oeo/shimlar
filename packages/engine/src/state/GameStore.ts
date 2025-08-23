/**
 * zustand store for game state management
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { 
  GameState, 
  PlayerState, 
  CombatState, 
  createInitialGameState 
} from "./GameState";
import { 
  Entity, 
  HealthComponent, 
  StatsComponent,
  PositionComponent,
  CombatPosition,
  Zone,
  ZoneData
} from "@shimlar/core";

export interface GameActions {
  // player actions
  createPlayer: (name: string, characterClass: string) => void;
  loadPlayer: (playerData: PlayerState) => void;
  updatePlayerPosition: (position: CombatPosition) => void;
  
  // zone actions
  registerZones: (zones: ZoneData[]) => void;
  enterZone: (zoneId: string) => void;
  exitZone: () => void;
  
  // combat actions
  startCombat: (enemyIds: string[]) => void;
  endCombat: () => void;
  
  // game actions
  pauseGame: () => void;
  resumeGame: () => void;
  saveGame: () => void;
  resetGame: () => void;
}

export type GameStore = GameState & GameActions;

export const useGameStore = create<GameStore>()(
  devtools(
    (set, get) => ({
      ...createInitialGameState(),
      
      // player actions
      createPlayer: (name: string, characterClass: string) => {
        const playerId = `player-${Date.now()}`;
        
        // create player state
        const playerState: PlayerState = {
          id: playerId,
          name,
          characterClass,
          level: 1,
          experience: 0,
          currentZoneId: "town", // starting zone
          position: "melee"
        };
        
        // create player entity
        const playerEntity = new Entity(playerId, "player");
        
        // add components based on class
        const baseStats = getBaseStatsForClass(characterClass);
        const statsComponent = new StatsComponent(1, baseStats);
        const derivedStats = statsComponent.getDerivedStats();
        
        playerEntity
          .addComponent(statsComponent)
          .addComponent(new HealthComponent(derivedStats.life, 2))
          .addComponent(new PositionComponent(CombatPosition.MELEE));
        
        // set event bus on entity
        playerEntity.setEventBus(get().eventBus);
        
        // emit player created event
        get().eventBus.emitSync("character.created", {
          characterId: playerId,
          name,
          class: characterClass,
          level: 1
        });
        
        set({
          player: playerState,
          playerEntity
        });
      },
      
      loadPlayer: (playerData: PlayerState) => {
        // reconstruct player entity from saved data
        const playerEntity = new Entity(playerData.id, "player");
        // TODO: reconstruct components from saved data
        
        set({
          player: playerData,
          playerEntity
        });
      },
      
      updatePlayerPosition: (position: CombatPosition) => {
        const { player, playerEntity } = get();
        if (!player || !playerEntity) return;
        
        const posComponent = playerEntity.getComponent<PositionComponent>("position");
        if (posComponent) {
          posComponent.moveTo(position);
        }
        
        set({
          player: {
            ...player,
            position: position as any
          }
        });
      },
      
      // zone actions
      registerZones: (zones: ZoneData[]) => {
        get().zoneManager.registerZones(zones);
      },
      
      enterZone: (zoneId: string) => {
        const { player, playerEntity, zoneManager, currentZone } = get();
        if (!player || !playerEntity) return;
        
        // leave current zone if any
        if (currentZone) {
          currentZone.removeEntity(playerEntity.id);
        }
        
        // get or create zone instance
        const newZone = zoneManager.getOrCreateZoneInstance(zoneId, player.id);
        if (!newZone) {
          console.error(`failed to enter zone: ${zoneId}`);
          return;
        }
        
        // add player to new zone
        newZone.addEntity(playerEntity);
        
        // update state
        set({
          currentZone: newZone,
          player: {
            ...player,
            currentZoneId: zoneId,
            currentZoneInstanceId: newZone.getInstanceId()
          }
        });
        
        // emit zone entered event
        get().eventBus.emitSync("zone.entered", {
          zoneId,
          zoneName: newZone.name,
          characterId: player.id,
          monsterLevel: newZone.monsterLevel.min
        });
      },
      
      exitZone: () => {
        const { player, playerEntity, currentZone } = get();
        if (!currentZone || !playerEntity) return;
        
        currentZone.removeEntity(playerEntity.id);
        
        set({
          currentZone: null
        });
      },
      
      // combat actions
      startCombat: (enemyIds: string[]) => {
        const combatState: CombatState = {
          active: true,
          currentTurn: 0,
          enemies: enemyIds,
          playerActions: []
        };
        
        set({ combat: combatState });
        
        get().eventBus.emitSync("combat.started", {
          enemyIds
        });
      },
      
      endCombat: () => {
        set({ combat: null });
        
        get().eventBus.emitSync("combat.ended", {});
      },
      
      // game actions
      pauseGame: () => {
        set({ isPaused: true });
        get().eventBus.emitSync("game.paused", {});
      },
      
      resumeGame: () => {
        set({ isPaused: false });
        get().eventBus.emitSync("game.resumed", {});
      },
      
      saveGame: () => {
        const state = get();
        const saveData = {
          player: state.player,
          lastSaved: Date.now()
        };
        
        // TODO: implement actual save to file
        console.log("saving game:", saveData);
        
        set({ lastSaved: Date.now() });
        get().eventBus.emitSync("game.saved", {});
      },
      
      resetGame: () => {
        const newState = createInitialGameState();
        set(newState);
      }
    }),
    {
      name: "shimlar-game"
    }
  )
);

// helper function to get base stats for character class
function getBaseStatsForClass(characterClass: string) {
  const classStats: Record<string, any> = {
    marauder: { strength: 32, dexterity: 14, intelligence: 14 },
    ranger: { strength: 14, dexterity: 32, intelligence: 14 },
    witch: { strength: 14, dexterity: 14, intelligence: 32 },
    duelist: { strength: 23, dexterity: 23, intelligence: 14 },
    templar: { strength: 23, dexterity: 14, intelligence: 23 },
    shadow: { strength: 14, dexterity: 23, intelligence: 23 },
    scion: { strength: 20, dexterity: 20, intelligence: 20 }
  };
  
  return classStats[characterClass.toLowerCase()] || classStats.scion;
}