# multiplayer architecture notes

## current state
the game is designed with multiplayer in mind but currently implements single-player only. the architecture supports scaling to 1000+ concurrent players with minimal changes.

## what works for multiplayer already

1. **zone instancing** - each player has their own zone instances (no shared world state)
2. **pure game logic** - all mechanics are stateless functions
3. **event system** - isolated per player, no global events
4. **entity system** - each player has separate entities

## required changes for multiplayer

### 1. add persistence layer
```typescript
// currently: in-memory only
// needed: database persistence

interface PlayerPersistence {
  savePlayer(playerId: string, data: PlayerState): Promise<void>;
  loadPlayer(playerId: string): Promise<PlayerState>;
  saveZoneState(instanceId: string, zone: Zone): Promise<void>;
}

// implementation options:
// - postgresql for relational data
// - mongodb for document storage
// - redis for session caching
```

### 2. server-side sessions
```typescript
// move game state from client to server
class PlayerSession {
  playerId: string;
  playerEntity: Entity;
  currentZone: Zone;
  lastAction: number;
  
  // process client actions
  async processAction(action: GameAction) {
    // validate action
    // update state
    // persist changes
    // broadcast to client
  }
}
```

### 3. client-server protocol
```typescript
// websocket messages
interface ClientMessage {
  type: "MOVE" | "ATTACK" | "USE_ITEM" | "ENTER_ZONE";
  payload: any;
}

interface ServerMessage {
  type: "STATE_UPDATE" | "COMBAT_LOG" | "ITEM_DROP";
  payload: any;
}
```

### 4. stateless server design
```typescript
// servers don't hold permanent state
class GameServer {
  // on player connect:
  async handleConnect(playerId: string) {
    const playerData = await db.loadPlayer(playerId);
    const session = new PlayerSession(playerData);
    this.sessions.set(playerId, session);
  }
  
  // on player disconnect:
  async handleDisconnect(playerId: string) {
    const session = this.sessions.get(playerId);
    await db.savePlayer(playerId, session.getState());
    this.sessions.delete(playerId);
  }
}
```

## scaling strategy

### horizontal scaling (multiple servers)
```
Load Balancer
├── Server 1 (handles players A-F)
├── Server 2 (handles players G-M)
├── Server 3 (handles players N-S)
└── Server 4 (handles players T-Z)

Shared Database (PostgreSQL/MongoDB)
```

### memory requirements
- per player: ~20kb active memory
- 1000 players: ~20mb ram
- with caching: ~100mb ram
- database: ~1mb per player saved data

### party system considerations
when players party together:
1. they share zone instances
2. party leader's server handles the instance
3. other players connect to leader's server for that zone
4. or: dedicated party servers

## implementation phases

### phase 1: single server multiplayer
- add postgresql for persistence
- implement websocket server
- move game state to server
- basic authentication

### phase 2: horizontal scaling
- add redis for session management
- implement server clustering
- load balancer setup
- server-to-server communication for parties

### phase 3: optimization
- connection pooling
- database query optimization
- caching layer
- cdn for static assets

## performance targets
- 100ms max latency for actions
- 60 ticks per second combat
- 1000 concurrent players per server
- 99.9% uptime

## what doesn't change
- core game mechanics
- entity-component system
- zone instancing model
- combat formulas
- item generation

the current architecture is solid for multiplayer. the main work is adding persistence and moving state management from client to server.