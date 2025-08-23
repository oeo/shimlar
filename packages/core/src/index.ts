// @shimlar/core - game mechanics and logic
export const version = "0.0.1";

// events
export { EventBus } from "./events/EventBus";
export { GameEventType, type GameEventMap } from "./events/GameEvents";
export type * from "./events/GameEvents";

// entities
export { Entity, type Component } from "./entities/Entity";

// components
export { HealthComponent } from "./components/HealthComponent";
export { StatsComponent, type Attributes, type DerivedStats } from "./components/StatsComponent";
export { PositionComponent, CombatPosition } from "./components/PositionComponent";

// zones
export { Zone, type ZoneData, type MonsterPack } from "./zones/Zone";
export { ZoneManager } from "./zones/ZoneManager";

// character
export { 
  type CharacterClass,
  CHARACTER_CLASSES,
  getCharacterClass,
  getAllCharacterClasses,
  calculateMaxLife,
  calculateMaxMana,
  calculateEvasion,
  calculateAccuracy
} from "./character/CharacterClass";
export { Character, createCharacter, type CharacterData } from "./character/Character";

// combat
export { CombatEngine, type CombatEngineOptions } from "./combat/CombatEngine";
export { CombatLog, type LogEntry, type LogEntryDetails, type CombatLogOptions } from "./combat/CombatLog";
export { 
  DotManager, 
  DotApplications, 
  DotType,
  type DotEffect,
  type DotApplication,
  type DotTickResult
} from "./combat/DamageOverTime";
export { 
  calculateHitChance,
  rollHit,
  rollCritical,
  applyCriticalDamage,
  calculateArmorReduction,
  calculateResistanceReduction,
  applyMitigation,
  calculateAttackResult,
  createDefaultCombatStats,
  type DamageCalculationParams
} from "./combat/formulas";
export type { 
  DamageType, 
  DamageAmount, 
  AttackResult, 
  CombatStats, 
  CombatAction, 
  CombatTick, 
  CombatEvent 
} from "./combat/types";