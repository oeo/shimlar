/**
 * character class definitions
 * based on path of exile's 7 classes
 */

import { Attributes } from "../components/StatsComponent";

export interface CharacterClass {
  id: string;
  name: string;
  description: string;
  baseAttributes: Attributes;
  startingLife: number;
  startingMana: number;
  lifePerLevel: number;
  manaPerLevel: number;
  ascendancies?: string[]; // future feature
}

/**
 * the 7 character classes forming the attribute triangle
 * 
 *              Witch (INT)
 *             /           \
 *      Templar             Shadow
 *     (STR/INT)          (DEX/INT)
 *         |                  |
 *     Marauder    Scion    Ranger
 *      (STR)     (ALL)     (DEX)
 *         \                 /
 *           Duelist
 *          (STR/DEX)
 */
export const CHARACTER_CLASSES: Map<string, CharacterClass> = new Map([
  ["marauder", {
    id: "marauder",
    name: "Marauder",
    description: "A mighty warrior who relies on raw strength to crush his enemies.",
    baseAttributes: {
      strength: 32,
      dexterity: 14,
      intelligence: 14
    },
    startingLife: 66,
    startingMana: 47,
    lifePerLevel: 12,
    manaPerLevel: 4,
    ascendancies: ["juggernaut", "berserker", "chieftain"]
  }],
  
  ["ranger", {
    id: "ranger",
    name: "Ranger",
    description: "A swift and agile fighter who relies on speed and precision.",
    baseAttributes: {
      strength: 14,
      dexterity: 32,
      intelligence: 14
    },
    startingLife: 57,
    startingMana: 47,
    lifePerLevel: 12,
    manaPerLevel: 4,
    ascendancies: ["deadeye", "raider", "pathfinder"]
  }],
  
  ["witch", {
    id: "witch",
    name: "Witch",
    description: "A powerful spellcaster who wields the elements to destroy her foes.",
    baseAttributes: {
      strength: 14,
      dexterity: 14,
      intelligence: 32
    },
    startingLife: 57,
    startingMana: 56,
    lifePerLevel: 12,
    manaPerLevel: 6,
    ascendancies: ["necromancer", "elementalist", "occultist"]
  }],
  
  ["duelist", {
    id: "duelist",
    name: "Duelist",
    description: "A master of arms who combines strength and speed in combat.",
    baseAttributes: {
      strength: 23,
      dexterity: 23,
      intelligence: 14
    },
    startingLife: 62,
    startingMana: 47,
    lifePerLevel: 12,
    manaPerLevel: 4,
    ascendancies: ["gladiator", "champion", "slayer"]
  }],
  
  ["templar", {
    id: "templar",
    name: "Templar",
    description: "A holy warrior who balances physical might with divine magic.",
    baseAttributes: {
      strength: 23,
      dexterity: 14,
      intelligence: 23
    },
    startingLife: 62,
    startingMana: 52,
    lifePerLevel: 12,
    manaPerLevel: 5,
    ascendancies: ["guardian", "hierophant", "inquisitor"]
  }],
  
  ["shadow", {
    id: "shadow",
    name: "Shadow",
    description: "A deadly assassin who strikes from darkness with critical precision.",
    baseAttributes: {
      strength: 14,
      dexterity: 23,
      intelligence: 23
    },
    startingLife: 57,
    startingMana: 52,
    lifePerLevel: 12,
    manaPerLevel: 5,
    ascendancies: ["assassin", "saboteur", "trickster"]
  }],
  
  ["scion", {
    id: "scion",
    name: "Scion",
    description: "A perfectly balanced exile who can develop in any direction.",
    baseAttributes: {
      strength: 20,
      dexterity: 20,
      intelligence: 20
    },
    startingLife: 60,
    startingMana: 50,
    lifePerLevel: 12,
    manaPerLevel: 5,
    ascendancies: ["ascendant"] // special case - can pick from other classes
  }]
]);

/**
 * get a character class by id
 */
export function getCharacterClass(id: string): CharacterClass | undefined {
  return CHARACTER_CLASSES.get(id.toLowerCase());
}

/**
 * get all character classes
 */
export function getAllCharacterClasses(): CharacterClass[] {
  return Array.from(CHARACTER_CLASSES.values());
}

/**
 * calculate total life for a character
 */
export function calculateMaxLife(
  characterClass: CharacterClass,
  level: number,
  additionalStrength: number = 0
): number {
  const baseLife = 38; // base life all characters have
  const lifeFromLevels = characterClass.lifePerLevel * (level - 1);
  const lifeFromStrength = (characterClass.baseAttributes.strength + additionalStrength) / 2;
  
  return Math.floor(
    baseLife + 
    characterClass.startingLife + 
    lifeFromLevels + 
    lifeFromStrength
  );
}

/**
 * calculate total mana for a character
 */
export function calculateMaxMana(
  characterClass: CharacterClass,
  level: number,
  additionalIntelligence: number = 0
): number {
  const baseMana = 34; // base mana all characters have
  const manaFromLevels = characterClass.manaPerLevel * (level - 1);
  const manaFromInt = (characterClass.baseAttributes.intelligence + additionalIntelligence) / 2;
  
  return Math.floor(
    baseMana + 
    characterClass.startingMana + 
    manaFromLevels + 
    manaFromInt
  );
}

/**
 * calculate evasion rating
 */
export function calculateEvasion(
  level: number,
  dexterity: number
): number {
  const baseEvasion = 53; // base evasion
  const evasionPerLevel = 3;
  
  return Math.floor(
    baseEvasion + 
    (level * evasionPerLevel) + 
    (dexterity * 0.2)
  );
}

/**
 * calculate accuracy rating
 */
export function calculateAccuracy(
  level: number,
  dexterity: number
): number {
  const baseAccuracy = 250;
  const accuracyPerLevel = 2;
  const accuracyPerDex = 2;
  
  return Math.floor(
    baseAccuracy + 
    (level * accuracyPerLevel) + 
    (dexterity * accuracyPerDex)
  );
}