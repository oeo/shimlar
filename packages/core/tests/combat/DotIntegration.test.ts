import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { CombatEngine } from '../../combat/CombatEngine';
import { Entity } from '../../entities/Entity';
import { HealthComponent } from '../../components/HealthComponent';
import { EventBus } from '../../events/EventBus';
import { DotApplications, DotType } from '../../combat/DamageOverTime';

describe("DoT Integration with Combat Engine", () => {
  let engine: CombatEngine;
  let eventBus: EventBus;
  let player: Entity;
  let enemy: Entity;

  beforeEach(() => {
    engine = new CombatEngine({ 
      tickRate: 100,
      logOptions: { showCalculations: true }
    });
    eventBus = new EventBus();
    engine.setEventBus(eventBus);

    player = new Entity("player-1", "player");
    player.addComponent(new HealthComponent(100, 1));

    enemy = new Entity("enemy-1", "monster");
    enemy.addComponent(new HealthComponent(50, 0));
  });

  afterEach(() => {
    engine.dispose();
  });

  describe("DoT mechanics in combat", () => {
    it("should apply and process dots during combat", (done) => {
      engine.addEntity(player, "Hero");
      engine.addEntity(enemy, "Poison Snake");

      // apply poison to player (enemy poisoned the player)
      const dotManager = engine.getDotManager();
      dotManager.applyDot(player.id, DotApplications.poison(200, enemy.id, 1000)); // 100 dps for 1 second

      engine.start();

      let tickCount = 0;
      eventBus.on("combat.tick", (tick) => {
        tickCount++;

        // look for dot damage events
        const dotDamageEvents = tick.events.filter(e => 
          e.type === "damage" && e.data.isDot
        );

        if (dotDamageEvents.length > 0) {
          expect(dotDamageEvents[0].targetId).toBe(player.id);
          expect(dotDamageEvents[0].data.damage).toBeGreaterThan(0);
          expect(dotDamageEvents[0].data.effects.length).toBe(1);
          expect(dotDamageEvents[0].data.effects[0].type).toBe(DotType.Poison);

          // check combat log for dot message
          const log = engine.getCombatLog();
          const entries = log.getEntries();
          const dotEntry = entries.find(e => e.message.includes("poison"));
          expect(dotEntry).toBeDefined();
          expect(dotEntry?.color).toBe("magenta");

          engine.stop();
          done();
        }

        if (tickCount >= 5) {
          engine.stop();
          done(new Error("No DoT damage events after 5 ticks"));
        }
      });
    });


    it("should stack multiple poison applications correctly", (done) => {
      engine.addEntity(player, "Hero");
      engine.addEntity(enemy, "Poison Dart Frog");

      const dotManager = engine.getDotManager();
      
      // apply multiple poison stacks quickly (like getting hit multiple times)
      dotManager.applyDot(player.id, DotApplications.poison(100, enemy.id));
      dotManager.applyDot(player.id, DotApplications.poison(100, enemy.id));
      dotManager.applyDot(player.id, DotApplications.poison(100, enemy.id));

      // check dots were stacked
      const dots = dotManager.getDots(player.id);
      expect(dots.length).toBe(1); // single poison effect
      expect(dots[0].currentStacks).toBe(3);
      expect(dots[0].type).toBe(DotType.Poison);

      engine.start();

      eventBus.on("combat.tick", (tick) => {
        const dotDamageEvents = tick.events.filter(e => 
          e.type === "damage" && e.data.isDot
        );

        if (dotDamageEvents.length > 0) {
          const event = dotDamageEvents[0];
          expect(event.data.effects[0].stacks).toBe(3);
          
          // damage should be 3x normal poison damage (stacked)
          expect(event.data.damage).toBeCloseTo(15, 1); // 50 dps * 3 stacks * 0.1s
          
          // check combat log shows stacks
          const log = engine.getCombatLog();
          const entries = log.getEntries();
          const dotEntry = entries.find(e => e.message.includes("poison"));
          
          if (dotEntry?.details?.calculations) {
            const stacksCalculation = dotEntry.details.calculations.find(c => c.includes("(x3)"));
            expect(stacksCalculation).toBeDefined();
          }
          
          engine.stop();
          done();
        }
      });
    });

    it("should handle mixed dot types simultaneously", (done) => {
      engine.addEntity(player, "Hero");
      engine.addEntity(enemy, "Chaos Mage");

      const dotManager = engine.getDotManager();
      
      // apply multiple dot types from different sources
      dotManager.applyDot(player.id, DotApplications.poison(100, enemy.id)); // chaos
      dotManager.applyDot(player.id, DotApplications.ignite(200, enemy.id));  // fire
      dotManager.applyDot(player.id, DotApplications.bleed(150, enemy.id));   // physical

      // verify all dots are active
      expect(dotManager.hasDot(player.id, DotType.Poison)).toBe(true);
      expect(dotManager.hasDot(player.id, DotType.Ignite)).toBe(true);
      expect(dotManager.hasDot(player.id, DotType.Bleed)).toBe(true);
      
      const totalDps = dotManager.getTotalDps(player.id);
      expect(totalDps).toBe(195); // 50 + 40 + 105 (let me check actual values)

      engine.start();

      eventBus.on("combat.tick", (tick) => {
        const dotDamageEvents = tick.events.filter(e => 
          e.type === "damage" && e.data.isDot
        );

        if (dotDamageEvents.length > 0) {
          const event = dotDamageEvents[0];
          expect(event.data.effects.length).toBe(3); // all three dot types
          
          const effectTypes = event.data.effects.map((e: any) => e.type);
          expect(effectTypes).toContain(DotType.Poison);
          expect(effectTypes).toContain(DotType.Ignite);
          expect(effectTypes).toContain(DotType.Bleed);
          
          // total damage should be sum of all dots
          expect(event.data.totalDamage).toBeCloseTo(19.5, 1); // 195 dps * 0.1s
          
          engine.stop();
          done();
        }
      });
    });

    it("should remove dots when entities leave combat", () => {
      engine.addEntity(player, "Hero");
      
      const dotManager = engine.getDotManager();
      dotManager.applyDot(player.id, DotApplications.poison(100, enemy.id));
      
      expect(dotManager.getDots(player.id).length).toBe(1);
      
      // remove player from combat - should clear dots
      engine.removeEntity(player.id);
      
      expect(dotManager.getDots(player.id).length).toBe(0);
    });

    it("should continue processing dots even after source entity dies", (done) => {
      engine.addEntity(player, "Hero");
      engine.addEntity(enemy, "Dying Scorpion");

      const dotManager = engine.getDotManager();
      
      // enemy poisons player then dies
      dotManager.applyDot(player.id, DotApplications.poison(300, enemy.id, 1500));
      
      engine.start();

      let enemyDied = false;
      let dotDamageAfterDeath = false;

      eventBus.on("combat.tick", (tick) => {
        // kill enemy on first tick
        if (!enemyDied) {
          const enemyHealth = enemy.getComponent<HealthComponent>("health")!;
          enemyHealth.takeDamage(1000);
          enemyDied = true;
        }

        // look for dot damage after enemy is dead
        if (enemyDied) {
          const dotDamageEvents = tick.events.filter(e => 
            e.type === "damage" && e.data.isDot && e.targetId === player.id
          );

          if (dotDamageEvents.length > 0) {
            dotDamageAfterDeath = true;
            
            // verify poison is still ticking from dead enemy
            expect(dotDamageEvents[0].data.effects[0].type).toBe(DotType.Poison);
            expect(dotDamageEvents[0].data.damage).toBeGreaterThan(0);
            
            // source entity is dead but dot persists
            const enemyHealth = enemy.getComponent<HealthComponent>("health")!;
            expect(enemyHealth.isDead()).toBe(true);
            
            engine.stop();
            done();
          }
        }
      });
    });
  });
});