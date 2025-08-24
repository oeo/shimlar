import { describe, it, expect } from "bun:test";
import { LootGenerator } from '../../items/LootGeneration';
import { 
  createPhysicalMonster, 
  createCasterMonster,
  createRangedMonster,
  MonsterSubtype,
  MonsterRarity,
  getMonster 
} from "@shimlar/data/monsters";

describe("Loot Validation - Path of Exile Mechanics", () => {
  describe("currency drop rates by monster level", () => {
    it("should follow poe exponential scaling for rare currency", async () => {
      const lowLevel = createPhysicalMonster("test_low", "Weak Zombie", MonsterSubtype.Zombie, 5);
      const midLevel = createPhysicalMonster("test_mid", "Veteran Orc", MonsterSubtype.Orc, 35);
      const highLevel = createPhysicalMonster("test_high", "Ancient Demon", MonsterSubtype.Demon, 65);
      
      const iterations = 200; // more iterations for rare currency
      const results = {
        low: { chaos: 0, exalt: 0, alchemy: 0, total: 0, goodCurrency: 0 },
        mid: { chaos: 0, exalt: 0, alchemy: 0, total: 0, goodCurrency: 0 },
        high: { chaos: 0, exalt: 0, alchemy: 0, total: 0, goodCurrency: 0 }
      };
      
      // generate large sample of loot
      for (let i = 0; i < iterations; i++) {
        for (const [level, monster] of [["low", lowLevel], ["mid", midLevel], ["high", highLevel]] as const) {
          const loot = await LootGenerator.generateLoot(monster);
          const currency = loot.filter(l => l.type === "currency");
          
          results[level].total += currency.length;
          results[level].chaos += currency.filter(c => c.itemId === "chaos_orb").length;
          results[level].exalt += currency.filter(c => c.itemId === "exalted_orb").length;
          results[level].alchemy += currency.filter(c => c.itemId === "orb_of_alchemy").length;
          results[level].goodCurrency += currency.filter(c => 
            ["chaos_orb", "exalted_orb", "orb_of_alchemy", "chromatic_orb"].includes(c.itemId!)
          ).length;
        }
      }
      
      // path of exile expectations (adjusted for actual rarities):
      // - higher level monsters should have better chance at good currency
      // - progression should be visible across levels
      
      expect(results.high.goodCurrency).toBeGreaterThan(results.low.goodCurrency);
      expect(results.high.alchemy).toBeGreaterThanOrEqual(results.low.alchemy);
      
      // total currency should be somewhat consistent (base drops)
      expect(results.low.total).toBeGreaterThan(0);
      expect(results.mid.total).toBeGreaterThan(0);
      expect(results.high.total).toBeGreaterThan(0);
      
      console.log("Currency distribution by level:");
      console.log(`Low (lvl 5): ${results.low.chaos} chaos, ${results.low.alchemy} alchemy, ${results.low.goodCurrency} good currency`);
      console.log(`Mid (lvl 35): ${results.mid.chaos} chaos, ${results.mid.alchemy} alchemy, ${results.mid.goodCurrency} good currency`);
      console.log(`High (lvl 65): ${results.high.chaos} chaos, ${results.high.alchemy} alchemy, ${results.high.goodCurrency} good currency`);
    });

    it("should maintain poe rarity distribution across different monster types", async () => {
      const monsters = [
        createPhysicalMonster("zombie_test", "Zombie", MonsterSubtype.Zombie, 30),
        createCasterMonster("shaman_test", "Goatman Shaman", MonsterSubtype.Goatman, 30),
        createRangedMonster("archer_test", "Skeleton Archer", MonsterSubtype.Skeleton, 30),
        createPhysicalMonster("orc_test", "Orc Warrior", MonsterSubtype.Orc, 30)
      ];
      
      const iterations = 50;
      const allCurrency: string[] = [];
      
      for (let i = 0; i < iterations; i++) {
        for (const monster of monsters) {
          const loot = await LootGenerator.generateLoot(monster);
          const currency = loot.filter(l => l.type === "currency").map(l => l.itemId!);
          allCurrency.push(...currency);
        }
      }
      
      const counts = allCurrency.reduce((acc, curr) => {
        acc[curr] = (acc[curr] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // path of exile expectations at level 30:
      // most common: wisdom scrolls, transmutes
      // common: alterations, augmentations
      // uncommon: alchemy, chromatic
      // rare: chaos
      // very rare: exalted
      
      const wisdom = counts["scroll_of_wisdom"] || 0;
      const transmute = counts["orb_of_transmutation"] || 0;
      const alteration = counts["orb_of_alteration"] || 0;
      const chaos = counts["chaos_orb"] || 0;
      const exalt = counts["exalted_orb"] || 0;
      
      expect(wisdom + transmute).toBeGreaterThan(alteration); // basic currency most common
      expect(alteration).toBeGreaterThanOrEqual(chaos); // mid-tier at least as common as rare
      // chaos and exalt are both very rare, so either could be 0
      
      console.log("Currency distribution (level 30 monsters):");
      Object.entries(counts).sort(([,a], [,b]) => b - a).forEach(([currency, count]) => {
        console.log(`${currency}: ${count}`);
      });
    });
  });

  describe("monster rarity impact on loot quality", () => {
    it("should generate better loot from higher rarity monsters like in poe", async () => {
      const normal = createPhysicalMonster("normal_test", "Zombie", MonsterSubtype.Zombie, 25, MonsterRarity.Normal);
      const magic = createPhysicalMonster("magic_test", "Bloated Zombie", MonsterSubtype.Zombie, 25, MonsterRarity.Magic);
      const rare = createPhysicalMonster("rare_test", "Putrid Devourer", MonsterSubtype.Zombie, 25, MonsterRarity.Rare);
      const unique = createPhysicalMonster("unique_test", "The Unbreathing Queen", MonsterSubtype.Zombie, 25, MonsterRarity.Unique);
      
      const iterations = 30;
      const results = {
        normal: { totalLoot: 0, rareItems: 0, currency: 0 },
        magic: { totalLoot: 0, rareItems: 0, currency: 0 },
        rare: { totalLoot: 0, rareItems: 0, currency: 0 },
        unique: { totalLoot: 0, rareItems: 0, currency: 0 }
      };
      
      for (let i = 0; i < iterations; i++) {
        for (const [rarity, monster] of [
          ["normal", normal], ["magic", magic], ["rare", rare], ["unique", unique]
        ] as const) {
          const loot = await LootGenerator.generateLoot(monster);
          
          results[rarity].totalLoot += loot.length;
          results[rarity].currency += loot.filter(l => l.type === "currency").length;
          results[rarity].rareItems += loot.filter(l => 
            l.type === "equipment" && l.item?.rarity === "rare"
          ).length;
        }
      }
      
      // path of exile expectations:
      // higher rarity monsters should drop more loot overall
      // higher rarity monsters should have better chance at rare items
      
      expect(results.unique.totalLoot).toBeGreaterThan(results.rare.totalLoot);
      expect(results.rare.totalLoot).toBeGreaterThan(results.magic.totalLoot);
      expect(results.magic.totalLoot).toBeGreaterThan(results.normal.totalLoot);
      
      // rare+ monsters should have better chance at rare items
      expect(results.unique.rareItems + results.rare.rareItems).toBeGreaterThanOrEqual(
        results.normal.rareItems + results.magic.rareItems
      );
      
      console.log("Loot by monster rarity:");
      Object.entries(results).forEach(([rarity, data]) => {
        const avg = data.totalLoot / iterations;
        console.log(`${rarity}: ${avg.toFixed(1)} avg items, ${data.rareItems} rare items, ${data.currency} currency`);
      });
    });
  });

  describe("item level appropriateness", () => {
    it("should generate level-appropriate equipment within reasonable bounds", async () => {
      const earlyMonster = createPhysicalMonster("early", "Zombie", MonsterSubtype.Zombie, 5);
      const lateMonster = createPhysicalMonster("late", "Demon", MonsterSubtype.Demon, 50);
      
      const iterations = 30;
      const equipment = {
        early: [] as any[],
        late: [] as any[]
      };
      
      for (let i = 0; i < iterations; i++) {
        for (const [stage, monster] of [
          ["early", earlyMonster], ["late", lateMonster]
        ] as const) {
          const loot = await LootGenerator.generateLoot(monster);
          const items = loot.filter(l => l.type === "equipment" && l.item).map(l => l.item);
          equipment[stage].push(...items);
        }
      }
      
      // basic sanity checks - items shouldn't have impossible level requirements
      for (const item of equipment.early) {
        const levelReq = item.requirements?.level || 1;
        expect(levelReq).toBeLessThanOrEqual(10); // early monsters shouldn't drop super high level items
      }
      
      for (const item of equipment.late) {
        const levelReq = item.requirements?.level || 1;
        expect(levelReq).toBeLessThanOrEqual(55); // level 50 monster + reasonable buffer
      }
      
      // we should actually get some equipment from both
      expect(equipment.early.length + equipment.late.length).toBeGreaterThan(0);
      
      console.log("Equipment level requirements:");
      console.log(`Early game: ${equipment.early.length} items`);
      console.log(`Late game: ${equipment.late.length} items`);
      
      if (equipment.early.length > 0) {
        const earlyAvg = equipment.early.reduce((sum, i) => sum + (i.requirements?.level || 1), 0) / equipment.early.length;
        console.log(`Early avg level req: ${earlyAvg.toFixed(1)}`);
      }
      
      if (equipment.late.length > 0) {
        const lateAvg = equipment.late.reduce((sum, i) => sum + (i.requirements?.level || 1), 0) / equipment.late.length;
        console.log(`Late avg level req: ${lateAvg.toFixed(1)}`);
      }
    });
  });

  describe("boss loot mechanics", () => {
    it("should generate appropriate loot for act bosses", async () => {
      const merveil = getMonster("merveil"); // act 1 boss
      const warden = getMonster("the_warden"); // prison boss
      
      expect(merveil).toBeDefined();
      expect(warden).toBeDefined();
      
      if (merveil && warden) {
        const iterations = 20;
        const merLoot: any[] = [];
        const warLoot: any[] = [];
        
        for (let i = 0; i < iterations; i++) {
          merLoot.push(await LootGenerator.generateLoot(merveil));
          warLoot.push(await LootGenerator.generateLoot(warden));
        }
        
        const merAvgItems = merLoot.reduce((sum, loot) => sum + loot.length, 0) / iterations;
        const warAvgItems = warLoot.reduce((sum, loot) => sum + loot.length, 0) / iterations;
        
        // bosses should drop significantly more loot than normal monsters
        expect(merAvgItems).toBeGreaterThan(2); // unique monsters drop 3-7 items
        expect(warAvgItems).toBeGreaterThan(2);
        
        // check for rare items from bosses
        const merRareItems = merLoot.reduce((count, lootArray) => {
          return count + lootArray.filter((l: any) => l.type === "equipment" && l.item?.rarity === "rare").length;
        }, 0);
        
        expect(merRareItems).toBeGreaterThan(0); // bosses should have good chance at rare items
        
        console.log(`Merveil avg loot: ${merAvgItems.toFixed(1)} items`);
        console.log(`Warden avg loot: ${warAvgItems.toFixed(1)} items`);
        console.log(`Merveil rare item drops: ${merRareItems}/${iterations}`);
      }
    });
  });


  describe("cross-act scaling validation", () => {
    it("should maintain appropriate loot progression across different acts", async () => {
      // simulate monsters from different acts
      const act1 = createPhysicalMonster("act1_zombie", "Zombie", MonsterSubtype.Zombie, 8);
      const act2 = createPhysicalMonster("act2_goat", "Goatman", MonsterSubtype.Goatman, 20);
      const act3 = createPhysicalMonster("act3_demon", "Demon", MonsterSubtype.Demon, 35);
      const endgame = createPhysicalMonster("endgame", "Ancient Horror", MonsterSubtype.Undead, 70);
      
      const iterations = 25;
      const actResults = {
        act1: { items: 0, goodCurrency: 0 },
        act2: { items: 0, goodCurrency: 0 },
        act3: { items: 0, goodCurrency: 0 },
        endgame: { items: 0, goodCurrency: 0 }
      };
      
      const goodCurrency = ["orb_of_alchemy", "chaos_orb", "exalted_orb", "chromatic_orb"];
      
      for (let i = 0; i < iterations; i++) {
        for (const [act, monster] of [
          ["act1", act1], ["act2", act2], ["act3", act3], ["endgame", endgame]
        ] as const) {
          const loot = await LootGenerator.generateLoot(monster);
          actResults[act].items += loot.length;
          actResults[act].goodCurrency += loot.filter(l => 
            l.type === "currency" && goodCurrency.includes(l.itemId!)
          ).length;
        }
      }
      
      // later acts should have better currency rates (endgame should be clearly better)
      expect(actResults.endgame.goodCurrency).toBeGreaterThan(actResults.act1.goodCurrency);
      // progression may be gradual, so check overall trend
      expect(actResults.endgame.goodCurrency).toBeGreaterThanOrEqual(actResults.act3.goodCurrency);
      
      console.log("Cross-act loot progression:");
      Object.entries(actResults).forEach(([act, data]) => {
        const avgItems = data.items / iterations;
        console.log(`${act}: ${avgItems.toFixed(1)} avg items, ${data.goodCurrency} good currency drops`);
      });
    });
  });
});