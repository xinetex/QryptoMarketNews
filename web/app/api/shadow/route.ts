
import { NextResponse } from 'next/server';
import { detectWhaleShadow } from '@/lib/whale-detector';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const signals = await detectWhaleShadow();
        return NextResponse.json({ signals });
    } catch (error) {
        console.error("Shadow API Error:", error);
        return NextResponse.json({ signals: [] }, { status: 500 });
    }
}
