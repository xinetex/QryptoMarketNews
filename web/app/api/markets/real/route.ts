import { NextResponse } from 'next/server';
import { getTopMarkets } from '@/lib/polymarket';

export const revalidate = 60;

export async function GET() {
    try {
        const rawMarkets = await getTopMarkets(20);

        // Transform to DiscoveryMarket format
        const markets = rawMarkets.map((m) => {
            const mainMarket = m.markets[0]; // Primary market for the event
            const yesPrice = mainMarket?.outcomePrices ? parseFloat(mainMarket.outcomePrices[0]) : 0.5;

            return {
                id: m.id,
                title: m.title,
                category: mapCategory(m.category), // Helper needed or just default
                yesPrice: yesPrice,
                volume24h: m.volume, // Total volume
                endDate: m.endDate,
                trending: m.volume > 100000,
                hot: m.volume > 500000,
                image: m.image,
                url: `https://polymarket.com/event/${m.slug}`
            };
        });

        return NextResponse.json({ markets });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}

function mapCategory(polyCat: string): string {
    // Simple mapping to our internal categories
    const c = polyCat?.toLowerCase() || '';
    if (c.includes('pol') || c.includes('elect')) return 'politics';
    if (c.includes('sport') || c.includes('nfl') || c.includes('nba')) return 'sports';
    if (c.includes('pop') || c.includes('entert')) return 'entertainment';
    if (c.includes('cryp') || c.includes('btc') || c.includes('eth')) return 'crypto';
    if (c.includes('worl') || c.includes('glob')) return 'world';
    return 'for-you'; // Default
}
