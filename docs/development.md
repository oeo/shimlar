# shimlar development guide

## prerequisites

- bun 1.0+ (not node.js)
- typescript knowledge

## getting started

```bash
# clone repository
git clone [repository]
cd shimlar

# install dependencies
bun install

# run api server
bun run server

# run tests
bun test

# run specific test suite
bun test packages/core/tests/combat/
bun test packages/core/tests/items/

# run with bail (stop on first failure)
bun test --bail
```

## development workflow

### 1. check the plan

always start by checking `plan.md`:
```bash
cat plan.md | grep "current focus"
```

### 2. write tests first

every feature needs tests:

```typescript
// packages/core/tests/items/UniqueItems.test.ts  
import { describe, it, expect } from "bun:test";
import { generateUniqueItem } from "../../items/UniqueItems";

describe("unique item generation", () => {
  it("should create tabula rasa with correct properties", () => {
    const tabula = generateUniqueItem("tabula_rasa");
    expect(tabula.sockets).toBe(6);
    expect(tabula.links).toBe(6);
    expect(tabula.requirements.level).toBe(1);
  });
});
```

### 3. implement feature

implement in the appropriate package:

```typescript
// packages/core/items/UniqueItems.ts
export function generateUniqueItem(uniqueId: string): Item {
  const unique = UNIQUE_ITEMS.get(uniqueId);
  if (!unique) throw new Error(`Unknown unique: ${uniqueId}`);
  
  return {
    ...unique.baseItem,
    name: unique.name,
    rarity: ItemRarity.Unique,
    affixes: unique.fixedAffixes
  };
}
```

### 4. verify tests pass

```bash
bun test --bail
```

### 5. update plan

mark completed items in plan.md:

```markdown
- [x] unique items system (2025-01-24)
```

## code organization

### package structure

```
packages/
├── core/     # pure game logic, no dependencies (flat structure)
├── engine/   # state management, uses core (flat structure)
├── data/     # static data files (flat structure)
└── server/   # api server, uses engine and core (flat structure)
```

### import rules

- **core**: can't import from any other package
- **engine**: can import from core and data
- **data**: can't import from any package
- **server**: can import from core and engine

### file naming

- typescript files: `PascalCase.ts` for classes/types, `camelCase.ts` for utilities
- test files: match source with `.test.ts`
- json files: `kebab-case.json`

## coding standards

### typescript

```typescript
// use explicit types
export interface Character {
  name: string;
  level: number;
  attributes: Attributes;
}

// use enums for constants
export enum DamageType {
  Physical = "physical",
  Fire = "fire",
  Cold = "cold",
  Lightning = "lightning",
  Chaos = "chaos"
}

// pure functions where possible
export function calculateLife(level: number, strength: number): number {
  return 100 + level * 10 + strength * 0.5;
}

// no any types
// no @ts-ignore
// no console.log in production code
```

## testing requirements

### what to test

**must test**:
- all game mechanics (damage, defense, items)
- all formulas and calculations
- state transitions
- data loading and parsing

**don't test**:
- simple getters/setters
- third-party libraries

### test structure

```typescript
describe("system under test", () => {
  describe("specific functionality", () => {
    it("should behave correctly in normal case", () => {
      // arrange
      const input = setupTestData();
      
      // act
      const result = functionUnderTest(input);
      
      // assert
      expect(result).toBe(expectedValue);
    });

    it("should handle edge case", () => {
      // test edge cases
    });
  });
});
```

## common patterns

### entity-component system

```typescript
// entity
class Character {
  components: Map<string, Component> = new Map();
  
  addComponent(component: Component) {
    this.components.set(component.type, component);
  }
}

// component
interface HealthComponent {
  type: "health";
  current: number;
  maximum: number;
}
```

### item system

```typescript
import { 
  generateItemFromBase, 
  getBaseItemTypeByName,
  EquipmentManager,
  ItemRarity 
} from "@shimlar/core";

// generate items
const baseAxe = getBaseItemTypeByName("Rusted Hatchet")!;
const item = await generateItemFromBase(baseAxe, 25); // item level 25

// equipment management
const equipment = new EquipmentManager();
equipment.equipItem(item, ItemSlot.MainHand);
const stats = equipment.calculateStats(); // aggregate all bonuses
```

### monster & loot system

```typescript
import { 
  LootGenerator,
  createPhysicalMonster, 
  getMonster,
  getZoneMonsters 
} from "@shimlar/core";
import { MonsterRarity } from "@shimlar/data";

// create monsters
const zombie = createPhysicalMonster("zombie_1", "Rotting Zombie", MonsterSubtype.Zombie, 3);

// generate loot
const loot = await LootGenerator.generateLoot(zombie);
```

## api development

### adding endpoints

```typescript
// packages/server/index.ts
server.get("/api/items/:id", async (req) => {
  const item = await repository.getItem(req.params.id);
  return Response.json(item);
});
```

### database operations

```typescript
// packages/engine/persistence/GameStateRepository.ts
async getItem(id: string): Promise<Item> {
  const result = await this.db.query(
    "SELECT * FROM items WHERE id = ?",
    [id]
  );
  return result.rows[0];
}
```

## commands reference

```bash
# development
bun run server      # start api server
bun test           # run tests
bun test --coverage # test coverage

# demo scripts
bun run demo:items        # interactive item demo
bun run validate:items    # validate item generation
bun run scripts/zone-demo.ts # zone generation visualization

# project
bun run typecheck  # typescript check
```

## getting help

1. check plan.md for current work
2. read architecture.md for system design
3. look at existing tests for examples
4. check bun documentation for runtime apis

## for ai assistants

if you're an ai assistant working on this project:

1. **always check plan.md first** - it has the current focus
2. **write tests before code** - every feature needs tests
3. **follow package boundaries** - don't violate architecture
4. **keep it simple** - complex features come later
5. **update plan.md** - mark completed work

current state:
- **330 tests across 24 files** validating all game mechanics
- zone system: procedural generation with 5 algorithms, safe towns with npcs
- item system: path of exile-accurate generation with 11k+ affix database
- combat system: tick-based combat with dot mechanics and detailed logging
- api server: rest endpoints for player management