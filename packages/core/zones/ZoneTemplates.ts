/**
 * predefined zone templates for acts 1-5
 */

import { ZoneTemplate } from './ZoneTypes';

export const ZONE_TEMPLATES: ZoneTemplate[] = [
  // ACT 1
  {
    id: 'twilight_strand',
    name: 'The Twilight Strand',
    description: 'A dark beach where you first awaken, littered with the wreckage of ships.',
    level: 1,
    act: 1,
    zoneType: 'outdoor',
    generator: 'linear',
    size: 'small',
    density: 'sparse',
    complexity: 'simple',
    monsterPool: ['zombie', 'skeleton'],
    environmentTheme: 'beach',
    hasWaypoint: false,
    hasBoss: false,
    prerequisites: [],
    connections: [
      { targetZoneId: 'lioneyes_watch', bidirectional: true, description: 'Path to Lioneye\'s Watch' }
    ],
    specialFeatures: ['tutorial']
  },
  
  {
    id: 'lioneyes_watch',
    name: 'Lioneye\'s Watch',
    description: 'A small town built into the coastal cliffs, serving as a safe haven.',
    level: 1,
    act: 1,
    zoneType: 'town',
    generator: 'dungeon',
    size: 'small',
    density: 'sparse',
    complexity: 'simple',
    monsterPool: [],
    environmentTheme: 'town',
    hasWaypoint: true,
    hasBoss: false,
    prerequisites: [
      { type: 'zone_cleared', value: 'twilight_strand', description: 'Clear the Twilight Strand' }
    ],
    connections: [
      { targetZoneId: 'twilight_strand', bidirectional: true, description: 'Return to the beach' },
      { targetZoneId: 'the_coast', bidirectional: true, description: 'Head inland along the coast' }
    ],
    specialFeatures: ['vendors', 'safe_zone']
  },

  {
    id: 'the_coast',
    name: 'The Coast',
    description: 'Rocky coastline with tide pools and scattered driftwood.',
    level: 2,
    act: 1,
    zoneType: 'outdoor',
    generator: 'open',
    size: 'medium',
    density: 'normal',
    complexity: 'moderate',
    monsterPool: ['zombie', 'skeleton', 'rhoa'],
    environmentTheme: 'coastal',
    hasWaypoint: true,
    hasBoss: false,
    prerequisites: [
      { type: 'zone_cleared', value: 'twilight_strand', description: 'Find your way from the beach' }
    ],
    connections: [
      { targetZoneId: 'lioneyes_watch', bidirectional: true, description: 'Return to town' },
      { targetZoneId: 'tidal_island', bidirectional: true, description: 'Cross to the tidal island' },
      { targetZoneId: 'mud_flats', bidirectional: true, description: 'Follow the coast inland' }
    ],
    specialFeatures: ['optional_path']
  },

  {
    id: 'tidal_island',
    name: 'The Tidal Island',
    description: 'A small island accessible only at low tide, home to aggressive sea creatures.',
    level: 3,
    act: 1,
    zoneType: 'outdoor',
    generator: 'cave',
    size: 'small',
    density: 'dense',
    complexity: 'simple',
    monsterPool: ['skeleton', 'rhoa', 'siren'],
    environmentTheme: 'island',
    hasWaypoint: false,
    hasBoss: true,
    bossType: 'hailrake',
    prerequisites: [
      { type: 'zone_cleared', value: 'the_coast', description: 'Find the path from the coast' }
    ],
    connections: [
      { targetZoneId: 'the_coast', bidirectional: true, description: 'Return to the mainland' }
    ],
    specialFeatures: ['optional_boss', 'skill_point_quest']
  },

  {
    id: 'mud_flats',
    name: 'The Mud Flats',
    description: 'Vast muddy plains where the tide has receded, revealing ancient ruins.',
    level: 4,
    act: 1,
    zoneType: 'outdoor',
    generator: 'open',
    size: 'large',
    density: 'normal',
    complexity: 'moderate',
    monsterPool: ['zombie', 'rhoa', 'goatman'],
    environmentTheme: 'mudflats',
    hasWaypoint: true,
    hasBoss: false,
    prerequisites: [
      { type: 'zone_cleared', value: 'the_coast', description: 'Clear the coast to reach the flats' }
    ],
    connections: [
      { targetZoneId: 'the_coast', bidirectional: true, description: 'Back to the rocky shore' },
      { targetZoneId: 'fetid_pool', bidirectional: true, description: 'Explore the stagnant pool' },
      { targetZoneId: 'submerged_passage', bidirectional: true, description: 'Enter the flooded caves' }
    ],
    specialFeatures: ['large_area', 'multiple_exits']
  },

  // ACT 2
  {
    id: 'southern_forest',
    name: 'The Southern Forest',
    description: 'Dense woodland filled with the sounds of wild beasts and rustling leaves.',
    level: 13,
    act: 2,
    zoneType: 'outdoor',
    generator: 'maze',
    size: 'large',
    density: 'normal',
    complexity: 'complex',
    monsterPool: ['bandit', 'ape', 'spider'],
    environmentTheme: 'forest',
    hasWaypoint: true,
    hasBoss: false,
    prerequisites: [
      { type: 'boss_killed', value: 'merveil', description: 'Defeat Merveil to access Act 2' }
    ],
    connections: [
      { targetZoneId: 'forest_encampment', bidirectional: true, description: 'Find the encampment' },
      { targetZoneId: 'old_fields', bidirectional: true, description: 'Head to the old fields' }
    ],
    specialFeatures: ['act_transition']
  },

  {
    id: 'forest_encampment',
    name: 'The Forest Encampment',
    description: 'A makeshift camp in a forest clearing, populated by exiles and merchants.',
    level: 13,
    act: 2,
    zoneType: 'town',
    generator: 'dungeon',
    size: 'small',
    density: 'sparse',
    complexity: 'simple',
    monsterPool: [],
    environmentTheme: 'camp',
    hasWaypoint: true,
    hasBoss: false,
    prerequisites: [
      { type: 'zone_cleared', value: 'southern_forest', description: 'Navigate through the forest' }
    ],
    connections: [
      { targetZoneId: 'southern_forest', bidirectional: true, description: 'Back to the forest' },
      { targetZoneId: 'old_fields', bidirectional: true, description: 'Explore the fields' }
    ],
    specialFeatures: ['vendors', 'safe_zone', 'bandit_choice_hub']
  },

  // ACT 3
  {
    id: 'city_of_sarn',
    name: 'The City of Sarn',
    description: 'Once-mighty city now overrun by the Blackguard and worse horrors.',
    level: 24,
    act: 3,
    zoneType: 'outdoor',
    generator: 'dungeon',
    size: 'large',
    density: 'dense',
    complexity: 'complex',
    monsterPool: ['blackguard', 'evangelist', 'undying'],
    environmentTheme: 'ruined_city',
    hasWaypoint: true,
    hasBoss: false,
    prerequisites: [
      { type: 'boss_killed', value: 'vaal_oversoul', description: 'Defeat the Vaal Oversoul' }
    ],
    connections: [
      { targetZoneId: 'sarn_encampment', bidirectional: true, description: 'Find the encampment' },
      { targetZoneId: 'the_slums', bidirectional: true, description: 'Enter the slums' }
    ],
    specialFeatures: ['act_transition', 'urban_environment']
  },

  // ACT 4
  {
    id: 'the_aqueduct',
    name: 'The Aqueduct',
    description: 'Ancient waterways leading to Highgate, now dry and cracked.',
    level: 35,
    act: 4,
    zoneType: 'indoor',
    generator: 'linear',
    size: 'medium',
    density: 'normal',
    complexity: 'moderate',
    monsterPool: ['miner', 'construct', 'demon'],
    environmentTheme: 'ancient_structure',
    hasWaypoint: true,
    hasBoss: false,
    prerequisites: [
      { type: 'boss_killed', value: 'dominus', description: 'Defeat Dominus in the tower' }
    ],
    connections: [
      { targetZoneId: 'highgate', bidirectional: true, description: 'Reach Highgate' },
      { targetZoneId: 'dried_lake', bidirectional: true, description: 'Cross the dried lake' }
    ],
    specialFeatures: ['act_transition']
  },

  // ACT 5
  {
    id: 'slave_pens',
    name: 'The Slave Pens',
    description: 'Oriath\'s prison complex, now a nightmare of corruption and despair.',
    level: 46,
    act: 5,
    zoneType: 'indoor',
    generator: 'dungeon',
    size: 'medium',
    density: 'dense',
    complexity: 'complex',
    monsterPool: ['templar', 'oriath_citizen', 'kitava_herald'],
    environmentTheme: 'prison',
    hasWaypoint: true,
    hasBoss: false,
    prerequisites: [
      { type: 'boss_killed', value: 'malachai', description: 'Escape from the Beast' }
    ],
    connections: [
      { targetZoneId: 'overseer_tower', bidirectional: true, description: 'Find the overseer\'s tower' },
      { targetZoneId: 'control_blocks', bidirectional: true, description: 'Enter the control blocks' }
    ],
    specialFeatures: ['act_transition', 'corruption_theme']
  }
];

/**
 * get zone template by id
 */
export function getZoneTemplate(id: string): ZoneTemplate | undefined {
  return ZONE_TEMPLATES.find(template => template.id === id);
}

/**
 * get zone templates by act
 */
export function getZoneTemplatesByAct(act: number): ZoneTemplate[] {
  return ZONE_TEMPLATES.filter(template => template.act === act);
}

/**
 * get all town zone templates
 */
export function getTownZoneTemplates(): ZoneTemplate[] {
  return ZONE_TEMPLATES.filter(template => template.zoneType === 'town');
}

/**
 * get boss zone templates
 */
export function getBossZoneTemplates(): ZoneTemplate[] {
  return ZONE_TEMPLATES.filter(template => template.hasBoss);
}