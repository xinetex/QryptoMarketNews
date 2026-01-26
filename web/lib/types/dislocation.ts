/**
 * Market Dislocation Types
 * Represents gaps between news sentiment and prediction market pricing.
 */

export interface DislocationSignal {
    id: string;
    timestamp: number;

    // The Gap
    score: number;           // 0-100 dislocation magnitude
    direction: 'BULLISH_GAP' | 'BEARISH_GAP';

    // News Side
    newsItem: {
        title: string;
        source: string;
        url: string;
        sentiment: number;     // -1 (bearish) to +1 (bullish)
        publishedAt: string;
        freshnessMinutes: number;
    };

    // Market Side  
    market: {
        id: string;
        title: string;
        yesPrice: number;      // 0-1 probability
        noPrice: number;
        volume: number;
        slug: string;
        eventSlug: string;
        endDate: string;
    };

    // Context
    narrative: string;       // AI-generated explanation of the gap
    conviction: 'HIGH' | 'MEDIUM' | 'LOW';
    actionableWindow: string; // e.g., "~2 hours before market catches up"

    // Trending Bias (TSMOM)
    trend?: {
        direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
        score: number;
        consensus: number;
    };

    // Matching metadata
    matchedKeywords: string[];
    correlationConfidence: number; // 0-1 how confident we are in the news-market link
}

export interface DislocationMeta {
    generatedAt: number;
    newsSourcesScanned: number;
    marketsScanned: number;
    signalCount: number;
    avgDislocationScore: number;
}

export interface DislocationResponse {
    signals: DislocationSignal[];
    meta: DislocationMeta;
}

// Keywords/entities to match news to markets
export interface MarketMatcher {
    marketId: string;
    marketTitle: string;
    keywords: string[];
    category: 'crypto' | 'politics' | 'economy' | 'tech' | 'sports' | 'general';
}
