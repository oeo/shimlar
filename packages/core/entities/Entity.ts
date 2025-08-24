/**
 * base entity class for all game objects
 * uses component-based architecture for flexibility
 */

import { EventBus } from "../events/EventBus";

export interface Component {
  type: string;
  entity?: Entity;
}

export class Entity {
  public readonly id: string;
  public readonly type: string;
  private components: Map<string, Component> = new Map();
  private eventBus?: EventBus;

  constructor(id: string, type: string) {
    this.id = id;
    this.type = type;
  }

  /**
   * add a component to this entity
   */
  addComponent<T extends Component>(component: T): this {
    component.entity = this;
    this.components.set(component.type, component);
    
    if (this.eventBus) {
      this.eventBus.emitSync(`entity.component.added`, {
        entityId: this.id,
        componentType: component.type
      });
    }
    
    return this;
  }

  /**
   * get a component by type
   */
  getComponent<T extends Component>(type: string): T | undefined {
    return this.components.get(type) as T | undefined;
  }

  /**
   * check if entity has a component
   */
  hasComponent(type: string): boolean {
    return this.components.has(type);
  }

  /**
   * remove a component
   */
  removeComponent(type: string): boolean {
    const component = this.components.get(type);
    if (component) {
      component.entity = undefined;
      this.components.delete(type);
      
      if (this.eventBus) {
        this.eventBus.emitSync(`entity.component.removed`, {
          entityId: this.id,
          componentType: type
        });
      }
      
      return true;
    }
    return false;
  }

  /**
   * get all components
   */
  getComponents(): ReadonlyArray<Component> {
    return Array.from(this.components.values());
  }

  /**
   * set the event bus for this entity
   */
  setEventBus(eventBus: EventBus): void {
    this.eventBus = eventBus;
  }

  /**
   * serialize entity to json
   */
  toJSON(): any {
    const components: any = {};
    for (const [type, component] of this.components) {
      // remove entity reference to avoid circular json
      const { entity, ...componentData } = component as any;
      components[type] = componentData;
    }
    
    return {
      id: this.id,
      type: this.type,
      components
    };
  }
}