import { getPolymarketMarkets, DomeMarket } from "./dome";

export interface PredictionMarket {
    id: string;
    question: string;
    category: string;
    endDate: string;
    yesPool: number;
    noPool: number;
    totalVolume: number;
    yesOdds: number;
    noOdds: number;
    isHot: boolean;
}

export async function getPredictions(): Promise<PredictionMarket[]> {
    try {
        const markets = await getPolymarketMarkets();

        return markets.map((market: DomeMarket) => {
            // Note: Dome API List endpoint currently doesn't return outcomePrices. 
            // We would need to fetch prices separately. For now, we defaulting to 50/50 to avoid breaking UI.
            let yesPrice = 0.5;
            let noPrice = 0.5;

            return {
                id: market.market_slug,
                question: market.title,
                category: "General", // Tags are available but strictly typed in our interface? Just use General or map from tags if needed
                endDate: new Date(market.end_time * 1000).toISOString(),
                yesPool: 0,
                noPool: 0,
                totalVolume: Math.floor(market.volume_total || 0),
                yesOdds: 50,
                noOdds: 50,
                isHot: (market.volume_total || 0) > 1000000
            };
        });

    } catch (error) {
        console.error("Failed to fetch predictions via Dome API, using fallback mocks:", error);

        // Fallback Mock Data
        return [
            {
                id: "mock1",
                question: "Bitcoin > $100k in 2026? (API Error Fallback)",
                category: "Crypto",
                endDate: "2026-12-31",
                yesPool: 500000,
                noPool: 300000,
                totalVolume: 800000,
                yesOdds: 65,
                noOdds: 35,
                isHot: true
            },
            {
                id: "mock2",
                question: "Fed Rate Cut in Jan?",
                category: "Economy",
                endDate: "2026-01-31",
                yesPool: 20000,
                noPool: 80000,
                totalVolume: 100000,
                yesOdds: 15,
                noOdds: 85,
                isHot: false
            }
        ];
    }
}
