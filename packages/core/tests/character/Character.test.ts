import { describe, it, expect, beforeEach } from "bun:test";
import { Character, createCharacter } from '../../character/Character';
import { HealthComponent } from '../../components/HealthComponent';
import { StatsComponent } from '../../components/StatsComponent';
import { PositionComponent } from '../../components/PositionComponent';

describe("Character", () => {
  describe("character creation", () => {
    it("should create a marauder character", () => {
      const character = createCharacter("Brutus", "marauder");
      
      expect(character.name).toBe("Brutus");
      expect(character.getLevel()).toBe(1);
      expect(character.getCharacterClass().id).toBe("marauder");
    });

    it("should throw error for invalid class", () => {
      expect(() => {
        createCharacter("Invalid", "invalid-class");
      }).toThrow("invalid character class: invalid-class");
    });

    it("should setup all required components", () => {
      const character = createCharacter("Hero", "ranger");
      const entity = character.getEntity();
      
      expect(entity.hasComponent("stats")).toBe(true);
      expect(entity.hasComponent("health")).toBe(true);
      expect(entity.hasComponent("mana")).toBe(true);
      expect(entity.hasComponent("position")).toBe(true);
    });

    it("should calculate correct starting life", () => {
      const marauder = createCharacter("Tank", "marauder");
      const stats = marauder.getStats();
      
      // marauder level 1: base(38) + starting(66) + str(32/2)
      expect(stats.life.maximum).toBe(120);
      expect(stats.life.current).toBe(120);
    });

    it("should calculate correct starting mana", () => {
      const witch = createCharacter("Caster", "witch");
      const stats = witch.getStats();
      
      // witch level 1: base(34) + starting(56) + int(32/2)
      expect(stats.mana.maximum).toBe(106);
      expect(stats.mana.current).toBe(106);
    });
  });

  describe("experience and leveling", () => {
    it("should add experience", () => {
      const character = createCharacter("Hero", "duelist");
      
      character.addExperience(50);
      const stats = character.getStats();
      expect(stats.experience).toBe(50);
    });

    it("should level up when enough experience", () => {
      const character = createCharacter("Hero", "duelist");
      
      // level 1->2 requires 100 exp
      const leveled = character.addExperience(100);
      
      expect(leveled).toBe(true);
      expect(character.getLevel()).toBe(2);
    });

    it("should increase life on level up", () => {
      const character = createCharacter("Hero", "marauder");
      const beforeLife = character.getStats().life.maximum;
      
      character.addExperience(100); // level up
      
      const afterLife = character.getStats().life.maximum;
      expect(afterLife).toBeGreaterThan(beforeLife);
      // should gain 12 life per level for marauder
      expect(afterLife - beforeLife).toBe(12);
    });

    it("should increase mana on level up", () => {
      const character = createCharacter("Hero", "witch");
      const beforeMana = character.getStats().mana.maximum;
      
      character.addExperience(100); // level up
      
      const afterMana = character.getStats().mana.maximum;
      expect(afterMana).toBeGreaterThan(beforeMana);
      // should gain 6 mana per level for witch
      expect(afterMana - beforeMana).toBe(6);
    });
  });

  describe("stats retrieval", () => {
    it("should get all character stats", () => {
      const character = createCharacter("Hero", "shadow");
      const stats = character.getStats();
      
      expect(stats.level).toBe(1);
      expect(stats.experience).toBe(0);
      expect(stats.attributes).toEqual({
        strength: 14,
        dexterity: 23,
        intelligence: 23
      });
      expect(stats.life.current).toBeGreaterThan(0);
      expect(stats.mana.current).toBeGreaterThan(0);
      expect(stats.position).toBe("melee");
    });
  });

  describe("serialization", () => {
    it("should serialize to JSON", () => {
      const character = createCharacter("Hero", "templar", "char-123");
      character.addExperience(50);
      
      const json = character.toJSON();
      
      expect(json.id).toBe("char-123");
      expect(json.name).toBe("Hero");
      expect(json.classId).toBe("templar");
      expect(json.level).toBe(1);
      expect(json.experience).toBe(50);
      expect(json.currentLife).toBeDefined();
      expect(json.currentMana).toBeDefined();
    });

    it("should deserialize from JSON", () => {
      const json = {
        id: "char-456",
        name: "LoadedHero",
        classId: "scion",
        level: 5,
        experience: 250,
        currentLife: 150,
        currentMana: 80
      };
      
      const character = Character.fromJSON(json);
      
      expect(character.id).toBe("char-456");
      expect(character.name).toBe("LoadedHero");
      expect(character.getLevel()).toBe(5);
      
      const stats = character.getStats();
      expect(stats.experience).toBe(250);
      expect(stats.life.current).toBe(150);
      expect(stats.mana.current).toBe(80);
    });

    it("should round-trip serialize correctly", () => {
      const original = createCharacter("Hero", "ranger", "char-789");
      original.addExperience(150);
      
      // damage the character
      const entity = original.getEntity();
      const health = entity.getComponent<HealthComponent>("health");
      health?.takeDamage(20);
      
      const json = original.toJSON();
      const loaded = Character.fromJSON(json);
      
      expect(loaded.id).toBe(original.id);
      expect(loaded.name).toBe(original.name);
      expect(loaded.getLevel()).toBe(original.getLevel());
      expect(loaded.getStats().life.current).toBe(original.getStats().life.current);
    });
  });
});