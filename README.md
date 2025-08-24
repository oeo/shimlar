# shimlar

arpg inspired by path of exile, built with bun and typescript. game logic with 330 tests.

## installation

```bash
bun install
```

## development

```bash
# run api server for react client
bun run server

# run all tests
bun test

# run item system tests specifically
bun run test:items

# run loot validation tests (path of exile accuracy)
bun test packages/core/tests/items/LootValidation.test.ts
bun test packages/core/tests/items/PoEAccuracy.test.ts
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
- `packages/core/` - pure game logic, no ui dependencies
- `packages/engine/` - game systems, state management, and persistence
- `packages/data/` - json data files (11k+ line affix database)
- `packages/server/` - rest api server for react client

## api server

the server provides a rest api for managing game state:

- `GET /api/players` - list all players
- `POST /api/players` - create new player
- `GET /api/players/:id` - get player data
- `PUT /api/players/:id` - update player data
- `GET /api/sessions/:id` - get session data (redis/postgres)
- `PUT /api/sessions/:id` - update session data
- `DELETE /api/sessions/:id` - end session

## database setup

game state supports both sqlite (development) and postgresql (production):

```bash
# development - uses sqlite automatically
DB_PATH=./data/shimlar.db bun run server

# production - set postgres connection
DATABASE_URL=postgresql://user:pass@host:port/db bun run server
```

## testing

game logic validated with 330 tests across 24 files:
- **combat system**: tick-based combat, damage calculations, dot mechanics
- **item system**: generation, equipment, affixes, path of exile accuracy
- **zone system**: procedural generation, monster spawns, town safety
- **character system**: 7 classes, stats, leveling, components
- **core architecture**: entity system, event bus, persistence

## documentation

- `plan.md` - project roadmap and completed features  
- `docs/architecture.md` - system design and package structure
- `docs/development.md` - coding standards and workflow guide
- `CLAUDE.md` - ai assistant context
