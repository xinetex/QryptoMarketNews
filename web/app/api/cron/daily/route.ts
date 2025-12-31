import { NextResponse } from "next/server";
import { generateDailyConcepts } from "@/lib/gemini";
import { sql } from "@/lib/db";

export async function GET(req: Request) {
    // Basic Cron Security: Check for CRON_SECRET if in production
    // You should set CRON_SECRET in your .env and Vercel Cron settings
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        // Allow access in development environment without secret for testing
        if (process.env.NODE_ENV === "production") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    }

    try {
        if (!sql) {
            return NextResponse.json({ error: "Database not connected" }, { status: 500 });
        }

        const concepts = await generateDailyConcepts();

        if (!concepts || !Array.isArray(concepts)) {
            return NextResponse.json({ error: "Failed to generate concepts" }, { status: 500 });
        }

        const inserted = [];

        for (const concept of concepts) {
            const result = await sql`
                INSERT INTO saved_ideas (
                    project_name, 
                    sector, 
                    summary, 
                    idea_title, 
                    idea_description, 
                    is_public,
                    created_at
                )
                VALUES (
                    ${concept.project_name}, 
                    ${concept.sector}, 
                    ${concept.summary}, 
                    ${concept.idea_title}, 
                    ${concept.idea_description},
                    true,
                    NOW()
                )
                RETURNING id
            `;
            inserted.push(result[0]);
        }

        return NextResponse.json({
            success: true,
            message: `Generated ${inserted.length} daily concepts`,
            concepts: inserted
        });

    } catch (error: any) {
        console.error("Cron Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
