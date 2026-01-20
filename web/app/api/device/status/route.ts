
import { NextResponse } from 'next/server';
import { getDeviceCodeStatus } from '@/lib/device';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.json({ error: 'code is required' }, { status: 400 });
    }

    try {
        const status = await getDeviceCodeStatus(code);
        if (!status) {
            return NextResponse.json({ error: 'Code not found' }, { status: 404 });
        }

        return NextResponse.json({ data: status });
    } catch (error) {
        console.error('Error fetching status:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
