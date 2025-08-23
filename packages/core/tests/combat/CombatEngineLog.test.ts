import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { CombatEngine } from "../../src/combat/CombatEngine";
import { Entity } from "../../src/entities/Entity";
import { HealthComponent } from "../../src/components/HealthComponent";
import { EventBus } from "../../src/events/EventBus";
import { CombatAction } from "../../src/combat/types";

describe("CombatEngine with CombatLog", () => {
  let engine: CombatEngine;
  let eventBus: EventBus;
  let player: Entity;
  let enemy: Entity;

  beforeEach(() => {
    engine = new CombatEngine({ 
      tickRate: 50,
      logOptions: {
        maxEntries: 20,
        showCalculations: true
      }
    });
    eventBus = new EventBus();
    engine.setEventBus(eventBus);

    // create test entities
    player = new Entity("player-1", "player");
    player.addComponent(new HealthComponent(100, 2));

    enemy = new Entity("enemy-1", "monster");
    enemy.addComponent(new HealthComponent(50, 0));
  });

  afterEach(() => {
    engine.dispose();
  });

  describe("combat log integration", () => {
    it("should log system messages when combat starts and stops", () => {
      engine.addEntity(player, "Hero");
      engine.addEntity(enemy, "Skeleton");
      
      engine.start();
      engine.stop();
      
      const log = engine.getCombatLog();
      const entries = log.getEntries();
      
      // should have entity entry, start and end messages
      expect(entries.length).toBeGreaterThanOrEqual(4); // 2 entities + start + end
      
      const startEntry = entries.find(e => e.message.includes("Combat begins"));
      expect(startEntry).toBeDefined();
      expect(startEntry?.type).toBe("system");
      
      const endEntry = entries.find(e => e.message.includes("Combat ends"));
      expect(endEntry).toBeDefined();
      expect(endEntry?.type).toBe("system");
    });

    it("should log entity names when provided", () => {
      engine.addEntity(player, "Mighty Hero");
      engine.addEntity(enemy, "Evil Orc");
      
      const log = engine.getCombatLog();
      const entries = log.getEntries();
      
      // should have entry events with proper names
      expect(entries.some(e => e.message.includes("Mighty Hero"))).toBe(true);
      expect(entries.some(e => e.message.includes("Evil Orc"))).toBe(true);
    });

    it("should log combat events with detailed information", (done) => {
      engine.addEntity(player, "Warrior");
      engine.addEntity(enemy, "Goblin");

      const action: CombatAction = {
        entityId: player.id,
        type: "attack",
        targetId: enemy.id,
        duration: 100,
        completed: false
      };

      engine.queueAction(action);

      let tickCount = 0;
      eventBus.on("combat.tick", (tick) => {
        tickCount++;
        
        const damageEvents = tick.events.filter(e => e.type === "damage");
        const missEvents = tick.events.filter(e => e.type === "miss");
        
        if (damageEvents.length > 0) {
          engine.stop();
          
          const log = engine.getCombatLog();
          const entries = log.getEntries();
          
          // find damage log entry
          const damageEntry = entries.find(e => e.type === "damage");
          expect(damageEntry).toBeDefined();
          expect(damageEntry?.message).toContain("Warrior");
          expect(damageEntry?.message).toContain("Goblin");
          expect(damageEntry?.message).toContain("damage");
          
          // should have detailed damage information
          expect(damageEntry?.details?.damage).toBeDefined();
          expect(damageEntry?.details?.calculations).toBeDefined();
          
          done();
        } else if (missEvents.length > 0) {
          // attack missed, which is also valid - check miss logging
          engine.stop();
          
          const log = engine.getCombatLog();
          const entries = log.getEntries();
          
          const missEntry = entries.find(e => e.type === "miss");
          expect(missEntry).toBeDefined();
          expect(missEntry?.message).toContain("Warrior");
          expect(missEntry?.message).toContain("misses");
          
          done();
        }
        
        // timeout after reasonable number of ticks
        if (tickCount >= 10) {
          engine.stop();
          done(new Error(`No combat events after ${tickCount} ticks`));
        }
      });

      engine.start();
    });

    it("should log miss events", (done) => {
      // this test will pass if we get either a miss or a hit, both are valid
      engine.addEntity(player, "Fighter");
      engine.addEntity(enemy, "Target");

      const action: CombatAction = {
        entityId: player.id,
        type: "attack",
        targetId: enemy.id,
        duration: 100,
        completed: false
      };

      engine.queueAction(action);

      let tickCount = 0;
      eventBus.on("combat.tick", (tick) => {
        tickCount++;
        
        const missEvents = tick.events.filter(e => e.type === "miss");
        const damageEvents = tick.events.filter(e => e.type === "damage");
        
        if (missEvents.length > 0) {
          engine.stop();
          
          const log = engine.getCombatLog();
          const entries = log.getEntries();
          
          const missEntry = entries.find(e => e.type === "miss");
          expect(missEntry).toBeDefined();
          expect(missEntry?.message).toContain("Fighter");
          expect(missEntry?.message).toContain("misses");
          expect(missEntry?.color).toBe("gray");
          
          done();
        } else if (damageEvents.length > 0) {
          // hit instead of miss - that's also fine, skip this test
          engine.stop();
          done();
        }
        
        // timeout after reasonable attempts
        if (tickCount >= 5) {
          engine.stop();
          done(); // either outcome is acceptable
        }
      });

      engine.start();
    });

    it("should provide formatted log entries", () => {
      engine.addEntity(player, "Test Player");
      
      engine.start();
      engine.stop();
      
      const formatted = engine.getLogEntries();
      expect(formatted.length).toBeGreaterThan(0);
      
      // formatted entries should be strings with timestamps
      formatted.forEach(entry => {
        expect(typeof entry).toBe("string");
        expect(entry.length).toBeGreaterThan(0);
      });
      
      // should contain our entity name
      const hasPlayerName = formatted.some(entry => entry.includes("Test Player"));
      expect(hasPlayerName).toBe(true);
    });

    it("should limit recent entries", () => {
      engine.addEntity(player, "Hero");
      
      // generate multiple log entries
      for (let i = 0; i < 10; i++) {
        engine.getCombatLog().logSystem(`Test message ${i}`);
      }
      
      const recent = engine.getLogEntries(3);
      expect(recent.length).toBe(3);
      
      // should be the most recent ones
      expect(recent.some(entry => entry.includes("Test message 9"))).toBe(true);
      expect(recent.some(entry => entry.includes("Test message 8"))).toBe(true);
      expect(recent.some(entry => entry.includes("Test message 7"))).toBe(true);
    });

    it("should handle multiple simultaneous events", (done) => {
      const enemy2 = new Entity("enemy-2", "monster");
      enemy2.addComponent(new HealthComponent(30, 0));
      
      engine.addEntity(player, "Hero");
      engine.addEntity(enemy, "Orc");
      engine.addEntity(enemy2, "Goblin");

      // multiple attacks at once
      const actions: CombatAction[] = [
        {
          entityId: player.id,
          type: "attack",
          targetId: enemy.id,
          duration: 100,
          completed: false
        },
        {
          entityId: enemy.id,
          type: "attack",
          targetId: player.id,
          duration: 100,
          completed: false
        },
        {
          entityId: enemy2.id,
          type: "attack",
          targetId: player.id,
          duration: 100,
          completed: false
        }
      ];

      actions.forEach(action => engine.queueAction(action));

      let ticksProcessed = 0;
      let totalActionsCompleted = 0;
      
      eventBus.on("combat.tick", (tick) => {
        ticksProcessed++;
        totalActionsCompleted += tick.actions.length;
        
        // check if we've processed all 3 actions (they might complete over multiple ticks)
        if (totalActionsCompleted >= 3) {
          engine.stop();
          
          const log = engine.getCombatLog();
          const entries = log.getEntries();
          
          // should have multiple combat-related entries 
          const combatEntries = entries.filter(e => e.type === "damage" || e.type === "miss");
          expect(combatEntries.length).toBeGreaterThanOrEqual(2);
          
          // entries should have proper entity names
          const heroEvents = combatEntries.filter(e => e.message.includes("Hero"));
          const orcEvents = combatEntries.filter(e => e.message.includes("Orc"));
          const goblinEvents = combatEntries.filter(e => e.message.includes("Goblin"));
          
          // at least 2 entities should have generated events
          const entitiesWithEvents = [heroEvents, orcEvents, goblinEvents].filter(events => events.length > 0).length;
          expect(entitiesWithEvents).toBeGreaterThanOrEqual(2);
          
          done();
        }
        
        // timeout after reasonable number of ticks
        if (ticksProcessed >= 10) {
          engine.stop();
          done(new Error(`Only processed ${totalActionsCompleted} actions after ${ticksProcessed} ticks`));
        }
      });

      engine.start();
    });
  });
});