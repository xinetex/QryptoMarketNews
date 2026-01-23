-- Flex Signal Network: Daily Briefings
-- Migration 011: Daily Briefings Table
-- Created: 2026-01-23

CREATE TABLE IF NOT EXISTS daily_briefings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL UNIQUE DEFAULT CURRENT_DATE,
    
    -- Content
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    content TEXT NOT NULL, -- Markdown content
    
    -- Sources used
    key_narratives TEXT[],
    token_tickers TEXT[],
    
    -- Metadata
    model_used VARCHAR(50) DEFAULT 'sonar-reasoning-pro',
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    is_published BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_briefings_date ON daily_briefings(date DESC);
