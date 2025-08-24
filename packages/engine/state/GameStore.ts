/**
 * zustand store for game state management with persistence
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
import { GameStateRepository } from "../persistence/GameStateRepository";
import { SerializablePlayerState, GameSessionData } from "../persistence/types";

export interface GameActions {
  // persistence actions
  initializeRepository: (dbPath: string, redisClient?: any) => void;
  
  // player actions
  createPlayer: (name: string, characterClass: string) => Promise<void>;
  loadPlayer: (playerId: string) => Promise<boolean>;
  savePlayer: () => Promise<void>;
  
  // session actions
  startSession: (playerId: string) => Promise<string>;
  endSession: () => Promise<void>;
  updateSession: () => Promise<void>;
  
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
  resetGame: () => void;
}

export interface ExtendedGameState extends GameState {
  repository?: GameStateRepository;
  currentSessionId?: string;
}

export type GameStore = ExtendedGameState & GameActions;

export const useGameStore = create<GameStore>()(
  devtools(
    (set, get) => ({
      ...createInitialGameState(),
      repository: undefined,
      currentSessionId: undefined,
      
      // persistence setup
      initializeRepository: (dbPath: string, redisClient?: any) => {
        const repository = new GameStateRepository(dbPath, redisClient);
        set({ repository });
      },
      
      // player management with persistence
      createPlayer: async (name: string, characterClass: string) => {
        const playerId = `player-${Date.now()}`;
        const baseStats = getBaseStatsForClass(characterClass);
        
        // create player state
        const playerState: PlayerState = {
          id: playerId,
          name,
          characterClass,
          level: 1,
          experience: 0,
          currentZoneId: "town",
          position: "melee"
        };
        
        // create serializable state for persistence
        const serializableState: SerializablePlayerState = {
          ...playerState,
          name,
          stats: baseStats,
          health: {
            current: 100,
            maximum: 100,
            regenerationRate: 2
          },
          equipment: {},
          inventory: [],
          createdAt: Date.now(),
          lastActiveAt: Date.now()
        };
        
        // create player entity
        const playerEntity = new Entity(playerId, "player");
        const statsComponent = new StatsComponent(1, baseStats);
        const derivedStats = statsComponent.getDerivedStats();
        
        playerEntity
          .addComponent(statsComponent)
          .addComponent(new HealthComponent(derivedStats.life, 2))
          .addComponent(new PositionComponent(CombatPosition.MELEE));
        
        playerEntity.setEventBus(get().eventBus);
        
        // save to database
        const { repository } = get();
        if (repository) {
          await repository.savePlayer(serializableState);
        }
        
        // emit event
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
      
      loadPlayer: async (playerId: string): Promise<boolean> => {
        const { repository } = get();
        if (!repository) return false;
        
        try {
          const playerData = await repository.loadPlayer(playerId);
          if (!playerData) return false;
          
          // convert to game state
          const playerState: PlayerState = {
            id: playerData.id,
            name: playerData.name,
            characterClass: playerData.characterClass,
            level: playerData.level,
            experience: playerData.experience,
            currentZoneId: playerData.currentZoneId,
            currentZoneInstanceId: playerData.currentZoneInstanceId,
            position: playerData.position
          };
          
          // reconstruct entity from saved data
          const playerEntity = new Entity(playerData.id, "player");
          const statsComponent = new StatsComponent(playerData.level, playerData.stats);
          const derivedStats = statsComponent.getDerivedStats();
          
          playerEntity
            .addComponent(statsComponent)
            .addComponent(new HealthComponent(playerData.health.current, playerData.health.regenerationRate, playerData.health.maximum))
            .addComponent(new PositionComponent(CombatPosition.MELEE));
          
          playerEntity.setEventBus(get().eventBus);
          
          set({
            player: playerState,
            playerEntity
          });
          
          return true;
        } catch (error) {
          console.error("failed to load player:", error);
          return false;
        }
      },
      
      savePlayer: async () => {
        const { player, playerEntity, repository } = get();
        if (!player || !playerEntity || !repository) return;
        
        // extract current state from entity components
        const statsComponent = playerEntity.getComponent<StatsComponent>("stats");
        const healthComponent = playerEntity.getComponent<HealthComponent>("health");
        
        const serializableState: SerializablePlayerState = {
          ...player,
          stats: statsComponent ? statsComponent.attributes : { strength: 20, dexterity: 20, intelligence: 20 },
          health: healthComponent ? {
            current: healthComponent.current,
            maximum: healthComponent.maximum,
            regenerationRate: healthComponent.regeneration
          } : { current: 100, maximum: 100, regenerationRate: 2 },
          equipment: {}, // TODO: extract from equipment manager
          inventory: [], // TODO: extract from inventory
          createdAt: Date.now(), // TODO: preserve original creation time
          lastActiveAt: Date.now()
        };
        
        await repository.savePlayer(serializableState);
        set({ lastSaved: Date.now() });
      },
      
      // session management
      startSession: async (playerId: string): Promise<string> => {
        const sessionId = `session-${playerId}-${Date.now()}`;
        const { repository, currentZone } = get();
        
        if (repository) {
          const sessionData: GameSessionData = {
            playerId,
            sessionId,
            currentZoneId: get().player?.currentZoneId || "town",
            currentZoneInstanceId: currentZone?.getInstanceId(),
            isInCombat: !!get().combat?.active,
            lastActivity: Date.now()
          };
          
          await repository.saveSession(sessionData);
        }
        
        set({ currentSessionId: sessionId });
        return sessionId;
      },
      
      endSession: async () => {
        const { repository, currentSessionId } = get();
        if (repository && currentSessionId) {
          await repository.deleteSession(currentSessionId);
        }
        set({ currentSessionId: undefined });
      },
      
      updateSession: async () => {
        const { repository, currentSessionId, player, currentZone, combat } = get();
        if (!repository || !currentSessionId || !player) return;
        
        const sessionData: GameSessionData = {
          playerId: player.id,
          sessionId: currentSessionId,
          currentZoneId: player.currentZoneId,
          currentZoneInstanceId: currentZone?.getInstanceId(),
          isInCombat: !!combat?.active,
          lastActivity: Date.now(),
          combatState: combat ? {
            enemies: combat.enemies,
            currentTurn: combat.currentTurn,
            playerActions: combat.playerActions
          } : undefined
        };
        
        await repository.saveSession(sessionData);
      },
      
      // zone actions (unchanged)
      registerZones: (zones: ZoneData[]) => {
        get().zoneManager.registerZones(zones);
      },
      
      enterZone: (zoneId: string) => {
        const { player, playerEntity, zoneManager, currentZone } = get();
        if (!player || !playerEntity) return;
        
        if (currentZone) {
          currentZone.removeEntity(playerEntity.id);
        }
        
        const newZone = zoneManager.getOrCreateZoneInstance(zoneId, player.id);
        if (!newZone) {
          console.error(`failed to enter zone: ${zoneId}`);
          return;
        }
        
        newZone.addEntity(playerEntity);
        
        set({
          currentZone: newZone,
          player: {
            ...player,
            currentZoneId: zoneId,
            currentZoneInstanceId: newZone.getInstanceId()
          }
        });
        
        get().eventBus.emitSync("zone.entered", {
          zoneId,
          zoneName: newZone.name,
          characterId: player.id,
          monsterLevel: newZone.monsterLevel.min
        });
        
        // auto-update session
        get().updateSession();
      },
      
      exitZone: () => {
        const { player, playerEntity, currentZone } = get();
        if (!currentZone || !playerEntity) return;
        
        currentZone.removeEntity(playerEntity.id);
        set({ currentZone: null });
      },
      
      // combat actions (unchanged)
      startCombat: (enemyIds: string[]) => {
        const combatState: CombatState = {
          active: true,
          currentTurn: 0,
          enemies: enemyIds,
          playerActions: []
        };
        
        set({ combat: combatState });
        get().eventBus.emitSync("combat.started", { enemyIds });
        get().updateSession(); // update session with combat state
      },
      
      endCombat: () => {
        set({ combat: null });
        get().eventBus.emitSync("combat.ended", {});
        get().updateSession(); // clear combat from session
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
      
      resetGame: () => {
        const newState = createInitialGameState();
        set({ ...newState, repository: get().repository }); // preserve repository
      }
    }),
    {
      name: "shimlar-game"
    }
  )
);

// helper function unchanged
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