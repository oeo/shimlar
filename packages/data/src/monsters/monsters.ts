import { 
  MonsterArchetype, 
  MonsterSubtype, 
  createPhysicalMonster, 
  createCasterMonster, 
  createRangedMonster,
  Monster 
} from "./archetypes";
import { MonsterRarity } from "./types";

// all monsters across all acts - defined once, used everywhere
export const MONSTER_REGISTRY: Record<string, Monster> = {
  // zombies (levels 1-10, can appear in multiple acts)
  "zombie_level_1": createPhysicalMonster("zombie_1", "Zombie", MonsterSubtype.Zombie, 1),
  "zombie_level_3": createPhysicalMonster("zombie_3", "Zombie", MonsterSubtype.Zombie, 3),
  "zombie_level_5": createPhysicalMonster("zombie_5", "Zombie", MonsterSubtype.Zombie, 5),
  "zombie_level_8": createPhysicalMonster("zombie_8", "Putrid Corpse", MonsterSubtype.Zombie, 8),
  
  // skeletons (mixed physical/ranged)
  "skeleton_warrior_3": createPhysicalMonster("skeleton_warrior_3", "Skeletal Warrior", MonsterSubtype.Skeleton, 3),
  "skeleton_archer_5": createRangedMonster("skeleton_archer_5", "Skeletal Archer", MonsterSubtype.Skeleton, 5),
  "skeleton_mage_7": createCasterMonster("skeleton_mage_7", "Skeletal Mage", MonsterSubtype.Skeleton, 7),
  
  // spiders (physical with some ranged)
  "cave_spider_4": createPhysicalMonster("cave_spider_4", "Cave Spider", MonsterSubtype.Spider, 4),
  "venomous_spider_6": createPhysicalMonster("venomous_spider_6", "Venomous Spider", MonsterSubtype.Spider, 6, MonsterRarity.Magic),
  "web_spinner_8": createRangedMonster("web_spinner_8", "Web Spinner", MonsterSubtype.Spider, 8),
  
  // goatmen (mixed types)
  "goatman_7": createPhysicalMonster("goatman_7", "Goatman", MonsterSubtype.Goatman, 7),
  "goatman_shaman_9": createCasterMonster("goatman_shaman_9", "Goatman Shaman", MonsterSubtype.Goatman, 9, MonsterRarity.Magic),
  "goatman_archer_8": createRangedMonster("goatman_archer_8", "Goatman Archer", MonsterSubtype.Goatman, 8),
  
  // cannibals (physical)
  "cannibal_4": createPhysicalMonster("cannibal_4", "Cannibal", MonsterSubtype.Cannibal, 4),
  "cannibal_5": createPhysicalMonster("cannibal_5", "Cannibal", MonsterSubtype.Cannibal, 5),
  
  // act 1 bosses
  "the_warden": createPhysicalMonster("the_warden", "The Warden", MonsterSubtype.Undead, 12, MonsterRarity.Unique),
  "merveil": createCasterMonster("merveil", "Merveil, the Siren", MonsterSubtype.Demon, 15, MonsterRarity.Unique),
  
  // higher level monsters for other acts (examples)
  "orc_warrior_20": createPhysicalMonster("orc_warrior_20", "Orc Warrior", MonsterSubtype.Orc, 20),
  "orc_shaman_22": createCasterMonster("orc_shaman_22", "Orc Shaman", MonsterSubtype.Orc, 22, MonsterRarity.Magic),
  
  // act 2+ examples
  "desert_zombie_15": createPhysicalMonster("desert_zombie_15", "Dried Corpse", MonsterSubtype.Zombie, 15),
  "sand_spider_18": createRangedMonster("sand_spider_18", "Sand Spitter", MonsterSubtype.Spider, 18),
  
  // endgame examples
  "chaos_demon_60": createCasterMonster("chaos_demon_60", "Chaos Demon", MonsterSubtype.Demon, 60, MonsterRarity.Rare),
  "bone_lord_65": createCasterMonster("bone_lord_65", "Bone Lord", MonsterSubtype.Undead, 65, MonsterRarity.Unique)
};

// zone spawn tables - define which monsters spawn in which areas
export const ZONE_SPAWNS = {
  // act 1 zones
  "the_coast": ["zombie_level_1", "zombie_level_3", "skeleton_warrior_3"],
  "mud_flats": ["zombie_level_3", "cannibal_4", "cave_spider_4"],
  "tidal_island": ["cannibal_4", "cannibal_5", "cave_spider_4"],
  "cavern_of_wrath": ["cave_spider_4", "venomous_spider_6", "web_spinner_8"],
  "the_ledge": ["goatman_7", "goatman_archer_8", "skeleton_archer_5"],
  "the_climb": ["goatman_7", "goatman_shaman_9", "skeleton_archer_5"],
  "lower_prison": ["skeleton_warrior_3", "skeleton_archer_5", "the_warden"],
  "ship_graveyard": ["cannibal_4", "cannibal_5", "zombie_level_5"],
  "cavern_of_anger": ["venomous_spider_6", "web_spinner_8", "merveil"],
  
  // act 2 zones (examples)
  "old_fields": ["zombie_level_8", "skeleton_mage_7", "desert_zombie_15"],
  "crossroads": ["orc_warrior_20", "orc_shaman_22", "sand_spider_18"],
  
  // endgame zones (examples)
  "chaos_sanctuary": ["chaos_demon_60", "bone_lord_65"]
};

// helper functions
export function getMonster(id: string): Monster | undefined {
  return MONSTER_REGISTRY[id];
}

export function getZoneMonsters(zoneId: string): Monster[] {
  const monsterIds = ZONE_SPAWNS[zoneId] || [];
  return monsterIds.map(id => MONSTER_REGISTRY[id]).filter(Boolean);
}

export function getMonstersInLevelRange(minLevel: number, maxLevel: number): Monster[] {
  return Object.values(MONSTER_REGISTRY).filter(
    monster => monster.level >= minLevel && monster.level <= maxLevel
  );
}

export function getMonstersByArchetype(archetype: MonsterArchetype): Monster[] {
  return Object.values(MONSTER_REGISTRY).filter(
    monster => monster.archetype === archetype
  );
}

export function getMonstersBySubtype(subtype: MonsterSubtype): Monster[] {
  return Object.values(MONSTER_REGISTRY).filter(
    monster => monster.subtype === subtype
  );
}