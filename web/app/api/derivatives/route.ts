/**
 * Derivatives API Route
 * Returns funding rates, open interest, and squeeze signals
 * 
 * GET /api/derivatives
 * GET /api/derivatives?symbols=BTC,ETH,SOL
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyzeDerivatives } from '@/lib/coinglass';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const symbolsParam = searchParams.get('symbols');

        const symbols = symbolsParam
            ? symbolsParam.split(',').map(s => s.trim().toUpperCase())
            : ['BTC', 'ETH', 'SOL', 'DOGE', 'XRP'];

        const signals = await analyzeDerivatives(symbols);

        // Calculate summary stats
        const highSqueeze = signals.filter(s => s.squeezePotential === 'HIGH').length;
        const avgFunding = signals.reduce((sum, s) => sum + s.fundingRate, 0) / signals.length;
        const marketBias = avgFunding > 0.01 ? 'LONG' : avgFunding < -0.01 ? 'SHORT' : 'NEUTRAL';

        return NextResponse.json({
            signals,
            summary: {
                totalSymbols: signals.length,
                highSqueezeAlerts: highSqueeze,
                averageFunding: avgFunding,
                marketBias,
                generatedAt: Date.now(),
            },
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
            },
        });

    } catch (error) {
        console.error('[Derivatives API] Error:', error);
        return NextResponse.json(
            {
                signals: [],
                summary: { error: 'Failed to fetch derivatives data' }
            },
            { status: 500 }
        );
    }
}
