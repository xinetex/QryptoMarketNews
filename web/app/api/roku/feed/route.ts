import { NextResponse } from 'next/server';
import { getSettings, getZones } from '@/lib/config/store';

// CoinGecko API for ticker data
const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// Fetch top coins for ticker
async function fetchTickerData() {
    try {
        const res = await fetch(
            `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&sparkline=false&price_change_percentage=24h`,
            { next: { revalidate: 60 } } // Cache for 60 seconds
        );
        if (!res.ok) return [];

        const data = await res.json();
        return data.map((coin: {
            id: string;
            symbol: string;
            name: string;
            current_price: number;
            price_change_percentage_24h: number;
            image: string;
            market_cap: number;
            market_cap_rank: number;
        }) => ({
            id: coin.id,
            symbol: coin.symbol.toUpperCase(),
            name: coin.name,
            price: coin.current_price,
            change24h: coin.price_change_percentage_24h?.toFixed(2) || '0.00',
            isPositive: (coin.price_change_percentage_24h || 0) >= 0,
            image: coin.image,
            marketCap: coin.market_cap,
            rank: coin.market_cap_rank,
        }));
    } catch (error) {
        console.error('Failed to fetch ticker data:', error);
        return [];
    }
}

// Fetch market pulse data
async function fetchMarketPulse() {
    try {
        const res = await fetch(
            `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&sparkline=false&price_change_percentage=24h`,
            { next: { revalidate: 60 } }
        );
        if (!res.ok) return null;

        const data = await res.json();
        let upCount = 0;
        let downCount = 0;
        let totalChange = 0;

        data.forEach((coin: { price_change_percentage_24h: number }) => {
            const change = coin.price_change_percentage_24h || 0;
            totalChange += change;
            if (change >= 0) upCount++;
            else downCount++;
        });

        const avgChange = totalChange / data.length;
        let status = 'neutral';

        if (upCount > downCount * 1.5) status = 'bullish';
        else if (downCount > upCount * 1.5) status = 'bearish';
        else if (Math.abs(avgChange) < 1) status = 'neutral';
        else if (avgChange > 0) status = 'positive';
        else status = 'negative';

        return {
            status,
            upCount,
            downCount,
            avgChange: avgChange.toFixed(2),
        };
    } catch (error) {
        console.error('Failed to fetch market pulse:', error);
        return null;
    }
}

// Roku Feed API - Returns configuration and live data for Roku app
import { getPredictions } from '@/lib/predictions';

export async function GET() {
    try {
        const [settings, zones, tickerData, marketPulse, predictions] = await Promise.all([
            getSettings(),
            getZones(),
            fetchTickerData(),
            fetchMarketPulse(),
            getPredictions(),
        ]);

        // Filter and sort enabled zones
        const enabledZones = zones
            .filter(z => z.enabled)
            .sort((a, b) => a.order - b.order);

        // Build Roku-compatible feed with live data
        const rokuFeed = {
            providerName: settings.appName,
            language: "en-US",
            lastUpdated: new Date().toISOString(),

            // App configuration
            config: {
                appName: settings.appName,
                tagline: settings.tagline,
                refreshInterval: settings.refreshInterval * 1000,
                features: settings.features,
                theme: settings.theme,
            },

            // Stream configuration
            stream: settings.stream,

            // Live market pulse
            marketPulse: marketPulse || {
                status: 'neutral',
                upCount: 0,
                downCount: 0,
                avgChange: '0.00',
            },

            // Live ticker data for CryptoTicker component
            ticker: tickerData.slice(0, 15),

            // Prediction Markets (NEW)
            predictions: predictions.slice(0, 20).map(m => ({
                id: m.id,
                question: m.question,
                yesOdds: m.yesOdds,
                noOdds: m.noOdds,
                volume: m.totalVolume,
                endDate: m.endDate
            })),

            // Zone definitions for Roku
            zones: enabledZones.map(zone => ({
                id: zone.id,
                title: zone.name,
                shortDescription: `${zone.icon} ${zone.name} Prophets`,
                icon: zone.icon,
                color: zone.color,
                coinLimit: zone.coinLimit,
                apiEndpoint: `/api/crypto/zone/${zone.coingeckoCategory}`,
            })),

            // API endpoints
            endpoints: {
                base: process.env.VERCEL_URL
                    ? `https://${process.env.VERCEL_URL}`
                    : 'http://localhost:3000',
                news: "/api/crypto/news",
                ticker: "/api/crypto/ticker",
                zones: "/api/admin/zones",
                coinDetail: "/api/crypto/coin/{id}",
                feed: "/api/roku/feed",
                predictions: "/api/predictions",
            },
        };

        return NextResponse.json(rokuFeed);
    } catch (error) {
        console.error('Roku feed error:', error);
        return NextResponse.json({ error: 'Failed to generate feed' }, { status: 500 });
    }
}
