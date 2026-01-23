/**
 * Market Dislocation Engine
 * 
 * The brain that spots gaps between prediction market prices and breaking news reality.
 * This is the edge that top Polymarket traders use to profit.
 * 
 * Core Formula:
 * dislocation = |newsSentiment - marketImpliedSentiment| × freshnessWeight × volumeWeight
 */

import { DislocationSignal, DislocationMeta, DislocationResponse, MarketMatcher } from './types/dislocation';
import { getLatestNews } from './news';
import { getTopMarkets, PolyMarket } from './polymarket';
import type { NewsItem } from './types/news';

// Weights for dislocation scoring
const WEIGHTS = {
    FRESHNESS_DECAY: 0.1,      // Score decays 10% per 10 minutes
    VOLUME_BOOST: 1.5,         // High volume markets get 1.5x weight
    MIN_CORRELATION: 0.3,      // Minimum keyword match confidence to consider
    DISLOCATION_THRESHOLD: 25, // Minimum score to surface as actionable
};

/**
 * Main entry point - detects all active dislocations
 */
export async function detectDislocations(): Promise<DislocationResponse> {
    const startTime = Date.now();

    // 1. Fetch data sources in parallel
    const [news, markets] = await Promise.all([
        getLatestNews(),
        getTopMarkets(30),
    ]);

    // 2. Build market matchers (extract searchable keywords from market titles)
    const matchers = buildMarketMatchers(markets);

    // 3. Correlate each news item to potential markets
    const signals: DislocationSignal[] = [];

    for (const newsItem of news) {
        const correlations = correlateNewsToMarkets(newsItem, matchers, markets);

        for (const correlation of correlations) {
            const signal = calculateDislocationSignal(newsItem, correlation.market, correlation.subMarket, correlation.confidence, correlation.keywords);

            if (signal && signal.score >= WEIGHTS.DISLOCATION_THRESHOLD) {
                signals.push(signal);
            }
        }
    }

    // 4. Rank by opportunity (magnitude × freshness × confidence)
    const rankedSignals = rankByOpportunity(signals);

    // 5. Build response
    const meta: DislocationMeta = {
        generatedAt: startTime,
        newsSourcesScanned: news.length,
        marketsScanned: markets.length,
        signalCount: rankedSignals.length,
        avgDislocationScore: rankedSignals.length > 0
            ? rankedSignals.reduce((sum, s) => sum + s.score, 0) / rankedSignals.length
            : 0,
    };

    return { signals: rankedSignals.slice(0, 10), meta }; // Top 10 signals
}

/**
 * Build keyword matchers from market titles
 */
function buildMarketMatchers(markets: PolyMarket[]): MarketMatcher[] {
    const matchers: MarketMatcher[] = [];

    for (const event of markets) {
        for (const market of event.markets || []) {
            // Extract keywords from market question
            const keywords = extractKeywords(market.question || event.title);
            const category = detectCategory(event.category, market.question || event.title);

            matchers.push({
                marketId: market.id,
                marketTitle: market.question || event.title,
                keywords,
                category,
            });
        }
    }

    return matchers;
}

/**
 * Extract searchable keywords from text
 */
function extractKeywords(text: string): string[] {
    const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'will', 'be', 'to', 'in', 'on', 'at', 'by', 'for', 'of', 'and', 'or', 'if', 'than', 'before', 'after', 'yes', 'no']);

    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 2 && !stopWords.has(word))
        .slice(0, 10); // Top 10 keywords
}

/**
 * Detect market category
 */
function detectCategory(apiCategory: string, text: string): MarketMatcher['category'] {
    const lower = (apiCategory + ' ' + text).toLowerCase();

    if (/bitcoin|ethereum|crypto|token|defi|nft|solana|btc|eth/.test(lower)) return 'crypto';
    if (/trump|biden|election|congress|senate|vote|political/.test(lower)) return 'politics';
    if (/fed|rate|inflation|gdp|economy|recession|market/.test(lower)) return 'economy';
    if (/ai|tech|apple|google|nvidia|openai|microsoft/.test(lower)) return 'tech';
    if (/nba|nfl|soccer|sports|game|championship/.test(lower)) return 'sports';

    return 'general';
}

/**
 * Find markets that correlate with a news item
 */
function correlateNewsToMarkets(
    news: NewsItem,
    matchers: MarketMatcher[],
    markets: PolyMarket[]
): { market: PolyMarket; subMarket: PolyMarket['markets'][0]; confidence: number; keywords: string[] }[] {
    const newsKeywords = extractKeywords(news.title);
    const correlations: { market: PolyMarket; subMarket: PolyMarket['markets'][0]; confidence: number; keywords: string[] }[] = [];

    for (const matcher of matchers) {
        // Count keyword overlaps
        const matchedKeywords = newsKeywords.filter(k => matcher.keywords.includes(k));
        const confidence = matchedKeywords.length / Math.max(newsKeywords.length, matcher.keywords.length);

        if (confidence >= WEIGHTS.MIN_CORRELATION) {
            // Find the parent market event
            const parentMarket = markets.find(m => m.markets?.some(sub => sub.id === matcher.marketId));
            const subMarket = parentMarket?.markets?.find(sub => sub.id === matcher.marketId);

            if (parentMarket && subMarket) {
                correlations.push({
                    market: parentMarket,
                    subMarket,
                    confidence,
                    keywords: matchedKeywords,
                });
            }
        }
    }

    return correlations;
}

/**
 * Calculate dislocation signal between news and market
 */
function calculateDislocationSignal(
    news: NewsItem,
    market: PolyMarket,
    subMarket: PolyMarket['markets'][0],
    correlationConfidence: number,
    matchedKeywords: string[]
): DislocationSignal | null {
    // 1. Get news sentiment (-1 to +1)
    const newsSentiment = sentimentToScore(news.sentiment);

    // 2. Get market implied sentiment from YES price
    const yesPrices = subMarket.outcomePrices || ['0.5', '0.5'];
    const yesPrice = parseFloat(yesPrices[0]) || 0.5;
    const noPrice = parseFloat(yesPrices[1]) || 0.5;

    // Map price to sentiment: 0.9 YES = very bullish (+0.8), 0.1 YES = very bearish (-0.8)
    const marketSentiment = (yesPrice - 0.5) * 2;

    // 3. Calculate raw dislocation
    const rawDislocation = Math.abs(newsSentiment - marketSentiment);

    // 4. Apply weights
    const freshnessMinutes = calculateFreshnessMinutes(news.published);
    const freshnessWeight = Math.max(0.2, 1 - (freshnessMinutes * WEIGHTS.FRESHNESS_DECAY / 60));

    const volumeWeight = market.volume > 1000000 ? WEIGHTS.VOLUME_BOOST : 1;

    // 5. Final score (0-100)
    const score = Math.min(100, Math.round(rawDislocation * 50 * freshnessWeight * volumeWeight * (1 + correlationConfidence)));

    if (score < 10) return null;

    // 6. Determine direction
    const direction: DislocationSignal['direction'] = newsSentiment > marketSentiment ? 'BULLISH_GAP' : 'BEARISH_GAP';

    // 7. Generate narrative
    const narrative = generateNarrative(news, market, subMarket, newsSentiment, marketSentiment, direction);

    // 8. Determine conviction level
    const conviction: DislocationSignal['conviction'] =
        score >= 60 ? 'HIGH' : score >= 40 ? 'MEDIUM' : 'LOW';

    // 9. Estimate actionable window
    const actionableWindow = estimateActionableWindow(freshnessMinutes, market.volume);

    return {
        id: `disloc_${news.id}_${subMarket.id}`,
        timestamp: Date.now(),
        score,
        direction,
        newsItem: {
            title: news.title,
            source: news.source,
            url: news.url,
            sentiment: newsSentiment,
            publishedAt: news.published,
            freshnessMinutes,
        },
        market: {
            id: subMarket.id,
            title: subMarket.question || market.title,
            yesPrice,
            noPrice,
            volume: market.volume,
            slug: market.slug,
            eventSlug: market.slug,
            endDate: market.endDate,
        },
        narrative,
        conviction,
        actionableWindow,
        matchedKeywords,
        correlationConfidence,
    };
}

/**
 * Convert sentiment string to numeric score
 */
function sentimentToScore(sentiment: 'positive' | 'negative' | 'neutral' | 'BULLISH' | 'BEARISH' | undefined): number {
    if (sentiment === 'positive' || sentiment === 'BULLISH') return 0.6;
    if (sentiment === 'negative' || sentiment === 'BEARISH') return -0.6;
    return 0;
}

/**
 * Calculate minutes since news was published
 */
function calculateFreshnessMinutes(published: string): number {
    // Handle relative times like "2h ago", "30m ago"
    const match = published.match(/(\d+)(m|h|d)/);
    if (match) {
        const value = parseInt(match[1]);
        const unit = match[2];
        if (unit === 'm') return value;
        if (unit === 'h') return value * 60;
        if (unit === 'd') return value * 60 * 24;
    }

    // Try parsing as date
    try {
        const date = new Date(published);
        if (!isNaN(date.getTime())) {
            return Math.floor((Date.now() - date.getTime()) / (1000 * 60));
        }
    } catch { }

    return 60; // Default to 1 hour
}

/**
 * Generate human-readable narrative explaining the dislocation
 */
function generateNarrative(
    news: NewsItem,
    market: PolyMarket,
    subMarket: PolyMarket['markets'][0],
    newsSentiment: number,
    marketSentiment: number,
    direction: DislocationSignal['direction']
): string {
    const yesPrice = parseFloat(subMarket.outcomePrices?.[0] || '0.5');
    const yesPct = Math.round(yesPrice * 100);

    const sentimentWord = newsSentiment > 0.3 ? 'bullish' : newsSentiment < -0.3 ? 'bearish' : 'neutral';
    const gapWord = direction === 'BULLISH_GAP' ? 'underpricing' : 'overpricing';

    return `Breaking ${sentimentWord} news from ${news.source} suggests the market may be ${gapWord} this outcome. Current YES price: ${yesPct}%. If the news thesis plays out, expect price movement in ${direction === 'BULLISH_GAP' ? 'upward' : 'downward'} direction.`;
}

/**
 * Estimate how long the opportunity window lasts
 */
function estimateActionableWindow(freshnessMinutes: number, volume: number): string {
    // High volume markets react faster
    const baseWindow = volume > 5000000 ? 30 : volume > 1000000 ? 60 : 120;
    const remainingMinutes = Math.max(5, baseWindow - freshnessMinutes);

    if (remainingMinutes < 30) return `~${remainingMinutes} minutes`;
    if (remainingMinutes < 120) return `~${Math.round(remainingMinutes / 30) * 30} minutes`;
    return `~${Math.round(remainingMinutes / 60)} hours`;
}

/**
 * Rank signals by opportunity quality
 */
function rankByOpportunity(signals: DislocationSignal[]): DislocationSignal[] {
    return signals.sort((a, b) => {
        // Primary: score
        if (b.score !== a.score) return b.score - a.score;

        // Secondary: freshness (lower is better)
        if (a.newsItem.freshnessMinutes !== b.newsItem.freshnessMinutes) {
            return a.newsItem.freshnessMinutes - b.newsItem.freshnessMinutes;
        }

        // Tertiary: correlation confidence
        return b.correlationConfidence - a.correlationConfidence;
    });
}
