import { NextResponse } from 'next/server';
import { getTopMarkets } from '@/lib/polymarket';

export const revalidate = 60;

export async function GET() {
    try {
        // Fetch deeper pool (50) to ensure category diversity
        const rawMarkets = await getTopMarkets(50);

        // Transform to DiscoveryMarket format
        const markets = rawMarkets.map((m) => {
            const mainMarket = m.markets[0]; // Primary market for the event
            const yesPrice = mainMarket?.outcomePrices ? parseFloat(mainMarket.outcomePrices[0]) : 0.5;

            // Logic: Viral Score
            const startDate = new Date(m.startDate).getTime();
            const now = Date.now();
            const daysActive = Math.max(1, (now - startDate) / (1000 * 60 * 60 * 24));
            const volumePerDay = m.volume / daysActive;

            const isWhale = m.volume > 2000000; // $2M+
            const isViral = volumePerDay > 50000; // $50k/day
            const isNew = daysActive < 7;

            return {
                id: m.id,
                title: m.title,
                category: mapCategory(m.category, m.title),
                yesPrice: yesPrice,
                volume24h: m.volume, // Total volume
                endDate: m.endDate,
                trending: (isNew && m.volume > 10000) || isViral,
                hot: isWhale,
                image: m.image,
                url: `https://polymarket.com/event/${m.slug}`
            };
        });

        // Return raw list; client handles "For You" filtering
        return NextResponse.json({ markets });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}

function mapCategory(polyCat: string, title: string): string {
    const text = `${polyCat} ${title}`.toLowerCase();

    // Politics (High signal keywords)
    if (text.match(/trump|biden|harris|election|senate|congress|vote|poll|president|democrat|republican/)) return 'politics';

    // Sports (Leagues + Events)
    if (text.match(/nfl|nba|football|soccer|league|cup|super bowl|chiefs|eagles|f1|formula|tennis/)) return 'sports';

    // Crypto (Tokens + Tech)
    if (text.match(/bitcoin|btc|eth|solana|crypto|token|nft|chain|defi|airdrop/)) return 'crypto';

    // Entertainment (Pop culture)
    if (text.match(/oscar|grammy|movie|film|song|music|swift|beyonce|mrbeast|youtube|tiktok/)) return 'entertainment';

    // World (Economy + Geopolitics)
    if (text.match(/fed|rate|inflation|war|china|russia|ukraine|climate|oil|gas|gdp|recession/)) return 'world';

    // Fallback based on Polymarket category if clear
    if (text.includes('sport')) return 'sports';
    if (text.includes('politic')) return 'politics';
    if (text.includes('crypto')) return 'crypto';

    return 'for-you'; // Default bucket
}
