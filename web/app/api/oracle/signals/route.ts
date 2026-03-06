import { NextResponse } from 'next/server';

export const revalidate = 0; // Always dynamic

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.ORACLE_API_SECRET;

    // Optional: Protect route if secret is configured
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Returning the target structure requested to wire into MaxxPoly immediately
    const signals = [
        {
            source: "qrypto-oracle",
            marketId: "KXBTCD-26MAR0617-T70749.99",
            side: "NO",
            confidence: 0.82,
            fairYes: 0.29,
            timestampIso: "2026-03-06T12:00:00Z",
            note: "BTC momentum + news tone + macro context"
        }
    ];

    return NextResponse.json({ signals });
}
