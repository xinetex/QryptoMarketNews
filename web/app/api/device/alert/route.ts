
import { NextResponse } from 'next/server';

// Mock in-memory store for alerts (would be Redis/DB in prod)
let activeAlert: any = null;

// Debug: Set an initial alert for testing?
// activeAlert = {
//     id: "test-alert-1",
//     type: "BULL", // BULL or BEAR
//     title: "BITCOIN BREAKOUT",
//     message: "Whale accumulation detected > $50M",
//     timestamp: Date.now()
// };

export async function GET() {
    // 20% chance to generate a random alert for demo purposes if none exists
    if (!activeAlert && Math.random() > 0.8) {
        const type = Math.random() > 0.5 ? 'BULL' : 'BEAR';
        activeAlert = {
            id: `demo-${Date.now()}`,
            type,
            title: type === 'BULL' ? 'HIGH MOMENTUM EVENT' : 'MARKET DUMP DETECTED',
            message: type === 'BULL' ? 'Solana breaking resistance levels.' : 'Heavy selling pressure on ETH.',
            timestamp: Date.now()
        };

        // Auto-clear after 1 minute (logic would be handled by a cleaner usually)
        setTimeout(() => activeAlert = null, 60000);
    }

    if (!activeAlert) {
        return new NextResponse(null, { status: 204 }); // No Content
    }

    return NextResponse.json(activeAlert);
}

// Admin endpoint to trigger alerts manually
export async function POST(req: Request) {
    try {
        const body = await req.json();
        activeAlert = {
            id: `manual-${Date.now()}`,
            type: body.type || 'BULL',
            title: body.title || 'MANUAL ALERT',
            message: body.message || 'Alert triggered manually',
            timestamp: Date.now()
        };
        return NextResponse.json({ success: true, alert: activeAlert });
    } catch (e) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
