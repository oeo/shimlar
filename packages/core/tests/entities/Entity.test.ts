import { describe, it, expect, beforeEach } from "bun:test";
import { Entity } from '../../entities/Entity';
import { HealthComponent } from '../../components/HealthComponent';
import { StatsComponent } from '../../components/StatsComponent';
import { EventBus } from '../../events/EventBus';

describe("Entity", () => {
  let entity: Entity;

  beforeEach(() => {
    entity = new Entity("test-entity", "character");
  });

  describe("component management", () => {
    it("should add components", () => {
      const health = new HealthComponent(100);
      entity.addComponent(health);
      
      expect(entity.hasComponent("health")).toBe(true);
      expect(health.entity).toBe(entity);
    });

    it("should get components", () => {
      const health = new HealthComponent(100);
      entity.addComponent(health);
      
      const retrieved = entity.getComponent<HealthComponent>("health");
      expect(retrieved).toBe(health);
    });

    it("should return undefined for missing components", () => {
      const component = entity.getComponent("nonexistent");
      expect(component).toBeUndefined();
    });

    it("should remove components", () => {
      const health = new HealthComponent(100);
      entity.addComponent(health);
      
      const removed = entity.removeComponent("health");
      expect(removed).toBe(true);
      expect(entity.hasComponent("health")).toBe(false);
      expect(health.entity).toBeUndefined();
    });

    it("should return false when removing nonexistent component", () => {
      const removed = entity.removeComponent("nonexistent");
      expect(removed).toBe(false);
    });

    it("should chain component additions", () => {
      const health = new HealthComponent(100);
      const stats = new StatsComponent(1);
      
      entity
        .addComponent(health)
        .addComponent(stats);
      
      expect(entity.hasComponent("health")).toBe(true);
      expect(entity.hasComponent("stats")).toBe(true);
    });

    it("should get all components", () => {
      const health = new HealthComponent(100);
      const stats = new StatsComponent(1);
      
      entity.addComponent(health).addComponent(stats);
      
      const components = entity.getComponents();
      expect(components.length).toBe(2);
      expect(components).toContain(health);
      expect(components).toContain(stats);
    });
  });

  describe("event integration", () => {
    it("should emit events when adding components", () => {
      const eventBus = new EventBus();
      let eventData: any = null;
      
      eventBus.on("entity.component.added", (data) => {
        eventData = data;
      });
      
      entity.setEventBus(eventBus);
      entity.addComponent(new HealthComponent(100));
      
      expect(eventData).toEqual({
        entityId: "test-entity",
        componentType: "health"
      });
    });

    it("should emit events when removing components", () => {
      const eventBus = new EventBus();
      let eventData: any = null;
      
      eventBus.on("entity.component.removed", (data) => {
        eventData = data;
      });
      
      entity.setEventBus(eventBus);
      entity.addComponent(new HealthComponent(100));
      entity.removeComponent("health");
      
      expect(eventData).toEqual({
        entityId: "test-entity",
        componentType: "health"
      });
    });
  });

  describe("serialization", () => {
    it("should serialize to JSON", () => {
      const health = new HealthComponent(100, 5);
      const stats = new StatsComponent(10, { strength: 15 });
      
      entity.addComponent(health).addComponent(stats);
      
      const json = entity.toJSON();
      
      expect(json.id).toBe("test-entity");
      expect(json.type).toBe("character");
      expect(json.components.health).toBeDefined();
      expect(json.components.stats).toBeDefined();
      
      // should not include entity references
      expect(json.components.health.entity).toBeUndefined();
      expect(json.components.stats.entity).toBeUndefined();
    });
  });
});