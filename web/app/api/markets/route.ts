import { NextResponse } from 'next/server';
import { getPolymarketMarkets } from '@/lib/dome';

export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
    try {
        const markets = await getPolymarketMarkets();

        // Filter for high quality markets (e.g. have volume or are active)
        const activeMarkets = markets.filter(m => m.status === 'open');

        return NextResponse.json({
            markets: activeMarkets,
            count: activeMarkets.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("Failed to fetch markets:", error);
        return NextResponse.json({ error: "Failed to fetch markets" }, { status: 500 });
    }
}
