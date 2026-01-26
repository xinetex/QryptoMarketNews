import { cachedCoinGeckoFetch } from "./agentcache";

const POLYMARKET_GAMMA_API = "https://gamma-api.polymarket.com";

export interface PolyMarket {
    id: string; // Event ID
    title: string;
    slug: string;
    category: string;
    startDate: string;
    endDate: string;
    image: string;
    volume: number;
    markets: {
        id: string;
        question: string;
        outcomes: string[];
        outcomePrices: string[];
        volume: number;
    }[];
}

/**
 * Fetch top relevant markets (Events) from Polymarket
 */
export async function getTopMarkets(limit: number = 20): Promise<PolyMarket[]> {
    try {
        const url = `${POLYMARKET_GAMMA_API}/events?limit=${limit}&active=true&closed=false&order=volume&ascending=false`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Polymarket API error");

        const data = await res.json();

        return data.map((event: any) => ({
            id: event.id,
            title: event.title,
            slug: event.slug,
            category: event.category || "General",
            startDate: event.startDate || event.creationDate || new Date().toISOString(),
            endDate: event.endDate,
            image: event.image,
            volume: parseFloat(event.volume) || 0,
            markets: (event.markets || []).map((m: any) => ({
                id: m.id,
                question: m.question,
                outcomes: JSON.parse(m.outcomes || "[]"),
                outcomePrices: JSON.parse(m.outcomePrices || "[]"),
                volume: parseFloat(m.volume) || 0
            }))
        }));
    } catch (e) {
        console.warn("Polymarket fetch failed:", e);
        return [];
    }
}

/**
 * Fetch markets by keyword
 */
export async function getPredictionMarkets(keyword: string): Promise<PolyMarket[]> {
    try {
        const url = `${POLYMARKET_GAMMA_API}/events?limit=5&active=true&closed=false&q=${encodeURIComponent(keyword)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Polymarket API error");

        const data = await res.json();

        return data.map((event: any) => ({
            id: event.id,
            title: event.title,
            slug: event.slug,
            category: event.category || "General",
            startDate: event.startDate || event.creationDate || new Date().toISOString(),
            endDate: event.endDate,
            image: event.image,
            volume: parseFloat(event.volume) || 0,
            markets: (event.markets || []).map((m: any) => ({
                id: m.id,
                question: m.question,
                outcomes: JSON.parse(m.outcomes || "[]"),
                outcomePrices: JSON.parse(m.outcomePrices || "[]"),
                volume: parseFloat(m.volume) || 0
            }))
        }));
    } catch (e) {
        return [];
    }
}
