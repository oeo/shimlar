import { BaseItemType, ItemCategory } from "./BaseItemTypes";
import { Affix, AffixType, rollRandomAffix } from "./AffixSystem";

export enum ItemRarity {
  Normal = "normal",
  Magic = "magic", 
  Rare = "rare",
  Unique = "unique"
}

export interface Item {
  id: string;
  name: string;
  baseType: BaseItemType;
  rarity: ItemRarity;
  itemLevel: number;
  affixes: Affix[];
  implicitMods: string[];
  identified: boolean;
  corrupted: boolean;
}

export interface ItemGenerationOptions {
  baseType: BaseItemType;
  itemLevel: number;
  rarity?: ItemRarity;
  forceRarity?: boolean;
}

class ItemGenerator {
  
  async generateItem(options: ItemGenerationOptions): Promise<Item> {
    const { baseType, itemLevel } = options;
    let { rarity } = options;
    
    // determine rarity if not specified
    if (!rarity || !options.forceRarity) {
      rarity = this.rollRarity();
    }
    
    const affixes = await this.generateAffixes(baseType.category, itemLevel, rarity);
    const itemName = this.generateItemName(baseType, affixes, rarity);
    
    return {
      id: this.generateId(),
      name: itemName,
      baseType,
      rarity,
      itemLevel,
      affixes,
      implicitMods: baseType.implicitMods || [],
      identified: rarity === ItemRarity.Normal, // normal items are auto-identified
      corrupted: false
    };
  }

  private rollRarity(): ItemRarity {
    const roll = Math.random();
    
    // rarity distribution similar to PoE
    if (roll < 0.78) return ItemRarity.Normal;   // 78%
    if (roll < 0.98) return ItemRarity.Magic;    // 20%
    if (roll < 0.999) return ItemRarity.Rare;    // 1.9%
    return ItemRarity.Unique;                    // 0.1%
  }

  private async generateAffixes(category: ItemCategory, itemLevel: number, rarity: ItemRarity): Promise<Affix[]> {
    const affixes: Affix[] = [];
    
    switch (rarity) {
      case ItemRarity.Normal:
        // no affixes
        break;
        
      case ItemRarity.Magic:
        // 1 prefix and/or 1 suffix
        const magicRoll = Math.random();
        if (magicRoll < 0.4) {
          // prefix only
          const prefix = await rollRandomAffix(category, itemLevel, AffixType.Prefix);
          if (prefix) affixes.push(prefix);
        } else if (magicRoll < 0.8) {
          // suffix only  
          const suffix = await rollRandomAffix(category, itemLevel, AffixType.Suffix);
          if (suffix) affixes.push(suffix);
        } else {
          // both prefix and suffix
          const prefix = await rollRandomAffix(category, itemLevel, AffixType.Prefix);
          const suffix = await rollRandomAffix(category, itemLevel, AffixType.Suffix);
          if (prefix) affixes.push(prefix);
          if (suffix) affixes.push(suffix);
        }
        break;
        
      case ItemRarity.Rare:
        // 4-6 total affixes, up to 3 prefixes and 3 suffixes
        const numAffixes = 4 + Math.floor(Math.random() * 3); // 4-6
        const maxPrefixes = Math.min(3, Math.ceil(numAffixes / 2));
        const maxSuffixes = Math.min(3, numAffixes - maxPrefixes);
        
        // roll prefixes
        const numPrefixes = Math.floor(Math.random() * maxPrefixes) + 1;
        for (let i = 0; i < numPrefixes; i++) {
          const prefix = await rollRandomAffix(category, itemLevel, AffixType.Prefix);
          if (prefix && !this.hasSimilarAffix(affixes, prefix)) {
            affixes.push(prefix);
          }
        }
        
        // roll suffixes
        const numSuffixes = Math.min(maxSuffixes, numAffixes - affixes.length);
        for (let i = 0; i < numSuffixes; i++) {
          const suffix = await rollRandomAffix(category, itemLevel, AffixType.Suffix);
          if (suffix && !this.hasSimilarAffix(affixes, suffix)) {
            affixes.push(suffix);
          }
        }
        break;
        
      case ItemRarity.Unique:
        // unique items have fixed affixes (not implemented yet)
        break;
    }
    
    return affixes;
  }

  private hasSimilarAffix(affixes: Affix[], newAffix: Affix): boolean {
    return affixes.some(existing => existing.modType === newAffix.modType);
  }

  private generateItemName(baseType: BaseItemType, affixes: Affix[], rarity: ItemRarity): string {
    switch (rarity) {
      case ItemRarity.Normal:
        return baseType.name;
        
      case ItemRarity.Magic: {
        const prefix = affixes.find(a => a.type === AffixType.Prefix);
        const suffix = affixes.find(a => a.type === AffixType.Suffix);
        
        if (prefix && suffix) {
          return `${prefix.displayName} ${baseType.name} ${suffix.displayName}`;
        } else if (prefix) {
          return `${prefix.displayName} ${baseType.name}`;
        } else if (suffix) {
          return `${baseType.name} ${suffix.displayName}`;
        }
        return baseType.name;
      }
      
      case ItemRarity.Rare:
        // rare items get random names (simplified)
        const rareNames = [
          "Death", "Soul", "Mind", "Blood", "Bone", "Shadow", "Storm", "Fire", 
          "Ice", "Lightning", "Chaos", "Void", "Pain", "Fear", "Rage", "Wrath"
        ];
        const rareTypes = [
          "Bite", "Grip", "Hold", "Touch", "Kiss", "Whisper", "Song", "Call",
          "Cry", "Roar", "Scream", "Weep", "Laugh", "Sigh", "Breath", "Heart"
        ];
        
        const firstName = rareNames[Math.floor(Math.random() * rareNames.length)];
        const lastName = rareTypes[Math.floor(Math.random() * rareTypes.length)];
        return `${firstName} ${lastName}`;
        
      case ItemRarity.Unique:
        // unique items have fixed names
        return `${baseType.name} (Unique)`;
        
      default:
        return baseType.name;
    }
  }

  private generateId(): string {
    return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// utility functions for item level and requirements
export function calculateItemRequirements(item: Item): { level: number; str: number; dex: number; int: number } {
  let requirements = { 
    level: item.baseType.requirements.level,
    str: item.baseType.requirements.strength,
    dex: item.baseType.requirements.dexterity,
    int: item.baseType.requirements.intelligence
  };
  
  // add requirements from affixes
  for (const affix of item.affixes) {
    // high-tier affixes add level requirements
    requirements.level = Math.max(requirements.level, affix.tier.lvl);
  }
  
  return requirements;
}

export function canEquipItem(item: Item, playerLevel: number, playerStats: { str: number; dex: number; int: number }): boolean {
  const reqs = calculateItemRequirements(item);
  
  return playerLevel >= reqs.level &&
         playerStats.str >= reqs.str &&
         playerStats.dex >= reqs.dex &&
         playerStats.int >= reqs.int;
}

export function getItemDisplayName(item: Item): string {
  return item.identified ? item.name : `Unidentified ${item.baseType.name}`;
}

export function getItemDisplayColor(rarity: ItemRarity): string {
  switch (rarity) {
    case ItemRarity.Normal: return "white";
    case ItemRarity.Magic: return "blue";
    case ItemRarity.Rare: return "yellow";
    case ItemRarity.Unique: return "orange";
    default: return "white";
  }
}

// singleton generator
export const itemGenerator = new ItemGenerator();

// convenience functions
export async function generateRandomItem(category: ItemCategory, itemLevel: number): Promise<Item> {
  // would need to select random base type from category
  throw new Error("Not implemented - need base type selection logic");
}

export async function generateItemFromBase(baseType: BaseItemType, itemLevel: number): Promise<Item> {
  return itemGenerator.generateItem({ baseType, itemLevel });
}