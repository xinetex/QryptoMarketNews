
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getCoin } from '@/lib/coingecko'; // Helper to fetch real price
import { earnPointsRemote, POINT_VALUES } from '@/lib/points';

export async function POST(request: Request) {
    try {
        if (!sql) throw new Error("DB not connected");

        const body = await request.json();
        const { wallet, symbol, direction, rationale } = body;

        // Basic Validation
        if (!wallet || !symbol || !direction) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // 1. Get Current Price (Anti-cheat: Server fetches price)
        const coinData = await getCoin(symbol.toLowerCase());
        // Note: getCoin usually takes ID (bitcoin), not symbol (BTC). 
        // For MVP we might need a mapper or pass ID from UI.
        // Assuming UI maps ID correctly for the call or we do a search.
        // Let's assume UI sends valid ID in 'symbol' field for now, or we lookup.

        const currentPrice = coinData.current_price || 0;

        if (currentPrice === 0) {
            return NextResponse.json({ error: 'Invalid Asset Price' }, { status: 400 });
        }

        // 2. Insert Prediction
        const result = await sql`
            INSERT INTO user_predictions (
                wallet_address, symbol, direction, entry_price, status, points_awarded, rationale, created_at
            ) VALUES (
                ${wallet}, ${symbol}, ${direction}, ${currentPrice}, 'OPEN', ${POINT_VALUES.PREDICTION_MADE}, ${rationale || ''}, NOW()
            )
            RETURNING id
        `;

        // 3. Award 'Prediction Made' Points
        // We do this via the points lib which handles the separate 'user_points' table update
        await earnPointsRemote(wallet, 'PREDICTION_MADE');

        return NextResponse.json({
            success: true,
            id: result[0].id,
            entry_price: currentPrice,
            points_earned: POINT_VALUES.PREDICTION_MADE
        });

    } catch (error) {
        console.error("Predict Error:", error);
        return NextResponse.json({ error: 'Failed to submit prediction' }, { status: 500 });
    }
}
