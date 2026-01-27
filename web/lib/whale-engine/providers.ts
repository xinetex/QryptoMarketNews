import { WhaleTransaction, ChainType, WhaleWallet } from './types';

export interface WhaleDataProvider {
    getLargeTransactions(chain: ChainType, minUsdValue: number): Promise<WhaleTransaction[]>;
    getWalletLabel(address: string, chain: ChainType): Promise<WhaleWallet>;
}

// Mock Provider (Simulated Real-Time Data until Alchemy keys are added)
export class MockWhaleProvider implements WhaleDataProvider {

    private nouns = ["Binance", "Coinbase", "Kraken", "Justin Sun", "Wintermute", "Jump Trading", "a16z"];
    private assets = [
        { symbol: "ETH", price: 3200 },
        { symbol: "SOL", price: 145 },
        { symbol: "BTC", price: 64000 },
        { symbol: "USDC", price: 1 },
    ];

    async getWalletLabel(address: string, chain: ChainType): Promise<WhaleWallet> {
        // Deterministic label based on address char
        const charCode = address.charCodeAt(address.length - 1);
        if (charCode % 2 === 0) {
            return {
                address,
                label: "Binance Hot Wallet",
                type: 'EXCHANGE',
                chain
            };
        }
        return {
            address,
            label: "Unknown 0x" + address.slice(0, 4),
            type: 'UNKNOWN',
            chain
        };
    }

    async getLargeTransactions(chain: ChainType, minUsdValue: number = 1000000): Promise<WhaleTransaction[]> {
        // Simulate a transaction
        const asset = this.assets[Math.floor(Math.random() * this.assets.length)];
        const amount = Math.floor(Math.random() * 5000) + 500; // Random amount
        const amountUsd = amount * asset.price;

        if (amountUsd < minUsdValue) return [];

        const sender = await this.getWalletLabel("0xSENDER" + Date.now(), chain);
        const receiver = await this.getWalletLabel("0xRECEIVER" + Date.now(), chain);

        return [{
            hash: "0xhash" + Date.now(),
            chain,
            timestamp: Date.now(),
            amount,
            amountUsd,
            symbol: asset.symbol,
            sender,
            receiver
        }];
    }
}
