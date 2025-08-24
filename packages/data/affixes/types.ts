// comprehensive affix type definitions for shimlar
export interface AffixTier {
  name: string;
  min: number;
  max: number;
  lvl: number;
}

export interface AffixDefinition {
  modType: string;
  displayTemplate: string; // e.g., "Adds # to # Fire Damage"
  tiers: AffixTier[];
}

export interface AffixPool {
  prefix: Record<string, AffixTier[]>;
  suffix: Record<string, AffixTier[]>;
  corrupted?: Record<string, AffixTier[]>;
}

export interface CategoryAffixes {
  category: string;
  pools: AffixPool;
}

// standard affix categories for weapons
export type WeaponAffixCategory = 
  | "oneHandedAxe"
  | "twoHandedAxe"
  | "oneHandedSword"
  | "twoHandedSword"
  | "oneHandedMace"
  | "twoHandedMace"
  | "dagger"
  | "claw"
  | "scepter"
  | "wand"
  | "bow"
  | "staff";

// armor affix categories by defense type
export type ArmorAffixCategory =
  | "armor"           // pure armor (AR)
  | "evasion"         // pure evasion (EV)  
  | "energyShield"    // pure energy shield (ES)
  | "armorEvasion"    // hybrid AR/EV
  | "armorEnergyShield" // hybrid AR/ES
  | "evasionEnergyShield" // hybrid EV/ES
  | "armorEvasionEnergyShield"; // tri-stat AR/EV/ES

// jewelry and accessory categories
export type AccessoryAffixCategory =
  | "ring"
  | "amulet"  
  | "belt"
  | "shield";

// flask categories
export type FlaskAffixCategory =
  | "lifeFlask"
  | "manaFlask"
  | "hybridFlask"
  | "utilityFlask";

// all affix categories combined
export type AffixCategory = 
  | WeaponAffixCategory
  | ArmorAffixCategory
  | AccessoryAffixCategory
  | FlaskAffixCategory;

// utility function type for creating affix tiers
export type AffixTierBuilder = (name: string, min: number, max: number, level: number) => AffixTier;

// common affix tier patterns
export interface CommonAffixTiers {
  // physical damage progression for weapons
  physicalDamage: AffixTier[];
  // elemental damage progressions
  fireDamage: AffixTier[];
  coldDamage: AffixTier[];
  lightningDamage: AffixTier[];
  // resistances for armor/jewelry
  fireResistance: AffixTier[];
  coldResistance: AffixTier[];
  lightningResistance: AffixTier[];
  chaosResistance: AffixTier[];
  // life and mana
  life: AffixTier[];
  mana: AffixTier[];
  // attack and cast speed
  attackSpeed: AffixTier[];
  castSpeed: AffixTier[];
}