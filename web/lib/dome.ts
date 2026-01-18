const BASE_URL = "https://api.domeapi.io/v1";

export interface DomeMarket {
    market_slug: string;
    event_slug: string;
    title: string;
    description: string;
    start_time: number;
    end_time: number;
    volume_total: number;
    side_a: {
        id: string;
        label: string;
    };
    side_b: {
        id: string;
        label: string;
    };
    status: string;
    image: string;
}

export async function getPolymarketMarkets(): Promise<DomeMarket[]> {
    const apiKey = process.env.DOME_API_KEY;

    if (!apiKey) {
        console.warn("DOME_API_KEY is not set");
        return [];
    }

    try {
        const response = await fetch(`${BASE_URL}/polymarket/markets?limit=20&status=open`, {
            headers: {
                "Authorization": `Bearer ${apiKey}`
            },
            next: { revalidate: 60 }
        });

        if (!response.ok) {
            console.error(`Dome API Error: ${response.status} ${response.statusText}`);
            return [];
        }

        const data = await response.json();
        return data.markets || [];
    } catch (error) {
        console.error("Failed to fetch markets from Dome API:", error);
        return [];
    }
}
