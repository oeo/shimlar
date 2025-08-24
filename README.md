# shimlar

arpg inspired by path of exile, built with bun and typescript. game logic ready for react client.

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

# comprehensive validation of item system (10k+ items)
bun run validate:items
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

comprehensive monster and loot generation system:
- **monster archetypes**: physical/caster/ranged/mixed behavioral types
- **cross-act registry**: define monsters once, use everywhere
- **level scaling**: currency drops scale exponentially with monster level  
- **path of exile accuracy**: chaos orbs 0.0-0.2% drop rate, proper rarity distribution
- **comprehensive testing**: 24+ tests validating poe mechanics across 3 test files

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

## documentation

- `plan.md` - project roadmap and completed features
- `docs/architecture.md` - system architecture details
- `docs/development.md` - development guide with examples
- `CLAUDE.md` - ai assistant context
