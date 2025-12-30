// News Types

export interface NewsItem {
    id: string;
    title: string;
    url: string;
    source: string;
    published: string;
    category?: string;
    sentiment?: "positive" | "negative" | "neutral";
}

export interface NewsApiResponse {
    data: NewsItem[];
    timestamp: number;
}
