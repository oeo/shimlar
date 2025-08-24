import { ItemCategory } from "./BaseItemTypes";

export interface AffixTier {
  name: string;
  min: number;
  max: number;
  lvl: number;
}

export interface AffixDefinition {
  modType: string; // e.g., "Adds # to # Fire Damage"
  tiers: AffixTier[];
}

export enum AffixType {
  Prefix = "prefix",
  Suffix = "suffix",
  Corrupted = "corrupted"
}

export interface Affix {
  type: AffixType;
  modType: string;
  tier: AffixTier;
  value: number;
  displayName: string; // e.g., "Flaming" or "of Fire"
  displayText: string; // e.g., "Adds 15 to 25 Fire Damage"
}

export interface AffixPool {
  prefix: Record<string, AffixTier[]>;
  suffix: Record<string, AffixTier[]>;
  corrupted?: Record<string, AffixTier[]>;
}

class AffixData {
  private affixPools: Record<ItemCategory, AffixPool> = {} as any;
  private loaded = false;

  async loadAffixes(): Promise<void> {
    if (this.loaded) return;

    try {
      // in a real implementation, we'd load from the json file
      // for now, let's load it from the packages/data/items/affixes.json
      const affixDataPath = "/Users/taky/www/shimlar/packages/data/items/affixes.json";
      const file = Bun.file(affixDataPath);
      const data = await file.json();
      
      // convert the raw data structure to our typed format
      for (const [categoryName, categoryData] of Object.entries(data)) {
        const category = this.mapCategoryName(categoryName);
        if (category) {
          this.affixPools[category] = categoryData as AffixPool;
        }
      }
      
      this.loaded = true;
    } catch (error) {
      console.error("Failed to load affix data:", error);
      throw error;
    }
  }

  private mapCategoryName(name: string): ItemCategory | null {
    const mappings: Record<string, ItemCategory> = {
      "One Handed Axe": ItemCategory.OneHandedAxe,
      "Claw": ItemCategory.Claw,
      "Dagger": ItemCategory.Dagger,
      "One Handed Mace": ItemCategory.OneHandedMace,
      "Scepter": ItemCategory.Scepter,
      "One Handed Sword": ItemCategory.OneHandedSword,
      "Wand": ItemCategory.Wand,
      "Two Handed Axe": ItemCategory.TwoHandedAxe,
      "Bow": ItemCategory.Bow,
      "Two Handed Mace": ItemCategory.TwoHandedMace,
      "Staff": ItemCategory.Staff,
      "Two Handed Sword": ItemCategory.TwoHandedSword,
      "Shield": ItemCategory.Shield,
      "Amulet": ItemCategory.Amulet,
      "Belt": ItemCategory.Belt,
      "Ring": ItemCategory.Ring,
      "Life": ItemCategory.LifeFlask,
      "Mana": ItemCategory.ManaFlask,
      "Hybrid": ItemCategory.HybridFlask,
      "Utility": ItemCategory.UtilityFlask,
      // armor types need to be mapped differently - they use defense type names
      "AR": ItemCategory.Helmet, // we'll handle armor types separately
      "EV": ItemCategory.Helmet, 
      "ES": ItemCategory.Helmet,
      "AR/EV": ItemCategory.Helmet,
      "AR/ES": ItemCategory.Helmet, 
      "EV/ES": ItemCategory.Helmet,
      "AR/EV/ES": ItemCategory.Helmet
    };
    
    return mappings[name] || null;
  }

  getAffixPool(category: ItemCategory): AffixPool | undefined {
    return this.affixPools[category];
  }

  getAvailablePrefixes(category: ItemCategory, itemLevel: number): AffixDefinition[] {
    const pool = this.getAffixPool(category);
    if (!pool || !pool.prefix) return [];
    
    const available: AffixDefinition[] = [];
    
    for (const [modType, tiers] of Object.entries(pool.prefix)) {
      const availableTiers = tiers.filter(tier => tier.lvl <= itemLevel);
      if (availableTiers.length > 0) {
        available.push({
          modType,
          tiers: availableTiers
        });
      }
    }
    
    return available;
  }

  getAvailableSuffixes(category: ItemCategory, itemLevel: number): AffixDefinition[] {
    const pool = this.getAffixPool(category);
    if (!pool || !pool.suffix) return [];
    
    const available: AffixDefinition[] = [];
    
    for (const [modType, tiers] of Object.entries(pool.suffix)) {
      const availableTiers = tiers.filter(tier => tier.lvl <= itemLevel);
      if (availableTiers.length > 0) {
        available.push({
          modType,
          tiers: availableTiers
        });
      }
    }
    
    return available;
  }

  rollAffix(affixDef: AffixDefinition, itemLevel: number): Affix {
    // get the highest tier available for this item level
    const availableTiers = affixDef.tiers.filter(tier => tier.lvl <= itemLevel);
    if (availableTiers.length === 0) {
      throw new Error(`No available tiers for ${affixDef.modType} at item level ${itemLevel}`);
    }
    
    // weighted selection favoring higher tiers
    const tier = this.selectWeightedTier(availableTiers);
    
    // roll value within tier range (handle cases where min > max)
    const actualMin = Math.min(tier.min, tier.max);
    const actualMax = Math.max(tier.min, tier.max);
    const value = Math.floor(Math.random() * (actualMax - actualMin + 1)) + actualMin;
    
    // determine if this is a prefix or suffix based on tier name
    const isPrefix = !tier.name.startsWith("of ");
    
    return {
      type: isPrefix ? AffixType.Prefix : AffixType.Suffix,
      modType: affixDef.modType,
      tier,
      value,
      displayName: tier.name,
      displayText: this.formatDisplayText(affixDef.modType, value, tier.name)
    };
  }

  private selectWeightedTier(tiers: AffixTier[]): AffixTier {
    // higher level tiers are rarer - use exponential weight decay
    const weights = tiers.map((tier, index) => Math.pow(0.6, index));
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < tiers.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return tiers[i];
      }
    }
    
    return tiers[tiers.length - 1]; // fallback
  }

  private formatDisplayText(modType: string, value: number, tierName: string): string {
    // replace # placeholders with actual values
    let text = modType.replace(/#/g, value.toString());
    
    // for ranges like "Adds # to # Fire Damage", we need to handle differently
    if (modType.includes(" to # ")) {
      // this is a range - we'd need more complex logic for min/max values
      // for now, just use the single value
      text = modType.replace(/# to #/g, `${value} to ${value}`);
    }
    
    return text;
  }
}

// singleton instance
export const affixData = new AffixData();

// utility functions for item generation
export async function getAvailableAffixes(category: ItemCategory, itemLevel: number) {
  await affixData.loadAffixes();
  
  const prefixes = affixData.getAvailablePrefixes(category, itemLevel);
  const suffixes = affixData.getAvailableSuffixes(category, itemLevel);
  
  return { prefixes, suffixes };
}

export async function rollRandomAffix(
  category: ItemCategory, 
  itemLevel: number,
  type: AffixType
): Promise<Affix | null> {
  const { prefixes, suffixes } = await getAvailableAffixes(category, itemLevel);
  
  const pool = type === AffixType.Prefix ? prefixes : suffixes;
  if (pool.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * pool.length);
  const selectedAffix = pool[randomIndex];
  
  return affixData.rollAffix(selectedAffix, itemLevel);
}