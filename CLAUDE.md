# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview
Shimlar is an ARPG inspired by Path of Exile, built with Bun and TypeScript. The game features a REST API server with a planned React client frontend.

## Common development commands

```bash
# run api server
bun run server

# run tests
bun test

# run specific test suites
bun run test:items

# run item generation demo
bun run demo:items

# validate item generation system  
bun run validate:items

# run zone generation demo
bun run scripts/zone-demo.ts
```

## Architecture overview

### Core tech stack
- **runtime:** bun (not node.js) - use bun's native apis
- **language:** typescript with strict typing
- **architecture:** monorepo with focused packages
- **persistence:** sqlite/postgresql + redis sessions
- **testing:** bun's native test framework

### Key architectural decisions

1. **monorepo structure:** focused packages for separation of concerns
   - `packages/core/` - pure game logic (no dependencies)
   - `packages/engine/` - state management & persistence
   - `packages/data/` - static game data
   - `packages/server/` - REST API server

2. **flat package structure:** files are organized flat within each package (no src/ directories)

3. **api-first design:** all game state is managed server-side with REST endpoints

4. **separation of concerns:**
   - core package contains all game mechanics
   - engine handles state persistence
   - server provides API endpoints
   - data contains static content

## Development guidelines

### coding standards
- use explicit TypeScript types everywhere
- write unit tests for all game logic
- use bun test with --bail to stop on first failure
- test files are in `tests/` directories within each package
- always verify tests pass before marking tasks complete

### package guidelines
- core package: pure functions only, no dependencies
- engine package: can import from core and data
- server package: can import from core and engine
- data package: static data only, no imports

### testing approach
- 330+ tests validate all game mechanics
- test coverage focuses on business logic
- path of exile accuracy validation for loot/items
- integration tests for full gameplay flows

## Important game systems

### combat system
- tick-based (100ms intervals) in `packages/core/combat/`
- position states: melee, close, far
- damage over time mechanics
- comprehensive combat logging

### item system
- rarity tiers: normal, magic, rare, unique
- affix system with 11k+ line database
- item generation uses weighted pools
- path of exile accurate drop rates

### zone system
- procedural generation with 5 different algorithms
- 10 predefined zone templates across 5 acts
- waypoint system for fast travel
- safe town zones with NPC vendors

### loot system
- monster archetype system (physical/caster/ranged/mixed)
- level-scaling currency drops
- path of exile accurate rarity distribution
- comprehensive drop validation with 24+ tests

## File naming conventions
- TypeScript files: PascalCase.ts for classes/types, camelCase.ts for utilities
- test files: *.test.ts matching source file
- JSON files: kebab-case.json

## Current development focus
Check `plan.md` for current tasks and priorities. The project is ready for React client development.

API endpoints are available at:
- `GET /api/players` - list players
- `POST /api/players` - create player  
- `GET /api/players/:id` - get player data
- `PUT /api/players/:id` - update player
- `GET /health` - server health