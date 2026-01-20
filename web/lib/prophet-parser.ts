import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import type { NewsItem } from './types/news';

// Schema for AI Output
const ScoredNewsSchema = z.object({
    items: z.array(z.object({
        id: z.string(),
        sentiment: z.enum(['BULLISH', 'BEARISH', 'neutral']),
        alpha_score: z.number().min(0).max(100),
        key_assets: z.array(z.string()),
        reasoning: z.string().optional()
    }))
});

export class ProphetParser {
    private model = google('gemini-1.5-flash');

    /**
     * Analyze a batch of news items and return scores
     */
    async scoreNewsBatch(newsItems: NewsItem[]): Promise<NewsItem[]> {
        if (newsItems.length === 0) return [];

        const prompt = `
      Analyze the following crypto news headlines for MARKET IMPACT.
      
      For each item, determine:
      1. Sentiment: BULLISH, BEARISH, or neutral.
      2. Alpha Score (0-100): 
         - 0-30: Noise, irrelevant, or minimal impact.
         - 31-60: Standard news, moderate interest.
         - 61-85: Significant market mover, actionable info.
         - 86-100: CRITICAL ALPHA (Major adoption, hacks, regulation, massive pumps).
      3. Key Assets: Extract tickers (e.g. BTC, ETH, SOL).
      
      News Items:
      ${newsItems.map(item => `[ID: ${item.id}] Title: ${item.title}`).join('\n')}
    `;

        try {
            const { object } = await generateObject({
                model: this.model,
                schema: ScoredNewsSchema,
                prompt: prompt,
            });

            // Merge results back into original items
            return newsItems.map(item => {
                const score = object.items.find(s => s.id === item.id);
                if (score) {
                    return {
                        ...item,
                        sentiment: score.sentiment as any,
                        alpha_score: score.alpha_score,
                        key_assets: score.key_assets
                    };
                }
                return item;
            });

        } catch (error) {
            console.error("ProphetParser Error:", error);
            // Return unscored items on failure
            return newsItems;
        }
    }
}

export const prophetParser = new ProphetParser();
