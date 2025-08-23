import { describe, it, expect, beforeEach } from "bun:test";
import {
  calculateHitChance,
  rollHit,
  rollCritical,
  applyCriticalDamage,
  calculateArmorReduction,
  calculateResistanceReduction,
  applyMitigation,
  calculateAttackResult,
  createDefaultCombatStats
} from "../../src/combat/formulas";
import { DamageType, DamageAmount } from "../../src/combat/types";

describe("combat formulas", () => {
  describe("hit chance calculation", () => {
    it("should calculate hit chance based on accuracy vs evasion", () => {
      expect(calculateHitChance(300, 200)).toBeCloseTo(0.857, 2); // 300/(300+50) = 85.7%
      expect(calculateHitChance(100, 400)).toBeCloseTo(0.5, 2);   // 100/(100+100) = 50%
      expect(calculateHitChance(1000, 100)).toBeCloseTo(0.95, 2); // capped at 95%
    });

    it("should handle edge cases", () => {
      expect(calculateHitChance(0, 100)).toBe(0);     // no accuracy = no hit
      expect(calculateHitChance(100, 0)).toBe(0.95);  // no evasion = 95% hit
      expect(calculateHitChance(-100, 200)).toBe(0);  // negative accuracy
    });

    it("should cap hit chance between 5% and 95%", () => {
      expect(calculateHitChance(1, 10000)).toBe(0.05); // minimum 5%
      expect(calculateHitChance(10000, 1)).toBe(0.95); // maximum 95%
    });
  });

  describe("hit rolling", () => {
    it("should always hit with perfect accuracy", () => {
      // with very high accuracy, should hit consistently
      let hits = 0;
      for (let i = 0; i < 100; i++) {
        if (rollHit(10000, 1)) hits++;
      }
      expect(hits).toBeGreaterThan(90); // should hit 95% of the time
    });

    it("should rarely hit with terrible accuracy", () => {
      // with very low accuracy, should miss most of the time
      let hits = 0;
      for (let i = 0; i < 100; i++) {
        if (rollHit(1, 10000)) hits++;
      }
      expect(hits).toBeLessThan(15); // should hit only 5% of the time
    });
  });

  describe("critical strike calculation", () => {
    it("should roll critical strikes based on chance", () => {
      // test with 0% crit chance
      let crits = 0;
      for (let i = 0; i < 100; i++) {
        if (rollCritical(0)) crits++;
      }
      expect(crits).toBe(0);
    });

    it("should cap critical chance at 95%", () => {
      let crits = 0;
      for (let i = 0; i < 100; i++) {
        if (rollCritical(10000)) crits++; // impossibly high crit chance
      }
      expect(crits).toBeLessThan(100); // should not be 100% due to cap
    });

    it("should apply critical multiplier to damage", () => {
      const baseDamage: DamageAmount[] = [
        { type: DamageType.Physical, amount: 100 },
        { type: DamageType.Fire, amount: 50 }
      ];

      const critDamage = applyCriticalDamage(baseDamage, 200); // 200% multiplier

      expect(critDamage[0].amount).toBe(200); // 100 * 2.0
      expect(critDamage[1].amount).toBe(100); // 50 * 2.0
      expect(critDamage[0].type).toBe(DamageType.Physical);
      expect(critDamage[1].type).toBe(DamageType.Fire);
    });
  });

  describe("armor reduction", () => {
    it("should calculate armor reduction with diminishing returns", () => {
      expect(calculateArmorReduction(100, 100)).toBeCloseTo(0.167, 2); // 100/(100+500)
      expect(calculateArmorReduction(500, 100)).toBeCloseTo(0.5, 2);   // 500/(500+500)
      expect(calculateArmorReduction(1000, 100)).toBeCloseTo(0.667, 2); // 1000/(1000+500)
    });

    it("should cap armor reduction at 90%", () => {
      const reduction = calculateArmorReduction(100000, 10);
      expect(reduction).toBe(0.9);
    });

    it("should handle zero values", () => {
      expect(calculateArmorReduction(0, 100)).toBe(0);
      expect(calculateArmorReduction(100, 0)).toBe(0);
    });
  });

  describe("resistance reduction", () => {
    it("should convert resistance percentage to decimal", () => {
      expect(calculateResistanceReduction(50)).toBe(0.5);
      expect(calculateResistanceReduction(75)).toBe(0.75);
      expect(calculateResistanceReduction(-60)).toBe(-0.6); // vulnerability
    });

    it("should cap resistance at 75%", () => {
      expect(calculateResistanceReduction(100)).toBe(0.75);
      expect(calculateResistanceReduction(1000)).toBe(0.75);
    });

    it("should allow negative resistance", () => {
      expect(calculateResistanceReduction(-100)).toBe(-1.0);
    });
  });

  describe("damage mitigation", () => {
    const defenderStats = createDefaultCombatStats();
    defenderStats.armor = 300;
    defenderStats.fireResistance = 50;
    defenderStats.coldResistance = 25;

    it("should apply armor reduction to physical damage", () => {
      const damage: DamageAmount[] = [
        { type: DamageType.Physical, amount: 100 }
      ];

      const mitigated = applyMitigation(damage, defenderStats);
      
      // armor reduction: 300/(300+500) = 37.5%
      // final damage: 100 * (1 - 0.375) = 62.5
      expect(mitigated[0].amount).toBeCloseTo(62.5, 1);
    });

    it("should apply resistance reduction to elemental damage", () => {
      const damage: DamageAmount[] = [
        { type: DamageType.Fire, amount: 100 },
        { type: DamageType.Cold, amount: 80 }
      ];

      const mitigated = applyMitigation(damage, defenderStats);
      
      expect(mitigated[0].amount).toBe(50); // 100 * (1 - 0.5) = 50
      expect(mitigated[1].amount).toBe(60); // 80 * (1 - 0.25) = 60
    });

    it("should handle multiple damage types", () => {
      const damage: DamageAmount[] = [
        { type: DamageType.Physical, amount: 60 },
        { type: DamageType.Fire, amount: 40 },
        { type: DamageType.Lightning, amount: 20 }
      ];

      const mitigated = applyMitigation(damage, defenderStats);
      
      expect(mitigated.length).toBe(3);
      expect(mitigated[0].type).toBe(DamageType.Physical);
      expect(mitigated[1].type).toBe(DamageType.Fire);
      expect(mitigated[2].type).toBe(DamageType.Lightning);
      
      // physical: armor reduction applied
      // fire: 50% resistance applied  
      // lightning: 0% resistance (no reduction)
      expect(mitigated[0].amount).toBeLessThan(60);
      expect(mitigated[1].amount).toBe(20); // 40 * 0.5
      expect(mitigated[2].amount).toBe(20); // no change
    });

    it("should not allow negative damage", () => {
      defenderStats.fireResistance = -200; // 200% vulnerability

      const damage: DamageAmount[] = [
        { type: DamageType.Fire, amount: 10 }
      ];

      const mitigated = applyMitigation(damage, defenderStats);
      expect(mitigated[0].amount).toBeGreaterThanOrEqual(0);
    });
  });

  describe("full attack calculation", () => {
    let attackerStats: any;
    let defenderStats: any;

    beforeEach(() => {
      attackerStats = createDefaultCombatStats();
      defenderStats = createDefaultCombatStats();
      
      // set deterministic values for testing
      attackerStats.accuracy = 400;
      attackerStats.criticalChance = 20;
      attackerStats.criticalMultiplier = 200;
      
      defenderStats.evasion = 100;
      defenderStats.armor = 200;
      defenderStats.fireResistance = 50;
    });

    it("should return miss result when attack misses", () => {
      // force miss by setting very low accuracy
      attackerStats.accuracy = 1;
      defenderStats.evasion = 10000;

      const damage: DamageAmount[] = [
        { type: DamageType.Physical, amount: 100 }
      ];

      // run multiple times since it's probabilistic
      let missCount = 0;
      for (let i = 0; i < 20; i++) {
        const result = calculateAttackResult({
          baseDamage: damage,
          attackerStats,
          defenderStats
        });
        
        if (!result.hit) {
          missCount++;
          expect(result.critical).toBe(false);
          expect(result.damage).toEqual([]);
          expect(result.totalDamage).toBe(0);
          expect(result.mitigatedDamage).toBe(0);
        }
      }
      
      expect(missCount).toBeGreaterThan(15); // should miss most of the time
    });

    it("should calculate normal hit damage", () => {
      // force hit and no crit for consistent testing
      attackerStats.accuracy = 10000;
      attackerStats.criticalChance = 0;
      defenderStats.evasion = 1;

      const damage: DamageAmount[] = [
        { type: DamageType.Physical, amount: 100 },
        { type: DamageType.Fire, amount: 60 }
      ];

      const result = calculateAttackResult({
        baseDamage: damage,
        attackerStats,
        defenderStats
      });

      expect(result.hit).toBe(true);
      expect(result.critical).toBe(false);
      expect(result.damage.length).toBe(2);
      
      // should have mitigation applied
      expect(result.mitigatedDamage).toBeLessThan(160); // original total was 160
      expect(result.mitigatedDamage).toBeGreaterThan(0);
    });

    it("should handle spells (always hit)", () => {
      // even with terrible accuracy, spells should hit
      attackerStats.accuracy = 1;
      defenderStats.evasion = 10000;

      const damage: DamageAmount[] = [
        { type: DamageType.Fire, amount: 50 }
      ];

      const result = calculateAttackResult({
        baseDamage: damage,
        attackerStats,
        defenderStats,
        isSpell: true
      });

      expect(result.hit).toBe(true);
    });

    it("should calculate damage totals correctly", () => {
      // Force hit by making spell (spells always hit)
      attackerStats.accuracy = 10000;
      attackerStats.criticalChance = 0;
      defenderStats.evasion = 1;

      const damage: DamageAmount[] = [
        { type: DamageType.Physical, amount: 80 },
        { type: DamageType.Fire, amount: 40 },
        { type: DamageType.Cold, amount: 20 }
      ];

      const result = calculateAttackResult({
        baseDamage: damage,
        attackerStats,
        defenderStats,
        isSpell: true // spells always hit
      });

      expect(result.hit).toBe(true); // spells always hit
      expect(result.totalDamage).toBe(140); // original total
      expect(result.mitigatedDamage).toBeLessThan(140); // after mitigation
      expect(result.mitigatedDamage).toBeGreaterThan(0); // but still some damage
      
      // verify individual damages sum to total
      const calculatedTotal = result.damage.reduce((sum, d) => sum + d.amount, 0);
      expect(calculatedTotal).toBeCloseTo(result.mitigatedDamage, 5);
    });
  });

  describe("default stats creation", () => {
    it("should create sensible default combat stats", () => {
      const stats = createDefaultCombatStats();
      
      expect(stats.accuracy).toBeGreaterThan(0);
      expect(stats.evasion).toBeGreaterThan(0);
      expect(stats.criticalChance).toBeGreaterThan(0);
      expect(stats.criticalMultiplier).toBeGreaterThan(100);
      expect(stats.attacksPerSecond).toBeGreaterThan(0);
      
      // resistances can be 0 by default
      expect(stats.fireResistance).toBeGreaterThanOrEqual(0);
      expect(stats.coldResistance).toBeGreaterThanOrEqual(0);
      expect(stats.lightningResistance).toBeGreaterThanOrEqual(0);
      expect(stats.chaosResistance).toBeGreaterThanOrEqual(0);
    });
  });
});