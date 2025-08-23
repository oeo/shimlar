import { AffixTier, CommonAffixTiers } from "./types";

// utility function to create affix tiers easily
export const tier = (name: string, min: number, max: number, level: number): AffixTier => ({
  name,
  min,
  max,
  lvl: level
});

// common tier progressions used across multiple item categories
// these follow Path of Exile's tier progression closely
export const commonTiers: CommonAffixTiers = {
  // physical damage tiers for weapons (170-179% at max)
  physicalDamage: [
    tier("Heavy", 40, 49, 1),
    tier("Serrated", 50, 64, 11),
    tier("Wicked", 65, 84, 23),
    tier("Vicious", 85, 109, 35),
    tier("Bloodthirsty", 110, 134, 46),
    tier("Cruel", 135, 154, 60),
    tier("Tyrannical", 155, 169, 73),
    tier("Merciless", 170, 179, 83)
  ],

  // fire damage tiers for weapons  
  fireDamage: [
    tier("Heated", 1, 4, 1),
    tier("Smouldering", 8, 18, 11),
    tier("Smoking", 12, 28, 18),
    tier("Burning", 17, 39, 26),
    tier("Flaming", 21, 49, 33),
    tier("Scorching", 26, 61, 42),
    tier("Incinerating", 32, 74, 51),
    tier("Blasting", 38, 89, 62),
    tier("Cremating", 45, 106, 74)
  ],

  // cold damage tiers for weapons
  coldDamage: [
    tier("Frosted", 1, 3, 2),
    tier("Chilled", 6, 15, 12),
    tier("Icy", 10, 23, 19),
    tier("Frigid", 14, 32, 27),
    tier("Freezing", 17, 40, 34),
    tier("Frozen", 22, 50, 43),
    tier("Glaciated", 26, 60, 52),
    tier("Polar", 31, 73, 63),
    tier("Entombing", 37, 87, 75)
  ],

  // lightning damage tiers for weapons
  lightningDamage: [
    tier("Humming", 1, 6, 3),
    tier("Buzzing", 1, 28, 13),
    tier("Snapping", 1, 43, 19),
    tier("Crackling", 2, 61, 31),
    tier("Sparking", 2, 76, 34),
    tier("Arcing", 3, 93, 43),
    tier("Shocking", 4, 113, 52),
    tier("Discharging", 5, 135, 63),
    tier("Electrocuting", 6, 160, 75)
  ],

  // fire resistance tiers (suffix)
  fireResistance: [
    tier("of the Whelp", 6, 11, 1),
    tier("of the Salamander", 12, 17, 12),
    tier("of the Drake", 18, 23, 24),
    tier("of the Kiln", 24, 29, 36),
    tier("of the Furnace", 30, 35, 48),
    tier("of the Volcano", 36, 41, 60),
    tier("of the Phoenix", 42, 45, 72)
  ],

  // cold resistance tiers (suffix)
  coldResistance: [
    tier("of the Inuit", 6, 11, 1),
    tier("of the Seal", 12, 17, 12),
    tier("of the Penguin", 18, 23, 24),
    tier("of the Yeti", 24, 29, 36),
    tier("of the Walrus", 30, 35, 48),
    tier("of the Polar Bear", 36, 41, 60),
    tier("of the Ice", 42, 45, 72)
  ],

  // lightning resistance tiers (suffix)
  lightningResistance: [
    tier("of the Eel", 6, 11, 1),
    tier("of the Fish", 12, 17, 12),
    tier("of the Shark", 18, 23, 24),
    tier("of the Lynx", 24, 29, 36),
    tier("of the Cat", 30, 35, 48),
    tier("of the Storm", 36, 41, 60),
    tier("of the Thunder", 42, 45, 72)
  ],

  // chaos resistance tiers (suffix) - much rarer and lower values
  chaosResistance: [
    tier("of the Viper", 4, 6, 16),
    tier("of the Snake", 7, 10, 28),
    tier("of the Cobra", 11, 15, 40),
    tier("of the Asp", 16, 20, 52),
    tier("of the Poison", 21, 25, 64),
    tier("of the Plague", 26, 30, 76)
  ],

  // life tiers (suffix)
  life: [
    tier("of the Newborn", 10, 19, 1),
    tier("of the Whelp", 20, 29, 5),
    tier("of the Pup", 30, 39, 11),
    tier("of the Cub", 40, 49, 18),
    tier("of the Beast", 50, 59, 25),
    tier("of the Lion", 60, 69, 32),
    tier("of the Gladiator", 70, 79, 44),
    tier("of the King", 80, 89, 56),
    tier("of the Titan", 90, 99, 68),
    tier("of the Colossus", 100, 109, 80)
  ],

  // mana tiers (suffix)
  mana: [
    tier("of the Apprentice", 15, 24, 1),
    tier("of the Student", 25, 34, 8),
    tier("of the Scholar", 35, 44, 15),
    tier("of the Scribe", 45, 54, 22),
    tier("of the Mage", 55, 64, 29),
    tier("of the Sorcerer", 65, 74, 36),
    tier("of the Warlock", 75, 84, 46),
    tier("of the Wizard", 85, 94, 56),
    tier("of the Archmage", 95, 104, 66),
    tier("of the Elder", 105, 114, 76)
  ],

  // attack speed tiers for weapons (prefix)
  attackSpeed: [
    tier("Glinting", 5, 7, 8),
    tier("Gleaming", 8, 10, 18),
    tier("Shining", 11, 13, 28),
    tier("Radiant", 14, 16, 38),
    tier("Brilliant", 17, 19, 48),
    tier("Blinding", 20, 22, 58),
    tier("Prismatic", 23, 25, 68),
    tier("Kaleidoscopic", 26, 27, 78)
  ],

  // cast speed tiers for weapons (prefix)  
  castSpeed: [
    tier("Apprentice's", 5, 7, 8),
    tier("Student's", 8, 10, 18),
    tier("Scholar's", 11, 13, 28),
    tier("Mage's", 14, 16, 38),
    tier("Sorcerer's", 17, 19, 48),
    tier("Wizard's", 20, 22, 58),
    tier("Archmage's", 23, 25, 68),
    tier("Elder's", 26, 27, 78)
  ]
};

// helper functions for creating category-specific affixes
export const createElementalDamageAffix = (element: "fire" | "cold" | "lightning") => {
  const tiers = element === "fire" ? commonTiers.fireDamage 
                : element === "cold" ? commonTiers.coldDamage
                : commonTiers.lightningDamage;
  
  const capitalElement = element.charAt(0).toUpperCase() + element.slice(1);
  return {
    [`Adds # to # ${capitalElement} Damage`]: tiers
  };
};

export const createResistanceAffix = (element: "fire" | "cold" | "lightning" | "chaos") => {
  const tiers = element === "fire" ? commonTiers.fireResistance
                : element === "cold" ? commonTiers.coldResistance
                : element === "lightning" ? commonTiers.lightningResistance
                : commonTiers.chaosResistance;
                
  const capitalElement = element.charAt(0).toUpperCase() + element.slice(1);
  return {
    [`+#% to ${capitalElement} Resistance`]: tiers
  };
};