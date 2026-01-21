-- Prophet Points: Expanded Schema Migration
-- Migration 009: Prophet Points v2 (The Oracle System)
-- Created: 2026-01-20

-- 1. Expand user_points table with Oracle tier system fields
ALTER TABLE user_points ADD COLUMN IF NOT EXISTS tier VARCHAR(20) DEFAULT 'Initiate';
ALTER TABLE user_points ADD COLUMN IF NOT EXISTS tier_color VARCHAR(10) DEFAULT '#71717a';
ALTER TABLE user_points ADD COLUMN IF NOT EXISTS multiplier DECIMAL(3,2) DEFAULT 1.0;
ALTER TABLE user_points ADD COLUMN IF NOT EXISTS accuracy_score DECIMAL(5,2) DEFAULT 0;
ALTER TABLE user_points ADD COLUMN IF NOT EXISTS predictions_total INTEGER DEFAULT 0;
ALTER TABLE user_points ADD COLUMN IF NOT EXISTS predictions_correct INTEGER DEFAULT 0;
ALTER TABLE user_points ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
ALTER TABLE user_points ADD COLUMN IF NOT EXISTS best_streak INTEGER DEFAULT 0;
ALTER TABLE user_points ADD COLUMN IF NOT EXISTS lifetime_watch_minutes INTEGER DEFAULT 0;
ALTER TABLE user_points ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0;
ALTER TABLE user_points ADD COLUMN IF NOT EXISTS referred_by VARCHAR(255);
ALTER TABLE user_points ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Point Events Log (granular tracking)
CREATE TABLE IF NOT EXISTS point_events (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(255) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    points_awarded INTEGER NOT NULL,
    multiplier_applied DECIMAL(3,2) DEFAULT 1.0,
    platform VARCHAR(20) DEFAULT 'web', -- 'roku', 'web', 'mobile'
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_point_events_wallet ON point_events(wallet_address);
CREATE INDEX IF NOT EXISTS idx_point_events_type ON point_events(event_type);
CREATE INDEX IF NOT EXISTS idx_point_events_created ON point_events(created_at);

-- 3. Achievement Badges
CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(255) NOT NULL,
    badge_id VARCHAR(50) NOT NULL,
    badge_name VARCHAR(100) NOT NULL,
    badge_icon VARCHAR(10) DEFAULT '🏅',
    rarity VARCHAR(20) DEFAULT 'common', -- common, uncommon, rare, epic, legendary
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(wallet_address, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_achievements_wallet ON achievements(wallet_address);

-- 4. Daily Challenges
CREATE TABLE IF NOT EXISTS daily_challenges (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(255) NOT NULL,
    challenge_date DATE NOT NULL,
    challenge_1_type VARCHAR(50) NOT NULL,
    challenge_1_target INTEGER NOT NULL,
    challenge_1_progress INTEGER DEFAULT 0,
    challenge_1_complete BOOLEAN DEFAULT FALSE,
    challenge_2_type VARCHAR(50) NOT NULL,
    challenge_2_target INTEGER NOT NULL,
    challenge_2_progress INTEGER DEFAULT 0,
    challenge_2_complete BOOLEAN DEFAULT FALSE,
    challenge_3_type VARCHAR(50) NOT NULL,
    challenge_3_target INTEGER NOT NULL,
    challenge_3_progress INTEGER DEFAULT 0,
    challenge_3_complete BOOLEAN DEFAULT FALSE,
    bonus_claimed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(wallet_address, challenge_date)
);

-- 5. Roku Device Sessions (watch time tracking)
CREATE TABLE IF NOT EXISTS roku_sessions (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(100) NOT NULL,
    wallet_address VARCHAR(255), -- nullable until linked
    session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_end TIMESTAMP WITH TIME ZONE,
    watch_minutes INTEGER DEFAULT 0,
    points_awarded INTEGER DEFAULT 0,
    synced BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_roku_sessions_device ON roku_sessions(device_id);
CREATE INDEX IF NOT EXISTS idx_roku_sessions_wallet ON roku_sessions(wallet_address);

-- 6. Leaderboard Snapshots (for weekly resets)
CREATE TABLE IF NOT EXISTS leaderboard_snapshots (
    id SERIAL PRIMARY KEY,
    snapshot_type VARCHAR(20) NOT NULL, -- 'weekly', 'monthly', 'alltime'
    wallet_address VARCHAR(255) NOT NULL,
    rank INTEGER NOT NULL,
    points INTEGER NOT NULL,
    accuracy DECIMAL(5,2),
    snapshot_date DATE NOT NULL,
    UNIQUE(snapshot_type, wallet_address, snapshot_date)
);

-- 7. Referral Tracking
CREATE TABLE IF NOT EXISTS referrals (
    id SERIAL PRIMARY KEY,
    referrer_wallet VARCHAR(255) NOT NULL,
    referred_wallet VARCHAR(255) NOT NULL,
    referrer_points_awarded INTEGER DEFAULT 0,
    referred_made_prediction BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(referred_wallet)
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_wallet);
