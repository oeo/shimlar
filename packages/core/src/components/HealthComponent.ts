/**
 * health component for entities that can take damage
 */

import { Component } from "../entities/Entity";

export class HealthComponent implements Component {
  public readonly type = "health";
  public entity?: any;
  
  public current: number;
  public maximum: number;
  public regeneration: number; // per second
  
  constructor(maximum: number, regeneration: number = 0) {
    this.current = maximum;
    this.maximum = maximum;
    this.regeneration = regeneration;
  }
  
  /**
   * take damage, returns actual damage taken
   */
  takeDamage(amount: number): number {
    const before = this.current;
    this.current = Math.max(0, this.current - amount);
    return before - this.current;
  }
  
  /**
   * heal, returns actual amount healed
   */
  heal(amount: number): number {
    const before = this.current;
    this.current = Math.min(this.maximum, this.current + amount);
    return this.current - before;
  }
  
  /**
   * regenerate health based on time passed
   */
  regenerate(deltaTime: number): number {
    if (this.regeneration <= 0 || this.current >= this.maximum) {
      return 0;
    }
    
    const amount = this.regeneration * (deltaTime / 1000);
    return this.heal(amount);
  }
  
  /**
   * check if dead
   */
  isDead(): boolean {
    return this.current <= 0;
  }
  
  /**
   * get health percentage
   */
  getPercentage(): number {
    return (this.current / this.maximum) * 100;
  }
}