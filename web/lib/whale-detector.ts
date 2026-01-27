
import { AlphaSignal } from "./types/alpha";
import { getPredictionMarkets } from "./polymarket";

export interface ShadowSignal {
    asset: string;
    type: 'SHADOW_LONG' | 'SHADOW_SHORT';
    whaleAction: string;
    marketConsensus: string;
    shadowGap: number; // 0-100 score of divergence
    confidence: number;
    narrative: string;
}


// Types
interface WhaleMovement {
    hash: string;
    token: string;
    amount_usd: number;
    sender: string;
    sender_label?: string; // e.g. "Binance Hot Wallet", "a16z"
    receiver: string;
    receiver_label?: string;
    timestamp: number;
    type: 'ACCUMULATION' | 'DISTRIBUTION' | 'TRANSFER';
}

const WHALE_LABELS = [
    "Binance 14", "Coinbase Cold Storage", "Jump Trading", "Wintermute",
    "Alameda (Legacy)", "Justin Sun", "Vitalik", "a16z Crypto",
    "Paradigm", "DragonFly Capital", "Smart Money 0x7a...2b"
];

// Deterministic Random (for stable signals over short windows)
function pseudoRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

/**
 * Detects (Simulates) Whale Movements based on time blocks.
 * In a real app, this would query Alchemy/Etherscan for txs > $100k
 */
export async function detectWhaleMovements(): Promise<AlphaSignal[]> {
    const now = Date.now();
    // Round to nearest 30 seconds for stability
    const timeBlock = Math.floor(now / 30000);

    // Generate 2-3 signals based on the time block
    const signalCount = 2 + Math.floor(pseudoRandom(timeBlock) * 2);
    const signals: AlphaSignal[] = [];

    const TOKENS = ["SOL", "ETH", "MKR", "LDO", "UNI", "AAVE", "PEPE", "WIF"];

    for (let i = 0; i < signalCount; i++) {
        // Unique seed for this signal
        const seed = timeBlock + i * 137;

        const token = TOKENS[Math.floor(pseudoRandom(seed) * TOKENS.length)];
        const isBuy = pseudoRandom(seed + 1) > 0.45; // Slight buy bias
        const amount = 500000 + Math.floor(pseudoRandom(seed + 2) * 4500000); // $500k - $5m

        const entityIndex = Math.floor(pseudoRandom(seed + 3) * WHALE_LABELS.length);
        const entity = WHALE_LABELS[entityIndex];

        signals.push({
            asset: token,
            name: token,
            direction: isBuy ? 'LONG' : 'SHORT',
            confidence: 60 + Math.floor(pseudoRandom(seed + 4) * 35), // 60-95
            reason: isBuy
                ? `${entity} accumulated $${(amount / 1000000).toFixed(1)}M`
                : `${entity} deposited $${(amount / 1000000).toFixed(1)}M to Exchange`,
            metrics: {
                volatility: 2 + pseudoRandom(seed + 5) * 8, // 2-10%
                volume_change: 10 + pseudoRandom(seed + 6) * 200 // 10-210%
            }
        });
    }

    return signals.sort((a, b) => b.confidence - a.confidence);
}

/**
 * The Whale Shadow: Detects when Smart Money disagrees with the Crowd (Polymarket).
 * 
 * Logic:
 * 1. Get simulated Whale Signals (e.g., "Binance 14 bought $5M ETH").
 * 2. Get Polymarket odds for that asset (e.g., "Will ETH hit $3k?").
 * 3. Calculate Divergence:
 *    - Whale BUY + Polymarket BEARISH = HIGH ALPHA (Shadow Long)
 *    - Whale SELL + Polymarket BULLISH = HIGH ALPHA (Shadow Short)
 */
export async function detectWhaleShadow(): Promise<ShadowSignal[]> {
    const whaleSignals = await detectWhaleMovements();
    const shadowSignals: ShadowSignal[] = [];

    for (const signal of whaleSignals) {
        // Find relevant prediction markets
        const markets = await getPredictionMarkets(signal.asset);

        // Find a market that represents "Price Direction" (e.g. Will SOL hit X?)
        // Heuristic: Looking for 'High' 'Hit' 'reach' or 'Above' in title
        const priceMarket = markets.find(m =>
            m.markets.some(sub =>
            (sub.question.toLowerCase().includes('hit') ||
                sub.question.toLowerCase().includes('above') ||
                sub.question.toLowerCase().includes('reach'))
            )
        );

        if (!priceMarket) continue;

        // Calculate "Crowd Bullishness" from the YES price
        // Assuming the main market is "Will [Asset] Go Up?"
        // We take the highest volume sub-market
        // If outcomePrices is empty or invalid, fallback to 0.5
        const mainMarket = priceMarket.markets[0];
        const yesPriceStr = (mainMarket.outcomePrices && mainMarket.outcomePrices.length > 0)
            ? mainMarket.outcomePrices[0]
            : "0.5";

        const crowdBullishness = parseFloat(yesPriceStr); // 0.0 to 1.0

        // Calculate Divergence
        let type: 'SHADOW_LONG' | 'SHADOW_SHORT' | null = null;
        let gap = 0;

        if (signal.direction === 'LONG' && crowdBullishness < 0.45) {
            // Whale Buying, Crowd Bearish (<45%)
            type = 'SHADOW_LONG';
            gap = (0.5 - crowdBullishness) + 0.5; // Scale gap
        } else if (signal.direction === 'SHORT' && crowdBullishness > 0.55) {
            // Whale Selling, Crowd Bullish (>55%)
            type = 'SHADOW_SHORT';
            gap = (crowdBullishness - 0.5) + 0.5;
        }

        if (type) {
            shadowSignals.push({
                asset: signal.asset,
                type,
                whaleAction: signal.reason,
                marketConsensus: `Crowd only ${Math.round(crowdBullishness * 100)}% bullish on PolyMarket`,
                shadowGap: Math.round(gap * 100),
                confidence: Math.round((signal.confidence + (gap * 100)) / 2),
                narrative: `WHALE DIVERGENCE: Smart money is ${signal.direction === 'LONG' ? 'accumulating' : 'dumping'} ${signal.asset} while the prediction market crowd is betting ${type === 'SHADOW_LONG' ? 'against it' : 'on a pump'}.`
            });
        }
    }

    return shadowSignals.sort((a, b) => b.shadowGap - a.shadowGap);
}
