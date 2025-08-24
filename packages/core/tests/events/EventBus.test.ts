import { describe, it, expect, beforeEach } from "bun:test";
import { EventBus } from '../../events/EventBus';

describe("EventBus", () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  describe("event subscription", () => {
    it("should subscribe to events", () => {
      let called = false;
      eventBus.on("test.event", () => {
        called = true;
      });

      eventBus.emitSync("test.event", {});
      expect(called).toBe(true);
    });

    it("should handle multiple subscribers", () => {
      let count = 0;
      eventBus.on("test.event", () => count++);
      eventBus.on("test.event", () => count++);
      eventBus.on("test.event", () => count++);

      eventBus.emitSync("test.event", {});
      expect(count).toBe(3);
    });

    it("should pass data to handlers", () => {
      let receivedData: any = null;
      const testData = { value: 42, message: "test" };

      eventBus.on("test.event", (data) => {
        receivedData = data;
      });

      eventBus.emitSync("test.event", testData);
      expect(receivedData).toEqual(testData);
    });

    it("should return unsubscribe function", () => {
      let count = 0;
      const unsubscribe = eventBus.on("test.event", () => count++);

      eventBus.emitSync("test.event", {});
      expect(count).toBe(1);

      unsubscribe();
      eventBus.emitSync("test.event", {});
      expect(count).toBe(1); // should not increase
    });
  });

  describe("event unsubscription", () => {
    it("should unsubscribe from events", () => {
      let called = false;
      const handler = () => { called = true; };

      eventBus.on("test.event", handler);
      eventBus.off("test.event", handler);

      eventBus.emitSync("test.event", {});
      expect(called).toBe(false);
    });

    it("should only unsubscribe specific handler", () => {
      let count1 = 0;
      let count2 = 0;
      const handler1 = () => count1++;
      const handler2 = () => count2++;

      eventBus.on("test.event", handler1);
      eventBus.on("test.event", handler2);
      eventBus.off("test.event", handler1);

      eventBus.emitSync("test.event", {});
      expect(count1).toBe(0);
      expect(count2).toBe(1);
    });
  });

  describe("async event emission", () => {
    it("should handle async handlers", async () => {
      let completed = false;
      
      eventBus.on("test.event", async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        completed = true;
      });

      await eventBus.emit("test.event", {});
      expect(completed).toBe(true);
    });

    it("should wait for all async handlers", async () => {
      let count = 0;
      
      eventBus.on("test.event", async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        count++;
      });
      
      eventBus.on("test.event", async () => {
        await new Promise(resolve => setTimeout(resolve, 5));
        count++;
      });

      await eventBus.emit("test.event", {});
      expect(count).toBe(2);
    });
  });

  describe("event history", () => {
    it("should store event history", () => {
      eventBus.emitSync("test.event1", { value: 1 });
      eventBus.emitSync("test.event2", { value: 2 });
      eventBus.emitSync("test.event3", { value: 3 });

      const history = eventBus.getHistory();
      expect(history.length).toBe(3);
      expect(history[0]?.type).toBe("test.event1");
      expect(history[1]?.type).toBe("test.event2");
      expect(history[2]?.type).toBe("test.event3");
    });

    it("should limit history size", () => {
      // default max is 100
      for (let i = 0; i < 150; i++) {
        eventBus.emitSync("test.event", { index: i });
      }

      const history = eventBus.getHistory();
      expect(history.length).toBe(100);
      expect(history[0]?.data).toEqual({ index: 50 });
      expect(history[99]?.data).toEqual({ index: 149 });
    });

    it("should include timestamps in events", () => {
      const before = Date.now();
      eventBus.emitSync("test.event", {});
      const after = Date.now();

      const history = eventBus.getHistory();
      const event = history[0];
      expect(event?.timestamp).toBeGreaterThanOrEqual(before);
      expect(event?.timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe("error handling", () => {
    it("should not stop on handler errors", () => {
      let count = 0;
      
      eventBus.on("test.event", () => {
        throw new Error("Handler error");
      });
      
      eventBus.on("test.event", () => {
        count++;
      });

      eventBus.emitSync("test.event", {});
      expect(count).toBe(1);
    });
  });

  describe("clear", () => {
    it("should clear all handlers and history", () => {
      let count = 0;
      
      eventBus.on("test.event", () => {
        count++;
      });
      
      eventBus.emitSync("test.event", {});
      expect(count).toBe(1);
      expect(eventBus.getHistory().length).toBe(1);

      eventBus.clear();
      
      // verify history was cleared
      expect(eventBus.getHistory().length).toBe(0);
      
      // emit after clear - no handlers should be called
      eventBus.emitSync("test.event", {});
      expect(count).toBe(1); // should not increase after clear
      
      // new event should be in history
      expect(eventBus.getHistory().length).toBe(1);
    });
  });
});