/**
 * position component for combat positioning
 */

import { Component } from "../entities/Entity";

export enum CombatPosition {
  MELEE = "melee",
  CLOSE = "close", 
  FAR = "far"
}

export class PositionComponent implements Component {
  public readonly type = "position";
  public entity?: any;
  
  public position: CombatPosition;
  public movementSpeed: number; // percentage, 100 = normal
  
  constructor(position: CombatPosition = CombatPosition.MELEE, movementSpeed: number = 100) {
    this.position = position;
    this.movementSpeed = movementSpeed;
  }
  
  /**
   * move to a new position
   */
  moveTo(position: CombatPosition): void {
    this.position = position;
  }
  
  /**
   * get distance to another position
   */
  getDistanceTo(other: CombatPosition): number {
    const positions = [CombatPosition.MELEE, CombatPosition.CLOSE, CombatPosition.FAR];
    const thisIndex = positions.indexOf(this.position);
    const otherIndex = positions.indexOf(other);
    return Math.abs(thisIndex - otherIndex);
  }
  
  /**
   * check if in range of another position
   */
  isInRangeOf(other: CombatPosition, range: number): boolean {
    return this.getDistanceTo(other) <= range;
  }
  
  /**
   * calculate movement time in milliseconds
   */
  getMovementTime(to: CombatPosition): number {
    const distance = this.getDistanceTo(to);
    const baseTime = 1000; // 1 second per position
    return Math.floor((distance * baseTime * 100) / this.movementSpeed);
  }
}