/**
 * Time Series Momentum (TSMOM) Types
 */

export type TrendDirection = 'BULLISH' | 'BEARISH' | 'NEUTRAL';

export interface TrendSignal {
    assetId: string;
    symbol: string;
    timestamp: number;

    // Returns over various horizons
    returns: {
        '1m': number;
        '3m': number;
        '12m': number; // The classic TSMOM lookback
    };

    // Volatility scaling
    volatility: number;      // Annualized volatility
    riskScaledReturn: number; // Return / Volatility (Sharpe-like)

    // The Signal
    direction: TrendDirection;
    score: number;           // 0-100 conviction

    // Metadata
    lastPrice: number;
    confidence: number;      // 0-1 based on trend strength and consensus across timeframes
}

export interface TrendSummary {
    generatedAt: number;
    assetsScanned: number;
    bullishCount: number;
    bearishCount: number;
    topSignals: TrendSignal[];
}
