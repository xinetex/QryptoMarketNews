import { NextResponse } from 'next/server';
import { cache } from '@/lib/cache';
import Parser from 'rss-parser';

// Initialize RSS Parser
const parser = new Parser();

// Curated list of high-quality crypto podcasts
const PODCAST_FEEDS = [
    {
        name: "Bankless",
        url: "http://podcast.banklesshq.com/feed",
        color: "#d01c1c"
    },
    {
        name: "Unchained",
        url: "https://unchained.libsyn.com/rss",
        color: "#6366f1"
    },
    {
        name: "The Daily Gwei",
        url: "https://anchor.fm/s/2eb039ac/podcast/rss",
        color: "#8b5cf6"
    }
];

export async function GET() {
    try {
        // OPTIMIZATION: Check Cache (1 Hour TTL)
        const CACHE_KEY = "briefing_feed_v1";
        const cached = await cache.get(CACHE_KEY);
        if (cached) {
            return NextResponse.json(cached);
        }

        const allEpisodes: any[] = [];

        // Fetch all feeds in parallel
        const feedPromises = PODCAST_FEEDS.map(async (feedInfo) => {
            try {
                const feed = await parser.parseURL(feedInfo.url);

                // Process recent episodes (limit 5 per feed)
                const recentItems = feed.items.slice(0, 5).map(item => {
                    // Find audio URL
                    const audioUrl = item.enclosure?.url;
                    if (!audioUrl || !audioUrl.includes('mp3') && !audioUrl.includes('m4a')) {
                        return null;
                    }

                    // Simple HTML strip from summary
                    const cleanDesc = (item.contentSnippet || item.content || "")
                        .replace(/<[^>]*>?/gm, "")
                        .slice(0, 300) + "...";

                    return {
                        id: item.guid || item.link,
                        title: item.title,
                        podcast: feedInfo.name,
                        description: cleanDesc,
                        date: item.pubDate,
                        timestamp: item.pubDate ? new Date(item.pubDate).getTime() : 0,
                        url: audioUrl,
                        duration: item.itunes?.duration || "",
                        image: item.itunes?.image || feed.image?.url || "",
                        color: feedInfo.color
                    };
                }).filter(Boolean); // Filter out nulls (no audio)

                allEpisodes.push(...recentItems);
            } catch (err) {
                console.error(`Failed to parse feed ${feedInfo.name}:`, err);
            }
        });

        await Promise.all(feedPromises);

        // Sort by date (newest first)
        allEpisodes.sort((a, b) => b.timestamp - a.timestamp);

        const responsePayload = {
            meta: {
                total: allEpisodes.length,
                generatedAt: new Date().toISOString()
            },
            items: allEpisodes
        };

        // Cache for 1 hour (3600 seconds)
        await cache.set(CACHE_KEY, responsePayload, 3600);

        return NextResponse.json(responsePayload);

    } catch (error) {
        console.error("Briefing API Error:", error);
        return NextResponse.json(
            { error: "Failed to generate briefing feed" },
            { status: 500 }
        );
    }
}
