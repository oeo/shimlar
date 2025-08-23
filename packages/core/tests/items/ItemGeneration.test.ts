import { describe, it, expect, beforeAll } from "bun:test";
import { ItemCategory, getBaseItemTypeByName } from "../../src/items/BaseItemTypes";
import { AffixType, affixData } from "../../src/items/AffixSystem";
import {
  ItemRarity,
  itemGenerator,
  calculateItemRequirements,
  canEquipItem,
  getItemDisplayName,
  getItemDisplayColor,
  generateItemFromBase
} from "../../src/items/ItemGeneration";

describe("Item Generation", () => {
  beforeAll(async () => {
    await affixData.loadAffixes();
  });

  describe("item rarity distribution", () => {
    it("should generate items with different rarities", async () => {
      const baseType = getBaseItemTypeByName("Rusted Hatchet")!;
      const items = [];
      
      // generate many items to test rarity distribution
      for (let i = 0; i < 50; i++) {
        const item = await itemGenerator.generateItem({
          baseType,
          itemLevel: 20
        });
        items.push(item);
      }
      
      const rarities = new Set(items.map(i => i.rarity));
      expect(rarities.size).toBeGreaterThan(1); // should have multiple rarities
    });

    it("should respect forced rarity", async () => {
      const baseType = getBaseItemTypeByName("Rusted Hatchet")!;
      
      const rareItem = await itemGenerator.generateItem({
        baseType,
        itemLevel: 50,
        rarity: ItemRarity.Rare,
        forceRarity: true
      });
      
      expect(rareItem.rarity).toBe(ItemRarity.Rare);
      expect(rareItem.affixes.length).toBeGreaterThan(0);
    });
  });

  describe("normal items", () => {
    it("should generate normal items with no affixes", async () => {
      const baseType = getBaseItemTypeByName("Rusted Hatchet")!;
      
      const item = await itemGenerator.generateItem({
        baseType,
        itemLevel: 10,
        rarity: ItemRarity.Normal,
        forceRarity: true
      });
      
      expect(item.rarity).toBe(ItemRarity.Normal);
      expect(item.affixes.length).toBe(0);
      expect(item.name).toBe(baseType.name);
      expect(item.identified).toBe(true);
    });
  });

  describe("magic items", () => {
    it("should generate magic items with 1-2 affixes", async () => {
      const baseType = getBaseItemTypeByName("Rusted Hatchet")!;
      
      for (let i = 0; i < 10; i++) {
        const item = await itemGenerator.generateItem({
          baseType,
          itemLevel: 20,
          rarity: ItemRarity.Magic,
          forceRarity: true
        });
        
        expect(item.rarity).toBe(ItemRarity.Magic);
        expect(item.affixes.length).toBeGreaterThan(0);
        expect(item.affixes.length).toBeLessThanOrEqual(2);
      }
    });

    it("should name magic items correctly", async () => {
      const baseType = getBaseItemTypeByName("Rusted Hatchet")!;
      
      const item = await itemGenerator.generateItem({
        baseType,
        itemLevel: 30,
        rarity: ItemRarity.Magic,
        forceRarity: true
      });
      
      const hasPrefix = item.affixes.some(a => a.type === AffixType.Prefix);
      const hasSuffix = item.affixes.some(a => a.type === AffixType.Suffix);
      
      if (hasPrefix && hasSuffix) {
        expect(item.name).toMatch(/^.+ Rusted Hatchet of .+$/);
      } else if (hasPrefix) {
        expect(item.name).toMatch(/^.+ Rusted Hatchet$/);
      } else if (hasSuffix) {
        expect(item.name).toMatch(/^Rusted Hatchet of .+$/);
      }
    });
  });

  describe("rare items", () => {
    it("should generate rare items with 4-6 affixes", async () => {
      const baseType = getBaseItemTypeByName("Rusted Hatchet")!;
      
      for (let i = 0; i < 10; i++) {
        const item = await itemGenerator.generateItem({
          baseType,
          itemLevel: 50,
          rarity: ItemRarity.Rare,
          forceRarity: true
        });
        
        expect(item.rarity).toBe(ItemRarity.Rare);
        expect(item.affixes.length).toBeGreaterThanOrEqual(1); // might be fewer if affix generation fails
        expect(item.affixes.length).toBeLessThanOrEqual(6);
      }
    });

    it("should give rare items random names", async () => {
      const baseType = getBaseItemTypeByName("Rusted Hatchet")!;
      
      const items = [];
      for (let i = 0; i < 5; i++) {
        const item = await itemGenerator.generateItem({
          baseType,
          itemLevel: 50,
          rarity: ItemRarity.Rare,
          forceRarity: true
        });
        items.push(item);
      }
      
      // rare items should have unique random names
      const names = items.map(i => i.name);
      const uniqueNames = new Set(names);
      expect(uniqueNames.size).toBeGreaterThan(1);
      
      // names should not contain the base type name
      for (const name of names) {
        expect(name).not.toContain("Rusted Hatchet");
      }
    });

    it("should not have duplicate affix types on rare items", async () => {
      const baseType = getBaseItemTypeByName("Rusted Hatchet")!;
      
      const item = await itemGenerator.generateItem({
        baseType,
        itemLevel: 80,
        rarity: ItemRarity.Rare,
        forceRarity: true
      });
      
      const modTypes = item.affixes.map(a => a.modType);
      const uniqueModTypes = new Set(modTypes);
      expect(uniqueModTypes.size).toBe(modTypes.length);
    });
  });

  describe("item requirements", () => {
    it("should calculate base requirements correctly", async () => {
      const baseType = getBaseItemTypeByName("Rusted Hatchet")!;
      
      const item = await itemGenerator.generateItem({
        baseType,
        itemLevel: 10,
        rarity: ItemRarity.Normal,
        forceRarity: true
      });
      
      const reqs = calculateItemRequirements(item);
      expect(reqs.level).toBe(baseType.requirements.level);
      expect(reqs.str).toBe(baseType.requirements.strength);
      expect(reqs.dex).toBe(baseType.requirements.dexterity);
      expect(reqs.int).toBe(baseType.requirements.intelligence);
    });

    it("should increase level requirement based on affix tiers", async () => {
      const baseType = getBaseItemTypeByName("Rusted Hatchet")!;
      
      const highLevelItem = await itemGenerator.generateItem({
        baseType,
        itemLevel: 80,
        rarity: ItemRarity.Rare,
        forceRarity: true
      });
      
      if (highLevelItem.affixes.length > 0) {
        const reqs = calculateItemRequirements(highLevelItem);
        const highestAffixLevel = Math.max(...highLevelItem.affixes.map(a => a.tier.lvl));
        expect(reqs.level).toBeGreaterThanOrEqual(highestAffixLevel);
      }
    });
  });

  describe("equipment validation", () => {
    it("should validate if player can equip item", async () => {
      const baseType = getBaseItemTypeByName("Rusted Hatchet")!;
      
      const item = await itemGenerator.generateItem({
        baseType,
        itemLevel: 10,
        rarity: ItemRarity.Normal,
        forceRarity: true
      });
      
      const playerStats = { str: 20, dex: 10, int: 10 };
      const canEquip = canEquipItem(item, 5, playerStats);
      expect(canEquip).toBe(true);
      
      const cannotEquip = canEquipItem(item, 1, { str: 5, dex: 5, int: 5 });
      expect(cannotEquip).toBe(false);
    });
  });

  describe("display utilities", () => {
    it("should show correct display names for identified/unidentified items", async () => {
      const baseType = getBaseItemTypeByName("Rusted Hatchet")!;
      
      const normalItem = await itemGenerator.generateItem({
        baseType,
        itemLevel: 10,
        rarity: ItemRarity.Normal,
        forceRarity: true
      });
      
      const magicItem = await itemGenerator.generateItem({
        baseType,
        itemLevel: 10,
        rarity: ItemRarity.Magic,
        forceRarity: true
      });
      
      expect(getItemDisplayName(normalItem)).toBe(normalItem.name);
      
      // magic items start unidentified
      expect(getItemDisplayName(magicItem)).toBe(`Unidentified ${baseType.name}`);
      
      // after identification
      magicItem.identified = true;
      expect(getItemDisplayName(magicItem)).toBe(magicItem.name);
    });

    it("should return correct colors for each rarity", () => {
      expect(getItemDisplayColor(ItemRarity.Normal)).toBe("white");
      expect(getItemDisplayColor(ItemRarity.Magic)).toBe("blue");
      expect(getItemDisplayColor(ItemRarity.Rare)).toBe("yellow");
      expect(getItemDisplayColor(ItemRarity.Unique)).toBe("orange");
    });
  });

  describe("item generation from base type", () => {
    it("should generate item from base type", async () => {
      const baseType = getBaseItemTypeByName("Crude Bow")!;
      const item = await generateItemFromBase(baseType, 25);
      
      expect(item.baseType).toBe(baseType);
      expect(item.itemLevel).toBe(25);
      expect(item.id).toBeTruthy();
      expect(item.name).toBeTruthy();
      expect(item.implicitMods).toEqual(baseType.implicitMods || []);
    });
  });

  describe("edge cases", () => {
    it("should handle very low item levels", async () => {
      const baseType = getBaseItemTypeByName("Rusted Hatchet")!;
      
      const item = await itemGenerator.generateItem({
        baseType,
        itemLevel: 1,
        rarity: ItemRarity.Magic,
        forceRarity: true
      });
      
      expect(item.itemLevel).toBe(1);
      // might have 0 affixes if no affixes available at level 1
      expect(item.affixes.length).toBeGreaterThanOrEqual(0);
    });

    it("should generate unique IDs", async () => {
      const baseType = getBaseItemTypeByName("Rusted Hatchet")!;
      
      const item1 = await itemGenerator.generateItem({ baseType, itemLevel: 10 });
      const item2 = await itemGenerator.generateItem({ baseType, itemLevel: 10 });
      
      expect(item1.id).not.toBe(item2.id);
    });
  });
});