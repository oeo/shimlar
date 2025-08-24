import { describe, it, expect, beforeEach } from "bun:test";
import { DotManager, DotType, DotApplications } from '../../combat/DamageOverTime';
import { DamageType } from '../../combat/types';

describe("DamageOverTime", () => {
  let dotManager: DotManager;
  const playerId = "player-1";
  const enemyId = "enemy-1";

  beforeEach(() => {
    dotManager = new DotManager();
  });

  describe("DotManager", () => {
    describe("poison application", () => {
      it("should apply poison correctly", () => {
        const effectId = dotManager.applyDot(playerId, DotApplications.poison(100, enemyId));
        
        expect(effectId).toBeTruthy();
        
        const dots = dotManager.getDots(playerId);
        expect(dots.length).toBe(1);
        expect(dots[0].type).toBe(DotType.Poison);
        expect(dots[0].damageType).toBe(DamageType.Chaos);
        expect(dots[0].damagePerSecond).toBe(50); // 100 / 2 seconds
        expect(dots[0].stackable).toBe(true);
        expect(dots[0].currentStacks).toBe(1);
      });

      it("should stack poison correctly", () => {
        dotManager.applyDot(playerId, DotApplications.poison(100, enemyId));
        dotManager.applyDot(playerId, DotApplications.poison(100, enemyId));
        dotManager.applyDot(playerId, DotApplications.poison(100, enemyId));
        
        const dots = dotManager.getDots(playerId);
        expect(dots.length).toBe(1); // single effect with stacks
        expect(dots[0].currentStacks).toBe(3);
        expect(dots[0].type).toBe(DotType.Poison);
      });

      it("should respect max stacks", () => {
        // apply 55 poison stacks (more than max of 50)
        for (let i = 0; i < 55; i++) {
          dotManager.applyDot(playerId, DotApplications.poison(100, enemyId));
        }
        
        const dots = dotManager.getDots(playerId);
        expect(dots[0].currentStacks).toBe(50); // capped at max
      });
    });

    describe("ignite application", () => {
      it("should apply ignite correctly", () => {
        dotManager.applyDot(playerId, DotApplications.ignite(100, enemyId));
        
        const dots = dotManager.getDots(playerId);
        expect(dots.length).toBe(1);
        expect(dots[0].type).toBe(DotType.Ignite);
        expect(dots[0].damageType).toBe(DamageType.Fire);
        expect(dots[0].damagePerSecond).toBe(20); // 100 * 0.2
        expect(dots[0].stackable).toBe(false);
        expect(dots[0].duration).toBe(4000); // 4 seconds
      });

      it("should not stack ignite", () => {
        dotManager.applyDot(playerId, DotApplications.ignite(100, enemyId));
        dotManager.applyDot(playerId, DotApplications.ignite(150, enemyId));
        
        const dots = dotManager.getDots(playerId);
        expect(dots.length).toBe(1); // replaced, not stacked
        expect(dots[0].damagePerSecond).toBe(30); // 150 * 0.2 (newer ignite)
      });
    });

    describe("bleed application", () => {
      it("should apply bleed correctly", () => {
        dotManager.applyDot(playerId, DotApplications.bleed(100, enemyId));
        
        const dots = dotManager.getDots(playerId);
        expect(dots.length).toBe(1);
        expect(dots[0].type).toBe(DotType.Bleed);
        expect(dots[0].damageType).toBe(DamageType.Physical);
        expect(dots[0].damagePerSecond).toBe(70); // 100 * 0.7
        expect(dots[0].duration).toBe(5700); // 5.7 seconds
        expect(dots[0].stackable).toBe(false);
      });
    });

    describe("freeze and shock", () => {
      it("should apply freeze without damage", () => {
        dotManager.applyDot(playerId, DotApplications.freeze(enemyId));
        
        const dots = dotManager.getDots(playerId);
        expect(dots.length).toBe(1);
        expect(dots[0].type).toBe(DotType.Freeze);
        expect(dots[0].damagePerSecond).toBe(0);
        expect(dots[0].duration).toBe(1000);
      });

      it("should apply shock with multiplier property", () => {
        dotManager.applyDot(playerId, DotApplications.shock(enemyId, 2000, 1.8));
        
        const dots = dotManager.getDots(playerId);
        expect(dots.length).toBe(1);
        expect(dots[0].type).toBe(DotType.Shock);
        expect(dots[0].damagePerSecond).toBe(0);
        expect(dots[0].properties?.shockMultiplier).toBe(1.8);
      });
    });

    describe("mixed dots", () => {
      it("should handle multiple different dot types", () => {
        dotManager.applyDot(playerId, DotApplications.poison(100, enemyId));
        dotManager.applyDot(playerId, DotApplications.ignite(200, enemyId));
        dotManager.applyDot(playerId, DotApplications.bleed(150, enemyId));
        
        const dots = dotManager.getDots(playerId);
        expect(dots.length).toBe(3);
        
        const dotTypes = dots.map(d => d.type);
        expect(dotTypes).toContain(DotType.Poison);
        expect(dotTypes).toContain(DotType.Ignite);
        expect(dotTypes).toContain(DotType.Bleed);
      });

      it("should calculate total dps correctly", () => {
        dotManager.applyDot(playerId, DotApplications.poison(100, enemyId)); // 50 dps
        dotManager.applyDot(playerId, DotApplications.poison(100, enemyId)); // +50 dps (stacked)
        dotManager.applyDot(playerId, DotApplications.ignite(100, enemyId)); // +20 dps
        
        const totalDps = dotManager.getTotalDps(playerId);
        expect(totalDps).toBe(120); // 50*2 + 20
      });
    });
  });

  describe("dot processing", () => {
    it("should process dots over time", () => {
      dotManager.applyDot(playerId, DotApplications.poison(100, enemyId, 1000)); // 1 second duration
      
      // process first tick (100ms)
      let results = dotManager.processDots(100);
      expect(results.length).toBe(1);
      expect(results[0].entityId).toBe(playerId);
      expect(results[0].totalDamage).toBeCloseTo(5, 1); // 50 dps * 0.1s
      
      const dots = dotManager.getDots(playerId);
      expect(dots[0].remainingDuration).toBe(900); // 1000 - 100
      expect(results[0].effects[0].expired).toBe(false);
    });

    it("should expire dots after duration", () => {
      dotManager.applyDot(playerId, DotApplications.poison(100, enemyId, 200)); // 200ms duration
      
      // process ticks to exceed duration
      const results1 = dotManager.processDots(100); // 100ms remaining
      expect(results1.length).toBe(1);
      expect(results1[0].effects[0].expired).toBe(false);
      
      const results2 = dotManager.processDots(150); // exceed remaining duration
      expect(results2.length).toBe(1);
      expect(results2[0].effects[0].expired).toBe(true);
      
      // dot should be removed after expiration
      const dots = dotManager.getDots(playerId);
      expect(dots.length).toBe(0);
    });

    it("should handle stacked poison damage", () => {
      // apply 3 poison stacks
      dotManager.applyDot(playerId, DotApplications.poison(100, enemyId)); // 50 dps
      dotManager.applyDot(playerId, DotApplications.poison(100, enemyId)); // +50 dps
      dotManager.applyDot(playerId, DotApplications.poison(100, enemyId)); // +50 dps
      
      const results = dotManager.processDots(100); // 100ms tick
      expect(results.length).toBe(1);
      expect(results[0].totalDamage).toBeCloseTo(15, 1); // 150 dps * 0.1s
      expect(results[0].effects[0].stacks).toBe(3);
    });

    it("should process multiple entities", () => {
      dotManager.applyDot(playerId, DotApplications.poison(100, enemyId));
      dotManager.applyDot(enemyId, DotApplications.ignite(200, playerId));
      
      const results = dotManager.processDots(100);
      expect(results.length).toBe(2);
      
      const playerResult = results.find(r => r.entityId === playerId);
      const enemyResult = results.find(r => r.entityId === enemyId);
      
      expect(playerResult).toBeDefined();
      expect(enemyResult).toBeDefined();
      expect(playerResult!.totalDamage).toBeCloseTo(5, 1); // poison
      expect(enemyResult!.totalDamage).toBeCloseTo(4, 1); // ignite
    });

    it("should process no dots when none are active", () => {
      const results = dotManager.processDots(100);
      expect(results.length).toBe(0);
    });
  });

  describe("dot management", () => {
    beforeEach(() => {
      dotManager.applyDot(playerId, DotApplications.poison(100, enemyId));
      dotManager.applyDot(playerId, DotApplications.ignite(100, enemyId));
    });

    it("should check if entity has specific dot type", () => {
      expect(dotManager.hasDot(playerId, DotType.Poison)).toBe(true);
      expect(dotManager.hasDot(playerId, DotType.Ignite)).toBe(true);
      expect(dotManager.hasDot(playerId, DotType.Bleed)).toBe(false);
      expect(dotManager.hasDot(enemyId, DotType.Poison)).toBe(false);
    });

    it("should clear all dots for entity", () => {
      expect(dotManager.getDots(playerId).length).toBe(2);
      
      dotManager.clearDots(playerId);
      
      expect(dotManager.getDots(playerId).length).toBe(0);
      expect(dotManager.hasDot(playerId, DotType.Poison)).toBe(false);
      expect(dotManager.hasDot(playerId, DotType.Ignite)).toBe(false);
    });

    it("should remove specific dot effect", () => {
      const dots = dotManager.getDots(playerId);
      const poisonId = dots.find(d => d.type === DotType.Poison)?.id;
      
      expect(poisonId).toBeTruthy();
      const removed = dotManager.removeDot(playerId, poisonId!);
      
      expect(removed).toBe(true);
      expect(dotManager.hasDot(playerId, DotType.Poison)).toBe(false);
      expect(dotManager.hasDot(playerId, DotType.Ignite)).toBe(true); // still there
    });

    it("should get affected entities", () => {
      dotManager.applyDot(enemyId, DotApplications.bleed(50, playerId));
      
      const affected = dotManager.getAffectedEntities();
      expect(affected).toContain(playerId);
      expect(affected).toContain(enemyId);
      expect(affected.length).toBe(2);
    });

    it("should not remove non-existent dot", () => {
      const removed = dotManager.removeDot(playerId, "non-existent-id");
      expect(removed).toBe(false);
      
      const removedFromWrongEntity = dotManager.removeDot(enemyId, "some-id");
      expect(removedFromWrongEntity).toBe(false);
    });
  });

  describe("DotApplications utility", () => {
    it("should create poison application", () => {
      const poison = DotApplications.poison(150, enemyId, 3000);
      
      expect(poison.dotType).toBe(DotType.Poison);
      expect(poison.baseDamage).toBe(150);
      expect(poison.duration).toBe(3000);
      expect(poison.sourceEntityId).toBe(enemyId);
    });

    it("should create ignite with default duration", () => {
      const ignite = DotApplications.ignite(200, enemyId);
      
      expect(ignite.dotType).toBe(DotType.Ignite);
      expect(ignite.duration).toBe(4000); // default 4 seconds
    });

    it("should create generic dot with custom properties", () => {
      const generic = DotApplications.generic(
        25, 
        6000, 
        enemyId, 
        DamageType.Lightning, 
        true
      );
      
      expect(generic.dotType).toBe(DotType.Generic);
      expect(generic.baseDamage).toBe(25);
      expect(generic.duration).toBe(6000);
      expect(generic.properties?.damageType).toBe(DamageType.Lightning);
      expect(generic.properties?.stackable).toBe(true);
      expect(generic.properties?.maxStacks).toBe(10);
    });

    it("should create freeze without damage", () => {
      const freeze = DotApplications.freeze(enemyId, 1500);
      
      expect(freeze.dotType).toBe(DotType.Freeze);
      expect(freeze.baseDamage).toBe(0);
      expect(freeze.duration).toBe(1500);
    });

    it("should create shock with multiplier", () => {
      const shock = DotApplications.shock(enemyId, 3000, 2.0);
      
      expect(shock.dotType).toBe(DotType.Shock);
      expect(shock.baseDamage).toBe(0);
      expect(shock.duration).toBe(3000);
      expect(shock.properties?.shockMultiplier).toBe(2.0);
    });
  });
});