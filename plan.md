current focus: remaining core game features

## completed foundation (330 passing tests)
- [x] core game mechanics (combat, items, loot, zones)
- [x] monorepo architecture with flat package structure
- [x] persistent api server with sqlite/postgresql + redis
- [x] path of exile accurate item/loot systems
- [x] comprehensive test coverage across all systems

## completed systems (detailed info in architecture.md)
- [x] combat engine with tick-based mechanics & dot system
- [x] item & equipment system with path of exile accuracy
- [x] loot generation with monster archetypes
- [x] zone system with procedural generation & waypoints
- [x] character system with 7 classes & attributes
- [x] persistence layer with sqlite/postgresql support

## core game features
- [ ] unique items with fixed affixes
- [ ] add zone affixes
- [ ] finish derived character calculation using all affixes combined
- [ ] socket & gem system (like path of exile)
- [ ] passive skill tree and progression
- [ ] crafting system with currency orbs
- [ ] endgame mapping system

## react client features
- [ ] react client foundation
  - [ ] next.js/vite setup with tailwind
  - [ ] api client integration with zustand
  - [ ] character sheet interface
  - [ ] inventory management ui
  - [ ] basic combat interface

## technical information

### api endpoints
- `GET /api/players` - list all players
- `POST /api/players` - create new player
- `GET /api/players/:id` - get player data
- `PUT /api/players/:id` - update player data
- `GET /health` - server health check

### configuration
- **development**: `DB_PATH=./data/shimlar.db bun run server` (sqlite)
- **production**: `DATABASE_URL=postgresql://... bun run server`

### current status
- **330 passing tests** validate all game mechanics
- **path of exile accurate** item/loot systems
- **ready for react client** - backend systems complete

detailed feature specifications available in docs/game-design.md
