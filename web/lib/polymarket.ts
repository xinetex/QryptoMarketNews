/**
 * Polymarket Gamma API Client
 * Fetches real-time market data directly from Polymarket's public API.
 * Docs: https://docs.polymarket.com/
 */

const GAMMA_API_URL = "https://gamma-api.polymarket.com";

export interface PolyMarket {
    id: string;
    title: string;
    slug: string;
    volume: number;
    startDate: string;
    endDate: string;
    image: string;
    category: string;
    markets: {
        id: string;
        question: string;
        outcomePrices: string[]; // ["0.67", "0.33"]
        outcomes: string[]; // ["Yes", "No"]
        volume: number;
    }[];
}

export async function getTopMarkets(limit: number = 20): Promise<PolyMarket[]> {
    try {
        // Query param sorts by volume to get "Hot" markets
        const url = `${GAMMA_API_URL}/events?limit=${limit}&active=true&closed=false&order=volume&ascending=false`;
        const res = await fetch(url, { next: { revalidate: 60 } });

        if (!res.ok) throw new Error(`Polymarket API Error: ${res.status}`);

        const data = await res.json();
        return data as PolyMarket[];
    } catch (e) {
        console.error("Failed to fetch Polymarket data:", e);
        return [];
    }
}
