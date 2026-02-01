
import { NextResponse } from "next/server";
import { sentinel } from "@/lib/sentinel";

// Force dynamic needed for cron/API routes often
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    // Cron Security: Check for CRON_SECRET
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        if (process.env.NODE_ENV === "production") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    }

    try {
        console.log("[Cron/Sentinel] Triggering autonomous scan...");

        // Execute the Sentinel Logic
        const results = await sentinel.scanAndPost();

        return NextResponse.json({
            success: true,
            timestamp: Date.now(),
            actions_taken: results.length,
            details: results
        });

    } catch (error: any) {
        console.error("[Cron/Sentinel] Error:", error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
