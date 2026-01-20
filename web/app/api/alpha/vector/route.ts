
import { NextResponse } from "next/server";
import { generateAlphaVector } from "@/lib/alpha-engine";

export const revalidate = 60; // Revalidate every minute

export async function POST(request: Request) {
    try {
        // In the future, we'll parse the request body for userProfile
        // const body = await request.json();

        // For now, generate a generic vector
        const vector = await generateAlphaVector();

        return NextResponse.json(vector);
    } catch (error) {
        console.error("Failed to generate Alpha Vector:", error);
        return NextResponse.json(
            { error: "Internal Engine Error" },
            { status: 500 }
        );
    }
}

// Allow GET for easy testing/debugging
export async function GET(request: Request) {
    return POST(request);
}
