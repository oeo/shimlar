# shimlar architecture

**important**: this document supersedes all previous architecture documents. if you find conflicting information elsewhere, this is the authoritative source.

## overview

shimlar is a terminal-based arpg inspired by path of exile, built with:
- **runtime**: bun (not node.js)
- **language**: typescript with strict typing
- **ui framework**: ink v4 (react for terminals)
- **architecture**: monorepo with 5 focused packages
- **persistence**: json files initially, sqlite later
- **multiplayer**: future consideration, not initial focus

## what this is not

**critical**: we are not building:
- microservices architecture
- redis pub/sub systems
- kubernetes deployments
- distributed systems
- ranvier mud engine integration
- complex authentication servers
- separate chat/trade/game servers

any documentation suggesting these approaches is **obsolete**.

## monorepo structure

```
shimlar/
├── packages/
│   ├── core/        # game mechanics, no ui
│   ├── engine/      # game systems, no ui
│   ├── cli/         # terminal ui only
│   ├── data/        # static game data
│   └── server/      # future multiplayer
```

### package: @shimlar/core

**purpose**: pure game logic with zero dependencies on ui or state management

```typescript
// example structure
core/src/
├── entities/
│   ├── Entity.ts         // base entity with component system
│   └── Character.ts      // player character creation
├── components/
│   ├── HealthComponent.ts
│   ├── StatsComponent.ts
│   └── PositionComponent.ts
├── combat/
│   ├── CombatEngine.ts   // tick-based combat system
│   ├── formulas.ts       // hit/damage calculations
│   ├── DamageOverTime.ts // poison/ignite/bleed system
│   └── CombatLog.ts      // detailed combat logging
├── items/
│   ├── BaseItemTypes.ts  // weapon/armor/accessory definitions
│   ├── AffixSystem.ts    // prefix/suffix generation
│   ├── ItemGeneration.ts // complete item creation
│   └── Equipment.ts      // equipment slots and stat calculation
├── character/
│   ├── CharacterClass.ts // 7 character classes with stat distributions  
│   └── Character.ts      // character creation and management
├── zones/
│   ├── Zone.ts           // zone/area definitions
│   └── ZoneManager.ts    // zone management system
├── events/
│   ├── EventBus.ts       // game event system
│   └── GameEvents.ts     // event type definitions
├── entities/
│   └── Entity.ts         // base entity with component system
├── components/
│   ├── HealthComponent.ts
│   ├── StatsComponent.ts
│   └── PositionComponent.ts
└── types/
    └── types.ts          // combat types
```

**key principles**:
- pure functions where possible
- no side effects
- fully unit tested
- no external dependencies beyond types

### package: @shimlar/engine

**purpose**: game loop, systems, and orchestration

```typescript
engine/src/
├── systems/
│   ├── CombatSystem.ts   // manages combat flow
│   ├── LootSystem.ts     // handles drops
│   └── MovementSystem.ts // position management
├── zones/
│   ├── Zone.ts           // zone/area class
│   └── ZoneManager.ts    // zone transitions
├── events/
│   ├── EventBus.ts       // event system
│   └── GameEvents.ts     // event definitions
├── state/
│   ├── GameState.ts      // global game state
│   └── StateManager.ts   // state persistence
└── ai/
    ├── AIBehavior.ts     // base ai class
    └── behaviors/        // specific ai patterns
```

**key principles**:
- owns the game loop
- manages all game systems
- handles state persistence
- coordinates between systems
- no ui dependencies

### package: @shimlar/cli

**purpose**: terminal user interface using ink (react)

```typescript
cli/src/
├── components/
│   ├── views/           // full-screen views
│   │   ├── Combat.tsx
│   │   ├── Inventory.tsx
│   │   └── MainMenu.tsx
│   ├── ui/              // reusable components
│   │   ├── Box.tsx
│   │   ├── ProgressBar.tsx
│   │   └── Button.tsx
│   └── combat/          // combat-specific ui
│       ├── CombatLog.tsx
│       └── EnemyList.tsx
├── hooks/
│   ├── useGameState.ts
│   └── useKeyboard.ts
├── stores/
│   └── uiStore.ts       // ui-only state
└── index.tsx            // entry point
```

**key principles**:
- presentation only
- uses engine and core
- manages ui state only
- keyboard input handling
- terminal constraints (80x24 minimum)

### package: @shimlar/data

**purpose**: static game data in json format

```
data/
├── items/
│   ├── affixes.json     // complete 11k+ line affix database
│   ├── bases.json       // base item types (future)
│   └── uniques.json     // unique items (future)
├── monsters/
│   ├── normal.json      // regular enemies
│   └── bosses.json      // boss enemies
├── skills/
│   └── skills.json      // skill definitions
└── zones/
    └── zones.json       // zone data
```

### package: @shimlar/server (future)

**purpose**: multiplayer support (not initial focus)
- websocket communication
- state synchronization
- persistence layer
- will be built after single-player is complete

## data flow

```
User Input (keyboard)
    ↓
CLI (ink components)
    ↓
Engine (game systems)
    ↓
Core (game logic)
    ↓
Data (static content)
```

## state management

1. **game state**: managed by engine, persisted to json
2. **ui state**: managed by cli with zustand
3. **no global state**: each package manages its own state
4. **save files**: json files in saves/ directory

## testing strategy

- every game mechanic must have unit tests
- use bun test with --bail flag
- test files mirror source structure
- minimum 80% coverage for game logic
- no tests for ui components initially

## build and development

```bash
# install dependencies
bun install

# run development
bun run dev

# run tests
bun test

# build for production
bun run build
```

## scalability considerations

the architecture supports future expansion to:
- multiplayer via websocket server
- persistent world via sqlite/postgres
- web interface via xterm.js
- mobile interface via react native

but these are **not** initial goals.

## why this architecture

1. **separation of concerns**: game logic separate from ui
2. **testability**: pure functions in core are easy to test
3. **flexibility**: can swap ui without touching game logic
4. **incremental development**: can build features in isolation
5. **future-proof**: can add multiplayer without major refactor

## common pitfalls to avoid

1. don't add dependencies between packages that violate hierarchy
2. don't put game logic in the cli package
3. don't put ui code in the engine or core
4. don't optimize prematurely
5. don't add features not in the plan

## item system architecture

### item generation pipeline

```
1. select base item type → weapon/armor/accessory/flask
2. determine item level → from zone/monster level  
3. roll rarity → normal/magic/rare/unique
4. generate affixes → based on rarity and item level
5. calculate requirements → level + stat requirements
6. create final item → with name, stats, and display
```

### affix system

the affix system uses a comprehensive database with:
- **30+ item categories** (weapons, armor types, jewelry)
- **prefix pools** (offensive modifiers like damage)  
- **suffix pools** (defensive modifiers like resistances)
- **tier progression** (higher levels = better values)
- **level requirements** (item level gates affix access)

### equipment system

- **15 equipment slots** including dual wield and 5 flask slots
- **stat aggregation** combines all equipped item bonuses
- **two-handed restrictions** prevent off-hand items with 2h weapons  
- **item comparison** automatic upgrade/downgrade analysis
- **requirements validation** level and attribute requirements

### rarity distribution

following path of exile mechanics:
- **normal**: 78% chance, no affixes
- **magic**: 20% chance, 1-2 affixes  
- **rare**: 1.9% chance, 4-6 affixes
- **unique**: 0.1% chance, fixed modifiers

## for future developers

if you're reading this and confused by other documentation that mentions:
- microservices
- redis
- kubernetes  
- ranvier
- distributed systems
- multiple servers

**ignore them**. this document is the current truth. we're building a monolithic game that can be split later if needed, but starting simple.