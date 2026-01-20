// News Types

export interface NewsItem {
    id: string;
    title: string;
    url: string;
    source: string;
    published: string;
    category?: string;
    sentiment?: "positive" | "negative" | "neutral" | "BULLISH" | "BEARISH";
    alpha_score?: number; // 0-100 Prophet Score
    key_assets?: string[]; // ["BTC", "SOL"]
    actionable?: boolean;
}

export interface NewsApiResponse {
    data: NewsItem[];
    timestamp: number;
}
