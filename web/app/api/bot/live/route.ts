import { NextResponse } from 'next/server';
import { cache } from '@/lib/cache';

// Force dynamic to ensure we get fresh state
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Fetch state from cache
        const state = await cache.get<any>('live_channel_state');

        if (!state) {
            // Return empty/idle state if nothing active
            return NextResponse.json({
                status: 'idle',
                updatedAt: Date.now()
            });
        }

        // Return current active state
        return NextResponse.json({
            status: 'active',
            ...state
        });

    } catch (error) {
        console.error("[LiveAPI] Error fetching state:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
