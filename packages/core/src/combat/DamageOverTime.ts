/**
 * damage over time system
 * handles ailments like poison, ignite, bleeding, etc.
 * based on path of exile dot mechanics
 */

import { DamageType } from "./types";
import { Entity } from "../entities/Entity";

export enum DotType {
  Poison = "poison",
  Ignite = "ignite", 
  Bleed = "bleed",
  Burn = "burn",
  Freeze = "freeze",
  Shock = "shock",
  Generic = "generic" // for custom dots
}

export interface DotEffect {
  id: string;
  type: DotType;
  damageType: DamageType;
  damagePerSecond: number;
  duration: number; // milliseconds
  remainingDuration: number;
  stackable: boolean;
  maxStacks?: number;
  currentStacks: number;
  sourceEntityId: string;
  appliedAt: number; // timestamp
  
  // special properties
  properties?: {
    chanceToIgnite?: number;
    freezeThreshold?: number;
    shockMultiplier?: number;
    [key: string]: any;
  };
}

export interface DotApplication {
  dotType: DotType;
  baseDamage: number;
  duration: number;
  sourceEntityId: string;
  properties?: Record<string, any>;
}

export interface DotTickResult {
  entityId: string;
  effects: Array<{
    effectId: string;
    type: DotType;
    damageDealt: number;
    stacks: number;
    expired: boolean;
  }>;
  totalDamage: number;
}

export class DotManager {
  private activeEffects: Map<string, DotEffect[]> = new Map(); // entityId -> effects
  private effectIdCounter: number = 0;
  
  /**
   * apply a dot effect to an entity
   */
  applyDot(entityId: string, application: DotApplication): string {
    if (!this.activeEffects.has(entityId)) {
      this.activeEffects.set(entityId, []);
    }
    
    const effects = this.activeEffects.get(entityId)!;
    const effectId = `dot-${++this.effectIdCounter}`;
    
    // create the dot effect
    const dotEffect = this.createDotEffect(effectId, application);
    
    // handle stacking
    if (dotEffect.stackable) {
      const existingEffect = effects.find(e => e.type === dotEffect.type);
      if (existingEffect) {
        this.handleStacking(existingEffect, dotEffect);
        return existingEffect.id;
      }
    } else {
      // non-stackable - remove existing effect of same type
      const existingIndex = effects.findIndex(e => e.type === dotEffect.type);
      if (existingIndex >= 0) {
        effects.splice(existingIndex, 1);
      }
    }
    
    effects.push(dotEffect);
    return effectId;
  }
  
  /**
   * process all dot effects for all entities (called each combat tick)
   */
  processDots(deltaTime: number): DotTickResult[] {
    const results: DotTickResult[] = [];
    
    for (const [entityId, effects] of this.activeEffects) {
      if (effects.length === 0) continue;
      
      const entityResult: DotTickResult = {
        entityId,
        effects: [],
        totalDamage: 0
      };
      
      // process each effect
      for (let i = effects.length - 1; i >= 0; i--) {
        const effect = effects[i];
        const tickResult = this.processSingleDot(effect, deltaTime);
        
        entityResult.effects.push({
          effectId: effect.id,
          type: effect.type,
          damageDealt: tickResult.damage,
          stacks: effect.currentStacks,
          expired: tickResult.expired
        });
        
        entityResult.totalDamage += tickResult.damage;
        
        // remove expired effects
        if (tickResult.expired) {
          effects.splice(i, 1);
        }
      }
      
      if (entityResult.effects.length > 0) {
        results.push(entityResult);
      }
    }
    
    return results;
  }
  
  /**
   * remove all dot effects from an entity
   */
  clearDots(entityId: string): void {
    this.activeEffects.delete(entityId);
  }
  
  /**
   * remove specific dot effect
   */
  removeDot(entityId: string, effectId: string): boolean {
    const effects = this.activeEffects.get(entityId);
    if (!effects) return false;
    
    const index = effects.findIndex(e => e.id === effectId);
    if (index >= 0) {
      effects.splice(index, 1);
      return true;
    }
    
    return false;
  }
  
  /**
   * get all active dot effects for an entity
   */
  getDots(entityId: string): ReadonlyArray<DotEffect> {
    return this.activeEffects.get(entityId) || [];
  }
  
  /**
   * get total dot damage per second for an entity
   */
  getTotalDps(entityId: string): number {
    const effects = this.activeEffects.get(entityId);
    if (!effects) return 0;
    
    return effects.reduce((total, effect) => {
      return total + (effect.damagePerSecond * effect.currentStacks);
    }, 0);
  }
  
  /**
   * check if entity has specific dot type
   */
  hasDot(entityId: string, dotType: DotType): boolean {
    const effects = this.activeEffects.get(entityId);
    return effects ? effects.some(e => e.type === dotType) : false;
  }
  
  /**
   * get all entities with active dots
   */
  getAffectedEntities(): string[] {
    return Array.from(this.activeEffects.keys()).filter(
      entityId => this.activeEffects.get(entityId)!.length > 0
    );
  }
  
  /**
   * create a dot effect from application data
   */
  private createDotEffect(effectId: string, application: DotApplication): DotEffect {
    const { dotType, baseDamage, duration, sourceEntityId, properties = {} } = application;
    
    // calculate damage per second based on dot type
    let damagePerSecond = baseDamage;
    let damageType = DamageType.Physical;
    let stackable = false;
    let maxStacks = 1;
    
    switch (dotType) {
      case DotType.Poison:
        // poison deals chaos damage over 2 seconds by default
        damageType = DamageType.Chaos;
        damagePerSecond = baseDamage / 2; // spread over 2 seconds
        stackable = true;
        maxStacks = 50; // high stack limit like PoE
        break;
        
      case DotType.Ignite:
        // ignite deals fire damage, burns for percentage of hit
        damageType = DamageType.Fire;
        damagePerSecond = baseDamage * 0.2; // 20% per second for 4 seconds = 80% total
        stackable = false; // only one ignite at a time
        break;
        
      case DotType.Bleed:
        // bleed deals physical damage over time
        damageType = DamageType.Physical;
        damagePerSecond = baseDamage * 0.7; // 70% per second for ~5.7 seconds = 400% total
        stackable = false;
        break;
        
      case DotType.Burn:
        // generic fire dot
        damageType = DamageType.Fire;
        damagePerSecond = baseDamage;
        stackable = true;
        maxStacks = 10;
        break;
        
      case DotType.Freeze:
        // freeze doesn't deal damage, just duration effect
        damageType = DamageType.Cold;
        damagePerSecond = 0;
        stackable = false;
        break;
        
      case DotType.Shock:
        // shock doesn't deal damage, increases damage taken
        damageType = DamageType.Lightning;
        damagePerSecond = 0;
        stackable = false;
        break;
        
      case DotType.Generic:
        // custom dot, use provided values
        damageType = properties.damageType || DamageType.Physical;
        stackable = properties.stackable || false;
        maxStacks = properties.maxStacks || 1;
        break;
    }
    
    return {
      id: effectId,
      type: dotType,
      damageType,
      damagePerSecond,
      duration,
      remainingDuration: duration,
      stackable,
      maxStacks,
      currentStacks: 1,
      sourceEntityId,
      appliedAt: Date.now(),
      properties
    };
  }
  
  /**
   * handle stacking logic for stackable dots
   */
  private handleStacking(existingEffect: DotEffect, newEffect: DotEffect): void {
    if (existingEffect.currentStacks < (existingEffect.maxStacks || 1)) {
      existingEffect.currentStacks++;
    }
    
    // refresh duration on new stack (common in PoE)
    if (newEffect.duration > existingEffect.remainingDuration) {
      existingEffect.remainingDuration = newEffect.duration;
    }
    
    // update source if newer effect has higher damage
    if (newEffect.damagePerSecond > existingEffect.damagePerSecond) {
      existingEffect.damagePerSecond = newEffect.damagePerSecond;
      existingEffect.sourceEntityId = newEffect.sourceEntityId;
    }
  }
  
  /**
   * process a single dot effect for one tick
   */
  private processSingleDot(effect: DotEffect, deltaTime: number): { damage: number; expired: boolean } {
    // reduce remaining duration
    effect.remainingDuration -= deltaTime;
    
    // calculate damage for this tick
    const damageThisTick = (effect.damagePerSecond * effect.currentStacks) * (deltaTime / 1000);
    
    return {
      damage: damageThisTick,
      expired: effect.remainingDuration <= 0
    };
  }
}

/**
 * utility functions for creating common dot applications
 */
export class DotApplications {
  /**
   * create poison application
   */
  static poison(baseDamage: number, sourceEntityId: string, duration = 2000): DotApplication {
    return {
      dotType: DotType.Poison,
      baseDamage,
      duration,
      sourceEntityId
    };
  }
  
  /**
   * create ignite application
   */
  static ignite(baseDamage: number, sourceEntityId: string, duration = 4000): DotApplication {
    return {
      dotType: DotType.Ignite,
      baseDamage,
      duration,
      sourceEntityId
    };
  }
  
  /**
   * create bleed application
   */
  static bleed(baseDamage: number, sourceEntityId: string, duration = 5700): DotApplication {
    return {
      dotType: DotType.Bleed,
      baseDamage,
      duration,
      sourceEntityId
    };
  }
  
  /**
   * create freeze application
   */
  static freeze(sourceEntityId: string, duration = 1000): DotApplication {
    return {
      dotType: DotType.Freeze,
      baseDamage: 0,
      duration,
      sourceEntityId
    };
  }
  
  /**
   * create shock application
   */
  static shock(sourceEntityId: string, duration = 2000, multiplier = 1.5): DotApplication {
    return {
      dotType: DotType.Shock,
      baseDamage: 0,
      duration,
      sourceEntityId,
      properties: { shockMultiplier: multiplier }
    };
  }
  
  /**
   * create generic dot application
   */
  static generic(
    damagePerSecond: number, 
    duration: number, 
    sourceEntityId: string,
    damageType = DamageType.Physical,
    stackable = false
  ): DotApplication {
    return {
      dotType: DotType.Generic,
      baseDamage: damagePerSecond,
      duration,
      sourceEntityId,
      properties: {
        damageType,
        stackable,
        maxStacks: stackable ? 10 : 1
      }
    };
  }
}