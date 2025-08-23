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

// items
export { 
  ItemCategory,
  WeaponType,
  ArmorType, 
  ItemSlot,
  ALL_BASE_ITEM_TYPES,
  WEAPON_BASE_TYPES,
  ARMOR_BASE_TYPES,
  ACCESSORY_BASE_TYPES,
  FLASK_BASE_TYPES,
  getBaseItemTypesByCategory,
  getBaseItemTypeByName,
  type BaseItemType,
  type StatRequirements
} from "./items/BaseItemTypes";
export {
  AffixType,
  affixData,
  getAvailableAffixes,
  rollRandomAffix,
  type Affix,
  type AffixTier,
  type AffixDefinition,
  type AffixPool
} from "./items/AffixSystem";
export {
  ItemRarity,
  itemGenerator,
  calculateItemRequirements,
  canEquipItem,
  getItemDisplayName,
  getItemDisplayColor,
  generateItemFromBase,
  type Item,
  type ItemGenerationOptions
} from "./items/ItemGeneration";
export {
  EquipmentManager,
  compareItems,
  type EquipmentSlots,
  type EquippedStats,
  type ItemComparison
} from "./items/Equipment";