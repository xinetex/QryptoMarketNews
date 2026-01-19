
export interface GalaxyCoinData {
    id: string;
    name: string;
    symbol: string;
    price: number;
    marketCap: number;
    fdv: number;               // Fully Diluted Valuation
    change: number;
    volume: number;
    volatility: number;        // 0-1 score
    history: {                 // For trails
        price: number;
        timestamp: number;
    }[];
    price7d: number;          // For ghost layer

    // Additional metrics for Scatter
    category?: string;
    change24h: number;
    volume24h: number;
    zoneColor: string;
}

export type ScatterDataPoint = GalaxyCoinData;

export interface ZoneWithCoins {
    id: string;
    name: string;
    color: string;
    coins: GalaxyCoinData[];
}
