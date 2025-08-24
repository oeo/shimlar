/**
 * combat log system for detailed combat calculations
 * formats combat events for terminal display
 */

import { CombatEvent, DamageType, DamageAmount } from "./types";
import { Entity } from "../entities/Entity";

export interface LogEntry {
  id: string;
  timestamp: number;
  tickNumber: number;
  type: "damage" | "heal" | "miss" | "critical" | "death" | "move" | "system";
  message: string;
  details?: LogEntryDetails;
  color?: "red" | "green" | "yellow" | "blue" | "cyan" | "magenta" | "white" | "gray";
}

export interface LogEntryDetails {
  sourceId: string;
  sourceName: string;
  targetId?: string;
  targetName?: string;
  damage?: {
    base: number;
    mitigated: number;
    breakdown: DamageAmount[];
    critical?: boolean;
  };
  healing?: {
    amount: number;
    type: "regeneration" | "flask" | "leech";
  };
  calculations?: string[]; // detailed calculation steps
}

export interface CombatLogOptions {
  maxEntries: number;
  showCalculations: boolean;
  colorEnabled: boolean;
}

export class CombatLog {
  private entries: LogEntry[] = [];
  private entryCounter: number = 0;
  private entityNames: Map<string, string> = new Map();
  
  private readonly maxEntries: number;
  private readonly showCalculations: boolean;
  private readonly colorEnabled: boolean;
  
  constructor(options: Partial<CombatLogOptions> = {}) {
    this.maxEntries = options.maxEntries ?? 100;
    this.showCalculations = options.showCalculations ?? true;
    this.colorEnabled = options.colorEnabled ?? true;
  }
  
  /**
   * register entity name for better log messages
   */
  registerEntity(entityId: string, name: string): void {
    this.entityNames.set(entityId, name);
  }
  
  /**
   * log a combat event
   */
  logEvent(event: CombatEvent, tickNumber: number): void {
    const entry = this.createLogEntry(event, tickNumber);
    if (entry) {
      this.addEntry(entry);
    }
  }
  
  /**
   * log multiple events from a combat tick
   */
  logTick(events: CombatEvent[], tickNumber: number): void {
    events.forEach(event => this.logEvent(event, tickNumber));
  }
  
  /**
   * add a custom system message
   */
  logSystem(message: string): void {
    this.addEntry({
      id: `log-${++this.entryCounter}`,
      timestamp: Date.now(),
      tickNumber: 0,
      type: "system",
      message,
      color: "cyan"
    });
  }
  
  /**
   * get all log entries
   */
  getEntries(): ReadonlyArray<LogEntry> {
    return [...this.entries];
  }
  
  /**
   * get recent entries
   */
  getRecentEntries(count: number = 10): ReadonlyArray<LogEntry> {
    return this.entries.slice(-count);
  }
  
  /**
   * clear the log
   */
  clear(): void {
    this.entries = [];
    this.entryCounter = 0;
  }
  
  /**
   * format entries for terminal display
   */
  formatForDisplay(entries?: ReadonlyArray<LogEntry>): string[] {
    const entriesToFormat = entries || this.entries;
    return entriesToFormat.map(entry => this.formatEntry(entry));
  }
  
  /**
   * create log entry from combat event
   */
  private createLogEntry(event: CombatEvent, tickNumber: number): LogEntry | null {
    const sourceName = this.getEntityName(event.sourceId);
    const targetName = event.targetId ? this.getEntityName(event.targetId) : undefined;
    
    const base: Partial<LogEntry> = {
      id: `log-${++this.entryCounter}`,
      timestamp: Date.now(),
      tickNumber,
      details: {
        sourceId: event.sourceId,
        sourceName,
        targetId: event.targetId,
        targetName
      }
    };
    
    switch (event.type) {
      case "damage":
        return this.createDamageEntry(base, event, sourceName, targetName);
        
      case "heal":
        return this.createHealEntry(base, event, sourceName);
        
      case "miss":
        return this.createMissEntry(base, event, sourceName, targetName);
        
      case "critical":
        return this.createCriticalEntry(base, event, sourceName, targetName);
        
      case "death":
        return this.createDeathEntry(base, event, sourceName);
        
      case "move":
        return this.createMoveEntry(base, event, sourceName);
        
      default:
        return null;
    }
  }
  
  /**
   * create damage log entry with detailed breakdown
   */
  private createDamageEntry(
    base: Partial<LogEntry>, 
    event: CombatEvent, 
    sourceName: string, 
    targetName?: string
  ): LogEntry {
    const data = event.data;
    const damage = Math.round(data.damage * 100) / 100; // round to 2 decimals
    const totalDamage = Math.round((data.totalDamage || damage) * 100) / 100;
    const mitigated = Math.round((data.mitigatedDamage || damage) * 100) / 100;
    
    const calculations: string[] = [];
    
    // handle dot damage differently
    if (data.isDot) {
      const effects = data.effects || [];
      const activeEffects = effects.filter((e: any) => e.damageDealt > 0);
      
      if (this.showCalculations && activeEffects.length > 0) {
        calculations.push(`DoT damage: ${totalDamage.toFixed(1)}`);
        
        // show individual dot effects
        for (const effect of activeEffects) {
          const stacks = effect.stacks > 1 ? ` (x${effect.stacks})` : "";
          calculations.push(`• ${effect.type}${stacks}: ${effect.damageDealt.toFixed(1)}`);
        }
        
        calculations.push(`Total DoT: ${damage}`);
      }
      
      const dotTypes = [...new Set(activeEffects.map((e: any) => e.type))].join(", ");
      const message = targetName
        ? `${targetName} takes ${damage} damage from ${dotTypes}`
        : `takes ${damage} damage from DoT`;
        
      return {
        ...base,
        type: "damage",
        message,
        color: "magenta", // different color for dots
        details: {
          ...base.details!,
          damage: {
            base: totalDamage,
            mitigated: damage,
            breakdown: data.effects || [],
            critical: false
          },
          calculations
        }
      } as LogEntry;
    }
    
    // regular damage
    if (this.showCalculations && data.damageTypes) {
      calculations.push(`Base damage: ${totalDamage}`);
      
      // show damage type breakdown
      const typeBreakdown = data.damageTypes.map((d: DamageAmount) => 
        `${d.amount.toFixed(1)} ${d.type}`
      ).join(", ");
      calculations.push(`Types: ${typeBreakdown}`);
      
      if (data.critical) {
        calculations.push("Critical strike applied");
      }
      
      if (mitigated !== totalDamage) {
        const mitigation = ((totalDamage - mitigated) / totalDamage * 100).toFixed(1);
        calculations.push(`Mitigated ${mitigation}% (${(totalDamage - mitigated).toFixed(1)})`);
      }
      
      calculations.push(`Final damage: ${damage}`);
    }
    
    const critText = data.critical ? " critically" : "";
    const message = targetName 
      ? `${sourceName}${critText} hits ${targetName} for ${damage} damage`
      : `${sourceName} takes ${damage} damage`;
    
    return {
      ...base,
      type: "damage",
      message,
      color: data.critical ? "yellow" : "red",
      details: {
        ...base.details!,
        damage: {
          base: totalDamage,
          mitigated: damage,
          breakdown: data.damageTypes || [],
          critical: data.critical
        },
        calculations
      }
    } as LogEntry;
  }
  
  /**
   * create heal log entry
   */
  private createHealEntry(
    base: Partial<LogEntry>, 
    event: CombatEvent, 
    sourceName: string
  ): LogEntry {
    const amount = Math.round(event.data.amount * 100) / 100;
    const type = event.data.type || "unknown";
    
    return {
      ...base,
      type: "heal",
      message: `${sourceName} heals ${amount} (${type})`,
      color: "green",
      details: {
        ...base.details!,
        healing: {
          amount,
          type
        }
      }
    } as LogEntry;
  }
  
  /**
   * create miss log entry
   */
  private createMissEntry(
    base: Partial<LogEntry>, 
    event: CombatEvent, 
    sourceName: string, 
    targetName?: string
  ): LogEntry {
    const reason = event.data.reason || "unknown";
    const message = targetName 
      ? `${sourceName} misses ${targetName} (${reason})`
      : `${sourceName} misses (${reason})`;
    
    return {
      ...base,
      type: "miss",
      message,
      color: "gray"
    } as LogEntry;
  }
  
  /**
   * create critical strike log entry
   */
  private createCriticalEntry(
    base: Partial<LogEntry>, 
    event: CombatEvent, 
    sourceName: string, 
    targetName?: string
  ): LogEntry {
    const multiplier = event.data.multiplier || 150;
    const message = targetName 
      ? `${sourceName} scores a critical hit on ${targetName}! (${multiplier}%)`
      : `${sourceName} scores a critical hit! (${multiplier}%)`;
    
    return {
      ...base,
      type: "critical",
      message,
      color: "yellow"
    } as LogEntry;
  }
  
  /**
   * create death log entry
   */
  private createDeathEntry(
    base: Partial<LogEntry>, 
    event: CombatEvent, 
    sourceName: string
  ): LogEntry {
    const cause = event.data.cause || "unknown";
    
    return {
      ...base,
      type: "death",
      message: `${sourceName} dies (${cause})`,
      color: "red"
    } as LogEntry;
  }
  
  /**
   * create movement log entry
   */
  private createMoveEntry(
    base: Partial<LogEntry>, 
    event: CombatEvent, 
    sourceName: string
  ): LogEntry {
    const action = event.data.action || "moves";
    let message: string;
    let color: LogEntry["color"] = "blue";
    
    switch (action) {
      case "entered_combat":
        message = `${sourceName} enters combat`;
        color = "cyan";
        break;
      case "exited_combat":
        message = `${sourceName} leaves combat`;
        color = "cyan";
        break;
      case "combat_started":
        message = `Combat begins (${event.data.tickRate}ms ticks)`;
        color = "cyan";
        break;
      case "combat_ended":
        message = `Combat ends (${event.data.totalTicks} ticks)`;
        color = "cyan";
        break;
      default:
        message = `${sourceName} ${action}`;
    }
    
    return {
      ...base,
      type: "move",
      message,
      color
    } as LogEntry;
  }
  
  /**
   * get entity name or fallback to id
   */
  private getEntityName(entityId: string): string {
    return this.entityNames.get(entityId) || `Entity${entityId.slice(-4)}`;
  }
  
  /**
   * add entry to log with size management
   */
  private addEntry(entry: LogEntry): void {
    this.entries.push(entry);
    
    // trim to max size
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(-this.maxEntries);
    }
  }
  
  /**
   * format a single entry for display
   */
  private formatEntry(entry: LogEntry): string {
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    const tick = entry.tickNumber > 0 ? `[T${entry.tickNumber}]` : "";
    
    let formatted = `${timestamp} ${tick} ${entry.message}`;
    
    if (this.showCalculations && entry.details?.calculations?.length) {
      const calculations = entry.details.calculations
        .map(calc => `  • ${calc}`)
        .join("\n");
      formatted += `\n${calculations}`;
    }
    
    return formatted;
  }
}