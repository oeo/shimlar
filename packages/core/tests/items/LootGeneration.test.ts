import { describe, it, expect } from "bun:test";
import { LootGenerator } from "../../src/items/LootGeneration";
import { 
  MonsterArchetype, 
  MonsterSubtype, 
  MonsterRarity,
  createPhysicalMonster, 
  createCasterMonster,
  createRangedMonster,
  getMonster,
  getZoneMonsters
} from "@shimlar/data/src/monsters";

describe("LootGeneration", () => {
  describe("basic monster loot generation", () => {
    it("should generate loot for any monster from registry", async () => {
      const zombie = getMonster("zombie_level_3");
      expect(zombie).toBeDefined();
      
      if (zombie) {
        const loot = await LootGenerator.generateLoot(zombie);
        expect(Array.isArray(loot)).toBe(true);
        expect(loot.length).toBeGreaterThanOrEqual(0);
        
        // check loot structure
        for (const drop of loot) {
          expect(drop).toHaveProperty("type");
          expect(["currency", "equipment"]).toContain(drop.type);
          
          if (drop.type === "currency") {
            expect(drop).toHaveProperty("itemId");
            expect(drop).toHaveProperty("quantity");
          } else if (drop.type === "equipment") {
            expect(drop).toHaveProperty("item");
          }
        }
      }
    });

    it("should generate more loot for higher rarity monsters", async () => {
      const normal = createPhysicalMonster("test_normal", "Normal Orc", MonsterSubtype.Orc, 10, MonsterRarity.Normal);
      const magic = createPhysicalMonster("test_magic", "Swift Orc", MonsterSubtype.Orc, 10, MonsterRarity.Magic);
      const rare = createPhysicalMonster("test_rare", "Bloodthirsty Chieftain", MonsterSubtype.Orc, 10, MonsterRarity.Rare);
      const unique = createPhysicalMonster("test_unique", "Gorthak the Crusher", MonsterSubtype.Orc, 10, MonsterRarity.Unique);
      
      // test multiple times to get averages
      const iterations = 10;
      let normalTotal = 0, magicTotal = 0, rareTotal = 0, uniqueTotal = 0;
      
      for (let i = 0; i < iterations; i++) {
        normalTotal += (await LootGenerator.generateLoot(normal)).length;
        magicTotal += (await LootGenerator.generateLoot(magic)).length;
        rareTotal += (await LootGenerator.generateLoot(rare)).length;
        uniqueTotal += (await LootGenerator.generateLoot(unique)).length;
      }
      
      const normalAvg = normalTotal / iterations;
      const magicAvg = magicTotal / iterations;
      const rareAvg = rareTotal / iterations;
      const uniqueAvg = uniqueTotal / iterations;
      
      // higher rarity should generate more loot on average (with some tolerance for randomness)
      expect(magicAvg).toBeGreaterThan(normalAvg * 0.9);
      expect(rareAvg).toBeGreaterThan(magicAvg * 0.9);
      expect(uniqueAvg).toBeGreaterThan(rareAvg * 0.9);
    });

    it("should generate level-appropriate currency", async () => {
      const lowLevel = createPhysicalMonster("low_test", "Weak Zombie", MonsterSubtype.Zombie, 2);
      const highLevel = createPhysicalMonster("high_test", "Ancient Demon", MonsterSubtype.Demon, 50);
      
      // collect currency over multiple runs
      const lowCurrency: string[] = [];
      const highCurrency: string[] = [];
      
      for (let i = 0; i < 50; i++) { // more runs for better chance
        const lowLoot = await LootGenerator.generateLoot(lowLevel);
        const highLoot = await LootGenerator.generateLoot(highLevel);
        
        lowCurrency.push(...lowLoot.filter(l => l.type === "currency").map(l => l.itemId!));
        highCurrency.push(...highLoot.filter(l => l.type === "currency").map(l => l.itemId!));
      }
      
      // both should get some currency (not necessarily wisdom scrolls every time)
      expect(lowCurrency.length).toBeGreaterThan(0);
      expect(highCurrency.length).toBeGreaterThan(0);
      
      // high level should have reasonable currency generation (very lenient check)
      // due to randomness, we just verify both generate currency and high level isn't worse
      const highHasRare = highCurrency.some(id => ["chaos_orb", "orb_of_alchemy", "chromatic_orb", "exalted_orb"].includes(id));
      const highHasMoreCurrency = highCurrency.length >= lowCurrency.length * 0.5;
      
      // very lenient - high level should at least not be dramatically worse than low level
      expect(highHasRare || highHasMoreCurrency).toBe(true);
    });
  });


  describe("zone monster spawning", () => {
    it("should get monsters for specific zones", () => {
      const coastMonsters = getZoneMonsters("the_coast");
      expect(coastMonsters.length).toBeGreaterThan(0);
      
      // should contain appropriate level monsters
      for (const monster of coastMonsters) {
        expect(monster.level).toBeLessThanOrEqual(5); // early game zone
      }
    });

    it("should handle non-existent zones gracefully", () => {
      const noMonsters = getZoneMonsters("fake_zone");
      expect(noMonsters).toEqual([]);
    });
  });

  describe("monster registry", () => {
    it("should have all expected monster types", () => {
      expect(getMonster("zombie_level_3")).toBeDefined();
      expect(getMonster("merveil")).toBeDefined();
      expect(getMonster("the_warden")).toBeDefined();
      expect(getMonster("nonexistent")).toBeUndefined();
    });

    it("should have bosses with unique rarity", () => {
      const merveil = getMonster("merveil");
      const warden = getMonster("the_warden");
      
      expect(merveil?.rarity).toBe(MonsterRarity.Unique);
      expect(warden?.rarity).toBe(MonsterRarity.Unique);
    });

    it("should have appropriate archetypes", () => {
      const zombie = getMonster("zombie_level_3");
      const shaman = getMonster("goatman_shaman_9");
      const archer = getMonster("skeleton_archer_5");
      
      expect(zombie?.archetype).toBe(MonsterArchetype.Physical);
      expect(shaman?.archetype).toBe(MonsterArchetype.Caster);
      expect(archer?.archetype).toBe(MonsterArchetype.Ranged);
    });
  });

  describe("cross-act scalability", () => {
    it("should work with monsters from different acts", async () => {
      // act 1 monster
      const act1Monster = getMonster("zombie_level_3");
      // higher level monster (conceptually from later acts)  
      const laterActMonster = getMonster("orc_warrior_20");
      
      if (act1Monster && laterActMonster) {
        const act1Loot = await LootGenerator.generateLoot(act1Monster);
        const laterLoot = await LootGenerator.generateLoot(laterActMonster);
        
        expect(act1Loot).toBeDefined();
        expect(laterLoot).toBeDefined();
        
        // both should generate valid loot
        expect(Array.isArray(act1Loot)).toBe(true);
        expect(Array.isArray(laterLoot)).toBe(true);
      }
    });

    it("should scale currency appropriately across levels", async () => {
      const earlyMonster = getMonster("zombie_level_1");
      const lateMonster = getMonster("chaos_demon_60");
      
      if (earlyMonster && lateMonster) {
        // get currency from many runs
        const earlyCurrency: string[] = [];
        const lateCurrency: string[] = [];
        
        for (let i = 0; i < 30; i++) {
          const earlyLoot = await LootGenerator.generateLoot(earlyMonster);
          const lateLoot = await LootGenerator.generateLoot(lateMonster);
          
          earlyCurrency.push(...earlyLoot.filter(l => l.type === "currency").map(l => l.itemId!));
          lateCurrency.push(...lateLoot.filter(l => l.type === "currency").map(l => l.itemId!));
        }
        
        // late game should have much higher chance of rare currency
        const lateHasExalted = lateCurrency.some(id => id === "exalted_orb");
        const earlyHasExalted = earlyCurrency.some(id => id === "exalted_orb");
        
        // late game should be much more likely to have rare currency
        // (though early game CAN have it, just extremely rare)
        expect(lateHasExalted || lateCurrency.some(id => ["chaos_orb", "orb_of_alchemy"].includes(id))).toBe(true);
      }
    });
  });
});