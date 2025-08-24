/**
 * game event type definitions
 */

// event type constants
export const GameEventType = {
  // character events
  CHARACTER_CREATED: 'character.created',
  CHARACTER_LEVELED: 'character.leveled',
  CHARACTER_DIED: 'character.died',
  CHARACTER_RESPAWNED: 'character.respawned',
  
  // combat events
  COMBAT_STARTED: 'combat.started',
  COMBAT_ENDED: 'combat.ended',
  DAMAGE_DEALT: 'damage.dealt',
  DAMAGE_TAKEN: 'damage.taken',
  ENEMY_KILLED: 'enemy.killed',
  
  // item events
  ITEM_DROPPED: 'item.dropped',
  ITEM_PICKED_UP: 'item.picked_up',
  ITEM_EQUIPPED: 'item.equipped',
  ITEM_UNEQUIPPED: 'item.unequipped',
  ITEM_IDENTIFIED: 'item.identified',
  
  // zone events
  ZONE_ENTERED: 'zone.entered',
  ZONE_EXITED: 'zone.exited',
  
  // system events
  GAME_STARTED: 'game.started',
  GAME_PAUSED: 'game.paused',
  GAME_RESUMED: 'game.resumed',
  GAME_SAVED: 'game.saved',
  GAME_LOADED: 'game.loaded'
} as const;

export type GameEventType = typeof GameEventType[keyof typeof GameEventType];

// event data interfaces
export interface CharacterCreatedEvent {
  characterId: string;
  name: string;
  class: string;
  level: number;
}

export interface CharacterLeveledEvent {
  characterId: string;
  oldLevel: number;
  newLevel: number;
  skillPoints: number;
}

export interface DamageDealtEvent {
  sourceId: string;
  targetId: string;
  damage: number;
  damageType: string;
  isCritical: boolean;
}

export interface DamageTakenEvent {
  targetId: string;
  sourceId: string;
  damage: number;
  damageType: string;
  remainingHealth: number;
}

export interface EnemyKilledEvent {
  enemyId: string;
  enemyType: string;
  killerId: string;
  experience: number;
  gold: number;
}

export interface ItemDroppedEvent {
  itemId: string;
  itemName: string;
  rarity: string;
  droppedBy: string;
  position: { x: number; y: number };
}

export interface ItemPickedUpEvent {
  itemId: string;
  itemName: string;
  pickedUpBy: string;
}

export interface ItemEquippedEvent {
  itemId: string;
  slot: string;
  characterId: string;
}

export interface ZoneEnteredEvent {
  zoneId: string;
  zoneName: string;
  characterId: string;
  monsterLevel: number;
}

// type-safe event map
export interface GameEventMap {
  [GameEventType.CHARACTER_CREATED]: CharacterCreatedEvent;
  [GameEventType.CHARACTER_LEVELED]: CharacterLeveledEvent;
  [GameEventType.DAMAGE_DEALT]: DamageDealtEvent;
  [GameEventType.DAMAGE_TAKEN]: DamageTakenEvent;
  [GameEventType.ENEMY_KILLED]: EnemyKilledEvent;
  [GameEventType.ITEM_DROPPED]: ItemDroppedEvent;
  [GameEventType.ITEM_PICKED_UP]: ItemPickedUpEvent;
  [GameEventType.ITEM_EQUIPPED]: ItemEquippedEvent;
  [GameEventType.ZONE_ENTERED]: ZoneEnteredEvent;
}