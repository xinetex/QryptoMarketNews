import { NextResponse } from 'next/server';
import { WhaleDetector } from '@/lib/whale-engine/detector';

// Instantiate detector (Singleton-ish behavior in lambda is tricky, but fine for now)
const detector = new WhaleDetector();

export async function GET() {
    try {
        // scan all chains
        // In a real app, this would query a DB where a background worker saves alerts
        // For now, we generate fresh ones on demand
        const ethAlerts = await detector.scanBlock('ethereum');
        const solAlerts = await detector.scanBlock('solana');
        const btcAlerts = await detector.scanBlock('bitcoin');

        const allAlerts = [...ethAlerts, ...solAlerts, ...btcAlerts]
            .sort((a, b) => b.score - a.score);

        return NextResponse.json({
            alerts: allAlerts,
            timestamp: Date.now(),
            active_scans: ['ethereum', 'solana', 'bitcoin']
        });
    } catch (error) {
        console.error("Whale Scan Failed:", error);
        return NextResponse.json({ error: "Failed to scan deep waters" }, { status: 500 });
    }
}
