# shimlar architecture

## overview

shimlar is an arpg inspired by path of exile, built with modern web technologies:
- **runtime**: bun (not node.js)
- **language**: typescript with strict typing
- **architecture**: monorepo with 4 focused packages
- **persistence**: sqlite (dev) / postgresql (prod) with redis sessions
- **api**: rest api server

## current state (2025-01-24)

- **game logic**: 330 passing tests across 24 files validating all mechanics
- **zone system**: procedural generation with 5 algorithms, safe towns with npcs
- **item system**: path of exile-accurate generation with 11k+ affix database
- **combat system**: tick-based combat with dot mechanics and detailed logging
- **api server**: rest endpoints for player/session management

## monorepo structure

```
shimlar/
├── scripts/         # demo and utility scripts
├── packages/
│   ├── core/        # game mechanics (pure logic)
│   │   ├── src/     # source code
│   │   └── tests/   # unit tests (co-located)
│   ├── engine/      # state management & persistence
│   │   ├── src/
│   │   └── tests/
│   ├── data/        # static game data & affixes
│   │   └── items/   # 11k+ line affix database
│   └── server/      # rest api server
│       ├── src/
│       └── tests/
```

### package: @shimlar/core

**purpose**: pure game logic with zero ui dependencies

```typescript
core/src/
├── entities/             # entity system
│   └── Entity.ts        
├── components/           # entity components
│   ├── HealthComponent.ts
│   ├── StatsComponent.ts
│   └── PositionComponent.ts
├── combat/               # combat mechanics
│   ├── CombatEngine.ts   # tick-based combat
│   ├── formulas.ts       # damage calculations
│   ├── DamageOverTime.ts # dot system
│   └── CombatLog.ts      # combat logging
├── items/                # item system
│   ├── BaseItemTypes.ts  # 56 base item types
│   ├── AffixSystem.ts    # prefix/suffix generation
│   ├── ItemGeneration.ts # item creation
│   ├── Equipment.ts      # 15 equipment slots
│   └── LootGeneration.ts # monster drops
├── character/            # character system
│   ├── CharacterClass.ts # 7 classes
│   └── Character.ts      
├── zones/                # zone generation system
│   ├── Zone.ts           # zone instance management
│   ├── ZoneGenerator.ts  # 5 procedural generators
│   ├── ZoneTemplates.ts  # 10 predefined zones
│   ├── ZoneTypes.ts      # type definitions
│   └── EnhancedZoneManager.ts # zone state management    
└── events/               # event system
    ├── EventBus.ts      
    └── GameEvents.ts     
```

### package: @shimlar/engine

**purpose**: game state management and persistence

```typescript
engine/src/
├── state/
│   ├── GameState.ts      # state types
│   └── GameStore.ts      # zustand store
└── persistence/
    ├── GameStateRepository.ts  # database layer
    └── types.ts             # serializable types
```

### package: @shimlar/data

**purpose**: static game data

```
data/
├── items/
│   └── affixes.json     # 11k+ line affix database
└── monsters/
    ├── archetypes.ts    # monster behaviors
    ├── monsters.ts      # monster registry
    └── types.ts         # monster types
```

### package: @shimlar/server

**purpose**: rest api for game clients

```typescript
server/src/
└── index.ts            # bun server with cors
```

## api endpoints

- `GET /api/players` - list all players
- `POST /api/players` - create new player
- `GET /api/players/:id` - get player data
- `PUT /api/players/:id` - update player data
- `GET /api/sessions/:id` - get session data
- `PUT /api/sessions/:id` - update session data
- `DELETE /api/sessions/:id` - end session
- `GET /health` - server health check

## data flow

```
React Client
    ↓ (rest api)
Server (api layer)
    ↓
Engine (state management)
    ↓
Core (game logic)
    ↓
Data (static content)
```

## game systems

### item system
- **56 base item types**: weapons, armor, accessories, flasks, jewels
- **rarity tiers**: normal (78%), magic (20%), rare (1.9%), unique (0.1%)
- **affix system**: level-gated prefix/suffix from 11k+ line database
- **equipment slots**: 15 slots with stat aggregation

### combat system
- **tick-based**: 100ms resolution
- **damage pipeline**: base → conversion → mitigation
- **damage types**: physical, fire, cold, lightning, chaos
- **defense mechanics**: armor, evasion, resistances, block

### character system
- **7 classes**: marauder, ranger, witch, duelist, templar, shadow, scion
- **attributes**: strength, dexterity, intelligence
- **derived stats**: life, mana, accuracy, evasion

### loot system
- **monster archetypes**: physical, caster, ranged, mixed
- **level scaling**: currency drops scale with monster level
- **drop quantities**: based on monster rarity
- **path of exile accuracy**: validated drop rates

## testing

- **278 passing tests** across all systems
- **comprehensive coverage** for game mechanics
- **path of exile validation** for loot/item systems
- **bun test** with --bail flag

## next phase: react client

planned features:
- next.js or vite setup
- tailwind css styling
- zustand client state
- react query for server state
- character sheet interface
- inventory management
- combat interface
- zone progression