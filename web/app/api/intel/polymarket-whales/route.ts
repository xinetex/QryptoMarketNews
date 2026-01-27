import { NextResponse } from 'next/server';
import { findProfitableWallets } from '@/lib/polymarket-analyzer';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow longer timeout for scanning

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const minProfit = parseFloat(searchParams.get('minProfit') || '0');
        const minWinRate = parseFloat(searchParams.get('minWinRate') || '0.5');

        const wallets = await findProfitableWallets(minProfit, minWinRate);

        return NextResponse.json({
            count: wallets.length,
            wallets
        });
    } catch (error) {
        console.error("Polymarket Whale Analysis Failed:", error);
        return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
    }
}
