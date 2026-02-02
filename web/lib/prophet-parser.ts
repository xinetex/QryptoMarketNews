import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';
import type { NewsItem } from './types/news';

// Initialize Google AI with our specific key
// Initialize Google AI with our specific key
// Initialize Google AI with our specific key
const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GEMINI_API || process.env.GEMINI_API_KEY,
});

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
    private model = google('gemini-2.0-flash');

    /**
     * Analyze a batch of news items and return scores
     */
    async scoreNewsBatch(newsItems: NewsItem[]): Promise<NewsItem[]> {
        if (newsItems.length === 0) return [];

        const prompt = `
      Analyze the following crypto news headlines for MARKET IMPACT.
      
      Act as a cynical, high-stakes trader. Most news is noise.
      
      For each item, determine:
      1. Sentiment: BULLISH, BEARISH, or neutral.
      2. Alpha Score (0-100): 
         - 0-50: NOISE. Generic updates, minor price moves, fluff, opinion pieces. -> IGNORE.
         - 51-75: INTERESTING. Defi launches, partnerships, significant stats. -> KEEP.
         - 76-100: CRITICAL ALPHA. Exploits/Hacks, SEC/Regulatory Action, Massive Adoption, Tokenomics Changes, Mainnet Launches. -> ALERT.
      3. Key Assets: Extract tickers (e.g. BTC, ETH, SOL).
      4. Reasoning: Brief (1 sentence) explanation of why this matters (or why it doesn't).
      
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
