
import { NextResponse } from 'next/server';
import { createDeviceCode } from '@/lib/device';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { roku_serial, device_name } = body;

        if (!roku_serial) {
            return NextResponse.json({ error: 'roku_serial is required' }, { status: 400 });
        }

        const deviceCode = await createDeviceCode(roku_serial, device_name);
        return NextResponse.json({ data: deviceCode });

    } catch (error) {
        console.error('Error creating device code:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
