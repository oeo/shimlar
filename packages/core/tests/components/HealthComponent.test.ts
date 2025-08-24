import { describe, it, expect, beforeEach } from "bun:test";
import { HealthComponent } from '../../components/HealthComponent';

describe("HealthComponent", () => {
  let health: HealthComponent;

  beforeEach(() => {
    health = new HealthComponent(100, 5); // 100 hp, 5 hp/s regen
  });

  describe("damage", () => {
    it("should take damage", () => {
      const taken = health.takeDamage(30);
      expect(taken).toBe(30);
      expect(health.current).toBe(70);
    });

    it("should not go below 0", () => {
      const taken = health.takeDamage(150);
      expect(taken).toBe(100);
      expect(health.current).toBe(0);
    });

    it("should handle 0 damage", () => {
      const taken = health.takeDamage(0);
      expect(taken).toBe(0);
      expect(health.current).toBe(100);
    });
  });

  describe("healing", () => {
    it("should heal", () => {
      health.current = 50;
      const healed = health.heal(30);
      expect(healed).toBe(30);
      expect(health.current).toBe(80);
    });

    it("should not exceed maximum", () => {
      health.current = 90;
      const healed = health.heal(20);
      expect(healed).toBe(10);
      expect(health.current).toBe(100);
    });

    it("should handle 0 healing", () => {
      health.current = 50;
      const healed = health.heal(0);
      expect(healed).toBe(0);
      expect(health.current).toBe(50);
    });
  });

  describe("regeneration", () => {
    it("should regenerate over time", () => {
      health.current = 50;
      const healed = health.regenerate(1000); // 1 second
      expect(healed).toBe(5);
      expect(health.current).toBe(55);
    });

    it("should not regenerate when full", () => {
      const healed = health.regenerate(1000);
      expect(healed).toBe(0);
      expect(health.current).toBe(100);
    });

    it("should not exceed maximum when regenerating", () => {
      health.current = 98;
      const healed = health.regenerate(1000); // would be 5, but capped at 2
      expect(healed).toBe(2);
      expect(health.current).toBe(100);
    });

    it("should handle no regeneration", () => {
      const noRegen = new HealthComponent(100, 0);
      noRegen.current = 50;
      const healed = noRegen.regenerate(1000);
      expect(healed).toBe(0);
      expect(noRegen.current).toBe(50);
    });
  });

  describe("status checks", () => {
    it("should detect death", () => {
      expect(health.isDead()).toBe(false);
      
      health.takeDamage(100);
      expect(health.isDead()).toBe(true);
    });

    it("should calculate percentage", () => {
      expect(health.getPercentage()).toBe(100);
      
      health.current = 50;
      expect(health.getPercentage()).toBe(50);
      
      health.current = 0;
      expect(health.getPercentage()).toBe(0);
    });
  });
});