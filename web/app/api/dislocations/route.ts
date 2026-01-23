/**
 * Dislocations API Route
 * Returns active market dislocation signals - gaps between news and market pricing
 * 
 * GET /api/dislocations
 */

import { NextResponse } from 'next/server';
import { detectDislocations } from '@/lib/dislocation-engine';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
    try {
        const response = await detectDislocations();

        return NextResponse.json(response, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
            },
        });
    } catch (error) {
        console.error('[Dislocations API] Error:', error);

        return NextResponse.json(
            {
                signals: [],
                meta: {
                    generatedAt: Date.now(),
                    newsSourcesScanned: 0,
                    marketsScanned: 0,
                    signalCount: 0,
                    avgDislocationScore: 0,
                    error: 'Failed to detect dislocations'
                }
            },
            { status: 500 }
        );
    }
}
