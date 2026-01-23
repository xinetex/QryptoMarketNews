/**
 * Calls API Route
 * Handles creating new market calls and fetching user history.
 */

import { NextRequest, NextResponse } from 'next/server';
import { submitCall, getUserCalls, getLeaderboard } from '@/lib/calls';
import { CallSubmission } from '@/lib/types/calls';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, username, call } = body;

        // Validate inputs (basic)
        if (!userId || !call.marketId || !call.direction) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Logic to ensure user isn't spamming (rate limit check could go here)
        const newCall = await submitCall(userId, username || 'Anonymous', call as CallSubmission);

        return NextResponse.json({ call: newCall });
    } catch (error) {
        console.error('Submit Call Error:', error);
        return NextResponse.json({ error: 'Failed to submit call' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type'); // 'leaderboard' or 'history'

    if (type === 'leaderboard') {
        const leaderboard = await getLeaderboard();
        return NextResponse.json({ leaderboard });
    }

    if (userId) {
        const calls = await getUserCalls(userId);
        return NextResponse.json({ calls });
    }

    return NextResponse.json({ error: 'Missing userId or valid type' }, { status: 400 });
}
