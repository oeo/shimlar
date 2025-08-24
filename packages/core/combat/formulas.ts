/**
 * combat damage formulas
 * based on path of exile mechanics but simplified
 */

import { DamageType, DamageAmount, AttackResult, CombatStats } from "./types";

export interface DamageCalculationParams {
  baseDamage: DamageAmount[];
  attackerStats: CombatStats;
  defenderStats: CombatStats;
  isSpell?: boolean;
}

/**
 * calculate if an attack hits based on accuracy vs evasion
 * formula similar to PoE: chance = attacker_accuracy / (attacker_accuracy + defender_evasion/4)
 */
export function calculateHitChance(accuracy: number, evasion: number): number {
  if (accuracy <= 0) return 0;
  if (evasion <= 0) return 0.95; // 95% max hit chance vs no evasion
  
  const hitChance = accuracy / (accuracy + (evasion / 4));
  return Math.min(0.95, Math.max(0.05, hitChance)); // cap between 5% and 95%
}

/**
 * roll for hit/miss
 */
export function rollHit(accuracy: number, evasion: number): boolean {
  const hitChance = calculateHitChance(accuracy, evasion);
  return Math.random() < hitChance;
}

/**
 * calculate if an attack is a critical strike
 */
export function rollCritical(critChance: number): boolean {
  const clampedChance = Math.min(0.95, Math.max(0, critChance / 100));
  return Math.random() < clampedChance;
}

/**
 * apply critical strike multiplier to damage
 */
export function applyCriticalDamage(damage: DamageAmount[], critMultiplier: number): DamageAmount[] {
  const multiplier = critMultiplier / 100; // convert percentage to decimal
  return damage.map(d => ({
    type: d.type,
    amount: d.amount * multiplier
  }));
}

/**
 * calculate physical damage reduction from armor
 * formula: reduction = armor / (armor + 5 * damage)
 * this gives diminishing returns like in PoE
 */
export function calculateArmorReduction(armor: number, physicalDamage: number): number {
  if (armor <= 0 || physicalDamage <= 0) return 0;
  
  const reduction = armor / (armor + 5 * physicalDamage);
  return Math.min(0.9, reduction); // cap at 90% reduction
}

/**
 * calculate elemental resistance reduction
 * resistances can be negative (vulnerability) up to +75% cap
 */
export function calculateResistanceReduction(resistance: number): number {
  const clampedResistance = Math.min(75, resistance); // cap at 75%
  return clampedResistance / 100; // convert to decimal
}

/**
 * apply damage mitigation (armor/resistances)
 */
export function applyMitigation(damage: DamageAmount[], defenderStats: CombatStats): DamageAmount[] {
  return damage.map(d => {
    let mitigatedAmount = d.amount;
    
    switch (d.type) {
      case DamageType.Physical:
        const armorReduction = calculateArmorReduction(defenderStats.armor, d.amount);
        mitigatedAmount = d.amount * (1 - armorReduction);
        break;
        
      case DamageType.Fire:
        const fireReduction = calculateResistanceReduction(defenderStats.fireResistance);
        mitigatedAmount = d.amount * (1 - fireReduction);
        break;
        
      case DamageType.Cold:
        const coldReduction = calculateResistanceReduction(defenderStats.coldResistance);
        mitigatedAmount = d.amount * (1 - coldReduction);
        break;
        
      case DamageType.Lightning:
        const lightningReduction = calculateResistanceReduction(defenderStats.lightningResistance);
        mitigatedAmount = d.amount * (1 - lightningReduction);
        break;
        
      case DamageType.Chaos:
        const chaosReduction = calculateResistanceReduction(defenderStats.chaosResistance);
        mitigatedAmount = d.amount * (1 - chaosReduction);
        break;
    }
    
    return {
      type: d.type,
      amount: Math.max(0, mitigatedAmount) // damage can't be negative
    };
  });
}

/**
 * main damage calculation function
 * handles the full pipeline: hit check → crit check → mitigation
 */
export function calculateAttackResult(params: DamageCalculationParams): AttackResult {
  const { baseDamage, attackerStats, defenderStats, isSpell = false } = params;
  
  // step 1: check if attack hits (spells always hit for now)
  const hit = isSpell ? true : rollHit(attackerStats.accuracy, defenderStats.evasion);
  
  if (!hit) {
    return {
      hit: false,
      critical: false,
      damage: [],
      totalDamage: 0,
      mitigatedDamage: 0
    };
  }
  
  // step 2: check for critical strike
  const critical = rollCritical(attackerStats.criticalChance);
  
  // step 3: apply critical multiplier if crit
  let damage = [...baseDamage];
  if (critical) {
    damage = applyCriticalDamage(damage, attackerStats.criticalMultiplier);
  }
  
  // step 4: apply mitigation
  const mitigatedDamage = applyMitigation(damage, defenderStats);
  
  // step 5: calculate totals
  const totalDamage = damage.reduce((sum, d) => sum + d.amount, 0);
  const totalMitigatedDamage = mitigatedDamage.reduce((sum, d) => sum + d.amount, 0);
  
  return {
    hit: true,
    critical,
    damage: mitigatedDamage,
    totalDamage,
    mitigatedDamage: totalMitigatedDamage
  };
}

/**
 * create default combat stats (useful for testing)
 */
export function createDefaultCombatStats(): CombatStats {
  return {
    accuracy: 300,
    evasion: 200,
    armor: 100,
    energyShield: 0,
    fireResistance: 0,
    coldResistance: 0,
    lightningResistance: 0,
    chaosResistance: 0,
    criticalChance: 5, // 5%
    criticalMultiplier: 150, // 150% = 1.5x damage
    attacksPerSecond: 1.2,
    castSpeed: 1.0
  };
}