// API Route: /api/crypto/prices
import { NextResponse } from "next/server";
import { getTopCoins } from "@/lib/coingecko";

export const revalidate = 60; // Revalidate every 60 seconds

export async function GET() {
    try {
        const prices = await getTopCoins();
        return NextResponse.json({ data: prices, timestamp: Date.now() });
    } catch (error) {
        console.error("Error fetching crypto prices:", error);
        return NextResponse.json(
            { error: "Failed to fetch prices", data: [] },
            { status: 500 }
        );
    }
}
