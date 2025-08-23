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
  }
];

// accessory base types
export const ACCESSORY_BASE_TYPES: BaseItemType[] = [
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
    category: ItemCategory.ManaFlask,
    name: "Small Mana Flask", 
    itemClass: "flask",
    slot: [ItemSlot.Flask1, ItemSlot.Flask2, ItemSlot.Flask3, ItemSlot.Flask4, ItemSlot.Flask5],
    requirements: { level: 1, strength: 0, dexterity: 0, intelligence: 0 },
    implicitMods: ["Recovers 40 Mana over 2.50 seconds"],
    tags: ["flask", "mana"]
  }
];

export const ALL_BASE_ITEM_TYPES = [
  ...WEAPON_BASE_TYPES,
  ...ARMOR_BASE_TYPES, 
  ...ACCESSORY_BASE_TYPES,
  ...FLASK_BASE_TYPES
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