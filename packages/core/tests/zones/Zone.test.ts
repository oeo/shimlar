import { describe, it, expect, beforeEach } from "bun:test";
import { Zone, ZoneData } from "../../src/zones/Zone";
import { Entity } from "../../src/entities/Entity";
import { EventBus } from "../../src/events/EventBus";

describe("Zone", () => {
  let zone: Zone;
  let zoneData: ZoneData;
  const playerId = "player-123";

  beforeEach(() => {
    zoneData = {
      id: "the-coast",
      name: "The Coast",
      description: "A rocky coastline",
      level: 1,
      monsterLevel: { min: 1, max: 3 },
      connections: ["the-caves", "town"],
      monsterPacks: [
        { id: "pack1", monsterType: "zombie", count: 5, position: "entrance", rarity: "normal" },
        { id: "pack2", monsterType: "skeleton", count: 3, position: "middle", rarity: "magic" },
        { id: "pack3", monsterType: "rhoa", count: 1, position: "end", rarity: "rare" }
      ]
    };
    zone = new Zone(zoneData, playerId);
  });

  describe("initialization", () => {
    it("should create zone with correct properties", () => {
      expect(zone.id).toBe("the-coast");
      expect(zone.name).toBe("The Coast");
      expect(zone.level).toBe(1);
      expect(zone.monsterLevel.min).toBe(1);
      expect(zone.monsterLevel.max).toBe(3);
    });

    it("should have unique instance id", async () => {
      const instanceId = zone.getInstanceId();
      expect(instanceId).toContain("the-coast");
      expect(instanceId).toContain(playerId);
      
      // wait a tiny bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 1));
      
      const zone2 = new Zone(zoneData, playerId);
      expect(zone2.getInstanceId()).not.toBe(instanceId);
    });

    it("should track connections", () => {
      expect(zone.isConnectedTo("the-caves")).toBe(true);
      expect(zone.isConnectedTo("town")).toBe(true);
      expect(zone.isConnectedTo("invalid")).toBe(false);
    });

    it("should copy monster packs", () => {
      const packs = zone.getMonsterPacks();
      expect(packs.length).toBe(3);
      expect(packs[0]?.monsterType).toBe("zombie");
      expect(packs[0]?.count).toBe(5);
    });
  });

  describe("entity management", () => {
    it("should add entities", () => {
      const entity = new Entity("monster-1", "monster");
      zone.addEntity(entity);
      
      expect(zone.getEntity("monster-1")).toBe(entity);
      expect(zone.getEntities().length).toBe(1);
    });

    it("should remove entities", () => {
      const entity = new Entity("monster-1", "monster");
      zone.addEntity(entity);
      
      const removed = zone.removeEntity("monster-1");
      expect(removed).toBe(true);
      expect(zone.getEntity("monster-1")).toBeUndefined();
    });

    it("should filter entities by type", () => {
      zone.addEntity(new Entity("monster-1", "monster"));
      zone.addEntity(new Entity("monster-2", "monster"));
      zone.addEntity(new Entity("player-1", "player"));
      
      const monsters = zone.getEntitiesByType("monster");
      expect(monsters.length).toBe(2);
      expect(zone.countEntitiesByType("monster")).toBe(2);
      expect(zone.countEntitiesByType("player")).toBe(1);
    });
  });

  describe("zone clearing", () => {
    it("should track when zone is cleared", () => {
      expect(zone.isCleared()).toBe(false);
      
      // add and remove all monsters
      const monster1 = new Entity("monster-1", "monster");
      const monster2 = new Entity("monster-2", "monster");
      zone.addEntity(monster1);
      zone.addEntity(monster2);
      
      zone.removeEntity("monster-1");
      expect(zone.isCleared()).toBe(false); // still one left
      
      zone.removeEntity("monster-2");
      expect(zone.isCleared()).toBe(true); // all gone
    });

    it("should calculate progress", () => {
      expect(zone.getProgress()).toBe(100); // no monsters spawned yet
      
      // simulate spawning all 9 monsters (5 + 3 + 1)
      for (let i = 0; i < 9; i++) {
        zone.addEntity(new Entity(`monster-${i}`, "monster"));
      }
      expect(zone.getProgress()).toBe(0); // all alive
      
      // kill half
      for (let i = 0; i < 4; i++) {
        zone.removeEntity(`monster-${i}`);
      }
      expect(Math.round(zone.getProgress())).toBe(44); // 4/9 killed
      
      // kill all
      for (let i = 4; i < 9; i++) {
        zone.removeEntity(`monster-${i}`);
      }
      expect(zone.getProgress()).toBe(100);
    });
  });

  describe("events", () => {
    it("should emit entity entered event", () => {
      const eventBus = new EventBus();
      let eventData: any = null;
      
      eventBus.on("zone.entity.entered", (data) => {
        eventData = data;
      });
      
      zone.setEventBus(eventBus);
      const entity = new Entity("test-1", "monster");
      zone.addEntity(entity);
      
      expect(eventData).toEqual({
        zoneId: "the-coast",
        instanceId: zone.getInstanceId(),
        entityId: "test-1",
        entityType: "monster"
      });
    });

    it("should emit zone cleared event", () => {
      const eventBus = new EventBus();
      let clearedData: any = null;
      
      eventBus.on("zone.cleared", (data) => {
        clearedData = data;
      });
      
      zone.setEventBus(eventBus);
      
      const monster = new Entity("monster-1", "monster");
      zone.addEntity(monster);
      zone.removeEntity("monster-1");
      
      expect(clearedData).toEqual({
        zoneId: "the-coast",
        instanceId: zone.getInstanceId(),
        playerId: playerId
      });
    });
  });

  describe("reset", () => {
    it("should reset zone state", async () => {
      const monster = new Entity("monster-1", "monster");
      zone.addEntity(monster);
      zone.removeEntity("monster-1");
      
      expect(zone.isCleared()).toBe(true);
      const oldInstanceId = zone.getInstanceId();
      
      // wait to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 1));
      
      zone.reset();
      
      expect(zone.isCleared()).toBe(false);
      expect(zone.getEntities().length).toBe(0);
      expect(zone.getInstanceId()).not.toBe(oldInstanceId);
    });
  });
});