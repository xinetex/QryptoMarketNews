import { getOrSetCache } from "./agentcache";
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

// Zod schema for the distilled intelligence we want
const MarketIntelSchema = z.object({
    sentiment: z.enum(['BULLISH', 'BEARISH', 'NEUTRAL']),
    summary: z.string(),
    key_assets: z.array(z.string()),
    alpha_score: z.number().min(0).max(100),
    actionable_signal: z.boolean()
});

/**
 * The Prophet Parser
 * 
 * 1. Checks AgentCache for existing intelligence on this URL.
 * 2. If MISS:
 *    a. Scrapes the Raw HTML.
 *    b. Feeds HTML to Gemini to "Distill" into JSON.
 *    c. Caches the result (Infinite Memory).
 */
export async function distillUrl(url: string) {
    const cacheKey = `prophet:intel:v1:${Buffer.from(url).toString('base64')}`;

    return getOrSetCache(cacheKey, async () => {
        console.log(`🔮 Prophet Analyzing (Fresh): ${url}`);

        try {
            const response = await fetch(url);
            const html = await response.text();

            // Strip scripts/styles/html tags to save tokens
            const cleanText = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gm, "")
                .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gm, "")
                .replace(/<[^>]+>/g, " ")
                .slice(0, 20000);

            const { object } = await generateObject({
                model: google('gemini-1.5-flash'),
                schema: MarketIntelSchema,
                prompt: `
                    Analyze this web content for crypto market alpha.
                    Extract sentiment, key assets mentioned, and a 0-100 alpha score.
                    Is this actionable intelligence?
                    
                    CONTENT:
                    ${cleanText}
                `,
            });

            return object;

        } catch (error) {
            console.error("Prophet Parser Error:", error);
            return {
                sentiment: 'NEUTRAL',
                summary: "Failed to parse content",
                key_assets: [],
                alpha_score: 0,
                actionable_signal: false
            };
        }
    }, 3600 * 24); // Cache insights for 24 hours
}
