import { NextResponse } from 'next/server';
import { cache } from '@/lib/cache';
import Parser from 'rss-parser';

const parser = new Parser({
    customFields: {
        item: ['media:group', 'media:thumbnail', 'media:description'],
    },
});

const CHANNELS = [
    { name: "Coin Bureau", id: "UCqK_GSMbpiV8spgD3ZGloSw" },
    { name: "Bankless", id: "UCAl9Ld79qaZxp9JzEOwd3aA" },
    { name: "The Daily Gwei", id: "UCvXG9dplO6k7Q5Z9-4V7b0Q" }, // Actually check ID
    { name: "a16z crypto", id: "UCH2_2C1r1422fcaB5lT3aXg" }
];

export async function GET() {
    try {
        // OPTIMIZATION: Check Cache (1 Hour TTL)
        const CACHE_KEY = "video_feed_v1";
        const cached = await cache.get(CACHE_KEY);
        if (cached) {
            return NextResponse.json(cached);
        }

        const allVideos: any[] = [];

        const promises = CHANNELS.map(async (channel) => {
            try {
                const feed = await parser.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${channel.id}`);

                const videos = feed.items.slice(0, 4).map(item => {
                    const group = item['media:group']; // RSS parser custom field access
                    const thumb = group ? group['media:thumbnail'][0]?.$.url : "";
                    const desc = group ? group['media:description'][0] : "";

                    return {
                        id: item.id.replace("yt:video:", ""),
                        title: item.title,
                        channel: channel.name,
                        thumbnail: thumb,
                        description: desc,
                        pubDate: item.pubDate,
                        timestamp: new Date(item.pubDate || "").getTime(),
                        url: item.link
                    };
                });

                allVideos.push(...videos);
            } catch (e) {
                console.error(`Failed to fetch ${channel.name}`, e);
            }
        });

        await Promise.all(promises);

        // Sort by newest
        allVideos.sort((a, b) => b.timestamp - a.timestamp);

        const responsePayload = {
            videos: allVideos,
            meta: {
                generatedAt: new Date().toISOString()
            }
        };

        // Cache for 1 hour (3600 seconds)
        await cache.set(CACHE_KEY, responsePayload, 3600);

        return NextResponse.json(responsePayload);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
    }
}
