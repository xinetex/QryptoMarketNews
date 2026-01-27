export type ChainType = 'ethereum' | 'solana' | 'polygon' | 'base' | 'bitcoin';

export interface WhaleWallet {
    address: string;
    label: string; // e.g. "Binance 14", "Vitalik", "Unknown"
    type: 'EXCHANGE' | 'TREASURY' | 'FOUNDATION' | 'INDIVIDUAL' | 'UNKNOWN';
    chain: ChainType;
}

export interface WhaleTransaction {
    hash: string;
    chain: ChainType;
    timestamp: number;
    amount: number;
    amountUsd: number;
    symbol: string;
    sender: WhaleWallet;
    receiver: WhaleWallet;
}

export interface WhaleAlert {
    id: string;
    timestamp: number;
    transaction: WhaleTransaction;
    score: number; // 0-100 Anomaly Score
    type: 'INFLOW_EXCHANGE' | 'OUTFLOW_EXCHANGE' | 'BRIDGE' | 'MINT' | 'LARGE_TRANSFER';
    confidence: number;
    narrative: string; // Generated text for the UI
    metadata: {
        isFreshWallet?: boolean;
        volatilityAtTime?: number;
    };
}
