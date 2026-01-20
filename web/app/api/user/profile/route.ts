
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { UserAlphaProfile } from '@/lib/types/alpha';

export const revalidate = 0; // Dynamic

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
        return NextResponse.json({ error: 'Wallet required' }, { status: 400 });
    }

    try {
        if (!sql) throw new Error("DB not connected");

        const result = await sql`
            SELECT * FROM user_alpha_profiles WHERE wallet_address = ${wallet}
        `;

        if (result.length === 0) {
            // value-add: return default profile
            return NextResponse.json({
                wallet_address: wallet,
                risk_tolerance: 'MODERATE',
                favorite_sectors: [],
                learning_mode: true
            });
        }

        return NextResponse.json(result[0]);
    } catch (error) {
        console.error("Profile Fetch Error:", error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        if (!sql) throw new Error("DB not connected");

        const body = await request.json();
        const { wallet, tolerance, sectors, learning } = body;

        if (!wallet) return NextResponse.json({ error: 'Wallet required' }, { status: 400 });

        // Upsert
        await sql`
            INSERT INTO user_alpha_profiles (
                wallet_address, risk_tolerance, favorite_sectors, learning_mode, last_active_at
            ) VALUES (
                ${wallet}, ${tolerance || 'MODERATE'}, ${JSON.stringify(sectors || [])}, ${learning ?? true}, NOW()
            )
            ON CONFLICT (wallet_address) 
            DO UPDATE SET 
                risk_tolerance = EXCLUDED.risk_tolerance,
                favorite_sectors = EXCLUDED.favorite_sectors,
                learning_mode = EXCLUDED.learning_mode,
                last_active_at = NOW()
        `;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Profile Save Error:", error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
