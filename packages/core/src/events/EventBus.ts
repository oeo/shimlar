/**
 * core event system for game mechanics
 * allows decoupled communication between game systems
 */

export type EventHandler<T = any> = (data: T) => void | Promise<void>;

export interface GameEvent<T = any> {
  type: string;
  data: T;
  timestamp: number;
}

export class EventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private eventHistory: GameEvent[] = [];
  private maxHistorySize = 100;

  /**
   * subscribe to an event type
   */
  on<T = any>(eventType: string, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    
    this.handlers.get(eventType)!.add(handler);
    
    // return unsubscribe function
    return () => {
      this.off(eventType, handler);
    };
  }

  /**
   * unsubscribe from an event type
   */
  off<T = any>(eventType: string, handler: EventHandler<T>): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.handlers.delete(eventType);
      }
    }
  }

  /**
   * emit an event to all subscribers
   */
  async emit<T = any>(eventType: string, data: T): Promise<void> {
    const event: GameEvent<T> = {
      type: eventType,
      data,
      timestamp: Date.now()
    };

    // store in history
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // notify all handlers
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      const promises: Promise<void>[] = [];
      
      for (const handler of handlers) {
        try {
          const result = handler(data);
          if (result instanceof Promise) {
            promises.push(result);
          }
        } catch (error) {
          console.error(`error in event handler for ${eventType}:`, error);
        }
      }
      
      if (promises.length > 0) {
        await Promise.all(promises);
      }
    }
  }

  /**
   * emit an event without waiting for handlers
   */
  emitSync<T = any>(eventType: string, data: T): void {
    const event: GameEvent<T> = {
      type: eventType,
      data,
      timestamp: Date.now()
    };

    // store in history
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // notify all handlers synchronously
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(data);
        } catch (error) {
          console.error(`error in event handler for ${eventType}:`, error);
        }
      }
    }
  }

  /**
   * get recent event history
   */
  getHistory(): ReadonlyArray<GameEvent> {
    return [...this.eventHistory];
  }

  /**
   * clear all handlers and history
   */
  clear(): void {
    this.handlers.clear();
    this.eventHistory = [];
  }
}