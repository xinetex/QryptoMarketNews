import { NextResponse } from 'next/server';
import { getSettings, getZones } from '@/lib/config/store';

// Roku Feed API - Returns configuration in a format consumable by Roku app
export async function GET() {
    try {
        const settings = await getSettings();
        const zones = await getZones();

        // Filter and sort enabled zones
        const enabledZones = zones
            .filter(z => z.enabled)
            .sort((a, b) => a.order - b.order);

        // Build Roku-compatible feed
        const rokuFeed = {
            providerName: settings.appName,
            language: "en-US",
            lastUpdated: new Date().toISOString(),

            // App configuration
            config: {
                appName: settings.appName,
                tagline: settings.tagline,
                refreshInterval: settings.refreshInterval * 1000, // Convert to ms for Roku
                features: settings.features,
                theme: settings.theme,
            },

            // Stream configuration
            stream: settings.stream,

            // Zone definitions for Roku
            zones: enabledZones.map(zone => ({
                id: zone.id,
                title: zone.name,
                shortDescription: `${zone.icon} ${zone.name} tokens`,
                icon: zone.icon,
                color: zone.color,
                coinLimit: zone.coinLimit,
                apiEndpoint: `/api/crypto/zone/${zone.coingeckoCategory}`,
            })),

            // API endpoints
            endpoints: {
                news: "/api/crypto/news",
                ticker: "/api/crypto/ticker",
                zones: "/api/admin/zones",
                coinDetail: "/api/crypto/coin/{id}",
            },
        };

        return NextResponse.json(rokuFeed);
    } catch (error) {
        console.error('Roku feed error:', error);
        return NextResponse.json({ error: 'Failed to generate feed' }, { status: 500 });
    }
}
