# shimlar

terminal-based arpg inspired by path of exile, built with bun and typescript.

## installation

```bash
bun install
```

## development

```bash
# run development server with hot reload
bun run dev

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
- `packages/engine/` - game systems and orchestration
- `packages/cli/` - terminal ui using ink
- `packages/data/` - json data files (11k+ line affix database)
- `packages/server/` - future multiplayer support

## documentation

- `plan.md` - project roadmap and completed features
- `docs/architecture.md` - system architecture details
- `docs/development.md` - development guide with examples
- `CLAUDE.md` - ai assistant context
