/**
 * manages zone instances for players
 * each player gets their own zone instances
 */

import { Zone, ZoneData } from "./Zone";
import { EventBus } from "../events/EventBus";

export class ZoneManager {
  private zoneTemplates: Map<string, ZoneData> = new Map();
  private playerInstances: Map<string, Map<string, Zone>> = new Map(); // playerId -> zoneId -> Zone
  private eventBus?: EventBus;
  
  /**
   * register a zone template
   */
  registerZone(data: ZoneData): void {
    this.zoneTemplates.set(data.id, data);
  }
  
  /**
   * register multiple zone templates
   */
  registerZones(zones: ZoneData[]): void {
    zones.forEach(zone => this.registerZone(zone));
  }
  
  /**
   * get or create a zone instance for a player
   */
  getOrCreateZoneInstance(zoneId: string, playerId: string): Zone | undefined {
    const template = this.zoneTemplates.get(zoneId);
    if (!template) {
      console.error(`zone template not found: ${zoneId}`);
      return undefined;
    }
    
    // get player's zone instances
    if (!this.playerInstances.has(playerId)) {
      this.playerInstances.set(playerId, new Map());
    }
    const playerZones = this.playerInstances.get(playerId)!;
    
    // check if instance already exists
    let instance = playerZones.get(zoneId);
    if (!instance) {
      // create new instance
      instance = new Zone(template, playerId);
      if (this.eventBus) {
        instance.setEventBus(this.eventBus);
      }
      playerZones.set(zoneId, instance);
      
      if (this.eventBus) {
        this.eventBus.emitSync("zone.instance.created", {
          zoneId,
          playerId,
          instanceId: instance.getInstanceId()
        });
      }
    }
    
    return instance;
  }
  
  /**
   * get an existing zone instance
   */
  getZoneInstance(zoneId: string, playerId: string): Zone | undefined {
    return this.playerInstances.get(playerId)?.get(zoneId);
  }
  
  /**
   * reset a zone instance (creates new instance)
   */
  resetZoneInstance(zoneId: string, playerId: string): Zone | undefined {
    const playerZones = this.playerInstances.get(playerId);
    if (playerZones) {
      playerZones.delete(zoneId);
    }
    return this.getOrCreateZoneInstance(zoneId, playerId);
  }
  
  /**
   * get all zone instances for a player
   */
  getPlayerZones(playerId: string): Zone[] {
    const playerZones = this.playerInstances.get(playerId);
    return playerZones ? Array.from(playerZones.values()) : [];
  }
  
  /**
   * clear all instances for a player
   */
  clearPlayerInstances(playerId: string): void {
    this.playerInstances.delete(playerId);
    
    if (this.eventBus) {
      this.eventBus.emitSync("zone.instances.cleared", { playerId });
    }
  }
  
  /**
   * get available zones for a player based on current zone
   */
  getAvailableZones(currentZoneId: string, playerId: string): string[] {
    const currentZone = this.getZoneInstance(currentZoneId, playerId);
    if (!currentZone) return [];
    
    return Array.from(currentZone.connections);
  }
  
  /**
   * move player to a new zone
   */
  moveToZone(fromZoneId: string, toZoneId: string, playerId: string): Zone | undefined {
    const fromZone = this.getZoneInstance(fromZoneId, playerId);
    if (!fromZone || !fromZone.isConnectedTo(toZoneId)) {
      console.error(`cannot move from ${fromZoneId} to ${toZoneId}`);
      return undefined;
    }
    
    const toZone = this.getOrCreateZoneInstance(toZoneId, playerId);
    if (toZone && this.eventBus) {
      this.eventBus.emitSync("zone.transition", {
        playerId,
        fromZoneId,
        toZoneId,
        toInstanceId: toZone.getInstanceId()
      });
    }
    
    return toZone;
  }
  
  /**
   * set event bus
   */
  setEventBus(eventBus: EventBus): void {
    this.eventBus = eventBus;
  }
  
  /**
   * get zone template
   */
  getZoneTemplate(zoneId: string): ZoneData | undefined {
    return this.zoneTemplates.get(zoneId);
  }
  
  /**
   * get all zone templates
   */
  getAllZoneTemplates(): ZoneData[] {
    return Array.from(this.zoneTemplates.values());
  }
}