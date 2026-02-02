import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@/lib/cache';

// Force dynamic since we use headers/body
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        // 1. Authorization Check
        // Expecting "Bearer <BOT_SECRET_KEY>"
        const authHeader = req.headers.get('authorization');
        const secretKey = process.env.BOT_SECRET_KEY;

        if (!authHeader || !secretKey || authHeader !== `Bearer ${secretKey}`) {
            console.warn("[BotAPI] Unauthorized access attempt");
            return NextResponse.json(
                { error: 'Unauthorized', message: 'Invalid or missing API key' },
                { status: 401 }
            );
        }

        // 2. Parse Body
        const body = await req.json();
        const { command, value, alert, zoneId, headline } = body;

        if (!command) {
            return NextResponse.json(
                { error: 'Bad Request', message: 'Missing command field' },
                { status: 400 }
            );
        }

        console.log(`[BotAPI] Received command: ${command}`);

        // 3. Update State based on command
        // We fetch existing state first to merge updates (optional, for now simple overwrite or merge)
        let currentState = await cache.get<any>('live_channel_state') || {};

        // Update timestamp
        currentState.updatedAt = Date.now();
        currentState.lastCommand = command;

        // Handle specific commands
        if (command === 'set_zone') {
            if (zoneId) currentState.activeZone = zoneId;
        } else if (command === 'alert') {
            if (alert) {
                currentState.alert = {
                    id: `alert-${Date.now()}`,
                    title: alert,
                    type: 'bot_alert',
                    timestamp: Date.now()
                };
            }
        } else if (command === 'set_headline') {
            if (headline) currentState.customHeadline = headline;
        } else if (command === 'reset') {
            currentState = { updatedAt: Date.now() }; // Clear state
        }

        // Merge arbitrary data if provided in 'data' field
        if (body.data) {
            currentState.data = { ...currentState.data, ...body.data };
        }

        // 4. Store State (TTL 5 minutes - keep it reasonably fresh but ephemeral)
        await cache.set('live_channel_state', currentState, 300);

        return NextResponse.json({
            success: true,
            message: `Command '${command}' processed`,
            state: currentState
        });

    } catch (error) {
        console.error("[BotAPI] Error processing request:", error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: String(error) },
            { status: 500 }
        );
    }
}
