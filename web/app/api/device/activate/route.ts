
import { NextResponse } from 'next/server';
import { linkDeviceCode } from '@/lib/device';

// In a real app, this would use session/auth middleware to get userId
// For now, we'll accept userId in body for testing/mocking
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { code, user_id } = body;

        if (!code || !user_id) {
            return NextResponse.json({ error: 'code and user_id are required' }, { status: 400 });
        }

        const success = await linkDeviceCode(code, user_id);

        if (!success) {
            return NextResponse.json({
                error: 'Activation failed. Code may be invalid, expired, or already used.'
            }, { status: 400 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error activating device:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
