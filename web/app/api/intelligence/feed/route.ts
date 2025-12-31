import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
    try {
        if (!sql) {
            return NextResponse.json({ ideas: [] });
        }

        const ideas = await sql`
            SELECT * FROM saved_ideas 
            WHERE is_public = true 
            ORDER BY created_at DESC 
            LIMIT 6
        `;

        return NextResponse.json({ ideas });
    } catch (error) {
        console.error("Feed API Error:", error);
        return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 });
    }
}
