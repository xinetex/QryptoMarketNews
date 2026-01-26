import { NextResponse } from "next/server";
import { generateTrendSummary } from "@/lib/trend-engine";
import { submitCall } from "@/lib/calls";
import { sql } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    // Basic Cron Security: Check for CRON_SECRET if in production
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        if (process.env.NODE_ENV === "production") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    }

    try {
        console.log('[Cron/Momentum] Starting TSMOM scan...');
        const summary = await generateTrendSummary();
        const callsCreated = [];

        for (const signal of summary.topSignals) {
            // We only care about signals with some conviction
            if (signal.direction === 'NEUTRAL' || signal.score < 20) continue;

            // Check if we already have a pending call for this asset today from this bot
            if (sql) {
                const existing = await sql`
                    SELECT id FROM market_calls 
                    WHERE user_id = 'system:trend-prophet' 
                    AND market_id = ${signal.assetId} 
                    AND status = 'PENDING'
                    AND created_at > NOW() - INTERVAL '24 hours'
                `;
                if (existing.length > 0) {
                    console.log(`[Cron/Momentum] Skipping ${signal.symbol}, active call already exists.`);
                    continue;
                }
            }

            const direction = signal.direction === 'BULLISH' ? 'LONG' : 'SHORT';

            const call = await submitCall('system:trend-prophet', 'Trend Prophet', {
                marketId: signal.assetId,
                marketTitle: `${signal.symbol} 12-Month Momentum Trend`,
                direction: direction,
                confidence: Math.round(signal.confidence * 100),
                entryPrice: signal.lastPrice,
                thesis: `Systematic Time Series Momentum (TSMOM): ${signal.symbol} exhibits a strong ${signal.direction.toLowerCase()} trend over the past 12 months (${(signal.returns['12m'] * 100).toFixed(1)}%). Signal is volatility-scaled with a score of ${signal.score}.`,
                marketSource: 'custom'
            });

            if (call) {
                callsCreated.push(signal.symbol);
            }
        }

        return NextResponse.json({
            success: true,
            timestamp: Date.now(),
            assetsScanned: summary.assetsScanned,
            signalsFound: summary.topSignals.length,
            callsCreated: callsCreated
        });

    } catch (error: any) {
        console.error("[Cron/Momentum] Error:", error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
