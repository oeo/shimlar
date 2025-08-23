import { AffixPool } from "../types";
import { commonTiers, createResistanceAffix, tier } from "../common-tiers";

// ring-specific affixes
export const ringAffixes: AffixPool = {
  prefix: {
    // elemental damage additions for rings
    "Adds # to # Fire Damage to Attacks": [
      tier("Heated", 1, 2, 1),
      tier("Smouldering", 3, 6, 11),
      tier("Smoking", 5, 10, 18),
      tier("Burning", 8, 15, 26),
      tier("Flaming", 10, 19, 33),
      tier("Scorching", 13, 24, 42),
      tier("Incinerating", 16, 30, 51),
      tier("Blasting", 19, 36, 62),
      tier("Cremating", 23, 43, 74)
    ],

    "Adds # to # Cold Damage to Attacks": [
      tier("Frosted", 1, 2, 2),
      tier("Chilled", 3, 8, 12),
      tier("Icy", 5, 12, 19),
      tier("Frigid", 7, 16, 27),
      tier("Freezing", 9, 20, 34),
      tier("Frozen", 11, 25, 43),
      tier("Glaciated", 13, 30, 52),
      tier("Polar", 15, 36, 63),
      tier("Entombing", 18, 43, 75)
    ],

    "Adds # to # Lightning Damage to Attacks": [
      tier("Humming", 1, 3, 3),
      tier("Buzzing", 1, 14, 13),
      tier("Snapping", 1, 21, 19),
      tier("Crackling", 1, 30, 31),
      tier("Sparking", 1, 38, 34),
      tier("Arcing", 1, 46, 43),
      tier("Shocking", 2, 56, 52),
      tier("Discharging", 2, 67, 63),
      tier("Electrocuting", 3, 80, 75)
    ],

    // weapon elemental damage (global modifier)
    "#% increased Elemental Damage with Weapons": [
      tier("Catalysing", 6, 10, 10),
      tier("Infusing", 11, 16, 20),
      tier("Empowering", 17, 22, 35),
      tier("Unleashed", 23, 28, 50),
      tier("Overpowering", 29, 32, 70)
    ],

    // cast speed for caster rings
    "#% increased Cast Speed": [
      tier("Apprentice's", 3, 5, 15),
      tier("Student's", 6, 8, 25),
      tier("Scholar's", 9, 11, 35),
      tier("Mage's", 12, 14, 50),
      tier("Sorcerer's", 15, 16, 65)
    ],

    // attack speed for melee rings  
    "#% increased Attack Speed": [
      tier("Glinting", 3, 5, 15),
      tier("Gleaming", 6, 8, 25),
      tier("Shining", 9, 11, 35),
      tier("Radiant", 12, 14, 50),
      tier("Brilliant", 15, 16, 65)
    ]
  },

  suffix: {
    // resistances - rings are primary source
    ...createResistanceAffix("fire"),
    ...createResistanceAffix("cold"),
    ...createResistanceAffix("lightning"),
    ...createResistanceAffix("chaos"),

    // life and mana
    "+# to maximum Life": commonTiers.life,
    "+# to maximum Mana": commonTiers.mana,

    // attributes
    "+# to Strength": [
      tier("of the Brute", 8, 12, 1),
      tier("of the Wrestler", 13, 17, 11),
      tier("of the Bear", 18, 22, 22),
      tier("of the Gorilla", 23, 27, 33),
      tier("of the Goliath", 28, 32, 44),
      tier("of the Titan", 33, 37, 55),
      tier("of the Colossus", 38, 42, 66),
      tier("of the Leviathan", 43, 47, 77)
    ],

    "+# to Dexterity": [
      tier("of the Lizard", 8, 12, 1),
      tier("of the Monkey", 13, 17, 11),
      tier("of the Lynx", 18, 22, 22),
      tier("of the Fox", 23, 27, 33),
      tier("of the Falcon", 28, 32, 44),
      tier("of the Jaguar", 33, 37, 55),
      tier("of the Cheetah", 38, 42, 66),
      tier("of the Phoenix", 43, 47, 77)
    ],

    "+# to Intelligence": [
      tier("of the Poet", 8, 12, 1),
      tier("of the Student", 13, 17, 11),
      tier("of the Scholar", 18, 22, 22),
      tier("of the Sage", 23, 27, 33),
      tier("of the Polymath", 28, 32, 44),
      tier("of the Genius", 33, 37, 55),
      tier("of the Mastermind", 38, 42, 66),
      tier("of the Savant", 43, 47, 77)
    ],

    // all attributes
    "+# to all Attributes": [
      tier("of the Gladiator", 5, 8, 25),
      tier("of the Champion", 9, 12, 35),
      tier("of the Warlord", 13, 16, 45),
      tier("of the Conqueror", 17, 20, 55),
      tier("of the Emperor", 21, 23, 65)
    ],

    // ITEM QUANTITY/RARITY - the main loot affixes!
    "#% increased Quantity of Items found": [
      tier("of Bounty", 3, 6, 20),
      tier("of Plentiful", 7, 10, 35),
      tier("of Abundance", 11, 15, 50),
      tier("of Wealth", 16, 20, 65),
      tier("of Opulence", 21, 25, 80)
    ],

    "#% increased Rarity of Items found": [
      tier("of Quality", 5, 10, 15),
      tier("of Superiority", 11, 20, 30),
      tier("of Excellence", 21, 30, 45),
      tier("of Perfection", 31, 40, 60),
      tier("of the Divine", 41, 50, 75)
    ],

    // mana/life leech for rings
    "#% of Physical Attack Damage Leeched as Life": [
      tier("of the Remora", 0.5, 1.0, 40),
      tier("of the Lamprey", 1.1, 1.5, 55),
      tier("of the Vampire", 1.6, 2.0, 70)
    ],

    "#% of Physical Attack Damage Leeched as Mana": [
      tier("of Thirst", 0.5, 1.0, 40),
      tier("of Hunger", 1.1, 1.5, 55),
      tier("of Consumption", 1.6, 2.0, 70)
    ],

    // energy shield for rings
    "+# to maximum Energy Shield": [
      tier("of the Student", 4, 8, 10),
      tier("of the Scholar", 9, 15, 20),
      tier("of the Sage", 16, 24, 35),
      tier("of the Genius", 25, 35, 50),
      tier("of the Mastermind", 36, 48, 65)
    ],

    // reduced requirements
    "#% reduced Attribute Requirements": [
      tier("of Ease", 6, 8, 11),
      tier("of the Worthy", 9, 11, 22),
      tier("of the Apt", 12, 14, 36),
      tier("of the Adept", 15, 16, 60)
    ]
  }
};