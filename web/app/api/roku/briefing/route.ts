
import { NextResponse } from 'next/server';
import { getLatestNews } from '@/lib/news';

export const dynamic = 'force-dynamic';

export async function GET() {
    // In a real app, this would fetch from RSS feeds (Bankless, Daily Gwei, etc)
    // For now, we mock the daily briefing data.

    try {
        // Fetch real news from the Prophet Engine
        const newsItems = await getLatestNews();

        // Transform into "Podcast Episodes" for the Roku BriefingScene
        const items = newsItems.map((news, index) => {
            // Determine color based on sentiment
            const color = news.sentiment === 'positive' ? '#10b981' : (news.sentiment === 'negative' ? '#ef4444' : '#3b82f6');

            return {
                id: news.id || `news-${index}`,
                title: news.title,
                podcast: news.source || "Prophet AI",
                description: `Source: ${news.source}. Published ${news.published}. Sentiment: ${news.sentiment?.toUpperCase()}`,
                image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=800&auto=format&fit=crop", // Crypto Abstract
                url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // Placeholder Audio
                duration: "2 min read",
                color: color
            };
        });

        return NextResponse.json({
            date: new Date().toISOString(),
            summary: "Live Intelligence Grid Online. Real-time market data synced from QryptoMarket-News.",
            items: items.slice(0, 10) // Limit to top 10
        });
    } catch (e) {
        console.error("Briefing API Error:", e);
        return NextResponse.json({ error: "Failed to fetch intelligence" }, { status: 500 });
    }
}
