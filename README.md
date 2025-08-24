# shimlar

ARPG inspired by Path of Exile, built with Bun and TypeScript. Features a REST API server with comprehensive game mechanics.

## installation

```bash
bun install
```

## development

```bash
# run api server
bun run server

# run all tests
bun test

# run item system tests
bun run test:items
```

## item system scripts

```bash
# interactive demo of item generation
bun run demo:items

# validation of item system (10k+ items)
bun run validate:items

# visualize zone generation types with ascii maps
bun run scripts/zone-demo.ts
```

### demo:items
shows interactive examples of:
- basic item generation across weapon/armor/accessory/flask types
- rarity differences (normal/magic/rare items)
- high-level items with powerful affixes
- equipment system with stat aggregation

### validate:items
tests the item generation system with thousands of items:
- rarity distribution matches poe (78% normal, 20% magic, 1.9% rare)
- affix constraints by rarity (normal=0, magic≤2, rare≤6)
- prefix/suffix naming conventions
- equipment integration and stat calculation
- item level requirements for affix tiers

## loot system

monster and loot generation system:
- **monster archetypes**: physical/caster/ranged/mixed behavioral types
- **cross-act registry**: define monsters once, use everywhere
- **level scaling**: currency drops scale exponentially with monster level  
- **path of exile accuracy**: chaos orbs 0.0-0.2% drop rate, proper rarity distribution
- **testing**: 24+ tests validating poe mechanics across 3 test files

## zone system

dynamic zone generation system for text-based gameplay:
- **procedural generation**: 5 generator types (linear, cave, dungeon, maze, open)
- **text-based navigation**: grid movement with ascii map visualization 
- **dynamic spawns**: procedural monster placement with smart distribution
- **zone templates**: 10 predefined zones across 5 acts (levels 1-60)
- **waypoint discovery**: unlock waypoints by exploration, not progress
- **town safety**: towns are safe zones with npc vendors, no monsters or hazards
- **testing**: 66 tests validating generation, spawns, and mechanics

try the zone demo: `bun run scripts/zone-demo.ts`

## project structure

monorepo with focused packages:
- `packages/core/` - pure game logic (flat structure)
- `packages/engine/` - state management and persistence  
- `packages/data/` - static game data (11k+ line affix database)
- `packages/server/` - REST API server

## api server

rest api for managing game state:

- `GET /api/players` - list all players
- `POST /api/players` - create new player
- `GET /api/players/:id` - get player data
- `PUT /api/players/:id` - update player data
- `GET /health` - server health check

## configuration

```bash
# development (sqlite)
DB_PATH=./data/shimlar.db bun run server

# production (postgresql)  
DATABASE_URL=postgresql://user:pass@host:port/db bun run server
```

## testing

330 tests across 24 files validate all game mechanics:
- combat system with damage calculations and dot mechanics
- item generation with Path of Exile accuracy
- zone system with procedural generation
- character classes and attribute systems

## documentation

- `plan.md` - current roadmap and completed features
- `docs/architecture.md` - system design and package structure  
- `docs/development.md` - coding standards and workflow
- `docs/game-design.md` - core game mechanics specification
