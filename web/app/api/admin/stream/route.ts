import { NextRequest, NextResponse } from 'next/server';
import { getSettings, saveSettings } from '@/lib/config/store';

export async function GET() {
    try {
        const settings = await getSettings();
        return NextResponse.json({
            success: true,
            data: {
                hlsUrl: settings.stream.hlsUrl,
                isLive: settings.stream.isLive,
                title: settings.stream.title,
            }
        });
    } catch (error) {
        console.error('Stream GET error:', error);
        return NextResponse.json({ success: false, error: 'Failed to load stream config' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const currentSettings = await getSettings();

        const updated = await saveSettings({
            ...currentSettings,
            stream: {
                ...currentSettings.stream,
                ...body,
            }
        });

        return NextResponse.json({ success: true, data: updated.stream });
    } catch (error) {
        console.error('Stream POST error:', error);
        return NextResponse.json({ success: false, error: 'Failed to save stream config' }, { status: 500 });
    }
}
