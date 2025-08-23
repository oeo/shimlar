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
│   ├── Character.ts      // player character class
│   ├── Monster.ts        // enemy class
│   └── Item.ts          // item class
├── combat/
│   ├── damage.ts        // damage calculations
│   ├── mitigation.ts    // armor/resistance calculations
│   └── formulas.ts      // combat formulas
├── items/
│   ├── generation.ts    // item generation
│   ├── affixes.ts       // prefix/suffix system
│   └── rarity.ts        // rarity tiers
├── skills/
│   ├── Skill.ts         // skill base class
│   └── effects.ts       // skill effects
├── constants/
│   └── game.ts          // game constants
└── types/
    └── index.ts         // shared types
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
│   ├── bases.json       // base item types
│   ├── uniques.json     // unique items
│   └── affixes.json     // affix pools
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

## for future developers

if you're reading this and confused by other documentation that mentions:
- microservices
- redis
- kubernetes  
- ranvier
- distributed systems
- multiple servers

**ignore them**. this document is the current truth. we're building a monolithic game that can be split later if needed, but starting simple.