import { NextResponse } from 'next/server';

export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
    try {
        const response = await fetch('https://qppbet.vercel.app/api/markets', {
            next: { revalidate: 60 },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch markets: ${response.status}`);
        }

        const data = await response.json();

        // Filter for hot markets
        const hotMarkets = data.filter((m: { isHot?: boolean }) => m.isHot);

        return NextResponse.json({
            markets: hotMarkets.length > 0 ? hotMarkets : data.slice(0, 5),
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
