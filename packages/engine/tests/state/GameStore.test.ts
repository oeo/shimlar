import { describe, it, expect, beforeEach } from "bun:test";
import { useGameStore } from "../../state/GameStore";
import { ZoneData } from "@shimlar/core";

describe("GameStore", () => {
  beforeEach(() => {
    // reset store before each test
    useGameStore.getState().resetGame();
  });

  describe("player management", () => {
    it("should create a player", () => {
      const store = useGameStore.getState();
      
      store.createPlayer("TestHero", "marauder");
      
      const state = useGameStore.getState();
      expect(state.player).toBeDefined();
      expect(state.player?.name).toBe("TestHero");
      expect(state.player?.characterClass).toBe("marauder");
      expect(state.player?.level).toBe(1);
      expect(state.playerEntity).toBeDefined();
    });

    it("should create player entity with components", () => {
      const store = useGameStore.getState();
      
      store.createPlayer("TestHero", "marauder");
      
      const state = useGameStore.getState();
      const entity = state.playerEntity;
      
      expect(entity?.hasComponent("stats")).toBe(true);
      expect(entity?.hasComponent("health")).toBe(true);
      expect(entity?.hasComponent("position")).toBe(true);
    });

    it("should set correct base stats for class", () => {
      const store = useGameStore.getState();
      
      store.createPlayer("TestHero", "marauder");
      
      const state = useGameStore.getState();
      const entity = state.playerEntity;
      const stats = entity?.getComponent("stats") as any;
      
      expect(stats?.attributes.strength).toBe(32);
      expect(stats?.attributes.dexterity).toBe(14);
      expect(stats?.attributes.intelligence).toBe(14);
    });
  });

  describe("zone management", () => {
    it("should register zones", () => {
      const zones: ZoneData[] = [
        {
          id: "town",
          name: "Town",
          description: "Safe haven",
          level: 1,
          monsterLevel: { min: 0, max: 0 },
          connections: ["the-coast"],
          monsterPacks: []
        },
        {
          id: "the-coast",
          name: "The Coast",
          description: "Rocky coastline",
          level: 1,
          monsterLevel: { min: 1, max: 3 },
          connections: ["town", "the-caves"],
          monsterPacks: [
            { id: "p1", monsterType: "zombie", count: 5, position: "entrance", rarity: "normal" }
          ]
        }
      ];
      
      const store = useGameStore.getState();
      store.registerZones(zones);
      
      const zoneTemplate = store.zoneManager.getZoneTemplate("town");
      expect(zoneTemplate).toBeDefined();
      expect(zoneTemplate?.name).toBe("Town");
    });

    it("should enter zone", () => {
      const store = useGameStore.getState();
      
      // setup
      store.createPlayer("TestHero", "marauder");
      store.registerZones([
        {
          id: "town",
          name: "Town",
          description: "Safe haven",
          level: 1,
          monsterLevel: { min: 0, max: 0 },
          connections: [],
          monsterPacks: []
        }
      ]);
      
      // enter zone
      store.enterZone("town");
      
      const state = useGameStore.getState();
      expect(state.currentZone).toBeDefined();
      expect(state.currentZone?.id).toBe("town");
      expect(state.player?.currentZoneId).toBe("town");
    });
  });

  describe("combat management", () => {
    it("should start combat", () => {
      const store = useGameStore.getState();
      
      store.startCombat(["enemy1", "enemy2"]);
      
      const state = useGameStore.getState();
      expect(state.combat).toBeDefined();
      expect(state.combat?.active).toBe(true);
      expect(state.combat?.enemies).toEqual(["enemy1", "enemy2"]);
    });

    it("should end combat", () => {
      const store = useGameStore.getState();
      
      store.startCombat(["enemy1"]);
      store.endCombat();
      
      const state = useGameStore.getState();
      expect(state.combat).toBeNull();
    });
  });

  describe("game state", () => {
    it("should pause and resume", () => {
      const store = useGameStore.getState();
      
      expect(store.isPaused).toBe(false);
      
      store.pauseGame();
      expect(useGameStore.getState().isPaused).toBe(true);
      
      store.resumeGame();
      expect(useGameStore.getState().isPaused).toBe(false);
    });

    it("should track save time", async () => {
      const store = useGameStore.getState();
      
      expect(store.lastSaved).toBe(0);
      
      // initialize repository and create a player
      store.initializeRepository(":memory:");
      await store.createPlayer("test-hero", "marauder");
      await store.savePlayer();
      
      const state = useGameStore.getState();
      expect(state.lastSaved).toBeGreaterThan(0);
    });

    it("should reset game", async () => {
      const store = useGameStore.getState();
      
      await store.createPlayer("TestHero", "marauder");
      store.startCombat(["enemy1"]);
      
      store.resetGame();
      
      const state = useGameStore.getState();
      expect(state.player).toBeNull();
      expect(state.playerEntity).toBeNull();
      expect(state.combat).toBeNull();
      expect(state.currentZone).toBeNull();
    });
  });
});