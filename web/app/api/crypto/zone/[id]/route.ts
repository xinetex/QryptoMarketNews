// API Route: /api/crypto/zone/[id]
import { NextResponse } from "next/server";
import { getCoinsByCategory } from "@/lib/coingecko";

export const revalidate = 120; // Revalidate every 2 minutes

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const coins = await getCoinsByCategory(id);
        return NextResponse.json({ data: coins, timestamp: Date.now() });
    } catch (error) {
        console.error("Error fetching zone coins:", error);
        return NextResponse.json(
            { error: "Failed to fetch zone data", data: [] },
            { status: 500 }
        );
    }
}
