
import { AlphaSignal } from "./types/alpha";

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
