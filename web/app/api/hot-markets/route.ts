import { NextResponse } from 'next/server';
import { getPolymarketMarkets } from '@/lib/dome';

export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
    try {
        const markets = await getPolymarketMarkets();

        // Sort by volume to find "Hot" markets
        const hotMarkets = markets
            .filter(m => m.status === 'open')
            .sort((a, b) => b.volume_total - a.volume_total)
            .slice(0, 10); // Top 10 by volume

        return NextResponse.json({
            markets: hotMarkets,
            cached: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Error fetching hot markets:', error);
        return NextResponse.json(
            { error: 'Failed to fetch hot markets', markets: [] },
            { status: 500 }
        );
    }
}
