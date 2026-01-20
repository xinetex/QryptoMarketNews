-- Prophet Intelligence: Market News & Alpha Scores
-- Stores scraped/RSS news with AI-enriched sentiment and alpha scores

CREATE TABLE IF NOT EXISTS market_news (
    id TEXT PRIMARY KEY, -- URL hash or Source ID
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    source TEXT NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- AI Enrichment
    sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral', 'BULLISH', 'BEARISH')),
    alpha_score INTEGER CHECK (alpha_score >= 0 AND alpha_score <= 100), -- 0-100 Prophet Score
    key_assets JSONB DEFAULT '[]'::jsonb, -- e.g. ["BTC", "SOL"]
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast retrieval of latest high-alpha news
CREATE INDEX IF NOT EXISTS idx_market_news_alpha_published ON market_news(published_at DESC, alpha_score DESC);
