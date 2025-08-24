import { describe, it, expect, beforeEach } from "bun:test";
import { CombatLog } from '../../combat/CombatLog';
import { CombatEvent, DamageType } from '../../combat/types';

describe("CombatLog", () => {
  let log: CombatLog;

  beforeEach(() => {
    log = new CombatLog({
      maxEntries: 50,
      showCalculations: true,
      colorEnabled: true
    });
  });

  describe("entity registration", () => {
    it("should register entity names", () => {
      log.registerEntity("player-1", "Hero");
      log.registerEntity("enemy-1", "Skeleton");
      
      // test by creating a damage event
      const event: CombatEvent = {
        type: "damage",
        sourceId: "player-1",
        targetId: "enemy-1",
        data: { damage: 25 }
      };
      
      log.logEvent(event, 1);
      const entries = log.getEntries();
      
      expect(entries.length).toBe(1);
      expect(entries[0].message).toContain("Hero");
      expect(entries[0].message).toContain("Skeleton");
    });

    it("should use fallback names for unregistered entities", () => {
      const event: CombatEvent = {
        type: "damage",
        sourceId: "unknown-entity-123",
        data: { damage: 10 }
      };
      
      log.logEvent(event, 1);
      const entries = log.getEntries();
      
      expect(entries[0].message).toContain("Entity-123");
    });
  });

  describe("damage event logging", () => {
    beforeEach(() => {
      log.registerEntity("attacker", "Warrior");
      log.registerEntity("defender", "Goblin");
    });

    it("should log basic damage events", () => {
      const event: CombatEvent = {
        type: "damage",
        sourceId: "attacker",
        targetId: "defender",
        data: {
          damage: 42.5,
          totalDamage: 50,
          mitigatedDamage: 42.5,
          critical: false
        }
      };
      
      log.logEvent(event, 5);
      const entries = log.getEntries();
      
      expect(entries.length).toBe(1);
      expect(entries[0].type).toBe("damage");
      expect(entries[0].tickNumber).toBe(5);
      expect(entries[0].message).toBe("Warrior hits Goblin for 42.5 damage");
      expect(entries[0].color).toBe("red");
    });

    it("should log critical damage events", () => {
      const event: CombatEvent = {
        type: "damage",
        sourceId: "attacker",
        targetId: "defender",
        data: {
          damage: 75,
          totalDamage: 50,
          mitigatedDamage: 75,
          critical: true,
          damageTypes: [{ type: DamageType.Physical, amount: 75 }]
        }
      };
      
      log.logEvent(event, 3);
      const entries = log.getEntries();
      
      expect(entries.length).toBe(1);
      expect(entries[0].message).toBe("Warrior critically hits Goblin for 75 damage");
      expect(entries[0].color).toBe("yellow");
      expect(entries[0].details?.damage?.critical).toBe(true);
    });

    it("should include detailed damage calculations", () => {
      const event: CombatEvent = {
        type: "damage",
        sourceId: "attacker",
        targetId: "defender",
        data: {
          damage: 35,
          totalDamage: 50,
          mitigatedDamage: 35,
          critical: true,
          damageTypes: [
            { type: DamageType.Physical, amount: 20 },
            { type: DamageType.Fire, amount: 15 }
          ]
        }
      };
      
      log.logEvent(event, 1);
      const entries = log.getEntries();
      
      const calculations = entries[0].details?.calculations;
      expect(calculations).toBeDefined();
      expect(calculations).toContain("Base damage: 50");
      expect(calculations).toContain("Types: 20.0 physical, 15.0 fire");
      expect(calculations).toContain("Critical strike applied");
      expect(calculations).toContain("Mitigated 30.0% (15.0)");
      expect(calculations).toContain("Final damage: 35");
    });
  });

  describe("heal event logging", () => {
    beforeEach(() => {
      log.registerEntity("player", "Hero");
    });

    it("should log heal events", () => {
      const event: CombatEvent = {
        type: "heal",
        sourceId: "player",
        data: {
          amount: 15.5,
          type: "regeneration"
        }
      };
      
      log.logEvent(event, 2);
      const entries = log.getEntries();
      
      expect(entries.length).toBe(1);
      expect(entries[0].type).toBe("heal");
      expect(entries[0].message).toBe("Hero heals 15.5 (regeneration)");
      expect(entries[0].color).toBe("green");
      expect(entries[0].details?.healing?.amount).toBe(15.5);
      expect(entries[0].details?.healing?.type).toBe("regeneration");
    });
  });

  describe("miss event logging", () => {
    beforeEach(() => {
      log.registerEntity("archer", "Ranger");
      log.registerEntity("target", "Orc");
    });

    it("should log miss events", () => {
      const event: CombatEvent = {
        type: "miss",
        sourceId: "archer",
        targetId: "target",
        data: { reason: "evasion" }
      };
      
      log.logEvent(event, 4);
      const entries = log.getEntries();
      
      expect(entries.length).toBe(1);
      expect(entries[0].type).toBe("miss");
      expect(entries[0].message).toBe("Ranger misses Orc (evasion)");
      expect(entries[0].color).toBe("gray");
    });
  });

  describe("critical event logging", () => {
    beforeEach(() => {
      log.registerEntity("assassin", "Shadow");
      log.registerEntity("victim", "Guard");
    });

    it("should log critical strike events", () => {
      const event: CombatEvent = {
        type: "critical",
        sourceId: "assassin",
        targetId: "victim",
        data: { multiplier: 250 }
      };
      
      log.logEvent(event, 1);
      const entries = log.getEntries();
      
      expect(entries.length).toBe(1);
      expect(entries[0].type).toBe("critical");
      expect(entries[0].message).toBe("Shadow scores a critical hit on Guard! (250%)");
      expect(entries[0].color).toBe("yellow");
    });
  });

  describe("death event logging", () => {
    beforeEach(() => {
      log.registerEntity("monster", "Dragon");
    });

    it("should log death events", () => {
      const event: CombatEvent = {
        type: "death",
        sourceId: "monster",
        data: { cause: "damage" }
      };
      
      log.logEvent(event, 10);
      const entries = log.getEntries();
      
      expect(entries.length).toBe(1);
      expect(entries[0].type).toBe("death");
      expect(entries[0].message).toBe("Dragon dies (damage)");
      expect(entries[0].color).toBe("red");
    });
  });

  describe("move event logging", () => {
    beforeEach(() => {
      log.registerEntity("player", "Hero");
    });

    it("should log combat entry events", () => {
      const event: CombatEvent = {
        type: "move",
        sourceId: "player",
        data: { action: "entered_combat" }
      };
      
      log.logEvent(event, 0);
      const entries = log.getEntries();
      
      expect(entries.length).toBe(1);
      expect(entries[0].message).toBe("Hero enters combat");
      expect(entries[0].color).toBe("cyan");
    });

    it("should log combat system events", () => {
      const event: CombatEvent = {
        type: "move",
        sourceId: "system",
        data: { 
          action: "combat_started",
          tickRate: 100
        }
      };
      
      log.logEvent(event, 0);
      const entries = log.getEntries();
      
      expect(entries.length).toBe(1);
      expect(entries[0].message).toBe("Combat begins (100ms ticks)");
      expect(entries[0].color).toBe("cyan");
    });
  });

  describe("system messages", () => {
    it("should log system messages", () => {
      log.logSystem("Test system message");
      const entries = log.getEntries();
      
      expect(entries.length).toBe(1);
      expect(entries[0].type).toBe("system");
      expect(entries[0].message).toBe("Test system message");
      expect(entries[0].color).toBe("cyan");
      expect(entries[0].tickNumber).toBe(0);
    });
  });

  describe("log management", () => {
    it("should limit entries to max size", () => {
      const smallLog = new CombatLog({ maxEntries: 3 });
      
      for (let i = 0; i < 5; i++) {
        smallLog.logSystem(`Message ${i}`);
      }
      
      const entries = smallLog.getEntries();
      expect(entries.length).toBe(3);
      expect(entries[0].message).toBe("Message 2");
      expect(entries[2].message).toBe("Message 4");
    });

    it("should get recent entries", () => {
      for (let i = 0; i < 10; i++) {
        log.logSystem(`Message ${i}`);
      }
      
      const recent = log.getRecentEntries(3);
      expect(recent.length).toBe(3);
      expect(recent[0].message).toBe("Message 7");
      expect(recent[2].message).toBe("Message 9");
    });

    it("should clear all entries", () => {
      log.logSystem("Message 1");
      log.logSystem("Message 2");
      
      expect(log.getEntries().length).toBe(2);
      
      log.clear();
      expect(log.getEntries().length).toBe(0);
    });
  });

  describe("formatting", () => {
    beforeEach(() => {
      log.registerEntity("player", "TestHero");
    });

    it("should format entries for display", () => {
      const event: CombatEvent = {
        type: "damage",
        sourceId: "player",
        data: {
          damage: 25,
          totalDamage: 30,
          mitigatedDamage: 25,
          damageTypes: [{ type: DamageType.Physical, amount: 25 }]
        }
      };
      
      log.logEvent(event, 5);
      const formatted = log.formatForDisplay();
      
      expect(formatted.length).toBe(1);
      expect(formatted[0]).toContain("[T5]");
      expect(formatted[0]).toContain("TestHero");
      expect(formatted[0]).toContain("25 damage");
      
      // should include calculations
      expect(formatted[0]).toContain("Base damage: 30");
      expect(formatted[0]).toContain("Types: 25.0 physical");
    });

    it("should format without calculations when disabled", () => {
      const noCalcLog = new CombatLog({ showCalculations: false });
      noCalcLog.registerEntity("player", "TestHero");
      
      const event: CombatEvent = {
        type: "damage",
        sourceId: "player",
        data: {
          damage: 25,
          damageTypes: [{ type: DamageType.Physical, amount: 25 }]
        }
      };
      
      noCalcLog.logEvent(event, 1);
      const formatted = noCalcLog.formatForDisplay();
      
      expect(formatted.length).toBe(1);
      expect(formatted[0]).not.toContain("Base damage");
      expect(formatted[0]).not.toContain("•");
    });
  });

  describe("tick logging", () => {
    it("should log multiple events from a tick", () => {
      log.registerEntity("player", "Hero");
      log.registerEntity("enemy", "Goblin");
      
      const events: CombatEvent[] = [
        {
          type: "damage",
          sourceId: "player",
          targetId: "enemy",
          data: { damage: 20 }
        },
        {
          type: "heal",
          sourceId: "player",
          data: { amount: 5, type: "regeneration" }
        },
        {
          type: "death",
          sourceId: "enemy",
          data: { cause: "damage" }
        }
      ];
      
      log.logTick(events, 7);
      const entries = log.getEntries();
      
      expect(entries.length).toBe(3);
      expect(entries[0].tickNumber).toBe(7);
      expect(entries[1].tickNumber).toBe(7);
      expect(entries[2].tickNumber).toBe(7);
      
      expect(entries[0].type).toBe("damage");
      expect(entries[1].type).toBe("heal");
      expect(entries[2].type).toBe("death");
    });
  });
});