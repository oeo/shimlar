/**
 * tick-based combat engine
 * runs at 100ms resolution, similar to path of exile
 */

import { Entity } from "../entities/Entity";
import { EventBus } from "../events/EventBus";
import { HealthComponent } from "../components/HealthComponent";
import { PositionComponent } from "../components/PositionComponent";
import { CombatAction, CombatTick, CombatEvent, DamageType, DamageAmount } from "./types";
import { calculateAttackResult, createDefaultCombatStats } from "./formulas";
import { CombatLog, CombatLogOptions } from "./CombatLog";
import { DotManager, DotType } from "./DamageOverTime";
import { LootGenerator, LootDrop } from "../items/LootGeneration";
import { Monster } from "@shimlar/data/src/monsters/archetypes";

export interface CombatEngineOptions {
  tickRate: number; // milliseconds per tick
  maxTicks: number; // max ticks before auto-end combat
  logOptions?: Partial<CombatLogOptions>;
}

export class CombatEngine {
  private entities: Map<string, Entity> = new Map();
  private actions: CombatAction[] = [];
  private currentTick: number = 0;
  private isRunning: boolean = false;
  private tickTimer?: Timer;
  private eventBus?: EventBus;
  private history: CombatTick[] = [];
  private combatLog: CombatLog;
  private dotManager: DotManager;
  
  // loot generation support
  private monsters: Map<string, Monster> = new Map();
  private generatedLoot: Map<string, LootDrop[]> = new Map();
  
  private readonly tickRate: number;
  private readonly maxTicks: number;
  
  constructor(options: Partial<CombatEngineOptions> = {}) {
    this.tickRate = options.tickRate ?? 100; // 100ms default
    this.maxTicks = options.maxTicks ?? 6000; // 10 minutes max
    this.combatLog = new CombatLog(options.logOptions);
    this.dotManager = new DotManager();
  }
  
  /**
   * add entity to combat
   */
  addEntity(entity: Entity, name?: string, monster?: Monster): void {
    this.entities.set(entity.id, entity);
    
    // register monster for loot generation
    if (monster) {
      this.monsters.set(entity.id, monster);
    }
    
    // register entity name for better log messages
    if (name) {
      this.combatLog.registerEntity(entity.id, name);
    }
    
    const event = {
      type: "move" as const,
      sourceId: entity.id,
      data: { action: "entered_combat" }
    };
    
    // log the event immediately
    this.combatLog.logEvent(event, 0);
    
    this.emitEvent(event);
  }
  
  /**
   * remove entity from combat
   */
  removeEntity(entityId: string): void {
    const entity = this.entities.get(entityId);
    if (entity) {
      this.entities.delete(entityId);
      
      // clean up monster and loot data
      this.monsters.delete(entityId);
      this.generatedLoot.delete(entityId);
      
      // remove any pending actions for this entity
      this.actions = this.actions.filter(action => 
        action.entityId !== entityId && action.targetId !== entityId
      );
      
      // clear any active dot effects
      this.dotManager.clearDots(entityId);
      
      this.emitEvent({
        type: "move",
        sourceId: entityId,
        data: { action: "exited_combat" }
      });
    }
  }
  
  /**
   * queue an action for an entity
   */
  queueAction(action: CombatAction): void {
    if (!this.entities.has(action.entityId)) {
      console.warn(`entity ${action.entityId} not in combat`);
      return;
    }
    
    // remove any existing incomplete actions for this entity
    this.actions = this.actions.filter(a => 
      a.entityId !== action.entityId || a.completed
    );
    
    this.actions.push(action);
  }
  
  /**
   * start combat engine
   */
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.currentTick = 0;
    this.history = [];
    
    this.tickTimer = setInterval(() => {
      this.processTick();
    }, this.tickRate);
    
    this.combatLog.logSystem(`Combat begins! (${this.entities.size} combatants)`);
    
    this.emitEvent({
      type: "move",
      sourceId: "system",
      data: { action: "combat_started", tickRate: this.tickRate }
    });
  }
  
  /**
   * stop combat engine
   */
  stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.tickTimer) {
      clearInterval(this.tickTimer);
      this.tickTimer = undefined;
    }
    
    this.combatLog.logSystem(`Combat ends after ${this.currentTick} ticks`);
    
    this.emitEvent({
      type: "move",
      sourceId: "system",
      data: { action: "combat_ended", totalTicks: this.currentTick }
    });
  }
  
  /**
   * process a single combat tick
   */
  private processTick(): void {
    this.currentTick++;
    const tickEvents: CombatEvent[] = [];
    const completedActions: CombatAction[] = [];
    
    // process all pending actions
    for (const action of this.actions) {
      if (action.completed) continue;
      
      // check if action is complete this tick
      const actionAge = this.currentTick * this.tickRate;
      if (actionAge >= action.duration) {
        action.completed = true;
        completedActions.push(action);
        
        // execute the action
        const events = this.executeAction(action);
        tickEvents.push(...events);
      }
    }
    
    // process regeneration
    this.processRegeneration(tickEvents);
    
    // process damage over time effects
    this.processDamageOverTime(tickEvents);
    
    // check for deaths
    this.checkForDeaths(tickEvents);
    
    // store tick in history
    const tick: CombatTick = {
      tickNumber: this.currentTick,
      timestamp: Date.now(),
      actions: [...completedActions],
      events: [...tickEvents]
    };
    this.history.push(tick);
    
    // log all events to combat log
    this.combatLog.logTick(tickEvents, this.currentTick);
    
    // emit tick processed event
    if (this.eventBus) {
      this.eventBus.emitSync("combat.tick", tick);
    }
    
    // check end conditions
    if (this.shouldEndCombat()) {
      this.stop();
    }
  }
  
  /**
   * execute a completed action
   */
  private executeAction(action: CombatAction): CombatEvent[] {
    const events: CombatEvent[] = [];
    const entity = this.entities.get(action.entityId);
    
    if (!entity) return events;
    
    switch (action.type) {
      case "attack":
        if (action.targetId) {
          const target = this.entities.get(action.targetId);
          if (target) {
            events.push(...this.executeAttack(entity, target));
          }
        }
        break;
        
      case "move":
        events.push(...this.executeMove(entity));
        break;
        
      case "wait":
        // just waiting, no events
        break;
        
      default:
        console.warn(`unknown action type: ${action.type}`);
    }
    
    return events;
  }
  
  /**
   * execute an attack action using proper damage calculation
   */
  private executeAttack(attacker: Entity, target: Entity): CombatEvent[] {
    const events: CombatEvent[] = [];
    
    // get combat stats (using defaults for now - will be enhanced later)
    const attackerStats = createDefaultCombatStats();
    const defenderStats = createDefaultCombatStats();
    
    // create base damage (simple for now)
    const baseDamage: DamageAmount[] = [
      { type: DamageType.Physical, amount: 10 }
    ];
    
    // calculate attack result using the damage system
    const result = calculateAttackResult({
      baseDamage,
      attackerStats,
      defenderStats,
      isSpell: false
    });
    
    // handle miss
    if (!result.hit) {
      events.push({
        type: "miss",
        sourceId: attacker.id,
        targetId: target.id,
        data: { reason: "evasion" }
      });
      return events;
    }
    
    // handle critical strike
    if (result.critical) {
      events.push({
        type: "critical",
        sourceId: attacker.id,
        targetId: target.id,
        data: { multiplier: attackerStats.criticalMultiplier }
      });
    }
    
    // apply damage to target
    const targetHealth = target.getComponent<HealthComponent>("health");
    if (targetHealth) {
      const actualDamage = targetHealth.takeDamage(result.mitigatedDamage);
      
      events.push({
        type: "damage",
        sourceId: attacker.id,
        targetId: target.id,
        data: { 
          damage: actualDamage,
          totalDamage: result.totalDamage,
          mitigatedDamage: result.mitigatedDamage,
          damageTypes: result.damage,
          critical: result.critical
        }
      });
    }
    
    return events;
  }
  
  /**
   * execute a move action
   */
  private executeMove(entity: Entity): CombatEvent[] {
    const events: CombatEvent[] = [];
    
    events.push({
      type: "move",
      sourceId: entity.id,
      data: { action: "position_changed" }
    });
    
    return events;
  }
  
  /**
   * process regeneration for all entities
   */
  private processRegeneration(events: CombatEvent[]): void {
    for (const entity of this.entities.values()) {
      const health = entity.getComponent<HealthComponent>("health");
      if (health && health.regeneration > 0) {
        const healed = health.regenerate(this.tickRate);
        if (healed > 0) {
          events.push({
            type: "heal",
            sourceId: entity.id,
            data: { amount: healed, type: "regeneration" }
          });
        }
      }
    }
  }
  
  /**
   * process damage over time effects for all entities
   */
  private processDamageOverTime(events: CombatEvent[]): void {
    const dotResults = this.dotManager.processDots(this.tickRate);
    
    for (const result of dotResults) {
      if (result.totalDamage > 0) {
        const entity = this.entities.get(result.entityId);
        if (entity) {
          const health = entity.getComponent<HealthComponent>("health");
          if (health) {
            const actualDamage = health.takeDamage(result.totalDamage);
            
            // create damage event for total dot damage
            events.push({
              type: "damage",
              sourceId: "dot",
              targetId: result.entityId,
              data: {
                damage: actualDamage,
                totalDamage: result.totalDamage,
                mitigatedDamage: actualDamage,
                damageType: "dot",
                effects: result.effects,
                isDot: true
              }
            });
          }
        }
      }
      
      // emit events for expired effects
      for (const effect of result.effects) {
        if (effect.expired) {
          events.push({
            type: "move",
            sourceId: result.entityId,
            data: { 
              action: "dot_expired",
              dotType: effect.type,
              effectId: effect.effectId
            }
          });
        }
      }
    }
  }
  
  /**
   * check for entity deaths and generate loot
   */
  private checkForDeaths(events: CombatEvent[]): void {
    for (const entity of this.entities.values()) {
      const health = entity.getComponent<HealthComponent>("health");
      if (health && health.isDead()) {
        // generate loot if this is a monster (fire and forget async)
        const monster = this.monsters.get(entity.id);
        if (monster && !this.generatedLoot.has(entity.id)) {
          this.generateLootForMonster(entity.id, monster).catch(err => {
            console.error(`Failed to generate loot for ${entity.id}:`, err);
          });
        }
        
        events.push({
          type: "death",
          sourceId: entity.id,
          data: { cause: "damage" }
        });
      }
    }
  }
  
  /**
   * generate loot for a dead monster
   */
  private async generateLootForMonster(entityId: string, monster: Monster): Promise<void> {
    // generate loot drops using simplified system
    const loot = await LootGenerator.generateLoot(monster);
    
    // store loot for later retrieval
    this.generatedLoot.set(entityId, loot);
    
    // log loot generation
    if (loot.length > 0) {
      this.combatLog.logSystemMessage(`${monster.name} drops ${loot.length} item(s)`);
    }
  }
  
  
  /**
   * check if combat should end
   */
  private shouldEndCombat(): boolean {
    // end if max ticks reached
    if (this.currentTick >= this.maxTicks) {
      return true;
    }
    
    // end if no living enemies (simplified check)
    const livingEntities = Array.from(this.entities.values()).filter(entity => {
      const health = entity.getComponent<HealthComponent>("health");
      return !health || !health.isDead();
    });
    
    return livingEntities.length <= 1; // only player left
  }
  
  /**
   * get current combat state
   */
  getCombatState() {
    return {
      isRunning: this.isRunning,
      currentTick: this.currentTick,
      entitiesInCombat: this.entities.size,
      pendingActions: this.actions.filter(a => !a.completed).length,
      tickRate: this.tickRate
    };
  }
  
  /**
   * get combat history
   */
  getHistory(): ReadonlyArray<CombatTick> {
    return [...this.history];
  }
  
  /**
   * get combat log
   */
  getCombatLog(): CombatLog {
    return this.combatLog;
  }
  
  /**
   * get formatted combat log entries for display
   */
  getLogEntries(count?: number): string[] {
    const entries = count ? this.combatLog.getRecentEntries(count) : this.combatLog.getEntries();
    return this.combatLog.formatForDisplay(entries);
  }
  
  /**
   * get the dot manager for applying dots
   */
  getDotManager(): DotManager {
    return this.dotManager;
  }
  
  /**
   * set event bus
   */
  setEventBus(eventBus: EventBus): void {
    this.eventBus = eventBus;
  }
  
  /**
   * emit a combat event
   */
  private emitEvent(event: CombatEvent): void {
    if (this.eventBus) {
      this.eventBus.emitSync("combat.event", event);
    }
  }
  
  /**
   * get loot generated by a specific monster
   */
  getMonsterLoot(entityId: string): LootDrop[] {
    return this.generatedLoot.get(entityId) || [];
  }
  
  /**
   * get all generated loot from combat
   */
  getAllLoot(): Map<string, LootDrop[]> {
    return new Map(this.generatedLoot);
  }
  
  /**
   * collect and remove loot for a monster (like picking it up)
   */
  collectLoot(entityId: string): LootDrop[] {
    const loot = this.generatedLoot.get(entityId) || [];
    this.generatedLoot.delete(entityId);
    return loot;
  }
  
  /**
   * clean up resources
   */
  dispose(): void {
    this.stop();
    this.entities.clear();
    this.actions = [];
    this.history = [];
    this.combatLog.clear();
    
    // clean up loot and monster data
    this.monsters.clear();
    this.generatedLoot.clear();
    
    // clear all dot effects
    for (const entityId of this.dotManager.getAffectedEntities()) {
      this.dotManager.clearDots(entityId);
    }
  }
}