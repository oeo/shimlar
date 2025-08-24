/**
 * repository for game state persistence using postgresql and redis
 */

import { Database } from "bun:sqlite";
import { SerializablePlayerState, GameSessionData, PlayerRecord, GameSessionRecord } from "./types";

export class GameStateRepository {
  private db: Database;
  private redis?: any; // redis client when available
  
  constructor(dbPath: string, redisClient?: any) {
    this.db = new Database(dbPath);
    this.redis = redisClient;
    this.initializeSchema();
  }
  
  private initializeSchema(): void {
    // create tables if they don't exist
    this.db.run(`
      CREATE TABLE IF NOT EXISTS players (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        character_class TEXT NOT NULL,
        level INTEGER NOT NULL DEFAULT 1,
        experience INTEGER NOT NULL DEFAULT 0,
        stats_data TEXT NOT NULL,
        health_data TEXT NOT NULL,
        equipment_data TEXT NOT NULL DEFAULT '{}',
        inventory_data TEXT NOT NULL DEFAULT '[]',
        current_zone_id TEXT NOT NULL DEFAULT 'town',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_active_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    this.db.run(`
      CREATE TABLE IF NOT EXISTS game_sessions (
        id TEXT PRIMARY KEY,
        player_id TEXT NOT NULL,
        session_data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL,
        FOREIGN KEY (player_id) REFERENCES players (id)
      )
    `);
    
    // create indexes
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_players_last_active ON players(last_active_at)`);
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_sessions_expires ON game_sessions(expires_at)`);
  }
  
  // player persistence methods
  async savePlayer(playerState: SerializablePlayerState): Promise<void> {
    const now = new Date().toISOString();
    const record = {
      id: playerState.id,
      name: playerState.name,
      character_class: playerState.characterClass,
      level: playerState.level,
      experience: playerState.experience,
      stats_data: JSON.stringify(playerState.stats),
      health_data: JSON.stringify(playerState.health),
      equipment_data: JSON.stringify(playerState.equipment),
      inventory_data: JSON.stringify(playerState.inventory),
      current_zone_id: playerState.currentZoneId,
      updated_at: now,
      last_active_at: now
    };
    
    // upsert player data
    this.db.run(`
      INSERT INTO players (
        id, name, character_class, level, experience, 
        stats_data, health_data, equipment_data, inventory_data,
        current_zone_id, updated_at, last_active_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        character_class = excluded.character_class,
        level = excluded.level,
        experience = excluded.experience,
        stats_data = excluded.stats_data,
        health_data = excluded.health_data,
        equipment_data = excluded.equipment_data,
        inventory_data = excluded.inventory_data,
        current_zone_id = excluded.current_zone_id,
        updated_at = excluded.updated_at,
        last_active_at = excluded.last_active_at
    `, [
      record.id,
      record.name,
      record.character_class,
      record.level,
      record.experience,
      record.stats_data,
      record.health_data,
      record.equipment_data,
      record.inventory_data,
      record.current_zone_id,
      record.updated_at,
      record.last_active_at
    ]);
  }
  
  async loadPlayer(playerId: string): Promise<SerializablePlayerState | null> {
    const record = this.db.query(`
      SELECT * FROM players WHERE id = $id
    `).get({ id: playerId }) as PlayerRecord | null;
    
    if (!record) return null;
    
    return {
      id: record.id,
      name: record.name,
      characterClass: record.character_class,
      level: record.level,
      experience: record.experience,
      currentZoneId: record.current_zone_id,
      position: "melee", // default position
      stats: JSON.parse(record.stats_data),
      health: JSON.parse(record.health_data),
      equipment: JSON.parse(record.equipment_data),
      inventory: JSON.parse(record.inventory_data),
      createdAt: new Date(record.created_at).getTime(),
      lastActiveAt: new Date(record.last_active_at).getTime()
    };
  }
  
  // session persistence (redis-backed for speed)
  async saveSession(sessionData: GameSessionData): Promise<void> {
    if (this.redis) {
      // store in redis with ttl
      const key = `session:${sessionData.sessionId}`;
      await this.redis.setex(key, 3600, JSON.stringify(sessionData)); // 1 hour ttl
    } else {
      // fallback to database
      const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour from now
      
      this.db.run(`
        INSERT INTO game_sessions (id, player_id, session_data, expires_at)
        VALUES ($id, $player_id, $session_data, $expires_at)
        ON CONFLICT(id) DO UPDATE SET
          session_data = $session_data,
          expires_at = $expires_at
      `, {
        id: sessionData.sessionId,
        player_id: sessionData.playerId,
        session_data: JSON.stringify(sessionData),
        expires_at: expiresAt
      });
    }
  }
  
  async loadSession(sessionId: string): Promise<GameSessionData | null> {
    if (this.redis) {
      const key = `session:${sessionId}`;
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } else {
      const record = this.db.query(`
        SELECT session_data FROM game_sessions 
        WHERE id = $id AND expires_at > datetime('now')
      `).get({ id: sessionId }) as GameSessionRecord | null;
      
      return record ? JSON.parse(record.session_data) : null;
    }
  }
  
  async deleteSession(sessionId: string): Promise<void> {
    if (this.redis) {
      await this.redis.del(`session:${sessionId}`);
    } else {
      this.db.run(`DELETE FROM game_sessions WHERE id = $id`, { id: sessionId });
    }
  }
  
  // cleanup expired sessions (database only)
  async cleanupExpiredSessions(): Promise<void> {
    this.db.run(`DELETE FROM game_sessions WHERE expires_at <= datetime('now')`);
  }
  
  // utility methods
  async getPlayerList(): Promise<Array<{id: string, name: string, level: number, lastActive: Date}>> {
    const records = this.db.query(`
      SELECT id, name, level, last_active_at 
      FROM players 
      ORDER BY last_active_at DESC 
      LIMIT 50
    `).all() as Array<{id: string, name: string, level: number, last_active_at: string}>;
    
    return records.map(r => ({
      id: r.id,
      name: r.name,
      level: r.level,
      lastActive: new Date(r.last_active_at)
    }));
  }
}