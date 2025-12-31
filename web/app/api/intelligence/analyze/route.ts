
import { NextResponse } from "next/server";
import { analyzeProject } from "@/lib/gemini";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { project } = await req.json();

        if (!project) {
            return NextResponse.json({ error: "Project name is required" }, { status: 400 });
        }

        // Check Usage Limits
        if (sql && !(session.user as any).isPremium) {
            const users = await sql`SELECT free_scans_used FROM users WHERE email = ${session.user.email}`;
            const usage = users[0]?.free_scans_used || 0;

            if (usage >= 1) {
                return NextResponse.json({ error: "Free limit reached" }, { status: 403 });
            }

            // Increment usage
            await sql`UPDATE users SET free_scans_used = free_scans_used + 1 WHERE email = ${session.user.email}`;
        }

        // Mock fallback if no API key in dev (optional, but good for stability)
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({
                sector: "Simulated Sector",
                summary: "Simulation mode active (No API Key).",
                gaps: ["Simulation Gap 1", "Simulation Gap 2"],
                innovationScore: 88,
                opportunities: [
                    { title: "Simulated Idea 1", description: "This is a mock response." },
                    { title: "Simulated Idea 2", description: "Configure GEMINI_API_KEY to get real intel." }
                ],
                riskLevel: "Low"
            });
        }

        const analysis = await analyzeProject(project);

        if (!analysis) {
            return NextResponse.json({ error: "Failed to generate analysis" }, { status: 500 });
        }

        return NextResponse.json(analysis);

    } catch (error) {
        console.error("Intelligence API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
