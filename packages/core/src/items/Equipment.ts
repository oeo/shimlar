import { Item } from "./ItemGeneration";
import { ItemSlot, WeaponType } from "./BaseItemTypes";

export interface EquipmentSlots {
  [ItemSlot.MainHand]: Item | null;
  [ItemSlot.OffHand]: Item | null;
  [ItemSlot.Helmet]: Item | null;
  [ItemSlot.BodyArmor]: Item | null;
  [ItemSlot.Gloves]: Item | null;
  [ItemSlot.Boots]: Item | null;
  [ItemSlot.Belt]: Item | null;
  [ItemSlot.Amulet]: Item | null;
  [ItemSlot.RingLeft]: Item | null;
  [ItemSlot.RingRight]: Item | null;
  [ItemSlot.Flask1]: Item | null;
  [ItemSlot.Flask2]: Item | null;
  [ItemSlot.Flask3]: Item | null;
  [ItemSlot.Flask4]: Item | null;
  [ItemSlot.Flask5]: Item | null;
}

export interface EquippedStats {
  // base attributes
  strength: number;
  dexterity: number;
  intelligence: number;
  
  // life and mana
  maxLife: number;
  maxMana: number;
  lifeRegeneration: number;
  manaRegeneration: number;
  
  // damage
  physicalDamage: number;
  fireDamage: number;
  coldDamage: number;
  lightningDamage: number;
  chaosDamage: number;
  
  // damage modifiers
  increasedPhysicalDamage: number;
  increasedElementalDamage: number;
  increasedSpellDamage: number;
  increasedAttackSpeed: number;
  
  // defenses
  armor: number;
  evasion: number;
  energyShield: number;
  fireResistance: number;
  coldResistance: number;
  lightningResistance: number;
  chaosResistance: number;
  
  // accuracy and crit
  accuracy: number;
  criticalStrikeChance: number;
  criticalStrikeMultiplier: number;
  
  // other
  movementSpeed: number;
  attacksPerSecond: number;
  castSpeed: number;
}

export class EquipmentManager {
  private slots: EquipmentSlots;
  
  constructor() {
    this.slots = this.createEmptySlots();
  }
  
  private createEmptySlots(): EquipmentSlots {
    return {
      [ItemSlot.MainHand]: null,
      [ItemSlot.OffHand]: null,
      [ItemSlot.Helmet]: null,
      [ItemSlot.BodyArmor]: null,
      [ItemSlot.Gloves]: null,
      [ItemSlot.Boots]: null,
      [ItemSlot.Belt]: null,
      [ItemSlot.Amulet]: null,
      [ItemSlot.RingLeft]: null,
      [ItemSlot.RingRight]: null,
      [ItemSlot.Flask1]: null,
      [ItemSlot.Flask2]: null,
      [ItemSlot.Flask3]: null,
      [ItemSlot.Flask4]: null,
      [ItemSlot.Flask5]: null,
    };
  }
  
  canEquipItem(item: Item, slot: ItemSlot): boolean {
    // check if item can go in this slot
    const itemSlots = Array.isArray(item.baseType.slot) ? item.baseType.slot : [item.baseType.slot];
    if (!itemSlots.includes(slot)) {
      return false;
    }
    
    // two-handed weapons can always be equipped in main hand (will unequip off-hand)
    if (slot === ItemSlot.MainHand && item.baseType.weaponType === WeaponType.TwoHanded) {
      return true;
    }
    
    // off-hand items cannot be equipped with two-handed weapon in main hand
    if (slot === ItemSlot.OffHand) {
      const mainHand = this.slots[ItemSlot.MainHand];
      if (mainHand && mainHand.baseType.weaponType === WeaponType.TwoHanded) {
        return false;
      }
    }
    
    return true;
  }
  
  equipItem(item: Item, slot: ItemSlot): Item | null {
    if (!this.canEquipItem(item, slot)) {
      throw new Error(`Cannot equip ${item.name} in ${slot}`);
    }
    
    // unequip off-hand if equipping two-handed weapon
    if (slot === ItemSlot.MainHand && item.baseType.weaponType === WeaponType.TwoHanded) {
      this.unequipItem(ItemSlot.OffHand);
    }
    
    // unequip main-hand if it's two-handed and we're equipping off-hand
    if (slot === ItemSlot.OffHand) {
      const mainHand = this.slots[ItemSlot.MainHand];
      if (mainHand && mainHand.baseType.weaponType === WeaponType.TwoHanded) {
        this.unequipItem(ItemSlot.MainHand);
      }
    }
    
    const previousItem = this.slots[slot];
    this.slots[slot] = item;
    
    return previousItem;
  }
  
  unequipItem(slot: ItemSlot): Item | null {
    const item = this.slots[slot];
    this.slots[slot] = null;
    return item;
  }
  
  getEquippedItem(slot: ItemSlot): Item | null {
    return this.slots[slot];
  }
  
  getAllEquippedItems(): Item[] {
    return Object.values(this.slots).filter(item => item !== null) as Item[];
  }
  
  getWeapons(): Item[] {
    const weapons: Item[] = [];
    const mainHand = this.slots[ItemSlot.MainHand];
    const offHand = this.slots[ItemSlot.OffHand];
    
    if (mainHand) weapons.push(mainHand);
    if (offHand && offHand.baseType.itemClass === "weapon") weapons.push(offHand);
    
    return weapons;
  }
  
  calculateStats(): EquippedStats {
    const stats: EquippedStats = this.createEmptyStats();
    
    // sum stats from all equipped items
    for (const item of this.getAllEquippedItems()) {
      this.addItemStats(stats, item);
    }
    
    return stats;
  }
  
  private createEmptyStats(): EquippedStats {
    return {
      strength: 0,
      dexterity: 0,
      intelligence: 0,
      maxLife: 0,
      maxMana: 0,
      lifeRegeneration: 0,
      manaRegeneration: 0,
      physicalDamage: 0,
      fireDamage: 0,
      coldDamage: 0,
      lightningDamage: 0,
      chaosDamage: 0,
      increasedPhysicalDamage: 0,
      increasedElementalDamage: 0,
      increasedSpellDamage: 0,
      increasedAttackSpeed: 0,
      armor: 0,
      evasion: 0,
      energyShield: 0,
      fireResistance: 0,
      coldResistance: 0,
      lightningResistance: 0,
      chaosResistance: 0,
      accuracy: 0,
      criticalStrikeChance: 0,
      criticalStrikeMultiplier: 0,
      movementSpeed: 0,
      attacksPerSecond: 0,
      castSpeed: 0,
    };
  }
  
  private addItemStats(stats: EquippedStats, item: Item): void {
    // add implicit mod bonuses
    for (const implicitMod of item.implicitMods) {
      this.parseAndAddMod(stats, implicitMod);
    }
    
    // add affix bonuses
    for (const affix of item.affixes) {
      this.parseAndAddMod(stats, affix.displayText, affix.value);
    }
  }
  
  private parseAndAddMod(stats: EquippedStats, modText: string, value?: number): void {
    // simplified mod parsing - in a full implementation this would be more robust
    const lowerMod = modText.toLowerCase();
    
    // extract numeric value if not provided
    if (value === undefined) {
      const match = modText.match(/(\d+)/);
      value = match ? parseInt(match[1]) : 0;
    }
    
    // attribute bonuses
    if (lowerMod.includes("strength")) {
      stats.strength += value;
    } else if (lowerMod.includes("dexterity")) {
      stats.dexterity += value;
    } else if (lowerMod.includes("intelligence")) {
      stats.intelligence += value;
    }
    
    // life and mana
    else if (lowerMod.includes("maximum life")) {
      stats.maxLife += value;
    } else if (lowerMod.includes("maximum mana")) {
      stats.maxMana += value;
    }
    
    // damage
    else if (lowerMod.includes("physical damage") && lowerMod.includes("increased")) {
      stats.increasedPhysicalDamage += value;
    } else if (lowerMod.includes("elemental damage") && lowerMod.includes("increased")) {
      stats.increasedElementalDamage += value;
    } else if (lowerMod.includes("spell damage") && lowerMod.includes("increased")) {
      stats.increasedSpellDamage += value;
    }
    
    // added damage (weapon implicits and affixes)
    else if (lowerMod.includes("adds") && lowerMod.includes("physical damage")) {
      // for "adds X to Y physical damage", use the value as average
      stats.physicalDamage += value;
    } else if (lowerMod.includes("adds") && lowerMod.includes("fire damage")) {
      stats.fireDamage += value;
    } else if (lowerMod.includes("adds") && lowerMod.includes("cold damage")) {
      stats.coldDamage += value;
    } else if (lowerMod.includes("adds") && lowerMod.includes("lightning damage")) {
      stats.lightningDamage += value;
    } else if (lowerMod.includes("adds") && lowerMod.includes("chaos damage")) {
      stats.chaosDamage += value;
    }
    
    // resistances
    else if (lowerMod.includes("fire resistance")) {
      stats.fireResistance += value;
    } else if (lowerMod.includes("cold resistance")) {
      stats.coldResistance += value;
    } else if (lowerMod.includes("lightning resistance")) {
      stats.lightningResistance += value;
    } else if (lowerMod.includes("chaos resistance")) {
      stats.chaosResistance += value;
    }
    
    // accuracy and crit
    else if (lowerMod.includes("accuracy")) {
      stats.accuracy += value;
    } else if (lowerMod.includes("critical strike chance")) {
      stats.criticalStrikeChance += value;
    } else if (lowerMod.includes("critical strike multiplier")) {
      stats.criticalStrikeMultiplier += value;
    }
    
    // attack speed
    else if (lowerMod.includes("attack speed") && lowerMod.includes("increased")) {
      stats.increasedAttackSpeed += value;
    }
    
    // movement speed
    else if (lowerMod.includes("movement speed")) {
      stats.movementSpeed += value;
    }
  }
  
  getSlots(): EquipmentSlots {
    return { ...this.slots };
  }
  
  isEmpty(): boolean {
    return this.getAllEquippedItems().length === 0;
  }
  
  clearAll(): Item[] {
    const items = this.getAllEquippedItems();
    this.slots = this.createEmptySlots();
    return items;
  }
}

// utility functions for item comparison
export interface ItemComparison {
  item1: Item;
  item2: Item | null;
  statChanges: Partial<EquippedStats>;
  overallRating: "upgrade" | "downgrade" | "sidegrade" | "incomparable";
}

export function compareItems(
  currentItem: Item | null,
  newItem: Item,
  currentStats: EquippedStats
): ItemComparison {
  // create temporary equipment manager for comparison
  const tempEquip = new EquipmentManager();
  
  // simulate equipping the new item
  const slot = Array.isArray(newItem.baseType.slot) ? newItem.baseType.slot[0] : newItem.baseType.slot;
  
  if (currentItem) {
    tempEquip.equipItem(currentItem, slot);
  }
  
  const oldStats = tempEquip.calculateStats();
  tempEquip.equipItem(newItem, slot);
  const newStats = tempEquip.calculateStats();
  
  // calculate differences
  const statChanges: Partial<EquippedStats> = {};
  let upgradeCount = 0;
  let downgradeCount = 0;
  
  for (const [key, newValue] of Object.entries(newStats)) {
    const oldValue = oldStats[key as keyof EquippedStats];
    const change = newValue - oldValue;
    
    if (Math.abs(change) > 0.01) {
      statChanges[key as keyof EquippedStats] = change;
      
      if (change > 0) upgradeCount++;
      if (change < 0) downgradeCount++;
    }
  }
  
  // determine overall rating
  let overallRating: ItemComparison["overallRating"];
  if (upgradeCount > downgradeCount * 2) {
    overallRating = "upgrade";
  } else if (downgradeCount > upgradeCount * 2) {
    overallRating = "downgrade";
  } else if (upgradeCount > 0 || downgradeCount > 0) {
    overallRating = "sidegrade";
  } else {
    overallRating = "incomparable";
  }
  
  return {
    item1: newItem,
    item2: currentItem,
    statChanges,
    overallRating
  };
}