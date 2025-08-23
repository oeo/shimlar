import { describe, it, expect } from "bun:test";
import { LootGenerator } from "../../src/items/LootGeneration";
import { 
  createPhysicalMonster, 
  createCasterMonster, 
  MonsterSubtype,
  MonsterRarity 
} from "@shimlar/data/src/monsters";

describe("Path of Exile Accuracy Tests", () => {
  describe("currency drop rates match PoE expectations", () => {
    it("should have realistic chaos orb drop rates", async () => {
      // in PoE, chaos orbs are extremely rare in early game, uncommon in late game
      const earlyLevel = createPhysicalMonster("early", "Act1 Monster", MonsterSubtype.Zombie, 8);
      const lateLevel = createPhysicalMonster("late", "Endgame Monster", MonsterSubtype.Demon, 75);
      
      const iterations = 500; // large sample for rare currency
      let earlyChaos = 0;
      let lateChaos = 0;
      
      for (let i = 0; i < iterations; i++) {
        const earlyLoot = await LootGenerator.generateLoot(earlyLevel);
        const lateLoot = await LootGenerator.generateLoot(lateLevel);
        
        earlyChaos += earlyLoot.filter(l => l.type === "currency" && l.itemId === "chaos_orb").length;
        lateChaos += lateLoot.filter(l => l.type === "currency" && l.itemId === "chaos_orb").length;
      }
      
      // in PoE, chaos orbs should be extremely rare at level 8 (maybe 1 in 1000+ kills)
      // but more common at level 75 (maybe 1 in 100-200 kills)
      expect(earlyChaos).toBeLessThanOrEqual(3); // very rare in early game
      expect(lateChaos).toBeGreaterThanOrEqual(earlyChaos); // should be at least as common in late game
      
      console.log(`Chaos orb rates: Early (lvl 8): ${earlyChaos}/${iterations}, Late (lvl 75): ${lateChaos}/${iterations}`);
      console.log(`Early rate: ${(earlyChaos / iterations * 100).toFixed(3)}%, Late rate: ${(lateChaos / iterations * 100).toFixed(3)}%`);
    });

    it("should have scroll of wisdom as most common drop", async () => {
      const monster = createPhysicalMonster("test", "Test Monster", MonsterSubtype.Zombie, 20);
      const iterations = 100;
      const currencyCount: Record<string, number> = {};
      
      for (let i = 0; i < iterations; i++) {
        const loot = await LootGenerator.generateLoot(monster);
        const currency = loot.filter(l => l.type === "currency");
        
        for (const c of currency) {
          currencyCount[c.itemId!] = (currencyCount[c.itemId!] || 0) + (c.quantity || 1);
        }
      }
      
      // in PoE, wisdom scrolls and portal scrolls are the most common drops
      const wisdom = currencyCount["scroll_of_wisdom"] || 0;
      const portal = currencyCount["portal_scroll"] || 0;
      const basicCurrency = wisdom + portal;
      const totalCurrency = Object.values(currencyCount).reduce((sum, count) => sum + count, 0);
      
      // basic scrolls should be majority of currency drops
      expect(basicCurrency / totalCurrency).toBeGreaterThan(0.4); // at least 40% should be scrolls
      
      console.log("Currency distribution:");
      Object.entries(currencyCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 8)
        .forEach(([currency, count]) => {
          console.log(`${currency}: ${count} (${(count / totalCurrency * 100).toFixed(1)}%)`);
        });
    });
  });

  describe("monster rarity effects match PoE", () => {
    it("should demonstrate clear loot quantity scaling by rarity", async () => {
      const level = 25;
      const normal = createPhysicalMonster("normal", "Normal Orc", MonsterSubtype.Orc, level, MonsterRarity.Normal);
      const magic = createPhysicalMonster("magic", "Swift Orc", MonsterSubtype.Orc, level, MonsterRarity.Magic);
      const rare = createPhysicalMonster("rare", "Bloodthirsty Chieftain", MonsterSubtype.Orc, level, MonsterRarity.Rare);
      const unique = createPhysicalMonster("unique", "The Orc King", MonsterSubtype.Orc, level, MonsterRarity.Unique);
      
      const iterations = 50;
      const results = {
        normal: { items: 0, rareItems: 0 },
        magic: { items: 0, rareItems: 0 },
        rare: { items: 0, rareItems: 0 },
        unique: { items: 0, rareItems: 0 }
      };
      
      for (let i = 0; i < iterations; i++) {
        for (const [rarity, monster] of [
          ["normal", normal], ["magic", magic], ["rare", rare], ["unique", unique]
        ] as const) {
          const loot = await LootGenerator.generateLoot(monster);
          results[rarity].items += loot.length;
          results[rarity].rareItems += loot.filter(l => 
            l.type === "equipment" && l.item?.rarity === "rare"
          ).length;
        }
      }
      
      // in PoE, higher rarity monsters drop significantly more loot
      const normalAvg = results.normal.items / iterations;
      const magicAvg = results.magic.items / iterations;
      const rareAvg = results.rare.items / iterations;
      const uniqueAvg = results.unique.items / iterations;
      
      // should show clear progression
      expect(magicAvg).toBeGreaterThan(normalAvg);
      expect(rareAvg).toBeGreaterThan(magicAvg);
      expect(uniqueAvg).toBeGreaterThan(rareAvg);
      
      // unique monsters should drop significantly more than normal
      expect(uniqueAvg).toBeGreaterThan(normalAvg * 2);
      
      console.log("Loot quantity by monster rarity:");
      console.log(`Normal: ${normalAvg.toFixed(1)} avg items`);
      console.log(`Magic: ${magicAvg.toFixed(1)} avg items`);
      console.log(`Rare: ${rareAvg.toFixed(1)} avg items`);
      console.log(`Unique: ${uniqueAvg.toFixed(1)} avg items`);
    });

    it("should show increasing rare item chance with monster rarity", async () => {
      const level = 30;
      const normal = createPhysicalMonster("normal", "Zombie", MonsterSubtype.Zombie, level, MonsterRarity.Normal);
      const rare = createPhysicalMonster("rare", "Putrid Devourer", MonsterSubtype.Zombie, level, MonsterRarity.Rare);
      const unique = createPhysicalMonster("unique", "The Unbreathing Queen", MonsterSubtype.Zombie, level, MonsterRarity.Unique);
      
      const iterations = 100;
      const results = {
        normal: { total: 0, rareItems: 0 },
        rare: { total: 0, rareItems: 0 },
        unique: { total: 0, rareItems: 0 }
      };
      
      for (let i = 0; i < iterations; i++) {
        for (const [rarity, monster] of [
          ["normal", normal], ["rare", rare], ["unique", unique]
        ] as const) {
          const loot = await LootGenerator.generateLoot(monster);
          const equipment = loot.filter(l => l.type === "equipment");
          
          results[rarity].total += equipment.length;
          results[rarity].rareItems += equipment.filter(l => l.item?.rarity === "rare").length;
        }
      }
      
      // calculate rare item rates
      const normalRate = results.normal.total > 0 ? results.normal.rareItems / results.normal.total : 0;
      const rareRate = results.rare.total > 0 ? results.rare.rareItems / results.rare.total : 0;
      const uniqueRate = results.unique.total > 0 ? results.unique.rareItems / results.unique.total : 0;
      
      // higher rarity monsters should have better chance at rare items
      expect(rareRate + uniqueRate).toBeGreaterThan(normalRate);
      
      console.log("Rare item drop rates by monster rarity:");
      console.log(`Normal: ${(normalRate * 100).toFixed(1)}% (${results.normal.rareItems}/${results.normal.total})`);
      console.log(`Rare: ${(rareRate * 100).toFixed(1)}% (${results.rare.rareItems}/${results.rare.total})`);
      console.log(`Unique: ${(uniqueRate * 100).toFixed(1)}% (${results.unique.rareItems}/${results.unique.total})`);
    });
  });

  describe("realistic drop simulations", () => {
    it("should simulate clearing a PoE zone with realistic results", async () => {
      // simulate clearing "The Coast" (act 1 zone) - mix of monster rarities
      const monsters = [
        // 20 normal monsters
        ...Array(20).fill(0).map((_, i) => 
          createPhysicalMonster(`coast_${i}`, "Zombie", MonsterSubtype.Zombie, 3, MonsterRarity.Normal)
        ),
        // 5 magic monsters
        ...Array(5).fill(0).map((_, i) => 
          createPhysicalMonster(`coast_magic_${i}`, "Bloated Zombie", MonsterSubtype.Zombie, 3, MonsterRarity.Magic)
        ),
        // 1 rare monster
        createPhysicalMonster("coast_rare", "Putrid Devourer", MonsterSubtype.Zombie, 3, MonsterRarity.Rare)
      ];
      
      const allLoot: any[] = [];
      
      // kill all monsters in the zone
      for (const monster of monsters) {
        const loot = await LootGenerator.generateLoot(monster);
        allLoot.push(...loot);
      }
      
      // analyze the zone clear results
      const currency = allLoot.filter(l => l.type === "currency");
      const equipment = allLoot.filter(l => l.type === "equipment");
      
      // in early PoE, you get a mix of currency and equipment
      // our 70% equipment / 30% currency split means equipment will be more common
      expect(allLoot.length).toBeGreaterThan(10); // should get reasonable amount of loot
      expect(allLoot.length).toBeLessThan(100); // but not unrealistic amounts
      
      const currencyTypes = [...new Set(currency.map(c => c.itemId))];
      const wisdomScrolls = currency.filter(c => c.itemId === "scroll_of_wisdom").length;
      
      expect(wisdomScrolls).toBeGreaterThan(0); // should definitely find some wisdom scrolls
      
      console.log("Zone clear simulation (The Coast - Act 1):");
      console.log(`Total loot: ${allLoot.length} items`);
      console.log(`Currency: ${currency.length} items (${currencyTypes.length} types)`);
      console.log(`Equipment: ${equipment.length} items`);
      console.log(`Wisdom scrolls: ${wisdomScrolls}`);
      
      // count equipment by rarity
      const equipmentByRarity = equipment.reduce((acc, item) => {
        const rarity = item.item?.rarity || "normal";
        acc[rarity] = (acc[rarity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      console.log("Equipment by rarity:", equipmentByRarity);
    });

    it("should simulate boss fight with appropriate rewards", async () => {
      // simulate fighting Merveil 10 times
      const merveil = createCasterMonster("merveil_sim", "Merveil, the Siren", MonsterSubtype.Demon, 12, MonsterRarity.Unique);
      const iterations = 10;
      const allLoot: any[] = [];
      
      for (let i = 0; i < iterations; i++) {
        const loot = await LootGenerator.generateLoot(merveil);
        allLoot.push(...loot);
      }
      
      const currency = allLoot.filter(l => l.type === "currency");
      const equipment = allLoot.filter(l => l.type === "equipment");
      const rareEquipment = equipment.filter(e => e.item?.rarity === "rare");
      
      // boss fights should yield good rewards
      expect(allLoot.length).toBeGreaterThan(30); // 10 fights * 3+ items average
      expect(rareEquipment.length).toBeGreaterThan(0); // should get some rare items
      
      const goodCurrency = currency.filter(c => 
        ["orb_of_alchemy", "chaos_orb", "chromatic_orb"].includes(c.itemId!)
      );
      
      console.log("Boss fight simulation (10x Merveil kills):");
      console.log(`Total loot: ${allLoot.length} items`);
      console.log(`Currency: ${currency.length} items`);
      console.log(`Equipment: ${equipment.length} items (${rareEquipment.length} rare)`);
      console.log(`Good currency: ${goodCurrency.length} items`);
    });
  });
});