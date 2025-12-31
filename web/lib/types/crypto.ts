// Crypto Types for CoinGecko API

export interface CoinPrice {
    id: string;
    symbol: string;
    name: string;
    current_price: number;
    price_change_percentage_24h: number;
    market_cap: number;
    market_cap_rank: number;
    image: string;
}

export interface TickerData {
    symbol: string;
    price: number;
    change24h: number;
    isPositive: boolean;
}

export interface CategoryData {
    id: string;
    name: string;
    market_cap_change_24h: number;
    volume_24h: number;
    top_3_coins: string[];
}

export interface ZoneData {
    id: string;
    name: string;
    change: string;
    isPositive: boolean;
    icon: string;
    color: string;
}

// CoinGecko API Response Types
export interface CoinGeckoMarketResponse {
    id: string;
    symbol: string;
    name: string;
    image: string;
    current_price: number;
    market_cap: number;
    market_cap_rank: number;
    fully_diluted_valuation: number | null;
    total_volume: number;
    high_24h: number;
    low_24h: number;
    price_change_24h: number;
    price_change_percentage_24h: number;
    market_cap_change_24h: number;
    market_cap_change_percentage_24h: number;
    circulating_supply: number;
    total_supply: number | null;
    max_supply: number | null;
    ath: number;
    ath_change_percentage: number;
    ath_date: string;
    atl: number;
    atl_change_percentage: number;
    atl_date: string;
    last_updated: string;
    sparkline_in_7d?: {
        price: number[];
    };
    // Optional extended fields from CoinGecko detailed API
    liquidity_score?: number;
    sentiment_votes_up_percentage?: number;
    sentiment_votes_down_percentage?: number;
}

export interface CoinGeckoCategoryResponse {
    id: string;
    name: string;
    market_cap: number;
    market_cap_change_24h: number;
    content: string;
    top_3_coins: string[];
    volume_24h: number;
    updated_at: string;
}
