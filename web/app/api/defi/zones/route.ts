// API Route: /api/defi/zones
import { NextResponse } from "next/server";
import { getEnhancedZoneData } from "@/lib/defillama";

export const revalidate = 300; // Revalidate every 5 minutes


import { sql } from "@/lib/db";
import { ZoneConfig } from "@/lib/types/defi";

export async function GET() {
    try {
        // Fetch active zones from DB
        if (!sql) {
            throw new Error("Database connection not configured");
        }

        const zones = await sql`
            SELECT * FROM qchannel_zones 
            WHERE is_active = true 
            ORDER BY sort_order ASC
        ` as unknown as ZoneConfig[];

        // Enhance with DeFiLlama data
        const enhancedZones = await getEnhancedZoneData(zones);

        return NextResponse.json({ data: enhancedZones, timestamp: Date.now() });
    } catch (error) {
        console.error("Error fetching zone data:", error);
        return NextResponse.json(
            { error: "Failed to fetch zone data", data: [] },
            { status: 500 }
        );
    }
}
