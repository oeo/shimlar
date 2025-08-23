import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { CombatEngine } from "../../src/combat/CombatEngine";
import { Entity } from "../../src/entities/Entity";
import { HealthComponent } from "../../src/components/HealthComponent";
import { EventBus } from "../../src/events/EventBus";
import { CombatAction } from "../../src/combat/types";

describe("CombatEngine", () => {
  let engine: CombatEngine;
  let eventBus: EventBus;
  let player: Entity;
  let enemy: Entity;

  beforeEach(() => {
    engine = new CombatEngine({ tickRate: 50 }); // faster for testing
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

  describe("entity management", () => {
    it("should add entities to combat", () => {
      engine.addEntity(player);
      
      const state = engine.getCombatState();
      expect(state.entitiesInCombat).toBe(1);
    });

    it("should remove entities from combat", () => {
      engine.addEntity(player);
      engine.addEntity(enemy);
      
      engine.removeEntity(player.id);
      
      const state = engine.getCombatState();
      expect(state.entitiesInCombat).toBe(1);
    });

    it("should emit events when entities enter combat", (done) => {
      eventBus.on("combat.event", (event) => {
        expect(event.type).toBe("move");
        expect(event.sourceId).toBe(player.id);
        expect(event.data.action).toBe("entered_combat");
        done();
      });

      engine.addEntity(player);
    });
  });

  describe("action management", () => {
    beforeEach(() => {
      engine.addEntity(player);
      engine.addEntity(enemy);
    });

    it("should queue actions for entities", () => {
      const action: CombatAction = {
        entityId: player.id,
        type: "attack",
        targetId: enemy.id,
        duration: 100,
        completed: false
      };

      engine.queueAction(action);
      
      const state = engine.getCombatState();
      expect(state.pendingActions).toBe(1);
    });

    it("should replace existing actions for same entity", () => {
      const action1: CombatAction = {
        entityId: player.id,
        type: "wait",
        duration: 100,
        completed: false
      };

      const action2: CombatAction = {
        entityId: player.id,
        type: "attack",
        targetId: enemy.id,
        duration: 200,
        completed: false
      };

      engine.queueAction(action1);
      engine.queueAction(action2);
      
      const state = engine.getCombatState();
      expect(state.pendingActions).toBe(1);
    });

    it("should not queue actions for entities not in combat", () => {
      const outsider = new Entity("outsider", "player");
      
      const action: CombatAction = {
        entityId: outsider.id,
        type: "attack",
        duration: 100,
        completed: false
      };

      engine.queueAction(action);
      
      const state = engine.getCombatState();
      expect(state.pendingActions).toBe(0);
    });
  });

  describe("combat flow", () => {
    beforeEach(() => {
      engine.addEntity(player);
      engine.addEntity(enemy);
    });

    it("should start and stop combat", () => {
      expect(engine.getCombatState().isRunning).toBe(false);
      
      engine.start();
      expect(engine.getCombatState().isRunning).toBe(true);
      
      engine.stop();
      expect(engine.getCombatState().isRunning).toBe(false);
    });

    it("should process ticks at specified rate", (done) => {
      let tickCount = 0;
      
      eventBus.on("combat.tick", () => {
        tickCount++;
        if (tickCount >= 3) {
          engine.stop();
          expect(tickCount).toBe(3);
          done();
        }
      });

      engine.start();
    });

    it("should execute actions when duration expires", (done) => {
      const action: CombatAction = {
        entityId: player.id,
        type: "attack",
        targetId: enemy.id,
        duration: 100, // 2 ticks at 50ms
        completed: false
      };

      engine.queueAction(action);

      let actionExecuted = false;
      eventBus.on("combat.tick", (tick) => {
        if (tick.actions.length > 0) {
          actionExecuted = true;
          expect(tick.actions[0].completed).toBe(true);
          expect(tick.actions[0].entityId).toBe(player.id);
          engine.stop();
          done();
        }
      });

      engine.start();
    });

    it("should deal damage on attacks", (done) => {
      const enemyHealth = enemy.getComponent<HealthComponent>("health")!;
      const initialHealth = enemyHealth.current;

      const action: CombatAction = {
        entityId: player.id,
        type: "attack",
        targetId: enemy.id,
        duration: 50,
        completed: false
      };

      engine.queueAction(action);

      eventBus.on("combat.tick", (tick) => {
        const damageEvents = tick.events.filter(e => e.type === "damage");
        if (damageEvents.length > 0) {
          expect(enemyHealth.current).toBeLessThan(initialHealth);
          engine.stop();
          done();
        }
      });

      engine.start();
    });

    it("should handle multiple monsters attacking same player", (done) => {
      // create additional enemies
      const enemy2 = new Entity("enemy-2", "monster");
      enemy2.addComponent(new HealthComponent(30, 0));
      const enemy3 = new Entity("enemy-3", "monster");
      enemy3.addComponent(new HealthComponent(25, 0));

      engine.addEntity(enemy2);
      engine.addEntity(enemy3);

      const playerHealth = player.getComponent<HealthComponent>("health")!;
      const initialHealth = playerHealth.current;

      // all enemies attack the player at the same time
      const actions: CombatAction[] = [
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
        },
        {
          entityId: enemy3.id,
          type: "attack",
          targetId: player.id,
          duration: 100,
          completed: false
        }
      ];

      actions.forEach(action => engine.queueAction(action));

      let damageEventsReceived = 0;
      eventBus.on("combat.tick", (tick) => {
        const damageEvents = tick.events.filter(e => e.type === "damage" && e.targetId === player.id);
        damageEventsReceived += damageEvents.length;

        // check if all attacks have been processed
        if (tick.actions.length >= 3) {
          expect(damageEventsReceived).toBe(3); // three attacks
          expect(playerHealth.current).toBeLessThan(initialHealth);
          
          // player should have taken some damage from all three attacks
          // note: damage is reduced by armor/resistances in the new system
          const totalDamageTaken = initialHealth - playerHealth.current;
          expect(totalDamageTaken).toBeGreaterThan(0);
          expect(totalDamageTaken).toBeLessThan(40); // should be less than 3 × 10 base damage
          
          engine.stop();
          done();
        }
      });

      engine.start();
    });
  });

  describe("regeneration", () => {
    it("should process health regeneration each tick", (done) => {
      engine.addEntity(player);
      
      // damage the player first
      const playerHealth = player.getComponent<HealthComponent>("health")!;
      playerHealth.takeDamage(20);
      const damagedHealth = playerHealth.current;

      let tickCount = 0;
      eventBus.on("combat.tick", (tick) => {
        tickCount++;
        
        const healEvents = tick.events.filter(e => e.type === "heal");
        if (healEvents.length > 0) {
          expect(playerHealth.current).toBeGreaterThan(damagedHealth);
          engine.stop();
          done();
          return;
        }
        
        // timeout after 10 ticks to prevent infinite wait
        if (tickCount >= 10) {
          engine.stop();
          done(new Error(`no regeneration detected after ${tickCount} ticks`));
        }
      });

      engine.start();
    });
  });

  describe("death detection", () => {
    it("should detect when entities die", (done) => {
      engine.addEntity(enemy);
      
      // kill the enemy
      const enemyHealth = enemy.getComponent<HealthComponent>("health")!;
      enemyHealth.takeDamage(100);

      eventBus.on("combat.tick", (tick) => {
        const deathEvents = tick.events.filter(e => e.type === "death");
        if (deathEvents.length > 0) {
          expect(deathEvents[0].sourceId).toBe(enemy.id);
          expect(enemyHealth.isDead()).toBe(true);
          engine.stop();
          done();
        }
      });

      engine.start();
    });
  });

  describe("combat ending", () => {
    it("should end combat when only one entity remains alive", (done) => {
      engine.addEntity(player);
      engine.addEntity(enemy);

      // kill the enemy
      const enemyHealth = enemy.getComponent<HealthComponent>("health")!;
      enemyHealth.takeDamage(100);

      eventBus.on("combat.event", (event) => {
        if (event.data?.action === "combat_ended") {
          expect(engine.getCombatState().isRunning).toBe(false);
          done();
        }
      });

      engine.start();
    });

    it("should end combat after max ticks", (done) => {
      const shortEngine = new CombatEngine({ 
        tickRate: 10, 
        maxTicks: 3 
      });
      shortEngine.setEventBus(eventBus);
      shortEngine.addEntity(player);
      shortEngine.addEntity(enemy);

      eventBus.on("combat.event", (event) => {
        if (event.data?.action === "combat_ended") {
          expect(event.data.totalTicks).toBe(3);
          done();
        }
      });

      shortEngine.start();
    });
  });

  describe("state and history", () => {
    it("should track combat state", () => {
      engine.addEntity(player);
      
      const action: CombatAction = {
        entityId: player.id,
        type: "wait",
        duration: 100,
        completed: false
      };
      engine.queueAction(action);

      const state = engine.getCombatState();
      expect(state.entitiesInCombat).toBe(1);
      expect(state.pendingActions).toBe(1);
      expect(state.tickRate).toBe(50);
      expect(state.isRunning).toBe(false);
    });

    it("should maintain combat history", (done) => {
      engine.addEntity(player);
      engine.addEntity(enemy); // need two entities or combat will end immediately
      engine.start();

      let ticksSeen = 0;
      eventBus.on("combat.tick", () => {
        ticksSeen++;
        if (ticksSeen >= 2) {
          engine.stop();
          
          const history = engine.getHistory();
          expect(history.length).toBe(2);
          expect(history[0].tickNumber).toBe(1);
          expect(history[1].tickNumber).toBe(2);
          done();
        }
      });
    });
  });
});