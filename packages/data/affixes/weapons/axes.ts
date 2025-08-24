import { AffixPool } from "../types";
import { commonTiers, createElementalDamageAffix, tier } from "../common-tiers";

// axe-specific affixes (both one-handed and two-handed)
export const axeAffixes: AffixPool = {
  prefix: {
    // physical damage - core axe mod
    "#% increased Physical Damage": commonTiers.physicalDamage,

    // elemental damage additions
    ...createElementalDamageAffix("fire"),
    ...createElementalDamageAffix("cold"), 
    ...createElementalDamageAffix("lightning"),

    // attack speed
    "#% increased Attack Speed": commonTiers.attackSpeed,

    // critical strike chance
    "#% increased Critical Strike Chance": [
      tier("Glinting", 20, 24, 8),
      tier("Gleaming", 25, 29, 18),
      tier("Shining", 30, 34, 28),
      tier("Radiant", 35, 39, 38),
      tier("Brilliant", 40, 44, 48),
      tier("Blinding", 45, 49, 58),
      tier("Prismatic", 50, 54, 68),
      tier("Kaleidoscopic", 55, 60, 78)
    ],

    // critical strike multiplier  
    "+#% to Critical Strike Multiplier": [
      tier("Rapturous", 15, 19, 23),
      tier("Ecstatic", 20, 24, 35),
      tier("Euphoric", 25, 29, 47),
      tier("Rhapsodic", 30, 34, 59),
      tier("Empyrean", 35, 38, 71)
    ],

    // life leech for melee weapons
    "#% of Physical Attack Damage Leeched as Life": [
      tier("Remora's", 0.2, 0.4, 50),
      tier("Lamprey's", 0.6, 0.8, 60),
      tier("Vampire's", 1.0, 1.2, 70)
    ],

    // mana leech 
    "#% of Physical Attack Damage Leeched as Mana": [
      tier("Thirsty", 0.2, 0.4, 50),
      tier("Parched", 0.6, 0.8, 60),
      tier("Desiccated", 1.0, 1.2, 70)
    ],

    // accuracy rating
    "+# to Accuracy Rating": [
      tier("Polished", 60, 119, 1),
      tier("Honed", 120, 199, 11),
      tier("Razor", 200, 299, 23),
      tier("Keen", 300, 399, 35),
      tier("Sharp", 400, 499, 47),
      tier("Fine", 500, 599, 59),
      tier("Surgical", 600, 699, 71),
      tier("Perfect", 700, 800, 83)
    ],

    // socketed gem bonuses (rarer, higher level)
    "+# to Level of Socketed Melee Gems": [
      tier("Combatant's", 1, 1, 8),
      tier("Weaponmaster's", 2, 2, 63)
    ],

    "+# to Level of Socketed Gems": [
      tier("Paragon's", 1, 1, 50)
    ],

    // elemental weapon damage scaling
    "#% increased Elemental Damage with Weapons": [
      tier("Catalysing", 5, 10, 4),
      tier("Infusing", 11, 20, 15),
      tier("Empowering", 21, 30, 30),
      tier("Unleashed", 31, 36, 60),
      tier("Overpowering", 37, 42, 81)
    ]
  },

  suffix: {
    // weapon-specific offensive suffixes only

    // attributes (weapons can have these)
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

    // weapon-specific combat mods
    "#% increased Stun Duration on enemies": [
      tier("of Stunning", 10, 14, 18),
      tier("of Demolishing", 15, 19, 30),
      tier("of Crushing", 20, 24, 42),
      tier("of Smashing", 25, 29, 54),
      tier("of Devastation", 30, 35, 66)
    ],

    // chance to cause status ailments
    "#% chance to Ignite": [
      tier("of Burning", 5, 7, 12),
      tier("of Flames", 8, 10, 24),
      tier("of Immolation", 11, 12, 42)
    ],

    "#% chance to Freeze": [
      tier("of Freezing", 5, 7, 12),
      tier("of Ice", 8, 10, 24),
      tier("of the Glacier", 11, 12, 42)
    ],

    "#% chance to Shock": [
      tier("of Shocking", 5, 7, 12),
      tier("of Lightning", 8, 10, 24),
      tier("of the Storm", 11, 12, 42)
    ],

    // reduced requirements
    "#% reduced Attribute Requirements": [
      tier("of Ease", 6, 8, 11),
      tier("of the Worthy", 9, 11, 22),
      tier("of the Apt", 12, 14, 36),
      tier("of the Adept", 15, 16, 60)
    ],

    // weapon range (for melee weapons)
    "+# to Melee Range": [
      tier("of Reach", 1, 1, 20),
      tier("of Extension", 2, 2, 45)
    ],

    // light radius (minor utility)
    "+# to Light Radius": [
      tier("of Light", 10, 15, 5),
      tier("of Radiance", 16, 20, 20),
      tier("of Brilliance", 21, 25, 40)
    ]
  }
};