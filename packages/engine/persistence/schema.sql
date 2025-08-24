-- PostgreSQL schema for Shimlar game state persistence
-- This schema supports both SQLite (for development) and PostgreSQL (for production)

-- Players table - core character data
CREATE TABLE IF NOT EXISTS players (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    character_class VARCHAR(50) NOT NULL,
    level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1 AND level <= 100),
    experience BIGINT NOT NULL DEFAULT 0 CHECK (experience >= 0),
    
    -- character stats (json)
    stats_data TEXT NOT NULL, -- {"strength": 20, "dexterity": 20, "intelligence": 20}
    health_data TEXT NOT NULL, -- {"current": 100, "maximum": 100, "regenerationRate": 2}
    
    -- items and equipment (json)
    equipment_data TEXT NOT NULL DEFAULT '{}', -- equipped items by slot
    inventory_data TEXT NOT NULL DEFAULT '[]', -- inventory items array
    
    -- world state
    current_zone_id VARCHAR(100) NOT NULL DEFAULT 'town',
    
    -- timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Game sessions table - active session tracking
CREATE TABLE IF NOT EXISTS game_sessions (
    id VARCHAR(255) PRIMARY KEY,
    player_id VARCHAR(255) NOT NULL,
    session_data TEXT NOT NULL, -- full session state as json
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

-- Player inventory table - normalized item storage (optional, for complex queries)
CREATE TABLE IF NOT EXISTS player_items (
    id SERIAL PRIMARY KEY,
    player_id VARCHAR(255) NOT NULL,
    item_data TEXT NOT NULL, -- complete item json
    slot_type VARCHAR(50), -- 'inventory', 'equipment', 'stash'
    slot_position INTEGER, -- position in inventory or equipment slot name
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

-- Zone instances table - persistent world state
CREATE TABLE IF NOT EXISTS zone_instances (
    id VARCHAR(255) PRIMARY KEY,
    zone_id VARCHAR(100) NOT NULL,
    owner_player_id VARCHAR(255), -- player who created this instance
    instance_data TEXT NOT NULL, -- zone state as json
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP, -- for temporary instances
    
    FOREIGN KEY (owner_player_id) REFERENCES players(id) ON DELETE SET NULL
);

-- Combat logs table - for analytics and debugging
CREATE TABLE IF NOT EXISTS combat_logs (
    id SERIAL PRIMARY KEY,
    player_id VARCHAR(255) NOT NULL,
    zone_id VARCHAR(100) NOT NULL,
    combat_data TEXT NOT NULL, -- complete combat log as json
    duration_ms INTEGER, -- combat duration in milliseconds
    result VARCHAR(20), -- 'victory', 'defeat', 'fled'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_players_last_active ON players(last_active_at DESC);
CREATE INDEX IF NOT EXISTS idx_players_level ON players(level DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON game_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_player ON game_sessions(player_id);
CREATE INDEX IF NOT EXISTS idx_items_player ON player_items(player_id);
CREATE INDEX IF NOT EXISTS idx_zones_owner ON zone_instances(owner_player_id);
CREATE INDEX IF NOT EXISTS idx_zones_expires ON zone_instances(expires_at);
CREATE INDEX IF NOT EXISTS idx_combat_player ON combat_logs(player_id);

-- Cleanup procedures (PostgreSQL specific)
-- Automatically clean up expired sessions and temporary zones
CREATE OR REPLACE FUNCTION cleanup_expired_data() RETURNS void AS $$
BEGIN
    -- Remove expired sessions
    DELETE FROM game_sessions WHERE expires_at < NOW();
    
    -- Remove expired zone instances
    DELETE FROM zone_instances WHERE expires_at IS NOT NULL AND expires_at < NOW();
    
    -- Remove old combat logs (keep last 1000 per player)
    DELETE FROM combat_logs 
    WHERE id NOT IN (
        SELECT id FROM (
            SELECT id, ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY created_at DESC) as rn
            FROM combat_logs
        ) ranked WHERE rn <= 1000
    );
END;
$$ LANGUAGE plpgsql;

-- Example trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS trigger AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_players_updated_at 
    BEFORE UPDATE ON players 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Example queries for common operations:

-- Get top players by level
-- SELECT name, character_class, level, last_active_at FROM players ORDER BY level DESC, experience DESC LIMIT 10;

-- Get active sessions count
-- SELECT COUNT(*) FROM game_sessions WHERE expires_at > NOW();

-- Get player with full data
-- SELECT p.*, COALESCE(s.session_data, '{}') as current_session 
-- FROM players p 
-- LEFT JOIN game_sessions s ON p.id = s.player_id AND s.expires_at > NOW()
-- WHERE p.id = $1;

-- Clean up expired data (run periodically)
-- SELECT cleanup_expired_data();