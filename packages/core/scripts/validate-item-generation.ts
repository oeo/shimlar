#!/usr/bin/env bun
/**
 * Comprehensive Item Generation Validation Script
 * 
 * This script validates that the item generation system works correctly
 * by generating thousands of items and analyzing their properties.
 */

import {
  ALL_BASE_ITEM_TYPES,
  ItemCategory,
  ItemRarity,
  AffixType,
  itemGenerator,
  generateItemFromBase,
  affixData,
  EquipmentManager
} from "../src/index";

interface ValidationResults {
  totalItems: number;
  rarityDistribution: Record<ItemRarity, number>;
  affixDistribution: {
    normal: { prefixes: number; suffixes: number };
    magic: { prefixes: number; suffixes: number };
    rare: { prefixes: number; suffixes: number };
  };
  equipmentTests: {
    successful: number;
    failed: number;
    errors: string[];
  };
  prefixSuffixValidation: {
    correctPrefixNames: number;
    correctSuffixNames: number;
    invalidPrefixes: number;
    invalidSuffixes: number;
  };
  errors: string[];
}

class ItemGenerationValidator {
  private results: ValidationResults = {
    totalItems: 0,
    rarityDistribution: {
      [ItemRarity.Normal]: 0,
      [ItemRarity.Magic]: 0,
      [ItemRarity.Rare]: 0,
      [ItemRarity.Unique]: 0
    },
    affixDistribution: {
      normal: { prefixes: 0, suffixes: 0 },
      magic: { prefixes: 0, suffixes: 0 },
      rare: { prefixes: 0, suffixes: 0 }
    },
    equipmentTests: {
      successful: 0,
      failed: 0,
      errors: []
    },
    prefixSuffixValidation: {
      correctPrefixNames: 0,
      correctSuffixNames: 0,
      invalidPrefixes: 0,
      invalidSuffixes: 0
    },
    errors: []
  };

  async run(itemCount: number = 10000): Promise<ValidationResults> {
    console.log(`🧪 Starting item generation validation with ${itemCount} items...`);
    console.log('');
    
    await affixData.loadAffixes();
    
    // Test 1: Generate random items and validate rarity distribution
    await this.testRarityDistribution(itemCount);
    
    // Test 2: Validate affix constraints by rarity
    await this.testAffixConstraints(1000);
    
    // Test 3: Test prefix/suffix naming conventions
    await this.testPrefixSuffixNaming(2000);
    
    // Test 4: Test equipment system integration
    await this.testEquipmentIntegration(500);
    
    // Test 5: Validate item level requirements
    await this.testItemLevelRequirements(1000);
    
    this.printResults();
    return this.results;
  }

  private async testRarityDistribution(itemCount: number): Promise<void> {
    console.log(`📊 Testing rarity distribution (${itemCount} items)...`);
    
    for (let i = 0; i < itemCount; i++) {
      try {
        const randomBaseType = ALL_BASE_ITEM_TYPES[
          Math.floor(Math.random() * ALL_BASE_ITEM_TYPES.length)
        ];
        const randomLevel = Math.floor(Math.random() * 80) + 1;
        
        const item = await generateItemFromBase(randomBaseType, randomLevel);
        
        this.results.totalItems++;
        this.results.rarityDistribution[item.rarity]++;
        
        if (i % 1000 === 0 && i > 0) {
          process.stdout.write(`  Generated ${i} items...\r`);
        }
      } catch (error) {
        this.results.errors.push(`Rarity test error: ${error}`);
      }
    }
    console.log(`  ✅ Generated ${itemCount} items successfully`);
  }

  private async testAffixConstraints(itemCount: number): Promise<void> {
    console.log(`🔧 Testing affix constraints (${itemCount} items)...`);
    
    const rarities = [ItemRarity.Normal, ItemRarity.Magic, ItemRarity.Rare];
    const itemsPerRarity = Math.floor(itemCount / rarities.length);
    
    for (const rarity of rarities) {
      for (let i = 0; i < itemsPerRarity; i++) {
        try {
          const randomBaseType = ALL_BASE_ITEM_TYPES[
            Math.floor(Math.random() * ALL_BASE_ITEM_TYPES.length)
          ];
          const randomLevel = Math.floor(Math.random() * 80) + 20; // higher level for more affixes
          
          const item = await itemGenerator.generateItem({
            baseType: randomBaseType,
            itemLevel: randomLevel,
            rarity,
            forceRarity: true
          });
          
          // Count affixes by type
          const prefixes = item.affixes.filter(a => a.type === AffixType.Prefix).length;
          const suffixes = item.affixes.filter(a => a.type === AffixType.Suffix).length;
          
          switch (rarity) {
            case ItemRarity.Normal:
              this.results.affixDistribution.normal.prefixes += prefixes;
              this.results.affixDistribution.normal.suffixes += suffixes;
              
              if (item.affixes.length > 0) {
                this.results.errors.push(`Normal item has ${item.affixes.length} affixes (should be 0)`);
              }
              break;
              
            case ItemRarity.Magic:
              this.results.affixDistribution.magic.prefixes += prefixes;
              this.results.affixDistribution.magic.suffixes += suffixes;
              
              if (item.affixes.length > 2) {
                this.results.errors.push(`Magic item has ${item.affixes.length} affixes (should be 1-2)`);
              }
              break;
              
            case ItemRarity.Rare:
              this.results.affixDistribution.rare.prefixes += prefixes;
              this.results.affixDistribution.rare.suffixes += suffixes;
              
              if (prefixes > 3) {
                this.results.errors.push(`Rare item has ${prefixes} prefixes (should be ≤3)`);
              }
              if (suffixes > 3) {
                this.results.errors.push(`Rare item has ${suffixes} suffixes (should be ≤3)`);
              }
              break;
          }
          
        } catch (error) {
          this.results.errors.push(`Affix constraint error: ${error}`);
        }
      }
    }
    console.log(`  ✅ Validated affix constraints for ${itemCount} items`);
  }

  private async testPrefixSuffixNaming(itemCount: number): Promise<void> {
    console.log(`📝 Testing prefix/suffix naming conventions (${itemCount} items)...`);
    
    for (let i = 0; i < itemCount; i++) {
      try {
        const randomBaseType = ALL_BASE_ITEM_TYPES[
          Math.floor(Math.random() * ALL_BASE_ITEM_TYPES.length)
        ];
        const randomLevel = Math.floor(Math.random() * 80) + 20;
        
        const item = await itemGenerator.generateItem({
          baseType: randomBaseType,
          itemLevel: randomLevel,
          rarity: ItemRarity.Rare, // rare items have more affixes to test
          forceRarity: true
        });
        
        for (const affix of item.affixes) {
          if (affix.type === AffixType.Prefix) {
            if (affix.displayName.startsWith("of ")) {
              this.results.prefixSuffixValidation.invalidPrefixes++;
              this.results.errors.push(`Prefix has suffix naming: ${affix.displayName}`);
            } else {
              this.results.prefixSuffixValidation.correctPrefixNames++;
            }
          } else if (affix.type === AffixType.Suffix) {
            if (!affix.displayName.startsWith("of ")) {
              this.results.prefixSuffixValidation.invalidSuffixes++;
              this.results.errors.push(`Suffix missing "of " prefix: ${affix.displayName}`);
            } else {
              this.results.prefixSuffixValidation.correctSuffixNames++;
            }
          }
          
          // Validate that affix values are within tier ranges
          const actualMin = Math.min(affix.tier.min, affix.tier.max);
          const actualMax = Math.max(affix.tier.min, affix.tier.max);
          
          if (affix.value < actualMin || affix.value > actualMax) {
            this.results.errors.push(
              `Affix value ${affix.value} outside range ${actualMin}-${actualMax} for ${affix.displayText}`
            );
          }
        }
        
        if (i % 500 === 0 && i > 0) {
          process.stdout.write(`  Validated ${i} items...\r`);
        }
      } catch (error) {
        this.results.errors.push(`Prefix/suffix naming error: ${error}`);
      }
    }
    console.log(`  ✅ Validated naming conventions for ${itemCount} items`);
  }

  private async testEquipmentIntegration(itemCount: number): Promise<void> {
    console.log(`⚔️  Testing equipment system integration (${itemCount} items)...`);
    
    const equipment = new EquipmentManager();
    
    for (let i = 0; i < itemCount; i++) {
      try {
        const randomBaseType = ALL_BASE_ITEM_TYPES[
          Math.floor(Math.random() * ALL_BASE_ITEM_TYPES.length)
        ];
        const randomLevel = Math.floor(Math.random() * 80) + 1;
        
        const item = await generateItemFromBase(randomBaseType, randomLevel);
        
        // Try to equip the item in a valid slot
        const validSlots = Array.isArray(item.baseType.slot) 
          ? item.baseType.slot 
          : [item.baseType.slot];
        
        const slot = validSlots[0];
        
        if (equipment.canEquipItem(item, slot)) {
          const previousItem = equipment.equipItem(item, slot);
          
          // Test stat calculation
          const stats = equipment.calculateStats();
          
          this.results.equipmentTests.successful++;
        } else {
          this.results.equipmentTests.failed++;
          this.results.equipmentTests.errors.push(
            `Cannot equip ${item.name} in slot ${slot}`
          );
        }
        
      } catch (error) {
        this.results.equipmentTests.failed++;
        this.results.equipmentTests.errors.push(`Equipment error: ${error}`);
      }
    }
    console.log(`  ✅ Equipment integration: ${this.results.equipmentTests.successful} successful, ${this.results.equipmentTests.failed} failed`);
  }

  private async testItemLevelRequirements(itemCount: number): Promise<void> {
    console.log(`📈 Testing item level requirements (${itemCount} items)...`);
    
    const levelRanges = [
      { min: 1, max: 10 },
      { min: 20, max: 30 },
      { min: 50, max: 60 },
      { min: 70, max: 80 }
    ];
    
    for (const range of levelRanges) {
      for (let i = 0; i < itemCount / levelRanges.length; i++) {
        try {
          const randomBaseType = ALL_BASE_ITEM_TYPES[
            Math.floor(Math.random() * ALL_BASE_ITEM_TYPES.length)
          ];
          const itemLevel = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
          
          const item = await generateItemFromBase(randomBaseType, itemLevel);
          
          // Validate that all affixes respect the item level
          for (const affix of item.affixes) {
            if (affix.tier.lvl > itemLevel) {
              this.results.errors.push(
                `Affix tier level ${affix.tier.lvl} exceeds item level ${itemLevel} for ${affix.displayText}`
              );
            }
          }
          
        } catch (error) {
          this.results.errors.push(`Item level requirement error: ${error}`);
        }
      }
    }
    console.log(`  ✅ Validated item level requirements for ${itemCount} items`);
  }

  private printResults(): void {
    console.log('\n' + '='.repeat(60));
    console.log('📋 ITEM GENERATION VALIDATION RESULTS');
    console.log('='.repeat(60));
    
    // Rarity distribution
    console.log('\n📊 Rarity Distribution:');
    const total = this.results.totalItems;
    for (const [rarity, count] of Object.entries(this.results.rarityDistribution)) {
      const percentage = ((count / total) * 100).toFixed(1);
      console.log(`  ${rarity.padEnd(8)}: ${count.toString().padStart(6)} (${percentage}%)`);
    }
    
    // Expected vs actual percentages
    console.log('\n📈 Expected vs Actual:');
    console.log(`  Normal  : Expected 78.0%, Actual ${((this.results.rarityDistribution.normal / total) * 100).toFixed(1)}%`);
    console.log(`  Magic   : Expected 20.0%, Actual ${((this.results.rarityDistribution.magic / total) * 100).toFixed(1)}%`);
    console.log(`  Rare    : Expected  1.9%, Actual ${((this.results.rarityDistribution.rare / total) * 100).toFixed(1)}%`);
    console.log(`  Unique  : Expected  0.1%, Actual ${((this.results.rarityDistribution.unique / total) * 100).toFixed(1)}%`);
    
    // Affix distribution
    console.log('\n🔧 Affix Distribution:');
    console.log(`  Normal  - Prefixes: ${this.results.affixDistribution.normal.prefixes}, Suffixes: ${this.results.affixDistribution.normal.suffixes}`);
    console.log(`  Magic   - Prefixes: ${this.results.affixDistribution.magic.prefixes}, Suffixes: ${this.results.affixDistribution.magic.suffixes}`);
    console.log(`  Rare    - Prefixes: ${this.results.affixDistribution.rare.prefixes}, Suffixes: ${this.results.affixDistribution.rare.suffixes}`);
    
    // Prefix/suffix validation
    console.log('\n📝 Prefix/Suffix Naming:');
    console.log(`  Correct Prefixes: ${this.results.prefixSuffixValidation.correctPrefixNames}`);
    console.log(`  Correct Suffixes: ${this.results.prefixSuffixValidation.correctSuffixNames}`);
    console.log(`  Invalid Prefixes: ${this.results.prefixSuffixValidation.invalidPrefixes}`);
    console.log(`  Invalid Suffixes: ${this.results.prefixSuffixValidation.invalidSuffixes}`);
    
    // Equipment tests
    console.log('\n⚔️  Equipment Integration:');
    console.log(`  Successful: ${this.results.equipmentTests.successful}`);
    console.log(`  Failed: ${this.results.equipmentTests.failed}`);
    
    // Errors
    console.log('\n❌ Errors Found:');
    if (this.results.errors.length === 0) {
      console.log('  ✅ No errors detected!');
    } else {
      console.log(`  Total errors: ${this.results.errors.length}`);
      
      // Show first 10 errors
      const errorsToShow = this.results.errors.slice(0, 10);
      for (const error of errorsToShow) {
        console.log(`  - ${error}`);
      }
      
      if (this.results.errors.length > 10) {
        console.log(`  ... and ${this.results.errors.length - 10} more errors`);
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    const successRate = ((this.results.equipmentTests.successful / 
      (this.results.equipmentTests.successful + this.results.equipmentTests.failed)) * 100).toFixed(1);
    
    if (this.results.errors.length === 0 && parseFloat(successRate) > 95) {
      console.log('🎉 VALIDATION PASSED - Item generation system is working correctly!');
    } else {
      console.log('⚠️  VALIDATION WARNINGS - Some issues detected, review above');
    }
    console.log('='.repeat(60));
  }
}

// Run the validation if this script is executed directly
if (import.meta.main) {
  const validator = new ItemGenerationValidator();
  const itemCount = parseInt(process.argv[2]) || 10000;
  
  await validator.run(itemCount);
}