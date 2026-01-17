
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
        // Fetch live events from PolyMarket Gamma API
        const response = await fetch('https://gamma-api.polymarket.com/events?closed=false&limit=20&sort=volume', {
            next: { revalidate: 60 } // Cache for 1 minute
        });

        if (!response.ok) {
            throw new Error(`PolyMarket API error: ${response.statusText}`);
        }

        const events = await response.json();

        // Transform PolyMarket events into our PredictionMarket format
        return events.map((event: any) => {
            // Find the main "Yes/No" market within the event
            // Usually the first market or the one matching the event slug
            const market = event.markets?.[0];

            if (!market) return null;

            // Extract odds from outcomePrices (["0.12", "0.88"])
            let yesPrice = 0.5;
            let noPrice = 0.5;

            try {
                if (market.outcomePrices) {
                    yesPrice = parseFloat(JSON.parse(market.outcomePrices)[0] || "0.5");
                    noPrice = parseFloat(JSON.parse(market.outcomePrices)[1] || "0.5");
                }
            } catch (e) {
                console.error("Error parsing outcome prices", e);
            }

            return {
                id: event.id,
                question: event.title,
                category: event.tags?.[0]?.label || "General",
                endDate: event.endDate,
                yesPool: 0, // Not provided directly, but logic doesn't strictly depend on it
                noPool: 0,
                totalVolume: Math.floor(event.volume || 0),
                yesOdds: Math.floor(yesPrice * 100),
                noOdds: Math.floor(noPrice * 100),
                isHot: (event.volume || 0) > 1000000
            };
        }).filter((m: any) => m !== null); // Remove any failed mappings

    } catch (error) {
        console.error("Failed to fetch PolyMarket data, using fallback mocks:", error);

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
