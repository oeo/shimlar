import { describe, it, expect, beforeAll } from "bun:test";
import { ItemSlot, WeaponType, getBaseItemTypeByName } from "../../src/items/BaseItemTypes";
import { ItemRarity, generateItemFromBase } from "../../src/items/ItemGeneration";
import { affixData } from "../../src/items/AffixSystem";
import { EquipmentManager, compareItems } from "../../src/items/Equipment";

describe("Equipment System", () => {
  beforeAll(async () => {
    await affixData.loadAffixes();
  });

  describe("equipment manager initialization", () => {
    it("should start with empty slots", () => {
      const equipment = new EquipmentManager();
      
      expect(equipment.isEmpty()).toBe(true);
      expect(equipment.getAllEquippedItems().length).toBe(0);
      expect(equipment.getEquippedItem(ItemSlot.MainHand)).toBeNull();
      expect(equipment.getEquippedItem(ItemSlot.Helmet)).toBeNull();
    });
  });

  describe("item equipping", () => {
    it("should equip items in appropriate slots", async () => {
      const equipment = new EquipmentManager();
      
      const axe = await generateItemFromBase(getBaseItemTypeByName("Rusted Hatchet")!, 10);
      const helmet = await generateItemFromBase(getBaseItemTypeByName("Iron Hat")!, 10);
      
      equipment.equipItem(axe, ItemSlot.MainHand);
      equipment.equipItem(helmet, ItemSlot.Helmet);
      
      expect(equipment.getEquippedItem(ItemSlot.MainHand)).toBe(axe);
      expect(equipment.getEquippedItem(ItemSlot.Helmet)).toBe(helmet);
      expect(equipment.getAllEquippedItems().length).toBe(2);
    });

    it("should replace existing items when equipping to same slot", async () => {
      const equipment = new EquipmentManager();
      
      const axe1 = await generateItemFromBase(getBaseItemTypeByName("Rusted Hatchet")!, 10);
      const axe2 = await generateItemFromBase(getBaseItemTypeByName("Jade Hatchet")!, 10);
      
      equipment.equipItem(axe1, ItemSlot.MainHand);
      const replacedItem = equipment.equipItem(axe2, ItemSlot.MainHand);
      
      expect(replacedItem).toBe(axe1);
      expect(equipment.getEquippedItem(ItemSlot.MainHand)).toBe(axe2);
    });

    it("should handle two-handed weapons correctly", async () => {
      const equipment = new EquipmentManager();
      
      const sword = await generateItemFromBase(getBaseItemTypeByName("Corroded Blade")!, 10);
      const shield = await generateItemFromBase(getBaseItemTypeByName("Splintered Tower Shield")!, 10);
      
      // equip shield first
      equipment.equipItem(shield, ItemSlot.OffHand);
      expect(equipment.getEquippedItem(ItemSlot.OffHand)).toBe(shield);
      
      // equipping two-handed sword should unequip shield
      equipment.equipItem(sword, ItemSlot.MainHand);
      expect(equipment.getEquippedItem(ItemSlot.MainHand)).toBe(sword);
      expect(equipment.getEquippedItem(ItemSlot.OffHand)).toBeNull();
    });

    it("should prevent equipping off-hand with two-handed weapon", async () => {
      const equipment = new EquipmentManager();
      
      const sword = await generateItemFromBase(getBaseItemTypeByName("Corroded Blade")!, 10);
      const shield = await generateItemFromBase(getBaseItemTypeByName("Splintered Tower Shield")!, 10);
      
      equipment.equipItem(sword, ItemSlot.MainHand);
      
      expect(() => {
        equipment.equipItem(shield, ItemSlot.OffHand);
      }).toThrow();
    });

    it("should handle ring slots correctly", async () => {
      const equipment = new EquipmentManager();
      
      const ring1 = await generateItemFromBase(getBaseItemTypeByName("Iron Ring")!, 10);
      const ring2 = await generateItemFromBase(getBaseItemTypeByName("Gold Ring")!, 10);
      
      equipment.equipItem(ring1, ItemSlot.RingLeft);
      equipment.equipItem(ring2, ItemSlot.RingRight);
      
      expect(equipment.getEquippedItem(ItemSlot.RingLeft)).toBe(ring1);
      expect(equipment.getEquippedItem(ItemSlot.RingRight)).toBe(ring2);
    });
  });

  describe("item validation", () => {
    it("should prevent equipping items in wrong slots", async () => {
      const equipment = new EquipmentManager();
      
      const axe = await generateItemFromBase(getBaseItemTypeByName("Rusted Hatchet")!, 10);
      const helmet = await generateItemFromBase(getBaseItemTypeByName("Iron Hat")!, 10);
      
      expect(equipment.canEquipItem(axe, ItemSlot.MainHand)).toBe(true);
      expect(equipment.canEquipItem(axe, ItemSlot.OffHand)).toBe(true); // one-handed weapons can dual wield
      expect(equipment.canEquipItem(axe, ItemSlot.Helmet)).toBe(false);
      expect(equipment.canEquipItem(helmet, ItemSlot.MainHand)).toBe(false);
      expect(equipment.canEquipItem(helmet, ItemSlot.Helmet)).toBe(true);
    });
  });

  describe("stat calculation", () => {
    it("should calculate stats from implicit mods", async () => {
      const equipment = new EquipmentManager();
      
      const ring = await generateItemFromBase(getBaseItemTypeByName("Iron Ring")!, 1); // level 1 to avoid affixes
      const amulet = await generateItemFromBase(getBaseItemTypeByName("Coral Amulet")!, 1);
      
      // force items to be normal (no affixes)
      ring.rarity = ItemRarity.Normal;
      ring.affixes = [];
      amulet.rarity = ItemRarity.Normal; 
      amulet.affixes = [];
      
      equipment.equipItem(ring, ItemSlot.RingLeft);
      equipment.equipItem(amulet, ItemSlot.Amulet);
      
      const stats = equipment.calculateStats();
      
      // iron ring: +1 to maximum life (implicit)
      // coral amulet: +20 to maximum life (implicit)
      expect(stats.maxLife).toBe(21);
    });

    it("should calculate stats from affixes", async () => {
      const equipment = new EquipmentManager();
      
      // create a rare item with affixes
      const axe = await generateItemFromBase(getBaseItemTypeByName("Rusted Hatchet")!, 50);
      axe.rarity = ItemRarity.Rare;
      
      // manually add some predictable affixes for testing
      const mockAffix = {
        type: "prefix" as any,
        modType: "+# to Strength",
        tier: { name: "of the Bear", min: 18, max: 22, lvl: 22 },
        value: 20,
        displayName: "of the Bear",
        displayText: "+20 to Strength"
      };
      axe.affixes = [mockAffix];
      
      equipment.equipItem(axe, ItemSlot.MainHand);
      const stats = equipment.calculateStats();
      
      expect(stats.strength).toBe(20);
    });

    it("should handle multiple items with overlapping stats", async () => {
      const equipment = new EquipmentManager();
      
      const belt = await generateItemFromBase(getBaseItemTypeByName("Rustic Sash")!, 10);
      
      // belt has "12% increased Physical Damage" implicit
      equipment.equipItem(belt, ItemSlot.Belt);
      
      const stats = equipment.calculateStats();
      expect(stats.increasedPhysicalDamage).toBe(12);
    });
  });

  describe("weapon handling", () => {
    it("should identify equipped weapons", async () => {
      const equipment = new EquipmentManager();
      
      const axe = await generateItemFromBase(getBaseItemTypeByName("Rusted Hatchet")!, 10);
      const dagger = await generateItemFromBase(getBaseItemTypeByName("Glass Shank")!, 10);
      const helmet = await generateItemFromBase(getBaseItemTypeByName("Iron Hat")!, 10);
      
      equipment.equipItem(axe, ItemSlot.MainHand);
      equipment.equipItem(dagger, ItemSlot.OffHand);
      equipment.equipItem(helmet, ItemSlot.Helmet);
      
      const weapons = equipment.getWeapons();
      expect(weapons.length).toBe(2);
      expect(weapons).toContain(axe);
      expect(weapons).toContain(dagger);
      expect(weapons).not.toContain(helmet);
    });

    it("should not include shields as weapons", async () => {
      const equipment = new EquipmentManager();
      
      const axe = await generateItemFromBase(getBaseItemTypeByName("Rusted Hatchet")!, 10);
      const shield = await generateItemFromBase(getBaseItemTypeByName("Splintered Tower Shield")!, 10);
      
      equipment.equipItem(axe, ItemSlot.MainHand);
      equipment.equipItem(shield, ItemSlot.OffHand);
      
      const weapons = equipment.getWeapons();
      expect(weapons.length).toBe(1);
      expect(weapons).toContain(axe);
      expect(weapons).not.toContain(shield);
    });
  });

  describe("equipment management", () => {
    it("should unequip items", async () => {
      const equipment = new EquipmentManager();
      
      const axe = await generateItemFromBase(getBaseItemTypeByName("Rusted Hatchet")!, 10);
      equipment.equipItem(axe, ItemSlot.MainHand);
      
      const unequippedItem = equipment.unequipItem(ItemSlot.MainHand);
      
      expect(unequippedItem).toBe(axe);
      expect(equipment.getEquippedItem(ItemSlot.MainHand)).toBeNull();
      expect(equipment.isEmpty()).toBe(true);
    });

    it("should clear all equipment", async () => {
      const equipment = new EquipmentManager();
      
      const axe = await generateItemFromBase(getBaseItemTypeByName("Rusted Hatchet")!, 10);
      const helmet = await generateItemFromBase(getBaseItemTypeByName("Iron Hat")!, 10);
      
      equipment.equipItem(axe, ItemSlot.MainHand);
      equipment.equipItem(helmet, ItemSlot.Helmet);
      
      const clearedItems = equipment.clearAll();
      
      expect(clearedItems.length).toBe(2);
      expect(clearedItems).toContain(axe);
      expect(clearedItems).toContain(helmet);
      expect(equipment.isEmpty()).toBe(true);
    });
  });

  describe("item comparison", () => {
    it("should compare items correctly", async () => {
      const equipment = new EquipmentManager();
      
      const currentAxe = await generateItemFromBase(getBaseItemTypeByName("Rusted Hatchet")!, 10);
      const newAxe = await generateItemFromBase(getBaseItemTypeByName("Jade Hatchet")!, 15);
      
      const comparison = compareItems(currentAxe, newAxe, equipment.calculateStats());
      
      expect(comparison.item1).toBe(newAxe);
      expect(comparison.item2).toBe(currentAxe);
      expect(comparison.overallRating).toBeDefined();
      expect(typeof comparison.statChanges).toBe("object");
    });

    it("should compare against null item", async () => {
      const equipment = new EquipmentManager();
      
      const newAxe = await generateItemFromBase(getBaseItemTypeByName("Rusted Hatchet")!, 10);
      
      const comparison = compareItems(null, newAxe, equipment.calculateStats());
      
      expect(comparison.item1).toBe(newAxe);
      expect(comparison.item2).toBeNull();
    });
  });

  describe("flask handling", () => {
    it("should equip flasks in flask slots", async () => {
      const equipment = new EquipmentManager();
      
      const lifeFlask = await generateItemFromBase(getBaseItemTypeByName("Small Life Flask")!, 1);
      const manaFlask = await generateItemFromBase(getBaseItemTypeByName("Small Mana Flask")!, 1);
      
      equipment.equipItem(lifeFlask, ItemSlot.Flask1);
      equipment.equipItem(manaFlask, ItemSlot.Flask2);
      
      expect(equipment.getEquippedItem(ItemSlot.Flask1)).toBe(lifeFlask);
      expect(equipment.getEquippedItem(ItemSlot.Flask2)).toBe(manaFlask);
    });

    it("should allow same flask type in different slots", async () => {
      const equipment = new EquipmentManager();
      
      const flask1 = await generateItemFromBase(getBaseItemTypeByName("Small Life Flask")!, 1);
      const flask2 = await generateItemFromBase(getBaseItemTypeByName("Small Life Flask")!, 1);
      
      equipment.equipItem(flask1, ItemSlot.Flask1);
      equipment.equipItem(flask2, ItemSlot.Flask2);
      
      expect(equipment.getEquippedItem(ItemSlot.Flask1)).toBe(flask1);
      expect(equipment.getEquippedItem(ItemSlot.Flask2)).toBe(flask2);
    });
  });
});