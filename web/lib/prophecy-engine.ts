/**
 * Prophet Oracle Engine
 * "The Prophet's Equation": A deterministic algorithm for market prophecy generation.
 * Synthesizes Volatility, Momentum, Volume Anomalies, and RSI.
 */

import { getMarketChart, getHistoricalVolatility } from './coingecko';

interface ProphecySignal {
    coinId: string;
    score: number;
    confidence: number;
    momentum: 'crash' | 'bearish' | 'neutral' | 'bullish' | 'moon';
    volatility: 'calm' | 'volatile' | 'extreme';
    volumeState: 'dead' | 'normal' | 'pump';
    narrative: string;
}

// Linear Regression Slope
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
    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
}

function normalizeMomentum(slope: number, currentPrice: number): number {
    const pctChange = (slope / currentPrice) * 100;
    return Math.max(-50, Math.min(50, pctChange * 10));
}

// RSI Calculation (14 periods)
function calculateRSI(prices: number[], periods: number = 14): number {
    if (prices.length < periods + 1) return 50;
    let gains = 0;
    let losses = 0;

    // Iterate over the last N periods
    // Note: prices is [t0, t1, ... tn]. We want last 14 changes.
    // Start index: length - periods (e.g. 100 - 14 = 86).
    // Loop from 86 to 99 (compare i with i-1).
    for (let i = prices.length - periods; i < prices.length; i++) {
        const diff = prices[i] - prices[i - 1];
        if (diff >= 0) gains += diff;
        else losses -= diff;
    }

    const avgGain = gains / periods;
    const avgLoss = losses / periods;

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
}

export async function generateProphecy(coinId: string): Promise<ProphecySignal> {
    // 1. Fetch Data
    const chart = await getMarketChart(coinId, 30);
    const volatility = await getHistoricalVolatility(coinId, 30);

    if (!chart || chart.prices.length < 2) {
        return createFallbackProphecy(coinId);
    }

    const prices = chart.prices.map(p => p[1]);
    const volumes = chart.total_volumes.map(v => v[1]);
    const currentPrice = prices[prices.length - 1];
    const currentVolume = volumes[volumes.length - 1];

    // 2. Metrics
    const microTrendData = prices.slice(-Math.floor(prices.length * 0.1));
    const slope = calculateSlope(microTrendData);
    const momentumScore = normalizeMomentum(slope, currentPrice);

    const rsi = calculateRSI(prices, 14);

    const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    const volumeRatio = currentVolume / avgVolume;

    // 3. Scoring
    let totalScore = momentumScore;
    if (volumeRatio > 1.5) totalScore += 10;
    if (rsi > 70) totalScore -= 10; // Overbought penalty
    if (rsi < 30) totalScore += 10; // Oversold bounce potential

    // 4. Narrative (Skunkworks Briefing)
    const priceFmt = currentPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    const rsiFmt = rsi.toFixed(0);
    const volFmt = volatility.toFixed(1);

    // Header
    let narrative = `[TARGET: ${coinId.toUpperCase()}] :: PRICE: ${priceFmt} \n`;
    narrative += `[METRICS] :: RSI: ${rsiFmt} (14D) | VOLATILITY: ${volFmt}% | VOL_RATIO: ${volumeRatio.toFixed(1)}x \n\n`;

    // Analysis
    narrative += `>> ANALYSIS: `;

    // RSI Context
    if (rsi > 75) narrative += `ASSET IS HEAVILY OVERBOUGHT (RSI ${rsiFmt}). CORRECTION PROBABILITY: HIGH. `;
    else if (rsi < 25) narrative += `ASSET IS OVERSOLD (RSI ${rsiFmt}). BOUNCE VECTORS ALIGNING. `;
    else narrative += `RSI (${rsiFmt}) INDICATES NEUTRAL CHANNELING. `;

    // Momentum Context
    if (totalScore > 30) narrative += `MOMENTUM IS SURGING. BREAKOUT CONFIRMED. `;
    else if (totalScore < -30) narrative += `MOMENTUM COLLAPSING. SEEK SHELTER. `;
    else narrative += `Trend is choppy/sideways. `;

    // Volume Context
    if (volumeRatio > 2.0) narrative += `DETECTED ANOMALOUS VOLUME SPIKE. WHALE ACTIVITY LIKELY. `;

    narrative += `\n>> VERDICT: ${totalScore > 10 ? "ACCUMULATE" : totalScore < -10 ? "DISTRIBUTE" : "HOLD"}.`;

    const volState = volatility > 80 ? 'extreme' : volatility > 40 ? 'volatile' : 'calm';

    return {
        coinId,
        score: totalScore,
        confidence: 0.85,
        momentum: totalScore > 0 ? 'bullish' : 'bearish',
        volatility: volState,
        volumeState: volumeRatio > 1.2 ? 'pump' : 'normal',
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
        narrative: `[ERROR] :: DATA_INSUFFICIENT_FOR_PROPHECY :: ${coinId.toUpperCase()}`
    };
}
