/**
 * combat system types
 * based on path of exile mechanics but simplified
 */

export enum DamageType {
  Physical = "physical",
  Fire = "fire",
  Cold = "cold",
  Lightning = "lightning",
  Chaos = "chaos"
}

export interface DamageAmount {
  type: DamageType;
  amount: number;
}

export interface AttackResult {
  hit: boolean;
  critical: boolean;
  damage: DamageAmount[];
  totalDamage: number;
  mitigatedDamage: number;
}

export interface CombatStats {
  accuracy: number;
  evasion: number;
  armor: number;
  energyShield: number;
  
  // resistances (-60% to 75% cap)
  fireResistance: number;
  coldResistance: number;
  lightningResistance: number;
  chaosResistance: number;
  
  // critical strike
  criticalChance: number;
  criticalMultiplier: number;
  
  // attack/cast speed
  attacksPerSecond: number;
  castSpeed: number;
}

export interface CombatAction {
  entityId: string;
  type: "attack" | "cast" | "move" | "wait";
  targetId?: string;
  skillId?: string;
  duration: number; // in milliseconds
  completed: boolean;
}

export interface CombatTick {
  tickNumber: number;
  timestamp: number;
  actions: CombatAction[];
  events: CombatEvent[];
}

export interface CombatEvent {
  type: "damage" | "heal" | "miss" | "critical" | "death" | "move";
  sourceId: string;
  targetId?: string;
  data: any;
}