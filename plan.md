current focus: loot generation - weighted drop tables and smart loot system

## phase 0: monorepo structure & documentation
- [x] initial project setup (2025-01-23)
  - [x] initialize bun project with typescript
  - [x] configure ink for terminal ui
  - [x] establish basic component structure
- [x] monorepo reorganization (2025-01-23)
  - [x] setup workspace configuration for bun
  - [x] create package structure (see file structure below)
  - [x] move existing code to appropriate packages
  - [x] setup shared tsconfig and dependencies
  - [x] ensure all packages can reference each other
- [x] documentation cleanup (2025-01-23)
  - [x] remove overly complex ranvier docs
  - [x] consolidate context files into single design doc
  - [x] create simplified architecture doc
  - [x] update claude.md with new structure
  - [ ] create package-specific readmes
- [ ] data integration
  - [ ] move item-affixes.json to packages/data
  - [ ] create item base types definitions
  - [ ] create typescript types from affix data
  - [ ] validate affix data structure
  - [ ] unit tests for data loading

## phase 1: foundational architecture & core combat
- [x] core game architecture (2025-01-23)
  - [x] game state management (zustand)
  - [x] event system for game mechanics
  - [x] entity-component system for characters/enemies
  - [x] zone/area management system
  - [x] unit tests for all core systems
- [x] character system foundation (2025-01-23)
  - [x] base attributes (str/dex/int)
  - [x] derived stats (life/mana/evasion/armor)
  - [x] 7 character classes with proper stat distributions
  - [x] character persistence to json
  - [x] unit tests for stat calculations
- [x] combat engine (2025-01-23)
  - [x] tick-based combat (100ms resolution)
  - [x] damage calculation pipeline (base -> conversion -> mitigation)
  - [x] hit/evasion/accuracy calculations
  - [x] critical strike system
  - [x] position system (melee/close/far)
  - [x] combat log with detailed calculations
  - [x] unit tests for all combat formulas
- [x] damage & defense systems (2025-01-23)
  - [x] damage types (physical/fire/cold/lightning/chaos)
  - [x] resistance system (-60% to 75% cap)
  - [x] armor/evasion/energy shield mechanics
  - [x] damage over time framework
  - [x] unit tests for mitigation calculations

## phase 2: items & loot system
- [x] item architecture (2025-01-23)
  - [x] base item types system
    - [x] weapon types (axes, swords, maces, daggers, claws, bows, staves, scepters, wands)
    - [x] armor types (helmets, body armor, gloves, boots, shields)
    - [x] jewelry types (rings, amulets, belts)
    - [x] flask types (life, mana, hybrid, utility)
  - [x] affix system using item-affixes.json
    - [x] prefix pool (offensive modifiers)
    - [x] suffix pool (defensive modifiers)
    - [x] tier-based affix selection by item level
    - [x] affix value range rolling
  - [x] item rarity tiers
    - [x] normal: no affixes
    - [x] magic: 1 prefix and/or 1 suffix
    - [x] rare: up to 3 prefixes and 3 suffixes
    - [x] unique: fixed special modifiers (future)
  - [x] item level and requirement system
    - [x] item level determines available affixes
    - [x] stat requirements (str/dex/int) from base types
    - [x] level requirements from affixes
  - [x] unit tests for item generation
- [x] equipment system (2025-01-23)
  - [x] equipment slots
    - [x] main hand (all weapon types)
    - [x] off hand (shields, dual wield)
    - [x] helm, body armor, gloves, boots
    - [x] belt, amulet, ring left, ring right
  - [x] stat aggregation from equipment
    - [x] sum all affix modifiers
    - [x] apply percentage increases
    - [x] calculate final stats
  - [x] item comparison system
  - [x] unit tests for equipment bonuses
- [x] documentation and testing (2025-01-23)
  - [x] update architecture.md with item system details
  - [x] update development.md with usage examples  
  - [x] create comprehensive item generation demo script
  - [x] create validation script for rarity/affix mechanics
  - [x] add npm scripts for testing and demos
  - [x] validate all 68 tests passing (441 expect calls)
- [ ] loot generation
  - [ ] weighted drop tables by monster type
  - [ ] rarity roll system
  - [ ] affix selection from pools
  - [ ] rarity affixes on gear may affect quality of items dropped
  - [ ] quantity affixes on gear may affect number of items dropped
  - [ ] unit tests for drop rates
- [ ] inventory management
  - [ ] grid-based inventory
  - [ ] stash system with tabs
  - [ ] unit tests for inventory operations

## phase 3: flasks & active skills
- [ ] flask system
  - [ ] 5 flask slots
  - [ ] flask types (life/mana/utility)
  - [ ] flask modifiers (instant/duration/unique effects)
  - [ ] charge generation/consumption
  - [ ] unit tests for flask mechanics
- [ ] skill system architecture
  - [ ] active skill framework
  - [ ] support gem system (simplified)
  - [ ] skill tags and scaling
  - [ ] mana costs and cooldowns
  - [ ] unit tests for skill damage
- [ ] basic skill implementation
  - [ ] 3-5 skills per class
  - [ ] melee skills (strike/slam/channel)
  - [ ] projectile skills (projectile count/chain/pierce)
  - [ ] spell skills (aoe/duration/damage effectiveness)
  - [ ] unit tests for each skill type

## phase 4: monsters & ai
- [ ] monster system
  - [ ] monster base types and variants
  - [ ] monster rarity (normal/magic/rare/unique)
  - [ ] monster modifiers system
  - [ ] unit tests for monster stats
- [ ] ai behaviors
  - [ ] movement patterns (direct/flanking/kiting)
  - [ ] ability usage conditions
  - [ ] aggro/threat system
  - [ ] unit tests for ai decisions
- [ ] boss mechanics
  - [ ] multi-phase bosses
  - [ ] telegraphed attacks
  - [ ] special mechanics (immunity phases/adds)
  - [ ] unit tests for boss behaviors

## phase 5: progression systems
- [ ] experience & leveling
  - [ ] experience scaling formula
  - [ ] death penalty system
  - [ ] level-based stat gains
  - [ ] unit tests for xp calculations
- [ ] passive skill tree
  - [ ] simplified node system (not full poe tree initially)
  - [ ] keystone passives
  - [ ] class starting positions
  - [ ] respec mechanics
  - [ ] unit tests for passive bonuses
- [ ] ascendancy classes
  - [ ] 2-3 ascendancies per base class
  - [ ] ascendancy passive trees
  - [ ] labyrinth trials (simplified)
  - [ ] unit tests for ascendancy mechanics

## phase 6: crafting & currency
- [ ] currency system
  - [ ] basic orbs (transmute/alteration/alchemy/chaos/scouring/regal/exalt/augment)
  - [ ] currency effects on items
  - [ ] deterministic crafting outcomes (initially)
  - [ ] unit tests for crafting results
- [ ] crafting bench
  - [ ] metamod crafting (basic)
  - [ ] unit tests for bench crafts
- [ ] essence system
  - [ ] essence tiers
  - [ ] guaranteed mod outcomes
  - [ ] essence-only mods
  - [ ] unit tests for essence crafting

## phase 7: endgame systems
- [ ] map system
  - [ ] map tiers (1-16)
  - [ ] map modifiers
  - [ ] atlas progression (simplified)
  - [ ] map sustain mechanics
  - [ ] unit tests for map generation
- [ ] league mechanics
  - [ ] rotating league content
  - [ ] league-specific rewards
  - [ ] challenge system
  - [ ] unit tests for league mechanics
- [ ] pinnacle content
  - [ ] elder/shaper influence (simplified)
  - [ ] pinnacle boss fights
  - [ ] uber versions
  - [ ] unit tests for pinnacle encounters

## phase 8: multiplayer foundation
- [ ] networking architecture
  - [ ] websocket server
  - [ ] state synchronization
  - [ ] latency compensation
  - [ ] unit tests for network messages
- [ ] party system
  - [ ] party formation/management
  - [ ] shared experience/loot
  - [ ] party benefits
  - [ ] unit tests for party mechanics
- [ ] trading system
  - [ ] direct trade interface
  - [ ] trade window mechanics
  - [ ] currency exchange
  - [ ] unit tests for trade validation
- [ ] chat system
  - [ ] global/trade/local channels
  - [ ] whisper system
  - [ ] chat commands
  - [ ] unit tests for chat filtering

## architecture decisions
- single codebase, modular architecture (not microservices initially)
- json file storage initially, can migrate to sqlite later
- websocket ready architecture for future multiplayer
- component-based entities for flexibility
- event-driven game mechanics for extensibility
- comprehensive unit testing for all game mechanics

## testing requirements
- every game mechanic must have unit tests
- use bun test with --bail for development
- test files mirror source structure in tests/
- minimum 80% code coverage for game logic
- integration tests for complex systems
- performance benchmarks for critical paths

## design constraints
- must support all poe-like mechanics (eventually)
- terminal-first but architecture supports other frontends
- start single-player, but multiplayer-ready architecture
- embrace ascii aesthetic but keep ui readable
- 80x24 minimum terminal size support

## monorepo file structure
```
shimlar/
├── packages/
│   ├── core/                    # shared game logic
│   │   ├── src/
│   │   │   ├── entities/        # character, monster, item classes
│   │   │   ├── combat/          # damage calculations, formulas
│   │   │   ├── items/           # item generation, affixes
│   │   │   ├── skills/          # skill definitions, effects
│   │   │   ├── constants/       # game constants, formulas
│   │   │   └── types/           # shared typescript types
│   │   ├── tests/
│   │   └── package.json
│   │
│   ├── engine/                  # game engine
│   │   ├── src/
│   │   │   ├── systems/         # ecs systems
│   │   │   ├── zones/           # zone/area management
│   │   │   ├── events/          # event system
│   │   │   ├── state/           # game state management
│   │   │   └── ai/              # monster ai
│   │   ├── tests/
│   │   └── package.json
│   │
│   ├── cli/                     # terminal ui (ink)
│   │   ├── src/
│   │   │   ├── components/      # ink components
│   │   │   │   ├── views/       # full screen views
│   │   │   │   ├── ui/          # reusable ui components
│   │   │   │   └── combat/      # combat specific ui
│   │   │   ├── hooks/           # react hooks
│   │   │   ├── stores/          # zustand stores
│   │   │   └── index.tsx        # entry point
│   │   ├── tests/
│   │   └── package.json
│   │
│   ├── data/                    # game data files
│   │   ├── items/               
│   │   │   ├── affixes.json    # complete affix database (11k+ lines)
│   │   │   ├── bases.json      # base item types
│   │   │   └── uniques.json    # unique items (future)
│   │   ├── monsters/            # monster definitions
│   │   ├── skills/              # skill data
│   │   ├── zones/               # zone/area data
│   │   └── package.json
│   │
│   └── server/                  # future multiplayer server
│       ├── src/
│       │   ├── websocket/       # ws communication
│       │   ├── persistence/     # save/load system
│       │   └── index.ts
│       ├── tests/
│       └── package.json
│
├── saves/                       # player save files (gitignored)
├── docs/                        # simplified documentation
│   ├── architecture.md          # system architecture
│   ├── game-design.md          # consolidated game design
│   └── development.md          # development guide
│
├── bun.lock
├── package.json                 # workspace root
├── tsconfig.json               # base tsconfig
├── README.md
├── CLAUDE.md                   # ai assistant context
└── plan.md                     # this file
```

## package responsibilities

### @shimlar/core
- game mechanics and formulas
- entity definitions (character, monster, item)
- damage calculations
- item generation system
- skill definitions
- shared types and constants
- no ui or state management

### @shimlar/engine  
- game loop and systems
- zone/area management
- event bus
- ai behavior system
- combat orchestration
- state management
- no ui dependencies

### @shimlar/cli
- terminal ui using ink
- view components
- user input handling
- display formatting
- local state for ui
- uses engine and core

### @shimlar/data
- json data files
- item affix database (complete with tiers and level requirements)
- item base types
- monster stats
- zone definitions
- skill descriptions

## item generation system

### affix data structure
the `item-affixes.json` file contains:
- **30+ item categories** (weapons, armor, jewelry, flasks)
- **per category**: prefix and suffix pools
- **per affix**: 
  - name tiers (e.g., "frosted" → "glaciated")
  - min/max value ranges
  - level requirements
  - progressive scaling with item level

### item generation flow
```
1. determine item base type (e.g., "one handed axe")
2. roll rarity (normal/magic/rare)
3. determine item level (from zone/monster)
4. filter available affixes by item level
5. randomly select affixes based on rarity
   - magic: 1-2 total affixes
   - rare: 4-6 total affixes
6. roll values within min/max ranges
7. calculate final item requirements
```

### example affix tiers (physical damage on axes)
- lvl 1: "heavy" (40-49% increased)
- lvl 11: "serrated" (50-64% increased)
- lvl 23: "wicked" (65-84% increased)
- lvl 35: "vicious" (85-109% increased)
- lvl 46: "bloodthirsty" (110-134% increased)
- lvl 60: "cruel" (135-154% increased)
- lvl 73: "tyrannical" (155-169% increased)
- lvl 83: "merciless" (170-179% increased)

## future features

### loot filters
- item filtering system (basic)
- customizable filter rules
- visual/audio alerts for valuable items

### @shimlar/server (multiplayer)
- websocket server
- multiplayer state sync
- persistence layer
- player authentication
- trade system
- chat system