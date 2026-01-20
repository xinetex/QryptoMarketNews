
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getCoin } from '@/lib/coingecko';
import { earnPointsRemote, POINT_VALUES } from '@/lib/points';

export const revalidate = 0; // Always dynamic

export async function GET(request: Request) {
    try {
        if (!sql) throw new Error("DB not connected");

        // 1. Find Open Predictions older than 24h
        // Note: For MVP we hardcode 24 hour interval check.
        const pending = await sql`
            SELECT * FROM user_predictions 
            WHERE status = 'OPEN' 
            AND created_at < NOW() - INTERVAL '24 hours'
        `;

        const results = [];

        // 2. Resolve each
        for (const pred of pending) {
            const coin = await getCoin(pred.symbol); // assumes symbol is id for now
            const closePrice = coin.current_price || 0;

            if (closePrice === 0) continue; // Failed to fetch price, skip

            let outcome = 'LOST';
            const entryPrice = parseFloat(pred.entry_price);

            if (pred.direction === 'UP' && closePrice > entryPrice) {
                outcome = 'WON';
            } else if (pred.direction === 'DOWN' && closePrice < entryPrice) {
                outcome = 'WON';
            } else if (closePrice === entryPrice) {
                outcome = 'VOID'; // Tie (rare)
            }

            // 3. Update DB
            await sql`
                UPDATE user_predictions
                SET status = ${outcome},
                    close_price = ${closePrice},
                    resolved_at = NOW(),
                    points_awarded = ${outcome === 'WON' ? POINT_VALUES.PREDICTION_CORRECT : 0}
                WHERE id = ${pred.id}
            `;

            // 4. Award Points if Won
            if (outcome === 'WON') {
                await earnPointsRemote(pred.wallet_address, 'PREDICTION_CORRECT');
            }

            results.push({
                id: pred.id,
                symbol: pred.symbol,
                outcome,
                points: outcome === 'WON' ? POINT_VALUES.PREDICTION_CORRECT : 0
            });
        }

        return NextResponse.json({
            resolved_count: results.length,
            details: results
        });

    } catch (error) {
        console.error("Resolution Error:", error);
        return NextResponse.json({ error: 'Resolution Failed' }, { status: 500 });
    }
}
