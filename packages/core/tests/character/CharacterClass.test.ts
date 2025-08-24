import { describe, it, expect } from "bun:test";
import {
  CHARACTER_CLASSES,
  getCharacterClass,
  getAllCharacterClasses,
  calculateMaxLife,
  calculateMaxMana,
  calculateEvasion,
  calculateAccuracy
} from '../../character/CharacterClass';

describe("CharacterClass", () => {
  describe("class definitions", () => {
    it("should have 7 character classes", () => {
      expect(CHARACTER_CLASSES.size).toBe(7);
    });

    it("should have correct marauder stats", () => {
      const marauder = getCharacterClass("marauder");
      expect(marauder).toBeDefined();
      expect(marauder?.baseAttributes.strength).toBe(32);
      expect(marauder?.baseAttributes.dexterity).toBe(14);
      expect(marauder?.baseAttributes.intelligence).toBe(14);
    });

    it("should have correct ranger stats", () => {
      const ranger = getCharacterClass("ranger");
      expect(ranger).toBeDefined();
      expect(ranger?.baseAttributes.strength).toBe(14);
      expect(ranger?.baseAttributes.dexterity).toBe(32);
      expect(ranger?.baseAttributes.intelligence).toBe(14);
    });

    it("should have correct witch stats", () => {
      const witch = getCharacterClass("witch");
      expect(witch).toBeDefined();
      expect(witch?.baseAttributes.strength).toBe(14);
      expect(witch?.baseAttributes.dexterity).toBe(14);
      expect(witch?.baseAttributes.intelligence).toBe(32);
    });

    it("should have balanced scion stats", () => {
      const scion = getCharacterClass("scion");
      expect(scion).toBeDefined();
      expect(scion?.baseAttributes.strength).toBe(20);
      expect(scion?.baseAttributes.dexterity).toBe(20);
      expect(scion?.baseAttributes.intelligence).toBe(20);
    });

    it("should handle case-insensitive lookup", () => {
      expect(getCharacterClass("MARAUDER")).toBeDefined();
      expect(getCharacterClass("Ranger")).toBeDefined();
      expect(getCharacterClass("witch")).toBeDefined();
    });

    it("should return undefined for invalid class", () => {
      expect(getCharacterClass("invalid")).toBeUndefined();
    });

    it("should get all character classes", () => {
      const all = getAllCharacterClasses();
      expect(all.length).toBe(7);
      expect(all.map(c => c.id).sort()).toEqual([
        "duelist", "marauder", "ranger", "scion", "shadow", "templar", "witch"
      ]);
    });
  });

  describe("life calculations", () => {
    it("should calculate level 1 marauder life", () => {
      const marauder = getCharacterClass("marauder")!;
      const life = calculateMaxLife(marauder, 1, 0);
      // base(38) + starting(66) + levels(0) + str(32/2)
      expect(life).toBe(38 + 66 + 0 + 16);
    });

    it("should calculate level 10 marauder life", () => {
      const marauder = getCharacterClass("marauder")!;
      const life = calculateMaxLife(marauder, 10, 0);
      // base(38) + starting(66) + levels(12*9) + str(32/2)
      expect(life).toBe(38 + 66 + 108 + 16);
    });

    it("should include additional strength", () => {
      const marauder = getCharacterClass("marauder")!;
      const life = calculateMaxLife(marauder, 1, 20);
      // base(38) + starting(66) + levels(0) + str((32+20)/2)
      expect(life).toBe(38 + 66 + 0 + 26);
    });

    it("should calculate witch life (lower than marauder)", () => {
      const witch = getCharacterClass("witch")!;
      const life = calculateMaxLife(witch, 1, 0);
      // base(38) + starting(57) + levels(0) + str(14/2)
      expect(life).toBe(38 + 57 + 0 + 7);
    });
  });

  describe("mana calculations", () => {
    it("should calculate level 1 witch mana", () => {
      const witch = getCharacterClass("witch")!;
      const mana = calculateMaxMana(witch, 1, 0);
      // base(34) + starting(56) + levels(0) + int(32/2)
      expect(mana).toBe(34 + 56 + 0 + 16);
    });

    it("should calculate level 10 witch mana", () => {
      const witch = getCharacterClass("witch")!;
      const mana = calculateMaxMana(witch, 10, 0);
      // base(34) + starting(56) + levels(6*9) + int(32/2)
      expect(mana).toBe(34 + 56 + 54 + 16);
    });

    it("should include additional intelligence", () => {
      const witch = getCharacterClass("witch")!;
      const mana = calculateMaxMana(witch, 1, 20);
      // base(34) + starting(56) + levels(0) + int((32+20)/2)
      expect(mana).toBe(34 + 56 + 0 + 26);
    });

    it("should calculate marauder mana (lower than witch)", () => {
      const marauder = getCharacterClass("marauder")!;
      const mana = calculateMaxMana(marauder, 1, 0);
      // base(34) + starting(47) + levels(0) + int(14/2)
      expect(mana).toBe(34 + 47 + 0 + 7);
    });
  });

  describe("evasion calculations", () => {
    it("should calculate base evasion", () => {
      const evasion = calculateEvasion(1, 10);
      // base(53) + level(1*3) + dex(10*0.2)
      expect(evasion).toBe(53 + 3 + 2);
    });

    it("should scale with level and dexterity", () => {
      const evasion = calculateEvasion(10, 50);
      // base(53) + level(10*3) + dex(50*0.2)
      expect(evasion).toBe(53 + 30 + 10);
    });
  });

  describe("accuracy calculations", () => {
    it("should calculate base accuracy", () => {
      const accuracy = calculateAccuracy(1, 10);
      // base(250) + level(1*2) + dex(10*2)
      expect(accuracy).toBe(250 + 2 + 20);
    });

    it("should scale with level and dexterity", () => {
      const accuracy = calculateAccuracy(10, 50);
      // base(250) + level(10*2) + dex(50*2)
      expect(accuracy).toBe(250 + 20 + 100);
    });
  });
});