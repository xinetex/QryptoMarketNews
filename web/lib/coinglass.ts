/**
 * Coinglass API Client
 * 
 * Provides derivatives market data: funding rates, open interest, liquidations.
 * These signals help detect crowd positioning and potential squeeze scenarios.
 * 
 * Docs: https://docs.coinglass.com/reference/getting-started
 */

const COINGLASS_API_BASE = 'https://open-api-v3.coinglass.com/api';

// Types
export interface FundingRate {
    symbol: string;
    rate: number;              // Current funding rate (e.g., 0.01 = 1%)
    nextFundingTime: number;   // Unix timestamp
    exchange: string;
}

export interface OpenInterest {
    symbol: string;
    openInterest: number;      // Total OI in USD
    openInterestChange24h: number;  // 24h change %
}

export interface Liquidation {
    symbol: string;
    longLiquidations: number;  // USD value
    shortLiquidations: number; // USD value
    time: number;
}

export interface DerivativesSignal {
    symbol: string;
    fundingRate: number;
    fundingSignal: 'EXTREME_LONG' | 'LONG' | 'NEUTRAL' | 'SHORT' | 'EXTREME_SHORT';
    openInterest: number;
    oiChange24h: number;
    longShortRatio: number;
    squeezePotential: 'HIGH' | 'MEDIUM' | 'LOW';
    narrative: string;
}

/**
 * Get funding rates for top coins
 * Note: Coinglass requires API key for most endpoints
 * This implementation uses public data where available
 */
export async function getFundingRates(symbols: string[] = ['BTC', 'ETH', 'SOL']): Promise<FundingRate[]> {
    try {
        // Try the public Coinglass endpoint first
        const url = `${COINGLASS_API_BASE}/futures/funding-rate/current`;

        const res = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                // Add API key if available
                ...(process.env.COINGLASS_API_KEY && {
                    'CG-API-KEY': process.env.COINGLASS_API_KEY,
                }),
            },
            next: { revalidate: 60 }, // Cache for 1 min
        });

        if (!res.ok) {
            console.warn('[Coinglass] API unavailable, using fallback');
            return getFallbackFundingRates(symbols);
        }

        const data = await res.json();

        if (data.code !== '0' || !data.data) {
            return getFallbackFundingRates(symbols);
        }

        // Parse response
        return data.data
            .filter((item: any) => symbols.includes(item.symbol?.toUpperCase()))
            .map((item: any) => ({
                symbol: item.symbol?.toUpperCase() || 'UNKNOWN',
                rate: parseFloat(item.rate) || 0,
                nextFundingTime: item.nextFundingTime || Date.now() + 8 * 60 * 60 * 1000,
                exchange: item.exchange || 'Aggregated',
            }));

    } catch (error) {
        console.error('[Coinglass] Error fetching funding rates:', error);
        return getFallbackFundingRates(symbols);
    }
}

/**
 * Get aggregated open interest
 */
export async function getOpenInterest(symbols: string[] = ['BTC', 'ETH', 'SOL']): Promise<OpenInterest[]> {
    try {
        const url = `${COINGLASS_API_BASE}/futures/open-interest/aggregated`;

        const res = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                ...(process.env.COINGLASS_API_KEY && {
                    'CG-API-KEY': process.env.COINGLASS_API_KEY,
                }),
            },
            next: { revalidate: 300 }, // Cache for 5 min
        });

        if (!res.ok) {
            return getFallbackOpenInterest(symbols);
        }

        const data = await res.json();

        if (data.code !== '0' || !data.data) {
            return getFallbackOpenInterest(symbols);
        }

        return data.data
            .filter((item: any) => symbols.includes(item.symbol?.toUpperCase()))
            .map((item: any) => ({
                symbol: item.symbol?.toUpperCase() || 'UNKNOWN',
                openInterest: parseFloat(item.openInterest) || 0,
                openInterestChange24h: parseFloat(item.change24h) || 0,
            }));

    } catch (error) {
        console.error('[Coinglass] Error fetching open interest:', error);
        return getFallbackOpenInterest(symbols);
    }
}

/**
 * Analyze derivatives positioning and generate signals
 */
export async function analyzeDerivatives(symbols: string[] = ['BTC', 'ETH', 'SOL']): Promise<DerivativesSignal[]> {
    const [fundingRates, openInterest] = await Promise.all([
        getFundingRates(symbols),
        getOpenInterest(symbols),
    ]);

    const signals: DerivativesSignal[] = [];

    for (const symbol of symbols) {
        const funding = fundingRates.find(f => f.symbol === symbol);
        const oi = openInterest.find(o => o.symbol === symbol);

        if (!funding || !oi) continue;

        // Classify funding rate signal
        let fundingSignal: DerivativesSignal['fundingSignal'] = 'NEUTRAL';
        if (funding.rate > 0.05) fundingSignal = 'EXTREME_LONG';
        else if (funding.rate > 0.01) fundingSignal = 'LONG';
        else if (funding.rate < -0.05) fundingSignal = 'EXTREME_SHORT';
        else if (funding.rate < -0.01) fundingSignal = 'SHORT';

        // Determine squeeze potential
        let squeezePotential: DerivativesSignal['squeezePotential'] = 'LOW';
        const absRate = Math.abs(funding.rate);

        if (absRate > 0.05 && Math.abs(oi.openInterestChange24h) > 10) {
            squeezePotential = 'HIGH';
        } else if (absRate > 0.02 && Math.abs(oi.openInterestChange24h) > 5) {
            squeezePotential = 'MEDIUM';
        }

        // Generate narrative
        const narrative = generateDerivativesNarrative(symbol, funding, oi, fundingSignal, squeezePotential);

        signals.push({
            symbol,
            fundingRate: funding.rate,
            fundingSignal,
            openInterest: oi.openInterest,
            oiChange24h: oi.openInterestChange24h,
            longShortRatio: funding.rate > 0 ? 1 + funding.rate * 10 : 1 - Math.abs(funding.rate) * 10,
            squeezePotential,
            narrative,
        });
    }

    return signals;
}

function generateDerivativesNarrative(
    symbol: string,
    funding: FundingRate,
    oi: OpenInterest,
    fundingSignal: DerivativesSignal['fundingSignal'],
    squeezePotential: DerivativesSignal['squeezePotential']
): string {
    const ratePercent = (funding.rate * 100).toFixed(3);
    const oiFormatted = (oi.openInterest / 1e9).toFixed(2);

    let narrative = `[${symbol}] Funding: ${ratePercent}% | OI: $${oiFormatted}B (${oi.openInterestChange24h > 0 ? '+' : ''}${oi.openInterestChange24h.toFixed(1)}% 24h). `;

    if (fundingSignal === 'EXTREME_LONG') {
        narrative += 'CROWDED LONG: Excessive bullish positioning. High risk of long squeeze.';
    } else if (fundingSignal === 'EXTREME_SHORT') {
        narrative += 'CROWDED SHORT: Excessive bearish positioning. High short squeeze potential.';
    } else if (fundingSignal === 'LONG') {
        narrative += 'Moderate long bias in funding. Watch for funding rate cooldown.';
    } else if (fundingSignal === 'SHORT') {
        narrative += 'Moderate short bias in funding. Shorts paying longs.';
    } else {
        narrative += 'Neutral positioning. No extreme crowd bias detected.';
    }

    if (squeezePotential === 'HIGH') {
        narrative += ' [!] SQUEEZE ALERT: High probability of leveraged position liquidation cascade.';
    }

    return narrative;
}

// Fallback data when API is unavailable
function getFallbackFundingRates(symbols: string[]): FundingRate[] {
    const mockData: Record<string, number> = {
        'BTC': 0.0023,
        'ETH': 0.0018,
        'SOL': 0.0045,
        'DOGE': 0.0089,
        'XRP': 0.0012,
    };

    return symbols.map(symbol => ({
        symbol,
        rate: mockData[symbol] ?? 0.001,
        nextFundingTime: Date.now() + 4 * 60 * 60 * 1000,
        exchange: 'Mock (API unavailable)',
    }));
}

function getFallbackOpenInterest(symbols: string[]): OpenInterest[] {
    const mockData: Record<string, { oi: number; change: number }> = {
        'BTC': { oi: 28_500_000_000, change: 2.3 },
        'ETH': { oi: 12_800_000_000, change: -1.5 },
        'SOL': { oi: 3_200_000_000, change: 8.7 },
        'DOGE': { oi: 890_000_000, change: 15.2 },
        'XRP': { oi: 1_100_000_000, change: 4.1 },
    };

    return symbols.map(symbol => ({
        symbol,
        openInterest: mockData[symbol]?.oi ?? 500_000_000,
        openInterestChange24h: mockData[symbol]?.change ?? 0,
    }));
}
