/**
 * Prophet Oracle Engine
 * "The Prophet's Equation": A deterministic algorithm for market prophecy generation.
 * 
 * Synthesizes Volatility, Momentum, and Volume Anomalies into a narrative.
 */

import { getMarketChart, getHistoricalVolatility } from './coingecko';

interface ProphecySignal {
    coinId: string;
    score: number; // -100 to +100 (Bearish to Bullish)
    confidence: number; // 0 to 1
    momentum: 'crash' | 'bearish' | 'neutral' | 'bullish' | 'moon';
    volatility: 'calm' | 'volatile' | 'extreme';
    volumeState: 'dead' | 'normal' | 'pump';
    narrative: string;
}

// Linear Regression Slope Calculation
function calculateSlope(values: number[]): number {
    const n = values.length;
    if (n < 2) return 0;

    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    for (let i = 0; i < n; i++) {
        sumX += i;
        sumY += values[i];
        sumXY += i * values[i];
        sumXX += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope; // Price change per unit time
}

// Normalize slope to a score (-50 to +50)
function normalizeMomentum(slope: number, currentPrice: number): number {
    // Percent change per period approx
    const pctChange = (slope / currentPrice) * 100; // e.g., 0.5% per tick
    // Cap at +/- 5% per tick as drastic
    return Math.max(-50, Math.min(50, pctChange * 10)); // Scale factor
}

export async function generateProphecy(coinId: string): Promise<ProphecySignal> {
    // 1. Fetch Data (30 days for trend / vol context)
    const chart = await getMarketChart(coinId, 30);
    const volatility = await getHistoricalVolatility(coinId, 30);

    if (!chart || chart.prices.length < 2) {
        return createFallbackProphecy(coinId);
    }

    const prices = chart.prices.map(p => p[1]);
    const volumes = chart.total_volumes.map(v => v[1]);
    const currentPrice = prices[prices.length - 1];
    const currentVolume = volumes[volumes.length - 1];

    // 2. Calculate Momentum (Last 7 days approx, assuming daily data is dense)
    // Coingecko returns hourly data for < 90 days usually. Let's take last 24 points (1 day) vs last 7 days.
    // For simplicity, let's use the whole 30d window for macro trend, and last 3 days for micro.

    // Micro Trend (Last ~10% of data)
    const microTrendData = prices.slice(-Math.floor(prices.length * 0.1));
    const slope = calculateSlope(microTrendData);
    const momentumScore = normalizeMomentum(slope, currentPrice);

    // 3. Calculate Volume Anomaly
    const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    const volumeRatio = currentVolume / avgVolume;
    let volumeScore = 0;
    if (volumeRatio > 2.0) volumeScore = 20; // Massive pump
    else if (volumeRatio > 1.2) volumeScore = 10; // Rising
    else if (volumeRatio < 0.5) volumeScore = -5; // Dying interest

    // Sign of volume score follows momentum
    if (momentumScore < 0) volumeScore = -volumeScore;

    // 4. Synthesize Prophecy Score
    // Formula: Momentum (50%) + Volume (30%) - VolatilityPenalty (20%)
    // High volatility reduces Bullish confidence, increases Bearish severity.

    let totalScore = momentumScore + volumeScore;

    // Volatility context
    let volState: 'calm' | 'volatile' | 'extreme' = 'calm';
    if (volatility > 80) volState = 'extreme';
    else if (volatility > 40) volState = 'volatile';

    // 5. Construct Narrative
    let narrative = `The oracle gazes upon ${coinId}... `;

    // Momentum Description
    if (totalScore > 40) narrative += "A surge of energy is detected. The charts align for a powerful ascent. ";
    else if (totalScore > 10) narrative += "Bullish structure is forming, though resistance lingers. ";
    else if (totalScore > -10) narrative += "Indecision plagues the market. The path is clouded. ";
    else if (totalScore > -40) narrative += "Weakness is evident. The spirits suggests caution. ";
    else narrative += "CRITICAL WARNING. A collapse in structure is imminent or underway. ";

    // Volume Context
    if (volumeRatio > 1.5) narrative += "Volume is effectively screaming—interest is at a fever pitch. ";
    else if (volumeRatio < 0.6) narrative += "The crowd has gone silent. Liquidity is drying up. ";

    // Volatility Context
    if (volState === 'extreme') narrative += "Volatility is extreme—expect violent swings in either direction.";
    else if (volState === 'calm') narrative += "The waters are calm, perhaps too calm...";

    return {
        coinId,
        score: totalScore,
        confidence: Math.min(1.0, Math.abs(totalScore) / 50),
        momentum: totalScore > 30 ? 'moon' : totalScore > 10 ? 'bullish' : totalScore > -10 ? 'neutral' : totalScore > -30 ? 'bearish' : 'crash',
        volatility: volState,
        volumeState: volumeRatio > 1.2 ? 'pump' : volumeRatio < 0.8 ? 'dead' : 'normal',
        narrative
    };
}

function createFallbackProphecy(coinId: string): ProphecySignal {
    return {
        coinId,
        score: 0,
        confidence: 0,
        momentum: 'neutral',
        volatility: 'calm',
        volumeState: 'normal',
        narrative: `The mists obscure ${coinId}. Data is insufficient for a prophecy.`
    };
}
