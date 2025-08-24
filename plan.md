current focus: react client development - ready for web application

## phase 0: architecture transition (completed 2025-01-24)
- [x] removed terminal cli package
  - [x] deleted packages/cli completely 
  - [x] removed ink dependencies
  - [x] updated root package.json scripts
- [x] persistence layer implementation
  - [x] GameStateRepository with sqlite/postgresql support
  - [x] redis session management with database fallback
  - [x] complete sql schema with indexing and cleanup
  - [x] serializable game state types
- [x] rest api server
  - [x] bun-powered server with cors support
  - [x] player management endpoints
  - [x] session management endpoints
  - [x] health check and error handling
- [x] documentation updates
  - [x] updated readme with api documentation
  - [x] database setup instructions
  - [x] removed cli references

## phase 1: foundational architecture & core combat (completed)
- [x] core game architecture (2025-01-23)
  - [x] game state management (zustand)
  - [x] event system for game mechanics
  - [x] entity-component system for characters/enemies
  - [x] zone/area management system
  - [x] unit tests for all core systems
- [x] character system foundation (2025-01-23)
  - [x] base attributes (str/dex/int)
  - [x] derived stats (life/mana/evasion/armor)
  - [x] 7 character classes with proper stat distributions
  - [x] character persistence to database
  - [x] unit tests for stat calculations
- [x] combat engine (2025-01-23)
  - [x] tick-based combat (100ms resolution)
  - [x] damage calculation pipeline (base -> conversion -> mitigation)
  - [x] hit/evasion/accuracy calculations
  - [x] critical strike system
  - [x] position system (melee/close/far)
  - [x] combat log with detailed calculations
  - [x] unit tests for all combat formulas
- [x] damage & defense systems (2025-01-23)
  - [x] damage types (physical/fire/cold/lightning/chaos)
  - [x] resistance system (-60% to 75% cap)
  - [x] armor/evasion/energy shield mechanics
  - [x] damage over time framework
  - [x] unit tests for mitigation calculations

## phase 2: items & loot system (completed)
- [x] item architecture (2025-01-23)
  - [x] base item types system
    - [x] weapon types (axes, swords, maces, daggers, claws, bows, staves, scepters, wands)
    - [x] armor types (helmets, body armor, gloves, boots, shields)
    - [x] jewelry types (rings, amulets, belts)
    - [x] flask types (life, mana, hybrid, utility)
  - [x] affix system using item-affixes.json
    - [x] prefix pool (offensive modifiers)
    - [x] suffix pool (defensive modifiers)
    - [x] tier-based affix selection by item level
    - [x] affix value range rolling
  - [x] item rarity tiers
    - [x] normal: no affixes
    - [x] magic: 1 prefix and/or 1 suffix
    - [x] rare: up to 3 prefixes and 3 suffixes
    - [x] unique: fixed special modifiers (future)
  - [x] item level and requirement system
    - [x] item level determines available affixes
    - [x] stat requirements (str/dex/int) from base types
    - [x] level requirements from affixes
  - [x] unit tests for item generation
- [x] equipment system (2025-01-23)
  - [x] equipment slots
    - [x] main hand (all weapon types)
    - [x] off hand (shields, dual wield)
    - [x] helm, body armor, gloves, boots
    - [x] belt, amulet, ring left, ring right
  - [x] stat aggregation from equipment
    - [x] sum all affix modifiers
    - [x] apply percentage increases
    - [x] calculate final stats
  - [x] item comparison system
  - [x] unit tests for equipment bonuses
- [x] loot generation (2025-01-23)
  - [x] simplified archetype-based monster system (physical/caster/ranged/mixed)
  - [x] level-scaling currency drops (all currency available, exponentially weighted by level)
  - [x] rarity-based drop quantity scaling (normal 0-2, magic 1-3, rare 2-5, unique 3-7 items)
  - [x] cross-act monster registry system (define once, use everywhere)
  - [x] zone spawn table system (easy monster-to-zone mapping)
  - [x] IIQ/IIR affix support for rings/jewelry (quantity/rarity find modifiers)
  - [x] integration with combat engine (async loot generation on monster death)
  - [x] comprehensive unit tests with PoE validation (24 tests across 3 files, 114+ expect calls)

## phase 3: react client foundation
- [ ] react application setup
  - [ ] next.js or vite setup with typescript
  - [ ] tailwind css for styling
  - [ ] api client integration (fetch/axios)
  - [ ] zustand for client state management
  - [ ] react query for server state
- [ ] authentication & sessions
  - [ ] simple auth system (username-based)
  - [ ] session management with api
  - [ ] player selection screen
  - [ ] character creation flow
- [ ] basic ui components
  - [ ] button, input, modal components
  - [ ] game layout with sidebar
  - [ ] responsive design for desktop
  - [ ] loading states and error handling

## phase 4: game interface implementation
- [ ] character sheet view
  - [ ] stats display (life, mana, resistances)
  - [ ] equipment visualization
  - [ ] character class information
  - [ ] level/experience progress
- [ ] inventory management
  - [ ] grid-based inventory interface
  - [ ] item tooltips with affix information
  - [ ] item comparison overlays
  - [ ] drag and drop equipment
- [ ] combat interface
  - [ ] combat log display
  - [ ] action buttons (attack, move, skills)
  - [ ] position indicators
  - [ ] enemy health/status

## phase 5: game mechanics ui
- [ ] zone/area system
  - [ ] zone selection interface  
  - [ ] zone progression tracking
  - [ ] monster encounter ui
  - [ ] loot pickup interface
- [ ] flask system
  - [ ] 5 flask slots ui
  - [ ] flask types (life/mana/utility)
  - [ ] flask modifiers display
  - [ ] charge generation visualization
- [ ] skill system interface
  - [ ] active skill selection
  - [ ] skill tooltips and descriptions
  - [ ] mana cost indicators
  - [ ] cooldown timers

## phase 6: advanced features
- [ ] crafting interface
  - [ ] currency orb usage
  - [ ] crafting bench ui
  - [ ] item modification preview
  - [ ] crafting history/results
- [ ] progression systems
  - [ ] experience tracking
  - [ ] passive skill tree (simplified)
  - [ ] ascendancy selection
  - [ ] level-up notifications

## phase 7: endgame systems
- [ ] map system interface
  - [ ] map selection and modifiers
  - [ ] atlas progression tracking
  - [ ] map rewards display
- [ ] league mechanics ui
  - [ ] league content indicators
  - [ ] challenge tracking
  - [ ] league-specific interfaces

## phase 8: multiplayer features
- [ ] party system interface
  - [ ] party formation ui
  - [ ] shared experience display
  - [ ] party member status
- [ ] trading system
  - [ ] trade window interface
  - [ ] currency exchange ui
  - [ ] trade history tracking
- [ ] chat system
  - [ ] chat channels interface
  - [ ] whisper system
  - [ ] chat commands

## api architecture (current)

### endpoints available
- `GET /api/players` - list all players
- `POST /api/players` - create new player  
- `GET /api/players/:id` - get player data
- `PUT /api/players/:id` - update player data
- `GET /api/sessions/:id` - get session data
- `PUT /api/sessions/:id` - update session data
- `DELETE /api/sessions/:id` - end session
- `GET /health` - server health check

### database support
- **development**: sqlite with `DB_PATH=./data/shimlar.db`
- **production**: postgresql with full schema
- **sessions**: redis-backed with database fallback
- **cleanup**: automatic expired session/data cleanup

### current package structure
```
shimlar/
├── packages/
│   ├── core/                    # pure game logic
│   │   ├── src/
│   │   │   ├── entities/        # character, monster, item classes
│   │   │   ├── combat/          # damage calculations, formulas
│   │   │   ├── items/           # item generation, affixes
│   │   │   ├── components/      # entity components
│   │   │   ├── events/          # event system
│   │   │   └── zones/           # zone management
│   │   └── tests/               # comprehensive test suite (21 files)
│   │
│   ├── engine/                  # state management & persistence
│   │   ├── src/
│   │   │   ├── state/           # zustand store with persistence
│   │   │   └── persistence/     # database repository & types
│   │   └── tests/
│   │
│   ├── data/                    # game data files
│   │   ├── src/
│   │   │   ├── affixes/         # affix type definitions
│   │   │   └── monsters/        # monster archetypes
│   │   └── items/
│   │       └── affixes.json     # complete 11k+ line affix database
│   │
│   └── server/                  # rest api server
│       └── src/
│           └── index.ts         # bun server with cors support
```

## design principles

### react client architecture
- server-first state management (react query + zustand)
- component-based ui with proper separation of concerns
- responsive design optimized for desktop gameplay
- real-time updates through polling (websockets future)
- comprehensive error handling and loading states

### api integration  
- rest api for all game state operations
- optimistic updates where appropriate
- client-side caching with server reconciliation
- session management for persistent connections
- automatic retry and error recovery

### testing requirements
- unit tests for all game logic (maintained)
- react component testing with testing library
- api integration tests
- e2e testing for critical user flows
- visual regression testing for ui components

## current status
- **game logic**: complete and tested (278 passing tests)
- **persistence**: implemented with sqlite/postgresql + redis
- **api server**: functional with cors support
- **ready for**: react client development

the foundational systems are solid and ready for a web interface. all game mechanics (combat, items, loot, equipment) are working and thoroughly tested. the next major milestone is building the react application that consumes the api.