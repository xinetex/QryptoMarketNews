import { MockWhaleProvider, WhaleDataProvider } from './providers';
import { WhaleAlert, WhaleTransaction, ChainType } from './types';

export class WhaleDetector {
    private provider: WhaleDataProvider;

    constructor() {
        this.provider = new MockWhaleProvider();
    }

    /**
     * The core loop: Fetches transactions and filters for anomalies.
     */
    async scanBlock(chain: ChainType): Promise<WhaleAlert[]> {
        // threshold: $1M for major chains
        const threshold = chain === 'ethereum' ? 1000000 : 500000;

        const txs = await this.provider.getLargeTransactions(chain, threshold);
        const alerts: WhaleAlert[] = [];

        for (const tx of txs) {
            const anomaly = this.analyzeTransaction(tx);
            if (anomaly) {
                alerts.push(anomaly);
            }
        }

        return alerts;
    }

    private analyzeTransaction(tx: WhaleTransaction): WhaleAlert | null {
        let score = 0;
        let type: WhaleAlert['type'] = 'LARGE_TRANSFER';
        let narrative = `Large transfer of ${tx.amount.toLocaleString()} ${tx.symbol} ($${(tx.amountUsd / 1000000).toFixed(1)}M)`;

        // 1. Exchange Inflow (Bearish)
        if (tx.sender.type !== 'EXCHANGE' && tx.receiver.type === 'EXCHANGE') {
            score += 75;
            type = 'INFLOW_EXCHANGE';
            narrative = `🚨 DUMP RISK: ${tx.amount.toLocaleString()} ${tx.symbol} moved to ${tx.receiver.label}.`;
        } // 2. Exchange Outflow (Bullish)
        else if (tx.sender.type === 'EXCHANGE' && tx.receiver.type !== 'EXCHANGE') {
            score += 65;
            type = 'OUTFLOW_EXCHANGE';
            narrative = `🐋 ACCUMULATION: ${tx.amount.toLocaleString()} ${tx.symbol} moved to Cold Storage.`;
        }
        // 3. Treasury Stuff
        else if (tx.sender.type === 'TREASURY') {
            score += 50;
            narrative = `🏛 TREASURY MOVE: ${tx.sender.label} active.`;
        }

        // 4. Size Scoring
        if (tx.amountUsd > 10000000) score += 20; // +20 for > $10M
        if (tx.amountUsd > 50000000) score += 30; // +50 total for > $50M

        // Minimum score to alert
        if (score < 40) return null;

        return {
            id: tx.hash,
            timestamp: tx.timestamp,
            transaction: tx,
            score: Math.min(100, score),
            type,
            confidence: 0.9, // High confidence on block data
            narrative,
            metadata: {}
        };
    }
}
