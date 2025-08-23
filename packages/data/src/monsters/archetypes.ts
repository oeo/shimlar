import { MonsterRarity } from "./types";

// monster behavioral archetypes
export enum MonsterArchetype {
  Physical = "physical",    // melee fighters, prefer weapon/armor drops
  Caster = "caster",       // spellcasters, slightly more currency/caster gear
  Ranged = "ranged",       // archers, prefer bow drops
  Mixed = "mixed"          // balanced, no special preferences
}

// monster subtypes (mostly cosmetic/thematic)
export enum MonsterSubtype {
  Zombie = "zombie",
  Skeleton = "skeleton", 
  Spider = "spider",
  Goatman = "goatman",
  Cannibal = "cannibal",
  Orc = "orc",
  Beast = "beast",
  Demon = "demon",
  Undead = "undead",
  Construct = "construct"
}

// archetype-based loot table modifications
export const archetypeLootModifiers = {
  [MonsterArchetype.Physical]: {
    // no special modifiers - uses base loot tables as-is
  },
  
  [MonsterArchetype.Caster]: {
    // slight boost to currency drops
    currencyWeightBonus: 10,
    equipmentWeightReduction: -10
  },
  
  [MonsterArchetype.Ranged]: {
    // no special modifiers for now
  },
  
  [MonsterArchetype.Mixed]: {
    // no special modifiers
  }
};

// create a monster with simple parameters
export interface SimpleMonster {
  id: string;
  name: string;
  archetype: MonsterArchetype;
  subtype: MonsterSubtype;
  level: number;
  rarity: MonsterRarity;
}

// helper to create monsters quickly
export function createMonster(
  id: string,
  name: string, 
  archetype: MonsterArchetype,
  subtype: MonsterSubtype,
  level: number,
  rarity: MonsterRarity = MonsterRarity.Normal
): SimpleMonster {
  return {
    id,
    name,
    archetype,
    subtype,
    level,
    rarity
  };
}

// convenience functions for common archetypes
export const createPhysicalMonster = (id: string, name: string, subtype: MonsterSubtype, level: number, rarity = MonsterRarity.Normal) =>
  createMonster(id, name, MonsterArchetype.Physical, subtype, level, rarity);

export const createCasterMonster = (id: string, name: string, subtype: MonsterSubtype, level: number, rarity = MonsterRarity.Normal) =>  
  createMonster(id, name, MonsterArchetype.Caster, subtype, level, rarity);

export const createRangedMonster = (id: string, name: string, subtype: MonsterSubtype, level: number, rarity = MonsterRarity.Normal) =>
  createMonster(id, name, MonsterArchetype.Ranged, subtype, level, rarity);