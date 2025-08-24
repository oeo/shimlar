export enum ItemCategory {
  // weapons
  OneHandedAxe = "One Handed Axe",
  Claw = "Claw", 
  Dagger = "Dagger",
  OneHandedMace = "One Handed Mace",
  Scepter = "Scepter",
  OneHandedSword = "One Handed Sword", 
  Wand = "Wand",
  TwoHandedAxe = "Two Handed Axe",
  Bow = "Bow",
  TwoHandedMace = "Two Handed Mace", 
  Staff = "Staff",
  TwoHandedSword = "Two Handed Sword",
  
  // shields
  Shield = "Shield",
  
  // armor
  Helmet = "Helmet",
  BodyArmor = "Body Armor", 
  Gloves = "Gloves",
  Boots = "Boots",
  
  // jewelry  
  Amulet = "Amulet",
  Belt = "Belt",
  Ring = "Ring",
  
  // flasks
  LifeFlask = "Life",
  ManaFlask = "Mana", 
  HybridFlask = "Hybrid",
  UtilityFlask = "Utility",
  CriticalUtilityFlask = "Critical Utility",
  
  // other equipment
  Quiver = "Quiver",
  
  // jewels
  CrimsonJewel = "Crimson",
  ViridianJewel = "Viridian",
  CobaltJewel = "Cobalt",
  PrismaticJewel = "Prismatic",
}

export enum WeaponType {
  OneHanded = "one-handed",
  TwoHanded = "two-handed",
  Bow = "bow",
  Wand = "wand",
  Staff = "staff",
}

export enum ArmorType {
  Armor = "armor", // ar
  Evasion = "evasion", // ev 
  EnergyShield = "energy-shield", // es
  ArmorEvasion = "armor-evasion", // ar/ev
  ArmorEnergyShield = "armor-energy-shield", // ar/es
  EvasionEnergyShield = "evasion-energy-shield", // ev/es
  Hybrid = "hybrid", // ar/ev/es
}

export enum ItemSlot {
  // weapons
  MainHand = "main-hand",
  OffHand = "off-hand", // shield or dual wield
  
  // armor
  Helmet = "helmet",
  BodyArmor = "body-armor", 
  Gloves = "gloves",
  Boots = "boots",
  
  // jewelry
  Amulet = "amulet",
  Belt = "belt", 
  RingLeft = "ring-left",
  RingRight = "ring-right",
  
  // consumables
  Flask1 = "flask-1",
  Flask2 = "flask-2", 
  Flask3 = "flask-3",
  Flask4 = "flask-4",
  Flask5 = "flask-5",
}

export interface StatRequirements {
  level: number;
  strength: number;
  dexterity: number; 
  intelligence: number;
}

export interface BaseItemType {
  category: ItemCategory;
  name: string;
  itemClass: "weapon" | "armor" | "accessory" | "flask";
  slot: ItemSlot | ItemSlot[]; // some items can go in multiple slots
  weaponType?: WeaponType;
  armorType?: ArmorType;
  requirements: StatRequirements;
  implicitMods?: string[]; // base implicit properties
  tags: string[]; // for affix filtering
}

// weapon base types
export const WEAPON_BASE_TYPES: BaseItemType[] = [
  // one-handed axes
  {
    category: ItemCategory.OneHandedAxe,
    name: "Rusted Hatchet",
    itemClass: "weapon",
    slot: [ItemSlot.MainHand, ItemSlot.OffHand],
    weaponType: WeaponType.OneHanded,
    requirements: { level: 1, strength: 12, dexterity: 0, intelligence: 0 },
    tags: ["weapon", "melee", "axe", "one-handed"]
  },
  {
    category: ItemCategory.OneHandedAxe, 
    name: "Jade Hatchet",
    itemClass: "weapon",
    slot: [ItemSlot.MainHand, ItemSlot.OffHand],
    weaponType: WeaponType.OneHanded,
    requirements: { level: 7, strength: 21, dexterity: 0, intelligence: 0 },
    tags: ["weapon", "melee", "axe", "one-handed"]
  },
  
  // claws
  {
    category: ItemCategory.Claw,
    name: "Nailed Fist", 
    itemClass: "weapon",
    slot: [ItemSlot.MainHand, ItemSlot.OffHand],
    weaponType: WeaponType.OneHanded,
    requirements: { level: 1, strength: 8, dexterity: 8, intelligence: 0 },
    implicitMods: ["2% of Physical Attack Damage Leeched as Life"],
    tags: ["weapon", "melee", "claw", "one-handed"]
  },
  
  // daggers
  {
    category: ItemCategory.Dagger,
    name: "Glass Shank",
    itemClass: "weapon", 
    slot: [ItemSlot.MainHand, ItemSlot.OffHand],
    weaponType: WeaponType.OneHanded,
    requirements: { level: 1, strength: 0, dexterity: 12, intelligence: 0 },
    implicitMods: ["30% increased Critical Strike Chance"],
    tags: ["weapon", "melee", "dagger", "one-handed"]
  },
  
  // one-handed maces
  {
    category: ItemCategory.OneHandedMace,
    name: "Driftwood Club",
    itemClass: "weapon",
    slot: [ItemSlot.MainHand, ItemSlot.OffHand],
    weaponType: WeaponType.OneHanded,
    requirements: { level: 1, strength: 14, dexterity: 0, intelligence: 0 },
    tags: ["weapon", "melee", "mace", "one-handed"]
  },
  {
    category: ItemCategory.OneHandedMace,
    name: "Stone Hammer",
    itemClass: "weapon",
    slot: [ItemSlot.MainHand, ItemSlot.OffHand],
    weaponType: WeaponType.OneHanded,
    requirements: { level: 15, strength: 35, dexterity: 0, intelligence: 0 },
    tags: ["weapon", "melee", "mace", "one-handed"]
  },
  
  // scepters
  {
    category: ItemCategory.Scepter,
    name: "Driftwood Sceptre",
    itemClass: "weapon",
    slot: [ItemSlot.MainHand, ItemSlot.OffHand],
    weaponType: WeaponType.OneHanded,
    requirements: { level: 1, strength: 8, dexterity: 0, intelligence: 8 },
    implicitMods: ["10% increased Elemental Damage"],
    tags: ["weapon", "melee", "scepter", "one-handed", "caster"]
  },
  {
    category: ItemCategory.Scepter,
    name: "Bronze Sceptre",
    itemClass: "weapon",
    slot: [ItemSlot.MainHand, ItemSlot.OffHand],
    weaponType: WeaponType.OneHanded,
    requirements: { level: 10, strength: 22, dexterity: 0, intelligence: 22 },
    implicitMods: ["12% increased Elemental Damage"],
    tags: ["weapon", "melee", "scepter", "one-handed", "caster"]
  },
  
  // one-handed swords
  {
    category: ItemCategory.OneHandedSword,
    name: "Rusted Sword",
    itemClass: "weapon",
    slot: [ItemSlot.MainHand, ItemSlot.OffHand],
    weaponType: WeaponType.OneHanded,
    requirements: { level: 1, strength: 8, dexterity: 8, intelligence: 0 },
    tags: ["weapon", "melee", "sword", "one-handed"]
  },
  {
    category: ItemCategory.OneHandedSword,
    name: "Copper Sword",
    itemClass: "weapon",
    slot: [ItemSlot.MainHand, ItemSlot.OffHand],
    weaponType: WeaponType.OneHanded,
    requirements: { level: 5, strength: 14, dexterity: 14, intelligence: 0 },
    tags: ["weapon", "melee", "sword", "one-handed"]
  },
  
  // two-handed axes
  {
    category: ItemCategory.TwoHandedAxe,
    name: "Stone Axe",
    itemClass: "weapon",
    slot: ItemSlot.MainHand,
    weaponType: WeaponType.TwoHanded,
    requirements: { level: 4, strength: 18, dexterity: 0, intelligence: 0 },
    tags: ["weapon", "melee", "axe", "two-handed"]
  },
  {
    category: ItemCategory.TwoHandedAxe,
    name: "Jade Chopper",
    itemClass: "weapon",
    slot: ItemSlot.MainHand,
    weaponType: WeaponType.TwoHanded,
    requirements: { level: 9, strength: 27, dexterity: 0, intelligence: 0 },
    tags: ["weapon", "melee", "axe", "two-handed"]
  },
  
  // two-handed maces
  {
    category: ItemCategory.TwoHandedMace,
    name: "Driftwood Maul",
    itemClass: "weapon",
    slot: ItemSlot.MainHand,
    weaponType: WeaponType.TwoHanded,
    requirements: { level: 3, strength: 20, dexterity: 0, intelligence: 0 },
    tags: ["weapon", "melee", "mace", "two-handed"]
  },
  {
    category: ItemCategory.TwoHandedMace,
    name: "Tribal Maul",
    itemClass: "weapon",
    slot: ItemSlot.MainHand,
    weaponType: WeaponType.TwoHanded,
    requirements: { level: 8, strength: 26, dexterity: 0, intelligence: 0 },
    tags: ["weapon", "melee", "mace", "two-handed"]
  },
  
  // two-handed swords
  {
    category: ItemCategory.TwoHandedSword,
    name: "Corroded Blade",
    itemClass: "weapon",
    slot: ItemSlot.MainHand, 
    weaponType: WeaponType.TwoHanded,
    requirements: { level: 8, strength: 26, dexterity: 0, intelligence: 0 },
    tags: ["weapon", "melee", "sword", "two-handed"]
  },
  {
    category: ItemCategory.TwoHandedSword,
    name: "Longsword",
    itemClass: "weapon",
    slot: ItemSlot.MainHand,
    weaponType: WeaponType.TwoHanded,
    requirements: { level: 14, strength: 37, dexterity: 14, intelligence: 0 },
    tags: ["weapon", "melee", "sword", "two-handed"]
  },
  
  // bows
  {
    category: ItemCategory.Bow,
    name: "Crude Bow", 
    itemClass: "weapon",
    slot: ItemSlot.MainHand,
    weaponType: WeaponType.Bow,
    requirements: { level: 1, strength: 0, dexterity: 14, intelligence: 0 },
    tags: ["weapon", "bow", "ranged"]
  },
  
  // staves
  {
    category: ItemCategory.Staff,
    name: "Gnarled Branch",
    itemClass: "weapon",
    slot: ItemSlot.MainHand,
    weaponType: WeaponType.Staff, 
    requirements: { level: 1, strength: 0, dexterity: 0, intelligence: 14 },
    implicitMods: ["18% Chance to Block"],
    tags: ["weapon", "staff", "caster", "two-handed"]
  },
  
  // wands
  {
    category: ItemCategory.Wand,
    name: "Driftwood Wand",
    itemClass: "weapon",
    slot: [ItemSlot.MainHand, ItemSlot.OffHand],
    weaponType: WeaponType.Wand,
    requirements: { level: 1, strength: 0, dexterity: 0, intelligence: 11 },
    implicitMods: ["20% increased Spell Damage"],
    tags: ["weapon", "wand", "caster", "one-handed"]
  }
];

// armor base types  
export const ARMOR_BASE_TYPES: BaseItemType[] = [
  // helmets
  {
    category: ItemCategory.Helmet,
    name: "Iron Hat",
    itemClass: "armor",
    slot: ItemSlot.Helmet,
    armorType: ArmorType.Armor,
    requirements: { level: 1, strength: 8, dexterity: 0, intelligence: 0 },
    tags: ["armor", "helmet", "str"]
  },
  {
    category: ItemCategory.Helmet, 
    name: "Leather Cap",
    itemClass: "armor",
    slot: ItemSlot.Helmet,
    armorType: ArmorType.Evasion,
    requirements: { level: 1, strength: 0, dexterity: 8, intelligence: 0 },
    tags: ["armor", "helmet", "dex"]
  },
  {
    category: ItemCategory.Helmet,
    name: "Vine Circlet", 
    itemClass: "armor",
    slot: ItemSlot.Helmet,
    armorType: ArmorType.EnergyShield,
    requirements: { level: 1, strength: 0, dexterity: 0, intelligence: 8 },
    tags: ["armor", "helmet", "int"]
  },
  
  // body armor
  {
    category: ItemCategory.BodyArmor,
    name: "Plate Vest",
    itemClass: "armor", 
    slot: ItemSlot.BodyArmor,
    armorType: ArmorType.Armor,
    requirements: { level: 1, strength: 17, dexterity: 0, intelligence: 0 },
    tags: ["armor", "body", "str"]
  },
  {
    category: ItemCategory.BodyArmor,
    name: "Leather Jerkin",
    itemClass: "armor",
    slot: ItemSlot.BodyArmor, 
    armorType: ArmorType.Evasion,
    requirements: { level: 1, strength: 0, dexterity: 17, intelligence: 0 },
    tags: ["armor", "body", "dex"]
  },
  {
    category: ItemCategory.BodyArmor,
    name: "Simple Robe",
    itemClass: "armor",
    slot: ItemSlot.BodyArmor,
    armorType: ArmorType.EnergyShield,
    requirements: { level: 1, strength: 0, dexterity: 0, intelligence: 17 },
    tags: ["armor", "body", "int"]
  },
  
  // gloves
  {
    category: ItemCategory.Gloves,
    name: "Iron Gauntlets",
    itemClass: "armor",
    slot: ItemSlot.Gloves,
    armorType: ArmorType.Armor,
    requirements: { level: 1, strength: 8, dexterity: 0, intelligence: 0 },
    tags: ["armor", "gloves", "str"]
  },
  {
    category: ItemCategory.Gloves,
    name: "Rawhide Gloves",
    itemClass: "armor",
    slot: ItemSlot.Gloves,
    armorType: ArmorType.Evasion,
    requirements: { level: 1, strength: 0, dexterity: 8, intelligence: 0 },
    tags: ["armor", "gloves", "dex"]
  },
  {
    category: ItemCategory.Gloves,
    name: "Wool Gloves",
    itemClass: "armor",
    slot: ItemSlot.Gloves,
    armorType: ArmorType.EnergyShield,
    requirements: { level: 1, strength: 0, dexterity: 0, intelligence: 8 },
    tags: ["armor", "gloves", "int"]
  },
  
  // boots
  {
    category: ItemCategory.Boots,
    name: "Iron Greaves",
    itemClass: "armor",
    slot: ItemSlot.Boots,
    armorType: ArmorType.Armor,
    requirements: { level: 1, strength: 8, dexterity: 0, intelligence: 0 },
    tags: ["armor", "boots", "str"]
  },
  {
    category: ItemCategory.Boots,
    name: "Rawhide Boots",
    itemClass: "armor",
    slot: ItemSlot.Boots,
    armorType: ArmorType.Evasion,
    requirements: { level: 1, strength: 0, dexterity: 8, intelligence: 0 },
    tags: ["armor", "boots", "dex"]
  },
  {
    category: ItemCategory.Boots,
    name: "Wool Shoes",
    itemClass: "armor",
    slot: ItemSlot.Boots,
    armorType: ArmorType.EnergyShield,
    requirements: { level: 1, strength: 0, dexterity: 0, intelligence: 8 },
    tags: ["armor", "boots", "int"]
  },
  
  // shields
  {
    category: ItemCategory.Shield,
    name: "Splintered Tower Shield",
    itemClass: "armor",
    slot: ItemSlot.OffHand,
    armorType: ArmorType.Armor, 
    requirements: { level: 1, strength: 12, dexterity: 0, intelligence: 0 },
    implicitMods: ["Chance to Block: 20%"],
    tags: ["armor", "shield", "str"]
  },
  {
    category: ItemCategory.Shield,
    name: "Goathide Buckler",
    itemClass: "armor",
    slot: ItemSlot.OffHand,
    armorType: ArmorType.Evasion,
    requirements: { level: 1, strength: 0, dexterity: 12, intelligence: 0 },
    implicitMods: ["Chance to Block: 15%"],
    tags: ["armor", "shield", "dex"]
  },
  {
    category: ItemCategory.Shield,
    name: "Twig Spirit Shield",
    itemClass: "armor",
    slot: ItemSlot.OffHand,
    armorType: ArmorType.EnergyShield,
    requirements: { level: 1, strength: 0, dexterity: 0, intelligence: 12 },
    implicitMods: ["Chance to Block: 10%", "+5% increased Spell Damage"],
    tags: ["armor", "shield", "int"]
  }
];

// accessory base types
export const ACCESSORY_BASE_TYPES: BaseItemType[] = [
  // quivers
  {
    category: ItemCategory.Quiver,
    name: "Serrated Arrow Quiver",
    itemClass: "accessory",
    slot: ItemSlot.OffHand,
    requirements: { level: 5, strength: 0, dexterity: 14, intelligence: 0 },
    implicitMods: ["10% increased Attack Speed with Bows"],
    tags: ["accessory", "quiver"]
  },
  {
    category: ItemCategory.Quiver,
    name: "Two-Point Arrow Quiver",
    itemClass: "accessory",
    slot: ItemSlot.OffHand,
    requirements: { level: 12, strength: 0, dexterity: 26, intelligence: 0 },
    implicitMods: ["20% increased Critical Strike Chance with Bows"],
    tags: ["accessory", "quiver"]
  },
  
  // rings
  {
    category: ItemCategory.Ring,
    name: "Iron Ring",
    itemClass: "accessory",
    slot: [ItemSlot.RingLeft, ItemSlot.RingRight],
    requirements: { level: 1, strength: 0, dexterity: 0, intelligence: 0 },
    implicitMods: ["+1 to maximum Life"],
    tags: ["accessory", "ring"]
  },
  {
    category: ItemCategory.Ring,
    name: "Gold Ring", 
    itemClass: "accessory",
    slot: [ItemSlot.RingLeft, ItemSlot.RingRight],
    requirements: { level: 6, strength: 0, dexterity: 0, intelligence: 0 },
    implicitMods: ["+3 to maximum Life"],
    tags: ["accessory", "ring"]
  },
  
  // amulets
  {
    category: ItemCategory.Amulet,
    name: "Coral Amulet",
    itemClass: "accessory",
    slot: ItemSlot.Amulet,
    requirements: { level: 1, strength: 0, dexterity: 0, intelligence: 0 },
    implicitMods: ["+20 to maximum Life"],
    tags: ["accessory", "amulet"]
  },
  
  // belts
  {
    category: ItemCategory.Belt,
    name: "Rustic Sash", 
    itemClass: "accessory",
    slot: ItemSlot.Belt,
    requirements: { level: 1, strength: 0, dexterity: 0, intelligence: 0 },
    implicitMods: ["12% increased Physical Damage"],
    tags: ["accessory", "belt"]
  }
];

// flask base types
export const FLASK_BASE_TYPES: BaseItemType[] = [
  // life flasks
  {
    category: ItemCategory.LifeFlask,
    name: "Small Life Flask",
    itemClass: "flask",
    slot: [ItemSlot.Flask1, ItemSlot.Flask2, ItemSlot.Flask3, ItemSlot.Flask4, ItemSlot.Flask5],
    requirements: { level: 1, strength: 0, dexterity: 0, intelligence: 0 },
    implicitMods: ["Recovers 60 Life over 4.00 seconds"],
    tags: ["flask", "life"]
  },
  {
    category: ItemCategory.LifeFlask,
    name: "Medium Life Flask",
    itemClass: "flask",
    slot: [ItemSlot.Flask1, ItemSlot.Flask2, ItemSlot.Flask3, ItemSlot.Flask4, ItemSlot.Flask5],
    requirements: { level: 8, strength: 0, dexterity: 0, intelligence: 0 },
    implicitMods: ["Recovers 110 Life over 3.50 seconds"],
    tags: ["flask", "life"]
  },
  {
    category: ItemCategory.LifeFlask,
    name: "Large Life Flask",
    itemClass: "flask",
    slot: [ItemSlot.Flask1, ItemSlot.Flask2, ItemSlot.Flask3, ItemSlot.Flask4, ItemSlot.Flask5],
    requirements: { level: 16, strength: 0, dexterity: 0, intelligence: 0 },
    implicitMods: ["Recovers 200 Life over 3.50 seconds"],
    tags: ["flask", "life"]
  },
  
  // mana flasks
  {
    category: ItemCategory.ManaFlask,
    name: "Small Mana Flask", 
    itemClass: "flask",
    slot: [ItemSlot.Flask1, ItemSlot.Flask2, ItemSlot.Flask3, ItemSlot.Flask4, ItemSlot.Flask5],
    requirements: { level: 1, strength: 0, dexterity: 0, intelligence: 0 },
    implicitMods: ["Recovers 40 Mana over 2.50 seconds"],
    tags: ["flask", "mana"]
  },
  {
    category: ItemCategory.ManaFlask,
    name: "Medium Mana Flask",
    itemClass: "flask",
    slot: [ItemSlot.Flask1, ItemSlot.Flask2, ItemSlot.Flask3, ItemSlot.Flask4, ItemSlot.Flask5],
    requirements: { level: 8, strength: 0, dexterity: 0, intelligence: 0 },
    implicitMods: ["Recovers 70 Mana over 2.50 seconds"],
    tags: ["flask", "mana"]
  },
  {
    category: ItemCategory.ManaFlask,
    name: "Large Mana Flask",
    itemClass: "flask",
    slot: [ItemSlot.Flask1, ItemSlot.Flask2, ItemSlot.Flask3, ItemSlot.Flask4, ItemSlot.Flask5],
    requirements: { level: 16, strength: 0, dexterity: 0, intelligence: 0 },
    implicitMods: ["Recovers 120 Mana over 2.50 seconds"],
    tags: ["flask", "mana"]
  },
  
  // hybrid flasks
  {
    category: ItemCategory.HybridFlask,
    name: "Small Hybrid Flask",
    itemClass: "flask",
    slot: [ItemSlot.Flask1, ItemSlot.Flask2, ItemSlot.Flask3, ItemSlot.Flask4, ItemSlot.Flask5],
    requirements: { level: 7, strength: 0, dexterity: 0, intelligence: 0 },
    implicitMods: ["Recovers 60 Life and 30 Mana over 3.00 seconds"],
    tags: ["flask", "hybrid"]
  },
  {
    category: ItemCategory.HybridFlask,
    name: "Medium Hybrid Flask",
    itemClass: "flask",
    slot: [ItemSlot.Flask1, ItemSlot.Flask2, ItemSlot.Flask3, ItemSlot.Flask4, ItemSlot.Flask5],
    requirements: { level: 18, strength: 0, dexterity: 0, intelligence: 0 },
    implicitMods: ["Recovers 120 Life and 60 Mana over 3.00 seconds"],
    tags: ["flask", "hybrid"]
  },
  
  // utility flasks
  {
    category: ItemCategory.UtilityFlask,
    name: "Quicksilver Flask",
    itemClass: "flask",
    slot: [ItemSlot.Flask1, ItemSlot.Flask2, ItemSlot.Flask3, ItemSlot.Flask4, ItemSlot.Flask5],
    requirements: { level: 4, strength: 0, dexterity: 0, intelligence: 0 },
    implicitMods: ["40% increased Movement Speed"],
    tags: ["flask", "utility", "speed"]
  },
  {
    category: ItemCategory.UtilityFlask,
    name: "Granite Flask",
    itemClass: "flask",
    slot: [ItemSlot.Flask1, ItemSlot.Flask2, ItemSlot.Flask3, ItemSlot.Flask4, ItemSlot.Flask5],
    requirements: { level: 27, strength: 0, dexterity: 0, intelligence: 0 },
    implicitMods: ["+3000 to Armour"],
    tags: ["flask", "utility", "armor"]
  },
  {
    category: ItemCategory.UtilityFlask,
    name: "Jade Flask",
    itemClass: "flask",
    slot: [ItemSlot.Flask1, ItemSlot.Flask2, ItemSlot.Flask3, ItemSlot.Flask4, ItemSlot.Flask5],
    requirements: { level: 27, strength: 0, dexterity: 0, intelligence: 0 },
    implicitMods: ["+3000 to Evasion Rating"],
    tags: ["flask", "utility", "evasion"]
  },
  {
    category: ItemCategory.UtilityFlask,
    name: "Quartz Flask",
    itemClass: "flask",
    slot: [ItemSlot.Flask1, ItemSlot.Flask2, ItemSlot.Flask3, ItemSlot.Flask4, ItemSlot.Flask5],
    requirements: { level: 27, strength: 0, dexterity: 0, intelligence: 0 },
    implicitMods: ["10% chance to Dodge Attacks", "Phasing"],
    tags: ["flask", "utility", "dodge"]
  }
];

// jewel base types
export const JEWEL_BASE_TYPES: BaseItemType[] = [
  {
    category: ItemCategory.CrimsonJewel,
    name: "Crimson Jewel",
    itemClass: "accessory",
    slot: [], // jewels go in passive tree, not equipment slots
    requirements: { level: 20, strength: 0, dexterity: 0, intelligence: 0 },
    tags: ["jewel", "crimson"]
  },
  {
    category: ItemCategory.ViridianJewel,
    name: "Viridian Jewel",
    itemClass: "accessory",
    slot: [],
    requirements: { level: 20, strength: 0, dexterity: 0, intelligence: 0 },
    tags: ["jewel", "viridian"]
  },
  {
    category: ItemCategory.CobaltJewel,
    name: "Cobalt Jewel",
    itemClass: "accessory",
    slot: [],
    requirements: { level: 20, strength: 0, dexterity: 0, intelligence: 0 },
    tags: ["jewel", "cobalt"]
  },
  {
    category: ItemCategory.PrismaticJewel,
    name: "Prismatic Jewel",
    itemClass: "accessory",
    slot: [],
    requirements: { level: 20, strength: 0, dexterity: 0, intelligence: 0 },
    tags: ["jewel", "prismatic"]
  }
];

export const ALL_BASE_ITEM_TYPES = [
  ...WEAPON_BASE_TYPES,
  ...ARMOR_BASE_TYPES, 
  ...ACCESSORY_BASE_TYPES,
  ...FLASK_BASE_TYPES,
  ...JEWEL_BASE_TYPES
];

export function getBaseItemTypesByCategory(category: ItemCategory): BaseItemType[] {
  return ALL_BASE_ITEM_TYPES.filter(baseType => baseType.category === category);
}

export function getBaseItemTypeByName(name: string): BaseItemType | undefined {
  return ALL_BASE_ITEM_TYPES.find(baseType => baseType.name === name);
}

export function getWeaponBaseTypes(): BaseItemType[] {
  return WEAPON_BASE_TYPES;
}

export function getArmorBaseTypes(): BaseItemType[] {
  return ARMOR_BASE_TYPES;
}

export function getAccessoryBaseTypes(): BaseItemType[] {
  return ACCESSORY_BASE_TYPES;
}

export function getFlaskBaseTypes(): BaseItemType[] {
  return FLASK_BASE_TYPES;
}

export function getJewelBaseTypes(): BaseItemType[] {
  return JEWEL_BASE_TYPES;
}