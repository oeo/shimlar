/**
 * character entity factory
 * creates properly configured character entities
 */

import { Entity } from "../entities/Entity";
import { HealthComponent } from "../components/HealthComponent";
import { StatsComponent } from "../components/StatsComponent";
import { PositionComponent, CombatPosition } from "../components/PositionComponent";
import { 
  CharacterClass, 
  getCharacterClass,
  calculateMaxLife,
  calculateMaxMana 
} from "./CharacterClass";

export interface CharacterData {
  id: string;
  name: string;
  classId: string;
  level: number;
  experience: number;
}

export class Character {
  private entity: Entity;
  private characterClass: CharacterClass;
  public readonly id: string;
  public readonly name: string;
  
  constructor(data: CharacterData) {
    this.id = data.id;
    this.name = data.name;
    
    // get character class
    const charClass = getCharacterClass(data.classId);
    if (!charClass) {
      throw new Error(`invalid character class: ${data.classId}`);
    }
    this.characterClass = charClass;
    
    // create entity
    this.entity = new Entity(data.id, "character");
    
    // add components
    this.setupComponents(data.level, data.experience);
  }
  
  private setupComponents(level: number, experience: number): void {
    // stats component
    const stats = new StatsComponent(level, this.characterClass.baseAttributes);
    stats.experience = experience;
    
    // calculate max life and mana
    const maxLife = calculateMaxLife(this.characterClass, level);
    const maxMana = calculateMaxMana(this.characterClass, level);
    
    // health component with life
    const health = new HealthComponent(maxLife, 1.7); // base regen 1.7% per second
    
    // mana component (using health component for mana too)
    // we need to give it a different type name
    const mana = new HealthComponent(maxMana, 1.8); // base mana regen 1.8% per second
    (mana as any).type = "mana"; // override the type
    
    // position component
    const position = new PositionComponent(CombatPosition.MELEE, 100);
    
    // add all components
    this.entity
      .addComponent(stats)
      .addComponent(health)
      .addComponent(mana)
      .addComponent(position);
  }
  
  /**
   * get the underlying entity
   */
  getEntity(): Entity {
    return this.entity;
  }
  
  /**
   * get character class
   */
  getCharacterClass(): CharacterClass {
    return this.characterClass;
  }
  
  /**
   * get current level
   */
  getLevel(): number {
    const stats = this.entity.getComponent<StatsComponent>("stats");
    return stats?.level ?? 1;
  }
  
  /**
   * add experience and check for level up
   */
  addExperience(amount: number): boolean {
    const stats = this.entity.getComponent<StatsComponent>("stats");
    if (!stats) return false;
    
    const leveled = stats.addExperience(amount);
    
    if (leveled) {
      // recalculate life and mana on level up
      this.onLevelUp();
    }
    
    return leveled;
  }
  
  private onLevelUp(): void {
    const stats = this.entity.getComponent<StatsComponent>("stats");
    if (!stats) return;
    
    // update max life
    const health = this.entity.getComponent<HealthComponent>("health");
    if (health) {
      const newMaxLife = calculateMaxLife(this.characterClass, stats.level);
      const lifeGain = newMaxLife - health.maximum;
      health.maximum = newMaxLife;
      health.current += lifeGain; // add the gained life
    }
    
    // update max mana
    const mana = this.entity.getComponent<HealthComponent>("mana");
    if (mana) {
      const newMaxMana = calculateMaxMana(this.characterClass, stats.level);
      const manaGain = newMaxMana - mana.maximum;
      mana.maximum = newMaxMana;
      mana.current += manaGain; // add the gained mana
    }
  }
  
  /**
   * get current stats
   */
  getStats() {
    const stats = this.entity.getComponent<StatsComponent>("stats");
    const health = this.entity.getComponent<HealthComponent>("health");
    const mana = this.entity.getComponent<HealthComponent>("mana");
    const position = this.entity.getComponent<PositionComponent>("position");
    
    return {
      level: stats?.level ?? 1,
      experience: stats?.experience ?? 0,
      attributes: stats?.attributes ?? this.characterClass.baseAttributes,
      life: {
        current: health?.current ?? 0,
        maximum: health?.maximum ?? 0
      },
      mana: {
        current: mana?.current ?? 0,
        maximum: mana?.maximum ?? 0
      },
      position: position?.position ?? CombatPosition.MELEE
    };
  }
  
  /**
   * serialize character data for saving
   */
  toJSON() {
    const stats = this.entity.getComponent<StatsComponent>("stats");
    const health = this.entity.getComponent<HealthComponent>("health");
    const mana = this.entity.getComponent<HealthComponent>("mana");
    
    return {
      id: this.id,
      name: this.name,
      classId: this.characterClass.id,
      level: stats?.level ?? 1,
      experience: stats?.experience ?? 0,
      currentLife: health?.current ?? 0,
      currentMana: mana?.current ?? 0
    };
  }
  
  /**
   * create a character from saved data
   */
  static fromJSON(data: any): Character {
    const character = new Character({
      id: data.id,
      name: data.name,
      classId: data.classId,
      level: data.level,
      experience: data.experience
    });
    
    // restore current life/mana
    const health = character.entity.getComponent<HealthComponent>("health");
    if (health && data.currentLife !== undefined) {
      health.current = data.currentLife;
    }
    
    const mana = character.entity.getComponent<HealthComponent>("mana");
    if (mana && data.currentMana !== undefined) {
      mana.current = data.currentMana;
    }
    
    return character;
  }
}

/**
 * create a new character
 */
export function createCharacter(
  name: string,
  classId: string,
  id?: string
): Character {
  return new Character({
    id: id ?? `char-${Date.now()}`,
    name,
    classId,
    level: 1,
    experience: 0
  });
}