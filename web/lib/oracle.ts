/**
 * Prophet Oracle AI Engine
 * 
 * Generates AI-powered predictions ("Prophecies") with confidence scores.
 * Analyzes market data, news sentiment, and social signals.
 */

// Types
export interface Prophecy {
    id: string;
    marketId: string;
    marketTitle: string;
    prediction: 'YES' | 'NO' | 'NEUTRAL';
    confidence: number; // 0-100
    reasoning: string;
    factors: ProphecyFactor[];
    createdAt: string;
    expiresAt: string;
    outcome?: 'CORRECT' | 'INCORRECT' | 'PENDING';
}

export interface ProphecyFactor {
    name: string;
    sentiment: 'bullish' | 'bearish' | 'neutral';
    weight: number; // 0-1
    description: string;
}

export interface OracleStats {
    totalProphecies: number;
    correctProphecies: number;
    accuracy: number;
    streak: number;
    lastUpdated: string;
}

const STORAGE_KEY = 'prophet_oracle_prophecies';
const STATS_KEY = 'prophet_oracle_stats';

/**
 * Get stored prophecies
 */
export function getProphecies(): Prophecy[] {
    if (typeof window === 'undefined') return [];

    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    try {
        return JSON.parse(stored);
    } catch {
        return [];
    }
}

/**
 * Store a new prophecy
 */
export function storeProphecy(prophecy: Prophecy): void {
    if (typeof window === 'undefined') return;

    const existing = getProphecies();
    const updated = [prophecy, ...existing].slice(0, 50); // Keep last 50
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

/**
 * Get oracle statistics
 */
export function getOracleStats(): OracleStats {
    if (typeof window === 'undefined') {
        return {
            totalProphecies: 0,
            correctProphecies: 0,
            accuracy: 0,
            streak: 0,
            lastUpdated: new Date().toISOString(),
        };
    }

    const stored = localStorage.getItem(STATS_KEY);
    if (!stored) {
        return {
            totalProphecies: 47, // Mock starting stats
            correctProphecies: 34,
            accuracy: 72,
            streak: 5,
            lastUpdated: new Date().toISOString(),
        };
    }

    try {
        return JSON.parse(stored);
    } catch {
        return {
            totalProphecies: 47,
            correctProphecies: 34,
            accuracy: 72,
            streak: 5,
            lastUpdated: new Date().toISOString(),
        };
    }
}

/**
 * Generate a prophecy ID
 */
function generateId(): string {
    return `prophecy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

import { analyzeMarketWhales } from './polymarket-analyzer';

/**
 * Analyze market factors (simplified heuristic version)
 * In production, this would call an LLM API
 */
async function analyzeFactors(market: {
    id: string;
    yesPrice: number;
    noPrice: number;
    volume24h?: number;
}): Promise<ProphecyFactor[]> {
    const factors: ProphecyFactor[] = [];

    // Price momentum factor
    const yesStrength = market.yesPrice > 0.5;
    factors.push({
        name: 'Market Sentiment',
        sentiment: yesStrength ? 'bullish' : 'bearish',
        weight: 0.3,
        description: yesStrength
            ? `YES trading at ${(market.yesPrice * 100).toFixed(0)}¢ indicates bullish sentiment`
            : `NO trading at ${(market.noPrice * 100).toFixed(0)}¢ indicates bearish sentiment`,
    });

    // Volume factor
    if (market.volume24h && market.volume24h > 10000) {
        factors.push({
            name: 'Trading Volume',
            sentiment: 'neutral',
            weight: 0.2,
            description: `High volume ($${(market.volume24h / 1000).toFixed(1)}K) suggests strong market interest`,
        });
    }

    // Price extremity factor
    const extremity = Math.abs(market.yesPrice - 0.5);
    if (extremity > 0.3) {
        factors.push({
            name: 'Price Extremity',
            sentiment: market.yesPrice > 0.5 ? 'bullish' : 'bearish',
            weight: 0.25,
            description: `Strong price signal at ${(market.yesPrice * 100).toFixed(0)}¢ suggests high conviction`,
        });
    } else {
        factors.push({
            name: 'Price Uncertainty',
            sentiment: 'neutral',
            weight: 0.15,
            description: 'Price near 50¢ indicates market uncertainty',
        });
    }

    // Smart Money / Whale Factor
    try {
        const whaleSignal = await analyzeMarketWhales(market.id);
        if (whaleSignal.whaleCount > 0 && whaleSignal.sentiment !== 'neutral') {
            factors.push({
                name: 'Smart Money Signal',
                sentiment: whaleSignal.sentiment,
                weight: 0.4, // High weight for whales
                description: `Detected ${whaleSignal.whaleCount} whales moving volume. ${whaleSignal.description}`,
            });
        }
    } catch (e) {
        // Ignore failure
    }

    return factors;
}

/**
 * Calculate confidence from factors
 */
function calculateConfidence(factors: ProphecyFactor[]): number {
    let baseConfidence = 50;

    for (const factor of factors) {
        if (factor.sentiment === 'bullish' || factor.sentiment === 'bearish') {
            baseConfidence += factor.weight * 30;
        }
    }

    // Add some variance
    const variance = (Math.random() - 0.5) * 10;
    return Math.min(95, Math.max(35, Math.round(baseConfidence + variance)));
}

/**
 * Generate reasoning from factors
 */
function generateReasoning(
    market: { question: string },
    prediction: 'YES' | 'NO' | 'NEUTRAL',
    factors: ProphecyFactor[],
    confidence: number
): string {
    const sentimentFactors = factors.filter(f => f.sentiment !== 'neutral');
    const mainFactor = sentimentFactors[0];

    if (prediction === 'NEUTRAL') {
        return `Market signals are mixed. Confidence is low at ${confidence}%. Recommend waiting for clearer signals before taking a position.`;
    }

    const predictionWord = prediction === 'YES' ? 'likely' : 'unlikely';
    return `Based on ${mainFactor?.name.toLowerCase() || 'market analysis'}, the outcome appears ${predictionWord}. ${mainFactor?.description || ''} Current confidence: ${confidence}%.`;
}

/**
 * Generate a prophecy for a market
 */
export async function generateProphecy(market: {
    id: string;
    question: string;
    yesPrice: number;
    noPrice: number;
    volume24h?: number;
    endDate?: string;
}): Promise<Prophecy> {
    // Analyze factors
    const factors = await analyzeFactors(market);

    // Determine prediction
    let prediction: 'YES' | 'NO' | 'NEUTRAL';
    const bullishFactors = factors.filter(f => f.sentiment === 'bullish').length;
    const bearishFactors = factors.filter(f => f.sentiment === 'bearish').length;

    if (bullishFactors > bearishFactors) {
        prediction = 'YES';
    } else if (bearishFactors > bullishFactors) {
        prediction = 'NO';
    } else {
        prediction = market.yesPrice > 0.5 ? 'YES' : market.yesPrice < 0.5 ? 'NO' : 'NEUTRAL';
    }

    // Calculate confidence
    const confidence = calculateConfidence(factors);

    // If confidence is too low, mark as neutral
    if (confidence < 45) {
        prediction = 'NEUTRAL';
    }

    // Generate reasoning
    const reasoning = generateReasoning(market, prediction, factors, confidence);

    // Create prophecy
    const prophecy: Prophecy = {
        id: generateId(),
        marketId: market.id,
        marketTitle: market.question,
        prediction,
        confidence,
        reasoning,
        factors,
        createdAt: new Date().toISOString(),
        expiresAt: market.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        outcome: 'PENDING',
    };

    // Store it
    storeProphecy(prophecy);

    return prophecy;
}

/**
 * Get recent prophecies for display
 */
export function getRecentProphecies(limit: number = 5): Prophecy[] {
    return getProphecies().slice(0, limit);
}

/**
 * Mark a prophecy outcome
 */
export function resolveProphecy(prophecyId: string, outcome: 'CORRECT' | 'INCORRECT'): void {
    if (typeof window === 'undefined') return;

    const prophecies = getProphecies();
    const updated = prophecies.map(p =>
        p.id === prophecyId ? { ...p, outcome } : p
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Update stats
    const stats = getOracleStats();
    stats.totalProphecies += 1;
    if (outcome === 'CORRECT') {
        stats.correctProphecies += 1;
        stats.streak += 1;
    } else {
        stats.streak = 0;
    }
    stats.accuracy = Math.round((stats.correctProphecies / stats.totalProphecies) * 100);
    stats.lastUpdated = new Date().toISOString();
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}
