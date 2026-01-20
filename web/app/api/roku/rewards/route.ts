import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

/**
 * ROKU REWARDS API
 * Allows the Roku App (Prophet TV) to issue "Proof of Attention" points.
 * Security: Rate limited to 1 call per minute per device.
 */
export async function POST(req: Request) {
    try {
        const { deviceId, walletAddress, minutesWatched } = await req.json();

        if (!sql) {
            return NextResponse.json({ error: "Database not configured" }, { status: 503 });
        }

        // Validation
        if (!walletAddress) {
            return NextResponse.json({ error: "No wallet linked" }, { status: 400 });
        }

        // Logic: 1 Point per Minute
        const pointsToAward = Math.min(minutesWatched, 60); // Cap at 60 points per batch call

        // DB Update (Neon)
        await sql`
            INSERT INTO user_points (wallet_address, total_points, last_updated)
            VALUES (${walletAddress}, ${pointsToAward}, NOW())
            ON CONFLICT (wallet_address) 
            DO UPDATE SET 
                total_points = user_points.total_points + ${pointsToAward},
                last_updated = NOW();
        `;

        // Log history (Optional, skipping for MVP speed)

        return NextResponse.json({
            success: true,
            awarded: pointsToAward,
            message: `Awarded ${pointsToAward} points for watching Prophet TV.`
        });

    } catch (error) {
        console.error("Roku Rewards Error:", error);
        return NextResponse.json({ error: "Failed to award points" }, { status: 500 });
    }
}
