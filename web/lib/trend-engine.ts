import { getMarketChart, getHistoricalVolatility } from "./coingecko";
import { TrendSignal, TrendSummary, TrendDirection } from "./types/trend";

/**
 * Trend Engine
 * 
 * Implements Time Series Momentum (TSMOM) - also known as trend-following.
 * Core strategy: If 12-month excess return is positive, go LONG; if negative, go SHORT.
 */

// Configuration
const ASSETS_TO_SCAN = [
    "bitcoin", "ethereum", "solana", "binancecoin", "ripple",
    "cardano", "avalanche-2", "polkadot", "chainlink", "polygon",
    "dogecoin", "shiba-inu", "pepe"
];

const LOOKBACK_DAYS = {
    '1m': 30,
    '3m': 90,
    '12m': 365
};

const TARGET_VOLATILITY = 0.40; // 40% target annual risk

/**
 * Generate trend signals for core assets
 */
export async function generateTrendSummary(): Promise<TrendSummary> {
    const startTime = Date.now();
    const signals: TrendSignal[] = [];

    // Scan assets in sequence to avoid rate limits (or parallel if cache is warm)
    for (const assetId of ASSETS_TO_SCAN) {
        try {
            const signal = await calculateTSMOM(assetId);
            if (signal) {
                signals.push(signal);
            }
        } catch (error) {
            console.error(`Error calculating TSMOM for ${assetId}:`, error);
        }
    }

    const bullishCount = signals.filter(s => s.direction === 'BULLISH').length;
    const bearishCount = signals.filter(s => s.direction === 'BEARISH').length;

    return {
        generatedAt: startTime,
        assetsScanned: ASSETS_TO_SCAN.length,
        bullishCount,
        bearishCount,
        topSignals: signals.sort((a, b) => b.score - a.score).slice(0, 10)
    };
}

/**
 * Calculate TSMOM for a specific asset
 */
export async function calculateTSMOM(assetId: string): Promise<TrendSignal | null> {
    // 1. Fetch 12-month price data
    const chart = await getMarketChart(assetId, 365);
    if (!chart || chart.prices.length < 30) return null;

    const prices = chart.prices.map(p => p[1]);
    const currentPrice = prices[prices.length - 1];

    // 2. Calculate returns for horizons
    const getReturn = (days: number) => {
        const lookbackIdx = Math.max(0, prices.length - days);
        const startPrice = prices[lookbackIdx];
        return (currentPrice - startPrice) / startPrice;
    };

    const returns = {
        '1m': getReturn(LOOKBACK_DAYS['1m']),
        '3m': getReturn(LOOKBACK_DAYS['3m']),
        '12m': getReturn(LOOKBACK_DAYS['12m'])
    };

    // 3. Get Volatility
    const vol = await getHistoricalVolatility(assetId, 60); // 60-day rolling volatility
    const annualizedVol = vol / 100; // Convert from percentage

    // 4. Calculate Vol-Scaled Signal
    // TSMOM = sign(R_12m) / Vol_Rolling
    // But for scoring, we'll use a combination of horizons
    const consensus = (Math.sign(returns['1m']) + Math.sign(returns['3m']) + Math.sign(returns['12m'])) / 3;

    let direction: TrendDirection = 'NEUTRAL';
    if (returns['12m'] > 0) direction = 'BULLISH';
    else if (returns['12m'] < 0) direction = 'BEARISH';

    // Confidence is 0-1 based on how many horizons agree with the 12m trend
    const confidence = Math.abs(consensus);

    // Score 0-100: Magnitude of 12m return scaled by vol, capped
    // High Sharpe signals (low vol, high return) get higher scores
    const sharpe = returns['12m'] / (annualizedVol || 1);
    const score = Math.min(100, Math.round(Math.abs(sharpe) * 20 * (1 + confidence)));

    return {
        assetId,
        symbol: assetId.toUpperCase(), // Simplification, ideally fetch from CG
        timestamp: Date.now(),
        returns,
        volatility: vol,
        riskScaledReturn: sharpe,
        direction,
        score,
        lastPrice: currentPrice,
        confidence
    };
}
