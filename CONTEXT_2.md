# SHIMLAR - Terminal-Based ARPG Game Design Document

## **Executive Summary**

A **terminal-first ARPG** inspired by Path of Exile, built with **Bun + TypeScript + Ink (React for CLI)**. The game combines the depth of PoE's itemization and crafting with the accessibility of a MUD, playable via SSH, terminal, or web (via xterm.js).

### **Core Design Principles**
- **Information Density** - Pack meaningful data efficiently
- **Terminal Authenticity** - Real terminal constraints, not fake aesthetic
- **Component-Based UI** - Reusable Ink/React components
- **Multi-Protocol** - SSH, native terminal, web all share same backend
- **Dark Fantasy Terminal** - "Haunted terminal" aesthetic with amber/gold highlights

### **Technical Stack**
- **Runtime:** Bun
- **Language:** TypeScript
- **UI Framework:** Ink 3 (React for CLI)
- **Terminal Enhancements:** Terminal-Kit (for advanced features)
- **State Management:** Zustand
- **Backend:** Bun with WebSockets/TCP
- **Database:** SQLite (via Bun's native driver)

---

## **Game Views/Pages**

### **1. Main Menu / Login**
```
╔════════════════════════════════════════════════════════════╗
║                      S H I M L A R                         ║
║                  [REALM OF ENDLESS NIGHT]                  ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  [N]ew Character      Create a new exile                  ║
║  [C]ontinue          Load existing character              ║
║  [L]eague Start      Join seasonal league                 ║
║  [S]tandard          Play permanent realm                 ║
║  [O]ptions           Settings and configuration           ║
║  [H]elp              Tutorial and guides                  ║
║  [Q]uit              Exit to terminal                     ║
║                                                            ║
║  Latest News: Harbinger League starts in 2 days!          ║
║  Online: 1,234 exiles fighting                            ║
╚════════════════════════════════════════════════════════════╝
```

### **2. Character Creation**
```
╔════════════════════════════════════════════════════════════╗
║                   CHARACTER CREATION                       ║
╠════════════════════════════════════════════════════════════╣
║  Choose Your Class:                                        ║
║                                                            ║
║  [1] MARAUDER    - Pure Strength      (Tank/Melee)       ║
║  [2] RANGER      - Pure Dexterity     (Ranged/Speed)     ║
║  [3] WITCH       - Pure Intelligence  (Spells/Minions)   ║
║  [4] DUELIST     - STR/DEX Hybrid     (Balanced Melee)   ║
║  [5] TEMPLAR     - STR/INT Hybrid     (Elemental/Guard)  ║
║  [6] SHADOW      - DEX/INT Hybrid     (Crit/Assassin)    ║
║  [7] SCION       - Perfectly Balanced (Advanced)         ║
║                                                            ║
║  Name: [____________________]                             ║
║  Hardcore: [ ] Permanent Death                            ║
║  Solo Self-Found: [ ] No Trading                          ║
╚════════════════════════════════════════════════════════════╝
```

### **3. Main Combat View**
```
╔═══════════════════════════════════════════════════════════════════════╗
║ SHIMLAR                                          [⚡1,234][☠][⚙][?][X]║
╠════════════════════════════════════╬══════════════════════════════════╣
║ ▓▓▓ BLOODIED CRYPTS - DEPTH 7 ▓▓▓ ║ RIFTWALKER LVL 67                ║
║ ═══════════════════════════════════ ║ ──────────────────────────────── ║
║                                     ║ HP ▓▓▓▓▓▓▓░░░░ 890/1200 [+45/s] ║
║ [FAR]   Bone Archer    ▓▓▓░░░ 45%  ║ MP ▓▓▓▓░░░░░░░ 234/560  [+12/s] ║
║         ↓ Bleeding for 3s           ║ ES ▓▓▓▓▓▓▓▓▓▓▓ 450/450  [FULL]  ║
║                                     ║ ──────────────────────────────── ║
║ [CLOSE] ⚔️ ELITE Revenant ▓▓▓▓▓ 90% ║ FLASKS                           ║
║         ⚠️ CHARGING SLAM (1.4s)     ║ [1] Life    ▓▓▓ Ready           ║
║                                     ║ [2] Quick   ░░░ Empty           ║
║ ═══════════════════════════════════ ║ [3] Granite ▓▓░ 2/3             ║
║ > You cast Essence Drain           ║ [4] Basalt  ▓▓▓ Ready           ║
║ > CRITICAL! 2,847 chaos damage     ║ [5] Unique  ▓▓▓ Ready           ║
║ > Revenant charges SLAM...         ║ ──────────────────────────────── ║
║ > Wither spreads (3 stacks)        ║ BUFFS                            ║
║ > Bone Archer marks you!           ║ ⚔️ Onslaught (4s) 🛡️ Fortify (12s)║
╠════════════════════════════════════╩══════════════════════════════════╣
║ (Q)Essence Drain [W]Contagion (E)Totem (R)Blight [Space]Dodge [I]nv   ║
╚════════════════════════════════════════════════════════════════════════╝
```

### **4. Inventory Management**
```
╔═══════════════════════════════════════════════════════════════════════╗
║ INVENTORY                           [Gold: 12,451] [Weight: 67/120]   ║
╠═══════════════════════════════════════════════════════════════════════╣
║ EQUIPPED                    │ BACKPACK          [Tab: All]            ║
║ ─────────────────────────  │ ┌──┬──┬──┬──┬──┬──┬──┬──┬──┬──┐      ║
║ Helm:  [Goldrim Crown]     │ │⚔️│🛡️│💍│██│░░│🗝️│📜│💎│🏺│░░│      ║
║ Body:  [Tabula Rasa]       │ ├──┼──┼──┼──┼──┼──┼──┼──┼──┼──┤      ║
║ Gloves:[Titan's Grip]      │ │🎁│██│██│💰│⚗️│░░│░░│🔮│📦│░░│      ║
║ Boots: [Seven-League]      │ ├──┼──┼──┼──┼──┼──┼──┼──┼──┼──┤      ║
║ Belt:  [Leather Belt]      │ │░░│░░│░░│░░│░░│░░│░░│░░│░░│░░│      ║
║ Ring1: [Coral Ring]        │ └──┴──┴──┴──┴──┴──┴──┴──┴──┴──┘      ║
║ Ring2: [Two-Stone Ring]    │                                         ║
║ Amulet:[Amulet of Fury]    │ Selected: Demon Edge Sword            ║
║ Weapon:[Void Sceptre]      │ ───────────────────────────           ║
║ Shield:[Spirit Shield]     │ Physical: 45-67 | Critical: 6.5%      ║
║                            │ +12% Attack Speed                      ║
║ FLASKS                     │ Required: Level 45, 80 STR            ║
║ [1-5] See equipped...      │ Value: ~5 Chaos                       ║
╚═══════════════════════════════════════════════════════════════════════╝
```

### **5. Stash/Bank**
```
╔═══════════════════════════════════════════════════════════════════════╗
║ STASH                       [Tab: Currency] [2/8]      [Guild Stash]  ║
╠═══════════════════════════════════════════════════════════════════════╣
║  [General][Currency][Maps][Cards][Unique][Essence][Fragment][Quad]   ║
║  ┌────────────────────────────────────────────────────────────┐      ║
║  │ CURRENCY TAB                                              │      ║
║  │ ════════════════════════════════════════════════════════ │      ║
║  │ Chaos Orb        x234    Orb of Alchemy    x45          │      ║
║  │ Exalted Orb      x2      Orb of Alteration x567         │      ║
║  │ Divine Orb       x0      Orb of Scouring   x89          │      ║
║  │ Mirror           x0      Blessed Orb       x34          │      ║
║  │ Chromatic Orb    x234    Orb of Fusing     x123         │      ║
║  │ Orb of Chance    x456    Orb of Binding    x67          │      ║
║  │ Vaal Orb         x78     Orb of Horizons   x23          │      ║
║  └────────────────────────────────────────────────────────────┘      ║
║  [D]eposit All  [W]ithdraw  [S]ort  [F]ilter  [Search: _____]       ║
╚═══════════════════════════════════════════════════════════════════════╝
```

### **6. Character Stats/Passive Tree**
```
╔═══════════════════════════════════════════════════════════════════════╗
║ CHARACTER SHEET                                    [89 Points Spent]  ║
╠═══════════════════════════════════════════════════════════════════════╣
║ ATTRIBUTES         │ DEFENSES           │ OFFENSE                    ║
║ ──────────────    │ ──────────────    │ ──────────────            ║
║ STR: 312          │ Armor:    2,456    │ Main DPS: 456,789         ║
║ DEX: 147          │ Evasion: 12,789    │ Accuracy: 95%             ║
║ INT: 89           │ ES:         234    │ Crit:     45.6%           ║
║                   │ Block:       24%    │ Crit Mul: 420%            ║
║ LIFE: 4567/4567   │ Dodge:       40%    │ APS:      4.56            ║
║ MANA: 234/890     │                    │                           ║
║                   │ RESISTANCES        │ PASSIVE TREE              ║
║ Movement: 145%    │ ──────────────    │ ──────────────            ║
║                   │ Fire:  75%(82%)    │     [A]                   ║
║ FLASK CHARGES     │ Cold:  75%(80%)    │    / | \                  ║
║ ──────────────   │ Light: 76%(76%)    │   B  C  D                 ║
║ Gained: 6/kill    │ Chaos: 24%(24%)    │  / \ | / \                ║
║                   │                    │ [E] [F] [G]               ║
╚═══════════════════════════════════════════════════════════════════════╝
```

### **7. Crafting Bench**
```
╔═══════════════════════════════════════════════════════════════════════╗
║ CRAFTING BENCH                                   [Materials: Listed]  ║
╠═══════════════════════════════════════════════════════════════════════╣
║ Selected Item: Vaal Regalia    │ AVAILABLE CRAFTS                    ║
║ ┌─────────────────────────┐   │ ──────────────────────────         ║
║ │ Energy Shield: 567       │   │ PREFIX (1/3 slots used)            ║
║ │ ───────────────────────  │   │ □ +89 Max Life (2 Chaos)          ║
║ │ +120 Maximum ES          │   │ □ +45 Max Mana (1 Chaos)          ║
║ │ +45% Fire Resistance     │   │ □ +12% Spell Damage (3 Alch)      ║
║ │ +38% Cold Resistance     │   │                                    ║
║ │ [Empty Prefix]           │   │ SUFFIX (2/3 slots used)            ║
║ │ [Empty Suffix]           │   │ □ +20% Resistance (2 Chaos)        ║
║ │                          │   │ □ +12 All Attributes (1 Ex)       ║
║ └─────────────────────────┘   │ □ Cannot be Frozen (1 Ex)         ║
║                                │                                    ║
║ [C]raft  [R]emove (1 Scour)  [S]imulate  [M]ultimod (2 Ex)         ║
╚═══════════════════════════════════════════════════════════════════════╝
```

### **8. Map/Atlas**
```
╔═══════════════════════════════════════════════════════════════════════╗
║ ATLAS OF WORLDS                              [Awakening Level: 5]    ║
╠═══════════════════════════════════════════════════════════════════════╣
║                        [SHAPER]                                      ║
║                           ◆                                          ║
║                        /  |  \                                       ║
║                     T16  T16  T16                                    ║
║                    /     |     \                                     ║
║                 T14    T15    T14    ● = Completed                  ║
║                / | \  / | \  / | \   ○ = Available                  ║
║              ●───●───●───○───●───●   ◆ = Boss                      ║
║             /│\  │  /│\ │ /│\ │ /│\  ░ = Locked                    ║
║           T1 T2 T3 T4 T5 T6 T7 T8                                  ║
║           ●  ●  ●  ●  ○  ○  ░  ░                                   ║
║                                                                      ║
║ Region: Glennach | Watchstones: 3/4 | Bonus: 87/154                ║
║ [R]un Map  [C]hisel  [A]lch  [V]aal  [S]extant                    ║
╚═══════════════════════════════════════════════════════════════════════╝
```

### **9. Trade Interface**
```
╔═══════════════════════════════════════════════════════════════════════╗
║ TRADE MARKET                                   [Currency: 45 Chaos]   ║
╠═══════════════════════════════════════════════════════════════════════╣
║ SEARCH FILTERS           │ RESULTS                                   ║
║ ────────────────────    │ ────────────────────────────────        ║
║ Type: [Weapon    ▼]     │ 1. Demon Sword - 5c - @ShadowKiller     ║
║ Level: [30] to [40]     │    Phys: 78-95, +45 life, +12% AS      ║
║ Mods: [Life     ▼]      │                                          ║
║ Max Price: [10c]        │ 2. Reaver Axe - 8c - @AxeMaster        ║
║                         │    Phys: 102-134, +2 Mana on Kill      ║
║ [S]earch                │                                          ║
║                         │ 3. Crystal Wand - 3c - @SpellSlinger    ║
║ LIVE SEARCH: OFF        │    Spell: +78%, Cast Speed: 12%         ║
║ [Toggle Alerts]         │                                          ║
║                         │ [W]hisper  [O]ffer  [B]uy  [N]ext Page  ║
╚═══════════════════════════════════════════════════════════════════════╝
```

### **10. Settings/Options**
```
╔═══════════════════════════════════════════════════════════════════════╗
║ SETTINGS                                              [Apply] [Reset] ║
╠═══════════════════════════════════════════════════════════════════════╣
║ GAMEPLAY                │ INTERFACE              │ KEYBINDS          ║
║ ───────────────────    │ ──────────────────    │ ──────────────    ║
║ ☑ Auto-pickup Currency │ Theme: [Dark ▼]       │ Move: Left Click  ║
║ ☑ Auto-identify Items  │ Font Size: [Medium ▼] │ Attack: Right     ║
║ ☐ Hardcore Warning     │ ☑ Show Minimap        │ Flask 1-5: 12345  ║
║ ☑ Show Damage Numbers  │ ☑ Show Item Levels    │ Skills: QWERT     ║
║ ☐ Lock Flask Position  │ ☑ Advanced Tooltips   │ Dodge: Space      ║
║                        │                       │ Map: Tab          ║
║ Loot Filter: [Semi ▼]  │ ASCII Quality: [Hi ▼] │ Inventory: I      ║
║ Combat Speed: [■■■■░]  │ Screen Shake: [■░░]   │ Character: C      ║
╚═══════════════════════════════════════════════════════════════════════╝
```

### **11. Death Recap**
```
╔═══════════════════════════════════════════════════════════════════════╗
║ YOU HAVE DIED                                    [Deaths: 3] [-10%]  ║
╠═══════════════════════════════════════════════════════════════════════╣
║ Killed by: Elite Rhoa (Rare) - Charge Attack                        ║
║ Location: Toxic Sewers T14 | Time: 14:32:45                         ║
║                                                                      ║
║ DAMAGE BREAKDOWN (Last 5 seconds)                                   ║
║ ─────────────────────────────────────────────────────────          ║
║ -1,234 Physical    | Rhoa Charge        | 0.1s ago | LETHAL       ║
║   -567 Physical DoT| Corrupted Blood x8 | 0.5s ago                ║
║   -234 Chaos      | Poison Projectile  | 1.2s ago                ║
║   -890 Physical    | Rhoa Charge (Crit) | 2.1s ago                ║
║   +456 Recovery    | Life Flask         | 2.5s ago                ║
║                                                                      ║
║ DEFENSIVE FAILURES:                                                 ║
║ • No Corrupted Blood immunity • Chaos Res: -23% • No Fortify      ║
║                                                                      ║
║ [R]espawn Checkpoint  [T]own  [S]tandard  [Q]uit                  ║
╚═══════════════════════════════════════════════════════════════════════╝
```

### **12. Guild/Social**
```
╔═══════════════════════════════════════════════════════════════════════╗
║ GUILD: <Chaos Recipe Enjoyers>              [Members: 47/100]        ║
╠═══════════════════════════════════════════════════════════════════════╣
║ ONLINE (12)            │ GUILD CHAT              │ GUILD STASH       ║
║ ──────────────────    │ ──────────────────     │ ──────────────    ║
║ ★ GuildLeader [L]     │ [G] Mike: rip          │ Tab 1: Currency   ║
║   Mapping T16         │ [G] Sarah: F           │ Tab 2: Maps       ║
║ ☆ OfficerDan [O]      │ [G] John: selling 6L?  │ Tab 3: Gear       ║
║   In Hideout          │ [G] Leader: 3ex tab 4  │ Tab 4: Sales      ║
║ • MagicMike [M]       │                        │                   ║
║   Delve depth 456     │ Message: [___________] │ Bank: 125ex       ║
║                       │                        │       4,567c      ║
║ Weekly: Kill Shaper   │ [Enter] Send           │                   ║
║ Progress: ▓▓▓▓▓▓░░ 67%│                        │ [V]iew [D]eposit  ║
╚═══════════════════════════════════════════════════════════════════════╝
```

---

## **File Structure**

```typescript
shimlar/
├── package.json
├── tsconfig.json
├── bunfig.toml
├── .env
├── README.md
│
├── src/
│   ├── index.tsx                 // Entry point
│   ├── app.tsx                   // Main App component
│   │
│   ├── types/
│   │   ├── game.ts              // Core game types
│   │   ├── items.ts             // Item/equipment types
│   │   ├── skills.ts            // Skill/ability types
│   │   ├── network.ts           // Network message types
│   │   └── index.ts
│   │
│   ├── components/
│   │   ├── layouts/
│   │   │   ├── MainLayout.tsx
│   │   │   ├── CombatLayout.tsx
│   │   │   └── MenuLayout.tsx
│   │   │
│   │   ├── views/              // Full screen views
│   │   │   ├── MainMenu.tsx
│   │   │   ├── CharacterCreation.tsx
│   │   │   ├── Combat.tsx
│   │   │   ├── Inventory.tsx
│   │   │   ├── Stash.tsx
│   │   │   ├── CharacterSheet.tsx
│   │   │   ├── PassiveTree.tsx
│   │   │   ├── CraftingBench.tsx
│   │   │   ├── Atlas.tsx
│   │   │   ├── Trade.tsx
│   │   │   ├── Guild.tsx
│   │   │   ├── Settings.tsx
│   │   │   └── DeathRecap.tsx
│   │   │
│   │   ├── combat/
│   │   │   ├── EnemyList.tsx
│   │   │   ├── CombatLog.tsx
│   │   │   ├── ActionBar.tsx
│   │   │   └── DamageNumber.tsx
│   │   │
│   │   ├── ui/                 // Reusable UI components
│   │   │   ├── Box.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── HealthBar.tsx
│   │   │   ├── FlaskBar.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Grid.tsx
│   │   │   ├── ScrollArea.tsx
│   │   │   ├── Tabs.tsx
│   │   │   └── Notification.tsx
│   │   │
│   │   ├── items/
│   │   │   ├── ItemTooltip.tsx
│   │   │   ├── ItemGrid.tsx
│   │   │   ├── ItemComparison.tsx
│   │   │   └── LootFilter.tsx
│   │   │
│   │   └── shared/
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       ├── Minimap.tsx
│   │       └── ChatWindow.tsx
│   │
│   ├── hooks/                  // Custom React hooks
│   │   ├── useGameState.ts
│   │   ├── useWebSocket.ts
│   │   ├── useCombat.ts
│   │   ├── useInventory.ts
│   │   ├── useKeyboard.ts
│   │   └── useSound.ts
│   │
│   ├── store/                  // Zustand stores
│   │   ├── gameStore.ts
│   │   ├── playerStore.ts
│   │   ├── combatStore.ts
│   │   ├── inventoryStore.ts
│   │   ├── settingsStore.ts
│   │   └── index.ts
│   │
│   ├── lib/
│   │   ├── api/               // API client
│   │   │   ├── client.ts
│   │   │   ├── auth.ts
│   │   │   ├── game.ts
│   │   │   └── trade.ts
│   │   │
│   │   ├── game/              // Game logic
│   │   │   ├── combat.ts
│   │   │   ├── items.ts
│   │   │   ├── skills.ts
│   │   │   ├── crafting.ts
│   │   │   ├── calculator.ts
│   │   │   └── lootFilter.ts
│   │   │
│   │   ├── terminal/          // Terminal utilities
│   │   │   ├── colors.ts
│   │   │   ├── effects.ts
│   │   │   ├── ascii.ts
│   │   │   └── sound.ts
│   │   │
│   │   └── utils/
│   │       ├── format.ts
│   │       ├── random.ts
│   │       ├── validation.ts
│   │       └── constants.ts
│   │
│   ├── data/                  // Static game data
│   │   ├── items.json
│   │   ├── skills.json
│   │   ├── enemies.json
│   │   ├── zones.json
│   │   ├── passives.json
│   │   └── recipes.json
│   │
│   └── styles/               // Terminal themes
│       ├── themes.ts
│       ├── dark.ts
│       ├── light.ts
│       └── colorblind.ts
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── scripts/
│   ├── build.ts
│   ├── dev.ts
│   └── generate-types.ts
│
└── dist/                     // Build output
```

### **Key Files Content Examples**

**`package.json`**
```json
{
  "name": "shimlar",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "bun run --watch src/index.tsx",
    "build": "bun build src/index.tsx --outdir dist --target node",
    "start": "bun run dist/index.js",
    "test": "bun test",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "ink": "^3.2.0",
    "ink-gradient": "^2.0.0",
    "ink-big-text": "^1.2.0",
    "ink-select-input": "^4.2.0",
    "ink-text-input": "^4.0.0",
    "terminal-kit": "^3.0.0",
    "zustand": "^4.4.7",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0"
  }
}
```

**`tsconfig.json`**
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react",
    "jsxFactory": "React.createElement",
    "jsxFragmentFactory": "React.Fragment",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@lib/*": ["./src/lib/*"],
      "@hooks/*": ["./src/hooks/*"],
      "@store/*": ["./src/store/*"],
      "@types/*": ["./src/types/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**`src/index.tsx`**
```typescript
#!/usr/bin/env bun
import React from 'react';
import { render } from 'ink';
import { App } from './app.js';

// Initialize terminal enhancements
import { terminal } from 'terminal-kit';

// Clear screen and hide cursor
terminal.clear();
terminal.hideCursor();

// Render the app
const { unmount } = render(<App />);

// Cleanup on exit
...
```
