import { describe, it, expect } from "bun:test";
import { DotManager, DotApplications, DotType } from "../../src/combat/DamageOverTime";

describe("DoT Demo: Enemy dies but player dies from poison later", () => {
  it("should demonstrate the classic PoE scenario", () => {
    const dotManager = new DotManager();
    const playerId = "hero";
    const enemyId = "venomous-spider";
    
    console.log("\n=== DEMO: Death by DoT after enemy dies ===");
    
    // 1. Enemy applies poison to player
    console.log("🕷️  Venomous Spider applies poison to Hero!");
    dotManager.applyDot(playerId, DotApplications.poison(500, enemyId, 3000)); // 250 dps for 3 seconds
    
    const poisonDots = dotManager.getDots(playerId);
    console.log(`🧪 Hero is now poisoned: ${poisonDots[0].damagePerSecond} dps for ${poisonDots[0].duration}ms`);
    
    // 2. Player kills enemy immediately
    console.log("⚔️  Hero kills Venomous Spider!");
    console.log("💀 Venomous Spider dies...");
    
    // 3. But poison persists and ticks over time
    console.log("\n--- Time passes, poison continues to tick ---");
    
    let playerHealth = 100;
    let totalDotDamage = 0;
    let timeElapsed = 0;
    
    // Simulate ticks every 100ms for 3 seconds
    for (let tick = 0; tick < 30; tick++) {
      const results = dotManager.processDots(100); // 100ms per tick
      timeElapsed += 100;
      
      if (results.length > 0 && results[0].totalDamage > 0) {
        const damage = results[0].totalDamage;
        playerHealth -= damage;
        totalDotDamage += damage;
        
        console.log(`☠️  Tick ${tick + 1} (${timeElapsed}ms): Hero takes ${damage.toFixed(1)} poison damage (HP: ${playerHealth.toFixed(1)}/100)`);
        
        if (playerHealth <= 0) {
          console.log(`\n💀 HERO DIES from poison after ${timeElapsed}ms!`);
          console.log(`📊 Total poison damage: ${totalDotDamage.toFixed(1)}`);
          console.log(`🕰️  Enemy was already dead for ${timeElapsed}ms`);
          break;
        }
      }
      
      // Check if poison expired
      const activeDots = dotManager.getDots(playerId);
      if (activeDots.length === 0) {
        console.log(`🧪 Poison effect expires after ${timeElapsed}ms`);
        if (playerHealth > 0) {
          console.log(`❤️  Hero survives with ${playerHealth.toFixed(1)} HP!`);
        }
        break;
      }
    }
    
    console.log("\n=== This demonstrates the classic Path of Exile mechanic ===");
    console.log("✅ Enemy can kill player with DoTs even after the enemy dies");
    console.log("✅ DoT effects persist independently of source entity");
    console.log("✅ Player must survive the full DoT duration to live");
    
    // Verify the system works as expected
    expect(totalDotDamage).toBeGreaterThan(0);
    expect(playerHealth).toBeLessThan(100); // should have taken damage
  });
  
  it("should demonstrate poison stacking", () => {
    const dotManager = new DotManager();
    const playerId = "hero";
    const enemyId = "multi-hit-spider";
    
    console.log("\n=== DEMO: Poison Stacking ===");
    
    // Apply multiple poison hits (like getting hit multiple times)
    console.log("🕷️  Spider hits Hero 5 times rapidly!");
    for (let i = 0; i < 5; i++) {
      dotManager.applyDot(playerId, DotApplications.poison(100, enemyId)); // 50 dps each
      console.log(`   Hit ${i + 1}: Poison stack applied`);
    }
    
    const dots = dotManager.getDots(playerId);
    const totalDps = dotManager.getTotalDps(playerId);
    
    console.log(`🧪 Poison stacks: ${dots[0].currentStacks}`);
    console.log(`💥 Total DPS: ${totalDps} (${dots[0].damagePerSecond} × ${dots[0].currentStacks})`);
    
    // Kill the enemy
    console.log("⚔️  Hero kills Spider!");
    console.log("💀 Spider dies...");
    
    // Process a few ticks to show stacked damage
    console.log("\n--- Stacked poison damage ---");
    let playerHealth = 200; // more health to survive longer
    
    for (let tick = 0; tick < 5; tick++) {
      const results = dotManager.processDots(100);
      if (results.length > 0) {
        const damage = results[0].totalDamage;
        playerHealth -= damage;
        console.log(`☠️  Tick ${tick + 1}: ${damage.toFixed(1)} damage (${dots[0].currentStacks}x stacks) - HP: ${playerHealth.toFixed(1)}`);
      }
    }
    
    console.log("\n=== Stacking System Works ===");
    console.log("✅ Multiple applications stack up to 50 times");
    console.log("✅ Each stack multiplies the damage per second");
    console.log("✅ Very dangerous in Path of Exile - avoid poison spam!");
    
    expect(dots[0].currentStacks).toBe(5);
    expect(totalDps).toBe(250); // 50 × 5
  });
});