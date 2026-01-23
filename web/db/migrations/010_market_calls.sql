-- Flex Signal Network: Calls Tracking System
-- Migration 010: Market Calls
-- Created: 2026-01-23
-- 
-- Core table for tracking user predictions/calls with resolution and accuracy scoring.

-- 1. Market Calls Table
CREATE TABLE IF NOT EXISTS market_calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User info (supports both wallet and email auth)
    user_id VARCHAR(255) NOT NULL,  -- wallet address or user ID
    username VARCHAR(100),           -- display name for leaderboards
    
    -- Market info
    market_id VARCHAR(255) NOT NULL,        -- Polymarket/Kalshi ID or 'custom:xyz'
    market_title TEXT NOT NULL,
    market_slug VARCHAR(255),
    market_source VARCHAR(50) DEFAULT 'polymarket', -- 'polymarket', 'kalshi', 'custom'
    
    -- The Call
    direction VARCHAR(10) NOT NULL,         -- 'YES', 'NO', 'LONG', 'SHORT'
    confidence INTEGER NOT NULL CHECK (confidence >= 1 AND confidence <= 100),
    entry_price DECIMAL(10,4),              -- Market price at call time (0.00-1.00 for prediction markets)
    stake_points INTEGER DEFAULT 0,          -- Points wagered (optional)
    
    -- Reasoning (optional but valuable for content)
    thesis TEXT,                             -- Why they made this call
    
    -- Resolution
    status VARCHAR(20) DEFAULT 'PENDING',   -- 'PENDING', 'WON', 'LOST', 'PUSH', 'EXPIRED'
    exit_price DECIMAL(10,4),               -- Market price at resolution
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_note TEXT,
    
    -- Scoring
    points_earned INTEGER DEFAULT 0,        -- Points won/lost
    accuracy_impact DECIMAL(5,4),           -- How this affected user's accuracy
    
    -- Metadata
    is_public BOOLEAN DEFAULT TRUE,         -- Show on leaderboard
    is_featured BOOLEAN DEFAULT FALSE,      -- Highlighted call
    source_platform VARCHAR(20) DEFAULT 'web', -- 'web', 'roku', 'api'
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_calls_user ON market_calls(user_id);
CREATE INDEX IF NOT EXISTS idx_calls_market ON market_calls(market_id);
CREATE INDEX IF NOT EXISTS idx_calls_status ON market_calls(status);
CREATE INDEX IF NOT EXISTS idx_calls_created ON market_calls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_calls_featured ON market_calls(is_featured) WHERE is_featured = TRUE;

-- 2. Call Comments/Reactions (social layer)
CREATE TABLE IF NOT EXISTS call_reactions (
    id SERIAL PRIMARY KEY,
    call_id UUID REFERENCES market_calls(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    reaction_type VARCHAR(20) NOT NULL,     -- 'agree', 'disagree', 'fire', 'thinking'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(call_id, user_id)
);

-- 3. User Call Stats (materialized for performance)
CREATE TABLE IF NOT EXISTS user_call_stats (
    user_id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(100),
    
    -- Volume
    total_calls INTEGER DEFAULT 0,
    pending_calls INTEGER DEFAULT 0,
    resolved_calls INTEGER DEFAULT 0,
    
    -- Accuracy
    winning_calls INTEGER DEFAULT 0,
    losing_calls INTEGER DEFAULT 0,
    push_calls INTEGER DEFAULT 0,
    accuracy_rate DECIMAL(5,4) DEFAULT 0,   -- 0.0000 to 1.0000
    
    -- Streaks
    current_streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    streak_type VARCHAR(10) DEFAULT 'none', -- 'win', 'lose', 'none'
    
    -- Points
    total_points_earned INTEGER DEFAULT 0,
    total_points_lost INTEGER DEFAULT 0,
    net_points INTEGER DEFAULT 0,
    
    -- Ranking
    rank_tier VARCHAR(20) DEFAULT 'NOVICE', -- 'NOVICE', 'ANALYST', 'STRATEGIST', 'ORACLE', 'PROPHET'
    global_rank INTEGER,
    
    -- Metadata
    first_call_at TIMESTAMP WITH TIME ZONE,
    last_call_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_stats_accuracy ON user_call_stats(accuracy_rate DESC);
CREATE INDEX IF NOT EXISTS idx_stats_volume ON user_call_stats(total_calls DESC);
CREATE INDEX IF NOT EXISTS idx_stats_rank ON user_call_stats(global_rank);

-- 4. Function to update user stats after call resolution
CREATE OR REPLACE FUNCTION update_user_call_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_call_stats (user_id, username, total_calls, first_call_at, last_call_at)
    VALUES (NEW.user_id, NEW.username, 1, NOW(), NOW())
    ON CONFLICT (user_id) DO UPDATE SET
        total_calls = user_call_stats.total_calls + 1,
        last_call_at = NOW(),
        username = COALESCE(NEW.username, user_call_stats.username),
        updated_at = NOW();
    
    IF NEW.status IN ('WON', 'LOST', 'PUSH') AND OLD.status = 'PENDING' THEN
        UPDATE user_call_stats SET
            resolved_calls = resolved_calls + 1,
            winning_calls = winning_calls + CASE WHEN NEW.status = 'WON' THEN 1 ELSE 0 END,
            losing_calls = losing_calls + CASE WHEN NEW.status = 'LOST' THEN 1 ELSE 0 END,
            push_calls = push_calls + CASE WHEN NEW.status = 'PUSH' THEN 1 ELSE 0 END,
            accuracy_rate = CASE 
                WHEN (resolved_calls + 1) > 0 
                THEN (winning_calls + CASE WHEN NEW.status = 'WON' THEN 1 ELSE 0 END)::DECIMAL / (resolved_calls + 1)
                ELSE 0 
            END,
            total_points_earned = total_points_earned + GREATEST(NEW.points_earned, 0),
            total_points_lost = total_points_lost + ABS(LEAST(NEW.points_earned, 0)),
            net_points = net_points + NEW.points_earned,
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS trigger_new_call ON market_calls;
CREATE TRIGGER trigger_new_call
    AFTER INSERT ON market_calls
    FOR EACH ROW
    EXECUTE FUNCTION update_user_call_stats();

DROP TRIGGER IF EXISTS trigger_resolve_call ON market_calls;
CREATE TRIGGER trigger_resolve_call
    AFTER UPDATE OF status ON market_calls
    FOR EACH ROW
    WHEN (OLD.status = 'PENDING' AND NEW.status IN ('WON', 'LOST', 'PUSH'))
    EXECUTE FUNCTION update_user_call_stats();
