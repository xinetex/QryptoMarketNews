import { NextRequest, NextResponse } from 'next/server';
import { analyzeSwarmActivity } from '@/lib/polymarket-analyzer';

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const conditionId = searchParams.get('conditionId');

    if (!conditionId) {
        return NextResponse.json({ error: 'Missing conditionId' }, { status: 400 });
    }

    try {
        const swarmData = await analyzeSwarmActivity(conditionId);
        return NextResponse.json(swarmData);
    } catch (error) {
        console.error('Swarm API Error:', error);
        return NextResponse.json({ error: 'Failed to analyze swarm' }, { status: 500 });
    }
}
