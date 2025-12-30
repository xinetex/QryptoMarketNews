// News API Client - Fetches from RSS feeds
import type { NewsItem } from "./types/news";

// Curated RSS feeds for crypto news
const NEWS_FEEDS = [
    {
        url: "https://cointelegraph.com/rss",
        source: "Cointelegraph",
    },
    {
        url: "https://decrypt.co/feed",
        source: "Decrypt",
    },
];

/**
 * Parse RSS XML to NewsItems
 */
function parseRSS(xml: string, source: string): NewsItem[] {
    const items: NewsItem[] = [];

    // Simple regex-based XML parsing (works server-side)
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const titleRegex = /<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/;
    const linkRegex = /<link>(.*?)<\/link>/;
    const pubDateRegex = /<pubDate>(.*?)<\/pubDate>/;

    let match;
    let index = 0;

    while ((match = itemRegex.exec(xml)) !== null && index < 10) {
        const itemXml = match[1];

        const titleMatch = itemXml.match(titleRegex);
        const linkMatch = itemXml.match(linkRegex);
        const pubDateMatch = itemXml.match(pubDateRegex);

        const title = titleMatch?.[1] || titleMatch?.[2] || "";
        let url = linkMatch?.[1] || "";
        const published = pubDateMatch?.[1] || "";

        // Strip CDATA wrapper from URL if present
        if (url.includes("<![CDATA[")) {
            url = url.replace(/<!\[CDATA\[/g, "").replace(/\]\]>/g, "");
        }

        if (title && url) {
            items.push({
                id: `${source}-${index}`,
                title: title.trim(),
                url: url.trim(),
                source,
                published: formatPublishedDate(published),
                sentiment: detectSentiment(title),
            });
            index++;
        }
    }

    return items;
}

/**
 * Simple sentiment detection based on keywords
 */
function detectSentiment(title: string): "positive" | "negative" | "neutral" {
    const lower = title.toLowerCase();

    const positiveWords = ["surge", "rally", "gains", "bullish", "soars", "jumps", "rises", "growth", "adoption", "milestone"];
    const negativeWords = ["crash", "plunge", "drops", "bearish", "falls", "hack", "exploit", "scam", "warning", "risk"];

    for (const word of positiveWords) {
        if (lower.includes(word)) return "positive";
    }
    for (const word of negativeWords) {
        if (lower.includes(word)) return "negative";
    }

    return "neutral";
}

/**
 * Format published date for display
 */
function formatPublishedDate(dateStr: string): string {
    try {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffHours < 1) {
            const diffMins = Math.floor(diffMs / (1000 * 60));
            return `${diffMins}m ago`;
        } else if (diffHours < 24) {
            return `${diffHours}h ago`;
        } else {
            const diffDays = Math.floor(diffHours / 24);
            return `${diffDays}d ago`;
        }
    } catch {
        return "";
    }
}

/**
 * Fetch news from all RSS feeds
 */
export async function getLatestNews(): Promise<NewsItem[]> {
    const allNews: NewsItem[] = [];

    for (const feed of NEWS_FEEDS) {
        try {
            const response = await fetch(feed.url, {
                next: { revalidate: 300 }, // Cache 5 min
                headers: {
                    'User-Agent': 'QChannel/1.0',
                },
            });

            if (response.ok) {
                const xml = await response.text();
                const items = parseRSS(xml, feed.source);
                allNews.push(...items);
            }
        } catch (error) {
            console.error(`Failed to fetch ${feed.source}:`, error);
        }
    }

    // Sort by most recent and return top 15
    return allNews.slice(0, 15);
}

/**
 * Get sample/fallback news for when RSS fails
 */
export function getFallbackNews(): NewsItem[] {
    return [
        { id: "1", title: "Bitcoin Approaches New All-Time High Amid Institutional Demand", url: "#", source: "Market", published: "2h ago", sentiment: "positive" },
        { id: "2", title: "Ethereum L2s See Record TVL as Gas Fees Drop", url: "#", source: "DeFi", published: "3h ago", sentiment: "positive" },
        { id: "3", title: "RWA Tokenization Market Surpasses $30B Milestone", url: "#", source: "RWA", published: "4h ago", sentiment: "positive" },
        { id: "4", title: "GameFi Projects Pivot to 'Play-and-Own' Model", url: "#", source: "Gaming", published: "5h ago", sentiment: "neutral" },
        { id: "5", title: "Solana DeFi Activity Reaches New Heights", url: "#", source: "Solana", published: "6h ago", sentiment: "positive" },
    ];
}
