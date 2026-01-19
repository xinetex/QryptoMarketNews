
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { POINT_VALUES, PointEventType } from '@/lib/points';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet');

    if (!walletAddress) {
        return NextResponse.json({ error: 'Missing wallet address' }, { status: 400 });
    }

    try {
        if (!sql) {
            return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
        }

        const result = await sql`
            SELECT * FROM user_points WHERE wallet_address = ${walletAddress}
        `;

        if (result.length === 0) {
            return NextResponse.json({
                totalPoints: 0,
                level: 'Bronze',
                history: []
            });
        }

        return NextResponse.json({
            totalPoints: result[0].total_points,
            level: result[0].level,
            history: result[0].history
        });
    } catch (error) {
        console.error('Failed to fetch points:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { walletAddress, eventType } = body;

        if (!walletAddress || !eventType) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (!sql) {
            return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
        }

        const pointsAwarded = POINT_VALUES[eventType as PointEventType] || 0;

        // Simple Level Logic (Duplicated from lib/points.ts for now, or imported)
        // Ideally we fetch the levels logic or store it in DB.
        // For MVP, we'll calculate level on write.

        // Get current points first
        const current = await sql`
            SELECT total_points, history FROM user_points WHERE wallet_address = ${walletAddress}
        `;

        let totalPoints = 0;
        let history = [];

        if (current.length > 0) {
            totalPoints = current[0].total_points;
            history = current[0].history || [];
        }

        const newTotal = totalPoints + pointsAwarded;

        // Calculate new level
        let newLevel = 'Bronze';
        if (newTotal >= 10000) newLevel = 'Prophet';
        else if (newTotal >= 2000) newLevel = 'Gold';
        else if (newTotal >= 500) newLevel = 'Silver';

        // Add event to history
        const newEvent = {
            id: crypto.randomUUID(),
            type: eventType,
            points: pointsAwarded,
            timestamp: new Date().toISOString()
        };

        const newHistory = [newEvent, ...history].slice(0, 50); // Keep last 50

        // Upsert
        await sql`
            INSERT INTO user_points (wallet_address, total_points, level, history, last_updated)
            VALUES (${walletAddress}, ${newTotal}, ${newLevel}, ${JSON.stringify(newHistory)}, NOW())
            ON CONFLICT (wallet_address)
            DO UPDATE SET
                total_points = EXCLUDED.total_points,
                level = EXCLUDED.level,
                history = EXCLUDED.history,
                last_updated = NOW()
        `;

        return NextResponse.json({
            success: true,
            totalPoints: newTotal,
            level: newLevel,
            pointsAwarded
        });

    } catch (error) {
        console.error('Failed to award points:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
