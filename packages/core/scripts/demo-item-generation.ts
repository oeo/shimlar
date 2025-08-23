#!/usr/bin/env bun
/**
 * Item Generation Demo Script
 * 
 * This script demonstrates the item generation system by creating
 * various types of items and showing their properties.
 */

import {
  ALL_BASE_ITEM_TYPES,
  WEAPON_BASE_TYPES,
  ARMOR_BASE_TYPES,
  ACCESSORY_BASE_TYPES,
  FLASK_BASE_TYPES,
  ItemRarity,
  AffixType,
  itemGenerator,
  generateItemFromBase,
  affixData,
  EquipmentManager,
  ItemSlot,
  getItemDisplayColor,
  getItemDisplayName
} from "../src/index";

const colors = {
  white: '\x1b[37m',
  blue: '\x1b[34m', 
  yellow: '\x1b[33m',
  orange: '\x1b[38;5;208m',
  green: '\x1b[32m',
  reset: '\x1b[0m',
  dim: '\x1b[2m'
};

function colorText(text: string, color: string): string {
  return `${color}${text}${colors.reset}`;
}

function displayItem(item: any, showDetails = true): void {
  const rarityColor = {
    [ItemRarity.Normal]: colors.white,
    [ItemRarity.Magic]: colors.blue,
    [ItemRarity.Rare]: colors.yellow,
    [ItemRarity.Unique]: colors.orange
  }[item.rarity] || colors.white;

  console.log(colorText(`\n${item.name}`, rarityColor));
  console.log(colorText(`${item.baseType.name} (Item Level ${item.itemLevel})`, colors.dim));
  
  if (showDetails) {
    // Show base item properties
    if (item.implicitMods.length > 0) {
      console.log(colorText('Implicit:', colors.dim));
      for (const mod of item.implicitMods) {
        console.log(colorText(`  ${mod}`, colors.white));
      }
    }
    
    // Show affixes
    if (item.affixes.length > 0) {
      const prefixes = item.affixes.filter((a: any) => a.type === AffixType.Prefix);
      const suffixes = item.affixes.filter((a: any) => a.type === AffixType.Suffix);
      
      if (prefixes.length > 0) {
        console.log(colorText('Prefixes:', colors.green));
        for (const affix of prefixes) {
          console.log(colorText(`  ${affix.displayText}`, colors.white));
        }
      }
      
      if (suffixes.length > 0) {
        console.log(colorText('Suffixes:', colors.green));
        for (const affix of suffixes) {
          console.log(colorText(`  ${affix.displayText}`, colors.white));
        }
      }
    }
    
    // Show requirements
    const reqs = item.baseType.requirements;
    const reqParts = [];
    if (reqs.level > 1) reqParts.push(`Level ${reqs.level}`);
    if (reqs.strength > 0) reqParts.push(`${reqs.strength} Str`);
    if (reqs.dexterity > 0) reqParts.push(`${reqs.dexterity} Dex`);
    if (reqs.intelligence > 0) reqParts.push(`${reqs.intelligence} Int`);
    
    if (reqParts.length > 0) {
      console.log(colorText(`Requirements: ${reqParts.join(', ')}`, colors.dim));
    }
  }
}

async function demonstrateBasicGeneration(): Promise<void> {
  console.log(colorText('\n=== BASIC ITEM GENERATION ===', colors.green));
  
  // Generate some weapons
  console.log(colorText('\n🗡️ Weapons:', colors.green));
  const axe = await generateItemFromBase(WEAPON_BASE_TYPES[0], 25);
  const dagger = await generateItemFromBase(WEAPON_BASE_TYPES.find(w => w.name === "Glass Shank")!, 30);
  const bow = await generateItemFromBase(WEAPON_BASE_TYPES.find(w => w.name === "Crude Bow")!, 20);
  
  displayItem(axe);
  displayItem(dagger);
  displayItem(bow);
  
  // Generate some armor
  console.log(colorText('\n🛡️ Armor:', colors.green));
  const helmet = await generateItemFromBase(ARMOR_BASE_TYPES[0], 15);
  const bodyArmor = await generateItemFromBase(ARMOR_BASE_TYPES.find(a => a.name === "Plate Vest")!, 12);
  
  displayItem(helmet);
  displayItem(bodyArmor);
  
  // Generate accessories
  console.log(colorText('\n💍 Accessories:', colors.green));
  const ring = await generateItemFromBase(ACCESSORY_BASE_TYPES[0], 10);
  const amulet = await generateItemFromBase(ACCESSORY_BASE_TYPES.find(a => a.name === "Coral Amulet")!, 8);
  
  displayItem(ring);
  displayItem(amulet);
}

async function demonstrateRarityGeneration(): Promise<void> {
  console.log(colorText('\n=== RARITY DEMONSTRATION ===', colors.green));
  
  const baseAxe = WEAPON_BASE_TYPES[0]; // Rusted Hatchet
  const itemLevel = 40;
  
  // Generate one of each rarity
  const normal = await itemGenerator.generateItem({
    baseType: baseAxe,
    itemLevel,
    rarity: ItemRarity.Normal,
    forceRarity: true
  });
  
  const magic = await itemGenerator.generateItem({
    baseType: baseAxe,
    itemLevel,
    rarity: ItemRarity.Magic,
    forceRarity: true
  });
  
  const rare = await itemGenerator.generateItem({
    baseType: baseAxe,
    itemLevel,
    rarity: ItemRarity.Rare,
    forceRarity: true
  });
  
  console.log(colorText('\nSame base type at different rarities:', colors.white));
  displayItem(normal);
  displayItem(magic);
  displayItem(rare);
}

async function demonstrateHighLevelItems(): Promise<void> {
  console.log(colorText('\n=== HIGH LEVEL ITEM GENERATION ===', colors.green));
  
  console.log(colorText('\nLevel 80 rare items with powerful affixes:', colors.white));
  
  // Generate some high-level rare items
  for (let i = 0; i < 3; i++) {
    const randomBase = WEAPON_BASE_TYPES[Math.floor(Math.random() * WEAPON_BASE_TYPES.length)];
    const item = await itemGenerator.generateItem({
      baseType: randomBase,
      itemLevel: 80,
      rarity: ItemRarity.Rare,
      forceRarity: true
    });
    
    displayItem(item);
  }
}

async function demonstrateEquipmentSystem(): Promise<void> {
  console.log(colorText('\n=== EQUIPMENT SYSTEM DEMONSTRATION ===', colors.green));
  
  const equipment = new EquipmentManager();
  console.log(colorText('\nEquipping a full set of gear:', colors.white));
  
  // Generate and equip a full set
  const weapon = await generateItemFromBase(WEAPON_BASE_TYPES[0], 30);
  const helmet = await generateItemFromBase(ARMOR_BASE_TYPES.find(a => a.name === "Iron Hat")!, 25);
  const bodyArmor = await generateItemFromBase(ARMOR_BASE_TYPES.find(a => a.name === "Plate Vest")!, 28);
  const ring1 = await generateItemFromBase(ACCESSORY_BASE_TYPES[0], 20);
  const ring2 = await generateItemFromBase(ACCESSORY_BASE_TYPES[1], 22);
  
  equipment.equipItem(weapon, ItemSlot.MainHand);
  equipment.equipItem(helmet, ItemSlot.Helmet);
  equipment.equipItem(bodyArmor, ItemSlot.BodyArmor);
  equipment.equipItem(ring1, ItemSlot.RingLeft);
  equipment.equipItem(ring2, ItemSlot.RingRight);
  
  console.log(colorText('\nEquipped Items:', colors.green));
  displayItem(weapon, false);
  displayItem(helmet, false);
  displayItem(bodyArmor, false);
  displayItem(ring1, false);
  displayItem(ring2, false);
  
  // Show aggregated stats
  const stats = equipment.calculateStats();
  console.log(colorText('\n📊 Total Stats from Equipment:', colors.green));
  
  const nonZeroStats = Object.entries(stats).filter(([key, value]) => value > 0);
  if (nonZeroStats.length > 0) {
    for (const [stat, value] of nonZeroStats) {
      console.log(`  ${stat}: +${value}`);
    }
  } else {
    console.log('  No stat bonuses (items have no affixes)');
  }
}

async function demonstrateRarityDistribution(): Promise<void> {
  console.log(colorText('\n=== RARITY DISTRIBUTION TEST ===', colors.green));
  
  const sampleSize = 1000;
  const counts = {
    [ItemRarity.Normal]: 0,
    [ItemRarity.Magic]: 0,
    [ItemRarity.Rare]: 0,
    [ItemRarity.Unique]: 0
  };
  
  console.log(`Generating ${sampleSize} items to test rarity distribution...`);
  
  const baseType = WEAPON_BASE_TYPES[0];
  for (let i = 0; i < sampleSize; i++) {
    const item = await generateItemFromBase(baseType, 30);
    counts[item.rarity]++;
    
    if (i % 100 === 0) {
      process.stdout.write(`  Progress: ${i}/${sampleSize}\r`);
    }
  }
  
  console.log(`\nResults:`);
  console.log(`  ${colorText('Normal', colors.white)}: ${counts.normal} (${(counts.normal/sampleSize*100).toFixed(1)}%) - Expected: 78%`);
  console.log(`  ${colorText('Magic', colors.blue)}: ${counts.magic} (${(counts.magic/sampleSize*100).toFixed(1)}%) - Expected: 20%`);
  console.log(`  ${colorText('Rare', colors.yellow)}: ${counts.rare} (${(counts.rare/sampleSize*100).toFixed(1)}%) - Expected: 1.9%`);
  console.log(`  ${colorText('Unique', colors.orange)}: ${counts.unique} (${(counts.unique/sampleSize*100).toFixed(1)}%) - Expected: 0.1%`);
}

async function main(): Promise<void> {
  console.log(colorText('🎮 SHIMLAR ITEM GENERATION DEMO', colors.green));
  console.log(colorText('='.repeat(50), colors.dim));
  
  // Load affix data first
  console.log('Loading affix data...');
  await affixData.loadAffixes();
  console.log(colorText('✅ Affix data loaded successfully!', colors.green));
  
  // Run demonstrations
  await demonstrateBasicGeneration();
  await demonstrateRarityGeneration();
  await demonstrateHighLevelItems();
  await demonstrateEquipmentSystem();
  
  // Optional: run distribution test (comment out for faster demo)
  if (process.argv.includes('--distribution')) {
    await demonstrateRarityDistribution();
  }
  
  console.log(colorText('\n✨ Demo completed! All item systems working correctly.', colors.green));
  console.log(colorText('Run with --distribution flag to test rarity distribution.', colors.dim));
}

// Run if executed directly
if (import.meta.main) {
  await main();
}