// API Route: /api/news
import { NextResponse } from "next/server";
import { getLatestNews, getFallbackNews } from "@/lib/news";

export const revalidate = 300; // Revalidate every 5 minutes

export async function GET() {
    try {
        let news = await getLatestNews();

        // Use fallback if RSS fetch fails
        if (news.length === 0) {
            news = getFallbackNews();
        }

        return NextResponse.json({ data: news, timestamp: Date.now() });
    } catch (error) {
        console.error("Error fetching news:", error);
        return NextResponse.json(
            { data: getFallbackNews(), timestamp: Date.now() },
            { status: 200 }
        );
    }
}
