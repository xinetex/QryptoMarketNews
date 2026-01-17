-- Prophet TV / QCrypto Channel Database Schema
-- Optimized for Supabase / Neon

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  tier TEXT DEFAULT 'free', -- free, pro, whale
  settings JSONB DEFAULT '{}'::jsonb
);

-- WATCHLISTS TABLE
CREATE TABLE IF NOT EXISTS watchlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  coin_id TEXT NOT NULL, -- CoinGecko ID
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  alert_price DECIMAL,
  UNIQUE(user_id, coin_id)
);

-- PORTFOLIO / HOLDINGS
CREATE TABLE IF NOT EXISTS holdings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  coin_id TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  avg_buy_price DECIMAL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- APP ANALYTICS / EVENTS
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT,
  event_name TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CACHED MARKET DATA (Optional, if moving off Redis)
CREATE TABLE IF NOT EXISTS market_cache (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE
);
