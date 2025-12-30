// API Route: /api/defi/zones
import { NextResponse } from "next/server";
import { getEnhancedZoneData } from "@/lib/defillama";

export const revalidate = 300; // Revalidate every 5 minutes

export async function GET() {
    try {
        const zones = await getEnhancedZoneData();
        return NextResponse.json({ data: zones, timestamp: Date.now() });
    } catch (error) {
        console.error("Error fetching zone data:", error);
        return NextResponse.json(
            { error: "Failed to fetch zone data", data: [] },
            { status: 500 }
        );
    }
}
