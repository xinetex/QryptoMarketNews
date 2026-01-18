import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { getCollectionData } from '@/lib/alchemy';
import { getCoin } from '@/lib/agentcache';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages, mission } = await req.json();

    // Define system prompt based on mission
    let systemPrompt = "You are Prophet AI, an elite crypto market analyst. Be data-driven, concise, and brutally honest.";

    if (mission === 'sentiment') {
        systemPrompt += " Focus on analyzing sentiment, narrative shifts, and mention volume using available data.";
    } else if (mission === 'gem-hunter') {
        systemPrompt += " You are a VC analyst looking for early-stage opportunities. Focus on team, product-market fit, and red flags.";
    } else if (mission === 'whale-watch') {
        systemPrompt += " You represent 'Smart Money'. Analyze rapid price movements and high-volume transactions to predict trend reversals.";
    }

    const result = streamText({
        model: openai('gpt-4o'),
        system: systemPrompt,
        messages,
        tools: {
            // Tool 1: Get Token Price & Market Data
            getTokenPrice: tool({
                description: 'Get current price, 24h change, and volume for a crypto token',
                parameters: z.object({
                    symbol: z.string().describe('The token symbol (e.g., BTC, SOL, PEPE)'),
                }),
                execute: async ({ symbol }: any) => {
                    // Mapping common symbols to IDs for CoinGecko (simple stub for now)
                    const map: Record<string, string> = {
                        'BTC': 'bitcoin', 'ETH': 'ethereum', 'SOL': 'solana', 'PEPE': 'pepe'
                    };
                    const id = map[symbol.toUpperCase()] || symbol.toLowerCase();
                    const data: any = await getCoin(id);
                    return {
                        price: data?.market_data?.current_price?.usd,
                        change24h: data?.market_data?.price_change_percentage_24h,
                        marketCap: data?.market_data?.market_cap?.usd,
                        ath: data?.market_data?.ath?.usd,
                        athDrawdown: data?.market_data?.ath_change_percentage?.usd
                    };
                },
            } as any),

            // Tool 2: Check NFT Stats (Alchemy)
            getNFTStats: tool({
                description: 'Get floor price and stats for an NFT collection',
                parameters: z.object({
                    contractAddress: z.string().describe('The contract address of the NFT collection'),
                }),
                execute: async ({ contractAddress }: any) => {
                    return await getCollectionData(contractAddress, "Analyst Request");
                }
            } as any),

            // Tool 3: Web Search (Stub for now - requires API key)
            webSearch: tool({
                description: 'Search the web for recent news and sentiment',
                parameters: z.object({
                    query: z.string(),
                }),
                execute: async ({ query }: any) => {
                    return {
                        results: [
                            { title: `Latest news on ${query}`, snippet: "Market sentiment is mixed with heavy volatility..." },
                            { title: "Twitter/X Consensus", snippet: "Influencers are rotating capital into AI tokens..." }
                        ]
                    };
                }
            } as any),
        },
    });

    return result.toTextStreamResponse();
}
