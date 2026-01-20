
export interface AlphaVector {
    timestamp: number;
    global_rank: number; // 0-100 score indicating overall market opportunity

    components: {
        momentum: number; // Price velocity & trend strength (0-100)
        social: number;   // Sentiment & mention volume (0-100)
        whale: number;    // Large holder accumulation/dispersion (0-100)
        risk: number;     // Inverse volatility/safety score (0-100, higher is safer)
    };

    // Deep-dive Social Analysis (Stage 3)
    social_analysis: {
        sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
        hype_score: number; // 0-100 (Hype vs Substance)
        narratives: string[]; // e.g., ["AI integration", "Tier 1 Listing"]
        volume_trend: 'UP' | 'DOWN' | 'FLAT';
    };

    // Specific asset recommendations based on the vector
    signals: AlphaSignal[];

    // Breakdown of the "Driver" - what is primarily moving the market?
    driver_breakdown: {
        primary_driver: 'MOMENTUM' | 'WHALE' | 'RISK_OFF' | 'FOMO';
        description: string;
    };
}

export interface AlphaSignal {
    asset: string;       // e.g., "SOL", "JUP"
    name: string;
    direction: 'LONG' | 'SHORT';
    confidence: number;  // 0-100
    reason: string;      // e.g., "Whale Accumulation +2.1σ"
    metrics: {
        volatility: number;
        volume_change: number;
    };
}

// User Profile for personalized tilts
export interface UserAlphaProfile {
    risk_tolerance: 'CONSERVATIVE' | 'MODERATE' | 'DEGEN';
    favorite_sectors: string[]; // e.g., ['ai', 'memes']
    holding_bias: 'Diversified' | 'Concentrated';
}
