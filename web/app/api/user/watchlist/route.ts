import { NextRequest, NextResponse } from 'next/server';
import { cache } from '@/lib/cache';

const KEY = "user_watchlist_default";

// Mock initial watchlist
const DEFAULT_WATCHLIST = [
    { id: "bitcoin", symbol: "btc", name: "Bitcoin", price: 64230 },
    { id: "ethereum", symbol: "eth", name: "Ethereum", price: 3450 },
    { id: "solana", symbol: "sol", name: "Solana", price: 145 }
];

export async function GET() {
    const data = await cache.get(KEY);
    return NextResponse.json({
        items: data || DEFAULT_WATCHLIST
    });
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { action, coin } = body; // action: 'add' | 'remove'

        // Get current list
        let current = (await cache.get(KEY)) as any[] || DEFAULT_WATCHLIST;

        if (action === 'add' && coin) {
            // Check if exists
            if (!current.find(c => c.id === coin.id)) {
                current.push(coin);
            }
        } else if (action === 'remove' && coin) {
            current = current.filter(c => c.id !== coin.id);
        }

        // Save
        await cache.set(KEY, current, 86400); // 24 hours

        return NextResponse.json({ success: true, items: current });
    } catch (e) {
        return NextResponse.json({ error: "Failed to update watchlist" }, { status: 500 });
    }
}
