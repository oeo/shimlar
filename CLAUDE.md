# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview
Shimlar is a terminal-based ARPG inspired by Path of Exile, built with Bun and TypeScript using Ink (React for CLI). The game runs entirely in the terminal with keyboard-only controls.

## Common development commands

```bash
# run development server with hot reload
bun run --watch src/index.tsx

# run tests
bun test

# run specific test suites
bun run test:items

# run item generation demo
bun run demo:items

# validate item generation system  
bun run validate:items

# build for production
bun build src/index.tsx --outdir dist --target node

# start production build
bun run dist/index.js
```

## Architecture overview

### Core tech stack
- **runtime:** bun (not node.js) - use bun's native apis
- **ui framework:** ink v4 (react for terminal)
- **language:** typescript with strict typing
- **state management:** zustand (only when needed)
- **testing:** bun's native test framework

### Key architectural decisions

1. **view-based navigation:** the app uses a router/state machine to switch between full-screen views (combat, inventory, etc.)

2. **component hierarchy:**
   - `src/app.tsx` - main app with router
   - `src/components/views/` - full screen views
   - `src/components/ui/` - reusable ui components
   - `src/lib/game/` - game logic (combat, items, etc.)

3. **mock-first development:** all backend data starts as mocks in `src/data/` json files and `src/lib/game/` modules

4. **separation of concerns:**
   - ui components only handle display
   - game logic lives in `src/lib/game/`
   - state management via stores in `src/store/`
   - api calls abstracted in `src/lib/api/`

## Development guidelines

### component patterns
- keep components under 100 lines
- use functional components with hooks
- extract complex logic to custom hooks
- use proper typescript types for all props

### testing requirements
- write unit tests for all game logic
- use bun test with --bail to stop on first failure
- test files go in `tests/` mirroring src structure
- always verify tests pass before marking tasks complete

### performance considerations
- minimize re-renders using react.memo when needed
- use virtualization for long lists (combat log, inventory)
- profile with bun's built-in profiler if fps drops below 60
- avoid deep nesting in render loops

### terminal ui constraints
- no mouse support - keyboard only
- use box-drawing characters for borders
- keep ui density high but readable
- test on 80x24 terminal minimum size
- use ink's built-in components when possible

## Important game systems

### combat system
- tick-based (100ms intervals) in `src/lib/game/combat.ts`
- position states: melee, close, far
- interrupt system for player actions
- mock enemies from `src/data/enemies.json`

### item system
- rarity tiers: normal, magic, rare, unique
- affix system in `src/lib/game/items.ts`
- item generation uses weighted pools
- mock item bases in `src/data/items.json`

### item & equipment systems
- **base item types:** 30+ weapon, armor, jewelry, and flask types with proper requirements
- **affix system:** complete integration with 11k+ line `affixes.json` database
- **rarity tiers:** normal (no affixes), magic (1-2), rare (4-6), unique (future)
- **equipment system:** 15 equipment slots with dual-wield support and stat aggregation
- **item generation:** level-gated affixes with path of exile accurate rarity distribution

### crafting system (future)
- currency orbs: transmute, alteration, alchemy, chaos, scouring, regal, exalt, augment
- currency effects on items
- deterministic outcomes for testing

## File naming conventions
- components: PascalCase.tsx
- utilities: camelCase.ts
- types: PascalCase.ts in types/ folder
- tests: *.test.ts matching source file

## Current development focus
check `plan.md` for current tasks and priorities. always update plan.md when completing tasks.
- whenever we add scripts into the package.json we should update the readme.md file with an explanation of what it is. if we remove scripts from package.json we should remove the explanation from readme.md