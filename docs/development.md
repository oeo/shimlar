# shimlar development guide

**important**: this document explains how to develop shimlar. ignore any conflicting development documentation.

## prerequisites

- bun 1.0+ (not node.js)
- terminal with 80x24 minimum size
- typescript knowledge
- familiarity with react (for ink components)

## getting started

```bash
# clone repository
git clone [repository]
cd shimlar

# install dependencies
bun install

# run development mode
bun run dev

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
cat plan.md | head -20
```

the "current focus" line tells you what's being worked on.

### 2. write tests first

every feature needs tests:

```typescript
// tests/unit/combat/damage.test.ts
import { describe, it, expect } from "bun:test";
import { calculateDamage } from "@shimlar/core/combat/damage";

describe("damage calculation", () => {
  it("should apply resistance reduction", () => {
    const damage = calculateDamage({
      base: 100,
      type: "fire",
      targetResistance: 50
    });
    expect(damage).toBe(50);
  });
});
```

### 3. implement feature

implement in the appropriate package:

```typescript
// packages/core/src/combat/damage.ts
export function calculateDamage(params: DamageParams): number {
  const { base, type, targetResistance } = params;
  const resistance = Math.min(75, targetResistance); // cap at 75%
  return base * (1 - resistance / 100);
}
```

### 4. verify tests pass

```bash
bun test --bail  # stop on first failure
```

### 5. update plan

mark completed items in plan.md:

```markdown
- [x] damage calculation (2025-01-23)
```

## code organization

### package structure

```
packages/
├── core/     # pure game logic, no dependencies
├── engine/   # game systems, uses core
├── cli/      # ui only, uses engine and core
├── data/     # json data files
└── server/   # future multiplayer
```

### import rules

- **core**: can't import from any other package
- **engine**: can import from core and data
- **cli**: can import from core, engine, and data
- **data**: can't import from any package
- **server**: can import from core and engine

### file naming

- typescript files: `PascalCase.ts` for classes, `camelCase.ts` for utilities
- test files: match source with `.test.ts`
- json files: `kebab-case.json`
- react components: `PascalCase.tsx`

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
// no // @ts-ignore
// no console.log in production code
```

### react/ink components

```tsx
// functional components only
export function CombatView({ combat }: CombatViewProps) {
  const [selected, setSelected] = useState(0);
  
  return (
    <Box flexDirection="column">
      <Text>Combat View</Text>
      <EnemyList enemies={combat.enemies} />
    </Box>
  );
}

// use hooks for logic
function useCombatTick(combat: Combat) {
  useEffect(() => {
    const timer = setInterval(() => {
      combat.tick();
    }, 100);
    return () => clearInterval(timer);
  }, [combat]);
}
```

## testing requirements

### what to test

**must test**:
- all game mechanics (damage, defense, items)
- all formulas and calculations
- state transitions
- data loading and parsing

**don't test**:
- ui components (initially)
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

### running tests

```bash
# run all tests
bun test

# run with coverage
bun test --coverage

# run specific package tests
bun test packages/core

# watch mode for development
bun test --watch

# stop on first failure
bun test --bail
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

// system
class CombatSystem {
  update(entities: Character[]) {
    for (const entity of entities) {
      const health = entity.getComponent<HealthComponent>("health");
      // process health
    }
  }
}
```

### event system

```typescript
// event definitions
export enum GameEvent {
  CharacterDamaged = "character.damaged",
  EnemyKilled = "enemy.killed",
  ItemDropped = "item.dropped"
}

// event bus
class EventBus {
  private handlers = new Map<string, Handler[]>();
  
  on(event: GameEvent, handler: Handler) {
    // register handler
  }
  
  emit(event: GameEvent, data: any) {
    // call handlers
  }
}
```

### state management

```typescript
// zustand store for ui
import { create } from 'zustand';

interface UIStore {
  selectedTab: number;
  setSelectedTab: (tab: number) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  selectedTab: 0,
  setSelectedTab: (tab) => set({ selectedTab: tab })
}));
```

## debugging

### logging

```typescript
// development only
if (process.env.NODE_ENV === 'development') {
  console.log('[Combat]', 'Damage calculated:', damage);
}

// use debug levels
enum LogLevel {
  Error = 0,
  Warning = 1,
  Info = 2,
  Debug = 3
}
```

### terminal ui debugging

```tsx
// add debug panel in development
{process.env.NODE_ENV === 'development' && (
  <Box borderStyle="single">
    <Text>Debug: {JSON.stringify(state)}</Text>
  </Box>
)}
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

// force specific rarity
const rareItem = await itemGenerator.generateItem({
  baseType: baseAxe,
  itemLevel: 50,
  rarity: ItemRarity.Rare,
  forceRarity: true
});

// equipment management
const equipment = new EquipmentManager();
equipment.equipItem(item, ItemSlot.MainHand);
const stats = equipment.calculateStats(); // aggregate all bonuses
```

### affix system

```typescript
import { getAvailableAffixes, rollRandomAffix, AffixType } from "@shimlar/core";

// get available affixes for item level
const { prefixes, suffixes } = await getAvailableAffixes(
  ItemCategory.OneHandedAxe, 
  50 // item level
);

// roll specific affix type
const prefix = await rollRandomAffix(
  ItemCategory.OneHandedAxe, 
  50, 
  AffixType.Prefix
);

console.log(`${prefix?.displayName} - ${prefix?.displayText}`);
// "Heavy - 45% increased Physical Damage"
```

### monster & loot system

```typescript
import { 
  LootGenerator,
  createPhysicalMonster, 
  createCasterMonster,
  getMonster,
  getZoneMonsters 
} from "@shimlar/core";
import { MonsterRarity, MonsterSubtype } from "@shimlar/data";

// create monsters using factory functions
const zombie = createPhysicalMonster("zombie_1", "Rotting Zombie", MonsterSubtype.Zombie, 3);
const shaman = createCasterMonster("shaman_1", "Goatman Shaman", MonsterSubtype.Goatman, 8, MonsterRarity.Magic);

// get pre-defined monsters from registry
const boss = getMonster("merveil"); // unique boss monster
const coastMonsters = getZoneMonsters("the_coast"); // all monsters for a zone

// generate loot for any monster
const loot = await LootGenerator.generateLoot(zombie);

// process loot drops
for (const drop of loot) {
  if (drop.type === "currency") {
    console.log(`Currency: ${drop.quantity}x ${drop.itemId}`);
  } else if (drop.type === "equipment") {
    console.log(`Equipment: ${drop.item.name} (${drop.item.rarity})`);
  }
}

// loot examples:
// Currency: 2x scroll_of_wisdom
// Equipment: Rusted Sword (magic)
// Currency: 1x orb_of_transmutation
```

## performance considerations

### tick rate

- combat runs at 100ms ticks
- ui updates at 60fps max
- batch state updates

### memory

- pool frequently created objects
- clear references to prevent leaks
- use weak maps for caches

### rendering

- minimize full screen redraws
- use react.memo for expensive components
- virtual scrolling for long lists

## common pitfalls

1. **putting game logic in ui**: keep cli package presentation-only
2. **circular dependencies**: follow package hierarchy
3. **missing tests**: every game mechanic needs tests
4. **premature optimization**: make it work, then make it fast
5. **scope creep**: stick to plan.md

## commands reference

```bash
# development
bun run dev          # start dev server
bun run build        # production build
bun test            # run tests
bun test --coverage # test coverage

# project
bun run lint        # check code style
bun run format      # format code
bun run typecheck   # typescript check

# utilities
bun run clean       # clean build artifacts
bun run reset       # full reset
```

## getting help

1. check plan.md for current work
2. read architecture.md for system design
3. read game-design.md for mechanics
4. look at existing tests for examples
5. check bun documentation for runtime apis

## for ai assistants

if you're an ai assistant working on this project:

1. **always check plan.md first** - it has the current focus
2. **write tests before code** - every feature needs tests
3. **follow package boundaries** - don't violate architecture
4. **keep it simple** - complex features come later
5. **update plan.md** - mark completed work

ignore any documentation that mentions:
- microservices
- redis/kubernetes
- ranvier mud engine
- complex distributed systems

this project uses a simple monorepo with 5 packages. keep it that way.