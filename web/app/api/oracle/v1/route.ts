import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateProphecy, storeProphecy } from '@/lib/oracle';

// --- Validation Schemas ---

const ProphecyRequestSchema = z.object({
    marketId: z.string(),
    question: z.string(),
    yesPrice: z.number().min(0).max(1),
    noPrice: z.number().min(0).max(1),
    volume24h: z.number().optional(),
    endDate: z.string().optional(),
});

// --- Constants ---

const API_KEY = process.env.ORACLE_API_KEY || 'test-api-key'; // Replace with env var in prod

// --- Handler ---

export async function POST(req: NextRequest) {
    // 1. Authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    if (token !== API_KEY) {
        return NextResponse.json({ error: 'Invalid API Key' }, { status: 403 });
    }

    // 2. Validation
    const body = await req.json();
    const result = ProphecyRequestSchema.safeParse(body);

    if (!result.success) {
        return NextResponse.json({ error: 'Invalid Request', details: result.error.format() }, { status: 400 });
    }

    // 3. Logic Execution (Generate/Store Prophecy)
    try {
        const prophecy = await generateProphecy({
            id: result.data.marketId,
            question: result.data.question,
            yesPrice: result.data.yesPrice,
            noPrice: result.data.noPrice,
            volume24h: result.data.volume24h,
            endDate: result.data.endDate,
        });

        // NOTE: In a real deployment, we would also:
        // 1. Sign this data with the Oracle's private key.
        // 2. Submit the hash to the Smart Contract (ProphetOracle.sol).

        return NextResponse.json({ success: true, prophecy }, { status: 200 });

    } catch (error) {
        console.error("Oracle Error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    return NextResponse.json({ status: 'active', service: 'Prophet Oracle v1' });
}
