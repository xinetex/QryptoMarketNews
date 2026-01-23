import { NextResponse } from 'next/server';
import { getTodaysBriefing } from '@/lib/briefing-engine';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
    try {
        const briefing = await getTodaysBriefing();
        return NextResponse.json({ briefing });
    } catch (error) {
        console.error('[Briefing API] Error:', error);
        return NextResponse.json({ error: 'Failed to generate briefing' }, { status: 500 });
    }
}
