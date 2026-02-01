import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

export const revalidate = 3600; // Cache for 1 hour

const parser = new Parser();

// RSS Feeds for Target Channels
const CHANNELS = [
    { id: 'UC4NGTMTk1bq4ldBaT6my7yA', name: 'Bankless' }, // Bankless
    { id: 'UCqK_GSMbpiV8spgD3ZGloSw', name: 'Coin Bureau' }, // Coin Bureau
];

export async function GET() {
    try {
        const feedPromises = CHANNELS.map(async (channel) => {
            const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.id}`;
            try {
                const feed = await parser.parseURL(feedUrl);
                return {
                    title: channel.name,
                    items: feed.items.map(item => ({
                        id: item.id.replace('yt:video:', ''),
                        title: item.title,
                        thumbnail: `https://i.ytimg.com/vi/${item.id.replace('yt:video:', '')}/hqdefault.jpg`,
                        link: item.link,
                        pubDate: item.pubDate,
                        author: item.author
                    })).slice(0, 8) // Limit to 8 recent videos
                };
            } catch (err) {
                console.error(`Failed to fetch feed for ${channel.name}:`, err);
                return null;
            }
        });

        const results = await Promise.all(feedPromises);
        const feeds = results.filter(feed => feed !== null);

        return NextResponse.json({
            feeds: feeds
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch feeds' }, { status: 500 });
    }
}
