import { ItemRarity, generateItemFromBase } from "./ItemGeneration";
import { BaseItemType, getBaseItemTypeByName, ALL_BASE_ITEM_TYPES } from "./BaseItemTypes";
import { MonsterRarity } from "@shimlar/data/src/monsters/types";
import { MonsterArchetype, SimpleMonster, archetypeLootModifiers } from "@shimlar/data/src/monsters/archetypes";

export interface LootDrop {
  type: "currency" | "equipment";
  itemId?: string; // for currency
  item?: any; // for equipment
  quantity?: number; // for currency stacks
}

export class SimpleLootGenerator {
  /**
   * Generate loot for any monster based on level, rarity, and archetype
   */
  static async generateLoot(monster: SimpleMonster): Promise<LootDrop[]> {
    const drops: LootDrop[] = [];
    
    // determine base drop quantity from rarity
    const baseDropCount = this.getBaseDropCount(monster.rarity);
    
    // roll for each potential drop
    for (let i = 0; i < baseDropCount; i++) {
      const drop = await this.rollSingleDrop(monster);
      if (drop) {
        drops.push(drop);
      }
    }
    
    return drops;
  }

  /**
   * Get base number of drops for monster rarity
   */
  private static getBaseDropCount(rarity: MonsterRarity): number {
    switch (rarity) {
      case MonsterRarity.Normal: return this.randomBetween(0, 2); // 0-2 items
      case MonsterRarity.Magic: return this.randomBetween(1, 3);  // 1-3 items  
      case MonsterRarity.Rare: return this.randomBetween(2, 5);   // 2-5 items
      case MonsterRarity.Unique: return this.randomBetween(3, 7); // 3-7 items (boss)
      default: return 1;
    }
  }

  /**
   * Roll a single drop (currency or equipment)
   */
  private static async rollSingleDrop(monster: SimpleMonster): Promise<LootDrop | null> {
    // determine currency vs equipment (70% equipment, 30% currency by default)
    let currencyChance = 30;
    
    // casters get slightly more currency
    if (monster.archetype === MonsterArchetype.Caster) {
      currencyChance = 40;
    }
    
    if (Math.random() * 100 < currencyChance) {
      return this.rollCurrency(monster.level);
    } else {
      return await this.rollEquipment(monster);
    }
  }

  /**
   * Roll currency based on monster level
   */
  private static rollCurrency(level: number): LootDrop {
    const currencies = this.getCurrenciesForLevel(level);
    const selected = this.weightedRandom(currencies);
    
    return {
      type: "currency",
      itemId: selected.id,
      quantity: this.randomBetween(selected.minStack, selected.maxStack)
    };
  }

  /**
   * Get available currencies with weights based on level
   */
  private static getCurrenciesForLevel(level: number) {
    const levelFactor = Math.pow(level / 10, 1.5);
    
    return [
      // always available
      { id: "scroll_of_wisdom", weight: Math.max(20, 50 - level * 0.5), minStack: 1, maxStack: 1 + Math.floor(level / 10) },
      { id: "portal_scroll", weight: Math.max(15, 40 - level * 0.4), minStack: 1, maxStack: 1 + Math.floor(level / 15) },
      { id: "orb_of_transmutation", weight: 15 + levelFactor * 2, minStack: 1, maxStack: 1 },
      { id: "orb_of_alteration", weight: 8 + levelFactor * 3, minStack: 1, maxStack: 1 },
      { id: "orb_of_augmentation", weight: 3 + levelFactor * 1.5, minStack: 1, maxStack: 1 },
      
      // uncommon (rare at low levels)
      { id: "orb_of_alchemy", weight: Math.max(0.1, levelFactor * 0.8), minStack: 1, maxStack: 1 },
      { id: "orb_of_chance", weight: Math.max(0.05, levelFactor * 0.5), minStack: 1, maxStack: 1 },
      { id: "chromatic_orb", weight: Math.max(0.1, levelFactor * 0.6), minStack: 1, maxStack: 1 },
      
      // rare (extremely rare at low levels)
      { id: "chaos_orb", weight: Math.max(0.001, Math.pow(levelFactor, 2) * 0.05), minStack: 1, maxStack: 1 },
      { id: "exalted_orb", weight: Math.max(0.00001, Math.pow(levelFactor, 5) * 0.001), minStack: 1, maxStack: 1 }
    ];
  }

  /**
   * Roll equipment based on monster properties
   */
  private static async rollEquipment(monster: SimpleMonster): Promise<LootDrop | null> {
    // select random base type from all available
    const availableBases = ALL_BASE_ITEM_TYPES.filter(base => {
      const levelReq = base.requirements?.level || 1;
      return levelReq <= monster.level + 5; // can drop slightly higher level items
    });
    
    if (availableBases.length === 0) return null;
    
    const baseType = availableBases[Math.floor(Math.random() * availableBases.length)];
    
    // determine item level (zone level +/- 2)
    const itemLevel = Math.max(1, monster.level + this.randomBetween(-2, 2));
    
    // roll rarity based on monster rarity
    const itemRarity = this.rollItemRarity(monster.rarity);
    
    try {
      const item = await generateItemFromBase(baseType, itemLevel);
      
      // modify item rarity if needed
      if (item && itemRarity !== ItemRarity.Normal) {
        item.rarity = itemRarity;
      }
      
      return {
        type: "equipment",
        item
      };
    } catch (error) {
      console.error("Failed to generate item:", error);
      return null;
    }
  }

  /**
   * Roll item rarity based on monster rarity
   */
  private static rollItemRarity(monsterRarity: MonsterRarity): ItemRarity {
    const roll = Math.random() * 1000;
    
    // base weights (per 1000)
    let normalWeight = 780; // 78%
    let magicWeight = 200;  // 20% 
    let rareWeight = 19;    // 1.9%
    let uniqueWeight = 1;   // 0.1%
    
    // modify based on monster rarity
    switch (monsterRarity) {
      case MonsterRarity.Magic:
        normalWeight = 700;
        magicWeight = 280;
        rareWeight = 19;
        uniqueWeight = 1;
        break;
      case MonsterRarity.Rare:
        normalWeight = 400;
        magicWeight = 400; 
        rareWeight = 180;
        uniqueWeight = 20;
        break;
      case MonsterRarity.Unique:
        normalWeight = 200;
        magicWeight = 400;
        rareWeight = 350;
        uniqueWeight = 50;
        break;
    }
    
    if (roll < uniqueWeight) return ItemRarity.Unique;
    if (roll < uniqueWeight + rareWeight) return ItemRarity.Rare;
    if (roll < uniqueWeight + rareWeight + magicWeight) return ItemRarity.Magic;
    return ItemRarity.Normal;
  }

  /**
   * Utility functions
   */
  private static randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private static weightedRandom<T extends { weight: number }>(items: T[]): T {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const item of items) {
      random -= item.weight;
      if (random <= 0) {
        return item;
      }
    }
    
    return items[items.length - 1]; // fallback
  }
}

// Example usage:
// const physicalZombie = createPhysicalMonster("zombie1", "Zombie", MonsterSubtype.Zombie, 4);
// const loot = await SimpleLootGenerator.generateLoot(physicalZombie);