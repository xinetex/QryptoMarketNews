import { NextRequest, NextResponse } from 'next/server';
import { getZones, saveZones, updateZone } from '@/lib/config/store';

export async function GET() {
    try {
        const zones = await getZones();
        return NextResponse.json({ success: true, data: zones });
    } catch (error) {
        console.error('Zones GET error:', error);
        return NextResponse.json({ success: false, error: 'Failed to load zones' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // If array, replace all zones
        if (Array.isArray(body)) {
            const updated = await saveZones(body);
            return NextResponse.json({ success: true, data: updated });
        }

        // If single zone update
        if (body.id) {
            const updated = await updateZone(body.id, body);
            if (!updated) {
                return NextResponse.json({ success: false, error: 'Zone not found' }, { status: 404 });
            }
            return NextResponse.json({ success: true, data: updated });
        }

        return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
    } catch (error) {
        console.error('Zones POST error:', error);
        return NextResponse.json({ success: false, error: 'Failed to save zones' }, { status: 500 });
    }
}
