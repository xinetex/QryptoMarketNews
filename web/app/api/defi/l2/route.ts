// API Route: /api/defi/l2
import { NextResponse } from "next/server";
import { getL2Comparison } from "@/lib/defillama";

export const revalidate = 300; // Revalidate every 5 minutes

export async function GET() {
    try {
        const l2Data = await getL2Comparison();
        return NextResponse.json({ data: l2Data, timestamp: Date.now() });
    } catch (error) {
        console.error("Error fetching L2 data:", error);
        return NextResponse.json(
            { error: "Failed to fetch L2 data", data: [] },
            { status: 500 }
        );
    }
}
