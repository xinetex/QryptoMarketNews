import { AlphaVector, UserAlphaProfile, AlphaSignal } from "./types/alpha";
import { ZoneEnhancedData } from "./types/defi";
import { getEnhancedZoneData } from "./defillama";
import { getTopCoins } from "./coingecko";
import { detectWhaleMovements } from "./whale-detector";
import { calculateRiskScore } from "./risk-engine";

// Engine Constants
const WEIGHTS = {
    MOMENTUM: 0.4,
    WHALE: 0.3,
    RISK: 0.2,
    SOCIAL: 0.1
};

/**
 * The Brain: Generates the Alpha Vector based on current market conditions
 * and optional user profile.
 */
export async function generateAlphaVector(userProfile?: UserAlphaProfile): Promise<AlphaVector> {

    // 1. Fetch Real Market Data & Signals
    const [tickerCoins, whaleSignals, riskMetrics] = await Promise.all([
        getTopCoins(),
        detectWhaleMovements(),
        calculateRiskScore('ETH') // Benchmark Risk against ETH for now
    ]);

    // 2. Synthesize Component Scores
    // Momentum: Driven by TickerCoin performance
    const momentumScore = calculateMomentumScore(tickerCoins);

    // Whale: Derived from the net flow of our detected signals
    // Logic: If majority of signals are LONG, score is high.
    const longCount = whaleSignals.filter(s => s.direction === 'LONG').length;
    const whaleRatio = whaleSignals.length > 0 ? longCount / whaleSignals.length : 0.5;
    const whaleScore = Math.round(30 + (whaleRatio * 60)); // Map 0-1 to 30-90

    // Risk: Real Volatility & Safety Logic from Risk Engine
    const riskScore = riskMetrics.score;

    // Social: Mocked
    const socialScore = 50 + (Math.random() * 40 - 20);

    // 3. Calculate Global Rank
    const globalRank = (
        (momentumScore * WEIGHTS.MOMENTUM) +
        (whaleScore * WEIGHTS.WHALE) +
        (riskScore * WEIGHTS.RISK) +
        (socialScore * WEIGHTS.SOCIAL)
    );

    // 4. Generate Specific Signals
    // Combine Whale Signals with Momentum Signals if needed, but Whale Signals are stronger alpha.
    // Let's use Whale Signals as the primary "Alpha" source for now.
    const signals = whaleSignals;

    // 5. Determine Primary Driver
    let driver: 'MOMENTUM' | 'WHALE' | 'RISK_OFF' | 'FOMO' = 'MOMENTUM';
    let description = "Market driven by price action.";

    // Logic: Choose the most dominant deviation
    const scores = { 'MOMENTUM': momentumScore, 'WHALE': whaleScore, 'RISK': riskScore, 'SOCIAL': socialScore };

    if (whaleScore > 75) {
        driver = 'WHALE';
        description = "Large holders are accumulating aggressively.";
    } else if (riskScore < 50) {
        driver = 'RISK_OFF';
        description = "High volatility detected; capital fleeing to safety.";
    } else if (socialScore > 80) {
        driver = 'FOMO';
        description = "Retail sentiment is overheating.";
    }

    return {
        timestamp: Date.now(),
        global_rank: Math.round(globalRank),
        components: {
            momentum: Math.round(momentumScore),
            whale: Math.round(whaleScore),
            risk: Math.round(riskScore),
            social: Math.round(socialScore)
        },
        social_analysis: {
            sentiment: socialScore > 60 ? 'BULLISH' : socialScore < 40 ? 'BEARISH' : 'NEUTRAL',
            hype_score: Math.round(Math.random() * 100), // Placeholder for Stage 3 logic
            narratives: ["RWA Tokenization", "DeFi 3.0", "Institutional Adoption"].sort(() => 0.5 - Math.random()).slice(0, 2),
            volume_trend: Math.random() > 0.5 ? 'UP' : 'DOWN'
        },
        signals: signals,
        driver_breakdown: {
            primary_driver: driver,
            description: description
        }
    };
}

function calculateMomentumScore(coins: any[]): number {
    if (!coins || coins.length === 0) return 50;

    // Simple average of 24h changes of top coins, normalized
    // If avg change is +5%, score is high. If -5%, score is low.
    const avgChange = coins.reduce((acc, c) => acc + (c.change24h || 0), 0) / coins.length;

    // Map -10% -> 0, +10% -> 100
    // Linear scale centered at 0% = 50
    let score = 50 + (avgChange * 5);
    return Math.max(0, Math.min(100, score));
}

function generateSignals(coins: any[]): AlphaSignal[] {
    // Generate signals for coins with significant movement
    return coins
        .filter(c => Math.abs(c.change24h) > 3) // Only interesting moves
        .map(c => {
            const isPump = c.change24h > 0;
            return {
                asset: c.symbol,
                name: c.symbol, // We might not have full name here easily
                direction: (isPump ? 'LONG' : 'SHORT') as 'LONG' | 'SHORT',
                confidence: Math.min(95, 50 + Math.abs(c.change24h) * 2), // Higher move = higher 'trend' confidence
                reason: isPump
                    ? `Strong momentum (+${c.change24h.toFixed(1)}%) aligned with sector flow.`
                    : `Weakness detected (${c.change24h.toFixed(1)}%), suggest hedging.`,
                metrics: {
                    volatility: Math.random() * 10, // Mock
                    volume_change: Math.random() * 50 // Mock
                }
            };
        })
        .slice(0, 3); // Top 3 signals
}
