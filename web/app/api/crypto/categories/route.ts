// API Route: /api/crypto/categories
import { NextResponse } from "next/server";
import { getCategoryData } from "@/lib/coingecko";

export const revalidate = 300; // Revalidate every 5 minutes

export async function GET() {
    try {
        const categories = await getCategoryData();
        return NextResponse.json({ data: categories, timestamp: Date.now() });
    } catch (error) {
        console.error("Error fetching category data:", error);
        return NextResponse.json(
            { error: "Failed to fetch categories", data: [] },
            { status: 500 }
        );
    }
}
