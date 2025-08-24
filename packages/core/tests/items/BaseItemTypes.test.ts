import { describe, it, expect } from "bun:test";
import {
  ItemCategory,
  WeaponType,
  ArmorType,
  ItemSlot,
  ALL_BASE_ITEM_TYPES,
  WEAPON_BASE_TYPES,
  ARMOR_BASE_TYPES,
  ACCESSORY_BASE_TYPES,
  FLASK_BASE_TYPES,
  JEWEL_BASE_TYPES,
  getBaseItemTypesByCategory,
  getBaseItemTypeByName
} from '../../items/BaseItemTypes';

describe("Base Item Types", () => {
  describe("base item type arrays", () => {
    it("should have non-empty arrays for each item class", () => {
      expect(WEAPON_BASE_TYPES.length).toBeGreaterThan(0);
      expect(ARMOR_BASE_TYPES.length).toBeGreaterThan(0);
      expect(ACCESSORY_BASE_TYPES.length).toBeGreaterThan(0);
      expect(FLASK_BASE_TYPES.length).toBeGreaterThan(0);
    });

    it("should contain all base types in ALL_BASE_ITEM_TYPES", () => {
      const expectedTotal = WEAPON_BASE_TYPES.length + 
                           ARMOR_BASE_TYPES.length + 
                           ACCESSORY_BASE_TYPES.length + 
                           FLASK_BASE_TYPES.length +
                           JEWEL_BASE_TYPES.length;
      
      expect(ALL_BASE_ITEM_TYPES.length).toBe(expectedTotal);
    });
  });

  describe("weapon base types", () => {
    it("should have proper weapon categories and types", () => {
      const axe = WEAPON_BASE_TYPES.find(w => w.category === ItemCategory.OneHandedAxe);
      expect(axe).toBeDefined();
      expect(axe?.weaponType).toBe(WeaponType.OneHanded);
      expect(axe?.itemClass).toBe("weapon");
      expect(Array.isArray(axe?.slot) ? axe.slot : [axe?.slot]).toContain(ItemSlot.MainHand);
    });

    it("should have bows with proper ranged tags", () => {
      const bow = WEAPON_BASE_TYPES.find(w => w.category === ItemCategory.Bow);
      expect(bow).toBeDefined();
      expect(bow?.weaponType).toBe(WeaponType.Bow);
      expect(bow?.tags).toContain("ranged");
    });

    it("should have staves with block chance implicit", () => {
      const staff = WEAPON_BASE_TYPES.find(w => w.category === ItemCategory.Staff);
      expect(staff).toBeDefined();
      expect(staff?.implicitMods).toContain("18% Chance to Block");
    });

    it("should have wands with spell damage implicit", () => {
      const wand = WEAPON_BASE_TYPES.find(w => w.category === ItemCategory.Wand);
      expect(wand).toBeDefined();
      expect(wand?.implicitMods).toContain("20% increased Spell Damage");
    });
  });

  describe("armor base types", () => {
    it("should have helmets with different defense types", () => {
      const armorHelmet = ARMOR_BASE_TYPES.find(a => 
        a.category === ItemCategory.Helmet && a.armorType === ArmorType.Armor
      );
      const evasionHelmet = ARMOR_BASE_TYPES.find(a => 
        a.category === ItemCategory.Helmet && a.armorType === ArmorType.Evasion
      );
      const esHelmet = ARMOR_BASE_TYPES.find(a => 
        a.category === ItemCategory.Helmet && a.armorType === ArmorType.EnergyShield
      );

      expect(armorHelmet).toBeDefined();
      expect(evasionHelmet).toBeDefined();
      expect(esHelmet).toBeDefined();
    });

    it("should have shields with block chance implicit", () => {
      const shield = ARMOR_BASE_TYPES.find(a => a.category === ItemCategory.Shield);
      expect(shield).toBeDefined();
      expect(shield?.implicitMods).toContain("Chance to Block: 20%");
      expect(shield?.slot).toBe(ItemSlot.OffHand);
    });

    it("should have proper stat requirements by armor type", () => {
      const armorPiece = ARMOR_BASE_TYPES.find(a => a.armorType === ArmorType.Armor);
      const evasionPiece = ARMOR_BASE_TYPES.find(a => a.armorType === ArmorType.Evasion);
      const esPiece = ARMOR_BASE_TYPES.find(a => a.armorType === ArmorType.EnergyShield);

      expect(armorPiece?.requirements.strength).toBeGreaterThan(0);
      expect(evasionPiece?.requirements.dexterity).toBeGreaterThan(0);
      expect(esPiece?.requirements.intelligence).toBeGreaterThan(0);
    });
  });

  describe("accessory base types", () => {
    it("should have rings that can go in both ring slots", () => {
      const ring = ACCESSORY_BASE_TYPES.find(a => a.category === ItemCategory.Ring);
      expect(ring).toBeDefined();
      expect(Array.isArray(ring?.slot)).toBe(true);
      expect(ring?.slot).toContain(ItemSlot.RingLeft);
      expect(ring?.slot).toContain(ItemSlot.RingRight);
    });

    it("should have accessories with appropriate implicits", () => {
      const ironRing = ACCESSORY_BASE_TYPES.find(a => a.name === "Iron Ring");
      const coralAmulet = ACCESSORY_BASE_TYPES.find(a => a.name === "Coral Amulet");
      const rusticSash = ACCESSORY_BASE_TYPES.find(a => a.name === "Rustic Sash");

      expect(ironRing?.implicitMods).toContain("+1 to maximum Life");
      expect(coralAmulet?.implicitMods).toContain("+20 to maximum Life");
      expect(rusticSash?.implicitMods).toContain("12% increased Physical Damage");
    });
  });

  describe("flask base types", () => {
    it("should have life and mana flasks", () => {
      const lifeFlask = FLASK_BASE_TYPES.find(f => f.category === ItemCategory.LifeFlask);
      const manaFlask = FLASK_BASE_TYPES.find(f => f.category === ItemCategory.ManaFlask);

      expect(lifeFlask).toBeDefined();
      expect(manaFlask).toBeDefined();
      expect(lifeFlask?.implicitMods).toContain("Recovers 60 Life over 4.00 seconds");
      expect(manaFlask?.implicitMods).toContain("Recovers 40 Mana over 2.50 seconds");
    });

    it("should allow flasks in any flask slot", () => {
      const flask = FLASK_BASE_TYPES[0];
      expect(Array.isArray(flask.slot)).toBe(true);
      expect(flask.slot).toContain(ItemSlot.Flask1);
      expect(flask.slot).toContain(ItemSlot.Flask5);
    });
  });

  describe("utility functions", () => {
    it("should get base types by category", () => {
      const axes = getBaseItemTypesByCategory(ItemCategory.OneHandedAxe);
      expect(axes.length).toBeGreaterThan(0);
      expect(axes.every(a => a.category === ItemCategory.OneHandedAxe)).toBe(true);
    });

    it("should get base type by name", () => {
      const rustedHatchet = getBaseItemTypeByName("Rusted Hatchet");
      expect(rustedHatchet).toBeDefined();
      expect(rustedHatchet?.category).toBe(ItemCategory.OneHandedAxe);
    });

    it("should return undefined for non-existent base type", () => {
      const nonExistent = getBaseItemTypeByName("Fake Item");
      expect(nonExistent).toBeUndefined();
    });
  });

  describe("item validation", () => {
    it("should have valid requirements for all base types", () => {
      for (const baseType of ALL_BASE_ITEM_TYPES) {
        expect(baseType.requirements.level).toBeGreaterThanOrEqual(1);
        expect(baseType.requirements.strength).toBeGreaterThanOrEqual(0);
        expect(baseType.requirements.dexterity).toBeGreaterThanOrEqual(0);
        expect(baseType.requirements.intelligence).toBeGreaterThanOrEqual(0);
      }
    });

    it("should have proper tags for all base types", () => {
      for (const baseType of ALL_BASE_ITEM_TYPES) {
        expect(Array.isArray(baseType.tags)).toBe(true);
        expect(baseType.tags.length).toBeGreaterThan(0);
      }
    });

    it("should have unique names within same category", () => {
      const categories = Object.values(ItemCategory);
      
      for (const category of categories) {
        const items = getBaseItemTypesByCategory(category);
        const names = items.map(item => item.name);
        const uniqueNames = new Set(names);
        
        expect(uniqueNames.size).toBe(names.length);
      }
    });
  });
});