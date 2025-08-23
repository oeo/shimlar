/**
 * stats component for character attributes
 */

import { Component } from "../entities/Entity";

export interface Attributes {
  strength: number;
  dexterity: number;
  intelligence: number;
}

export interface DerivedStats {
  life: number;
  mana: number;
  evasion: number;
  armour: number;
  energyShield: number;
  accuracy: number;
}

export class StatsComponent implements Component {
  public readonly type = "stats";
  public entity?: any;
  
  public level: number;
  public experience: number;
  public attributes: Attributes;
  
  constructor(level: number = 1, attributes?: Partial<Attributes>) {
    this.level = level;
    this.experience = 0;
    this.attributes = {
      strength: attributes?.strength ?? 10,
      dexterity: attributes?.dexterity ?? 10,
      intelligence: attributes?.intelligence ?? 10
    };
  }
  
  /**
   * calculate derived stats from attributes
   */
  getDerivedStats(): DerivedStats {
    return {
      life: this.calculateLife(),
      mana: this.calculateMana(),
      evasion: this.calculateEvasion(),
      armour: this.calculateArmour(),
      energyShield: this.calculateEnergyShield(),
      accuracy: this.calculateAccuracy()
    };
  }
  
  private calculateLife(): number {
    // base life + strength bonus
    return 100 + (this.level * 10) + (this.attributes.strength * 0.5);
  }
  
  private calculateMana(): number {
    // base mana + intelligence bonus
    return 50 + (this.level * 5) + (this.attributes.intelligence * 0.5);
  }
  
  private calculateEvasion(): number {
    // base evasion + dexterity bonus
    return 100 + (this.level * 5) + (this.attributes.dexterity * 2);
  }
  
  private calculateArmour(): number {
    // base armour + strength bonus
    return 0 + (this.attributes.strength * 2);
  }
  
  private calculateEnergyShield(): number {
    // base es + intelligence bonus
    return 0 + (this.attributes.intelligence * 2);
  }
  
  private calculateAccuracy(): number {
    // base accuracy + dexterity bonus
    return 100 + (this.level * 10) + (this.attributes.dexterity * 2);
  }
  
  /**
   * add experience and check for level up
   */
  addExperience(amount: number): boolean {
    this.experience += amount;
    const requiredExp = this.getRequiredExperience();
    
    if (this.experience >= requiredExp) {
      this.experience -= requiredExp;
      this.level++;
      return true; // leveled up
    }
    
    return false;
  }
  
  /**
   * get experience required for next level
   */
  getRequiredExperience(): number {
    // simple exponential formula
    return Math.floor(100 * Math.pow(1.5, this.level - 1));
  }
}