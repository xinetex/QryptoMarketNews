/**
 * Perplexity API Client
 * Powers the Daily Briefing Engine with deep research synthesis.
 * 
 * Model: sonar-reasoning-pro (preferred) or sonar-medium-online
 */

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const API_URL = 'https://api.perplexity.ai/chat/completions';

export interface BriefingRequest {
    date: string;
    marketContext: string; // Summary of significant price moves
    activeSignals: string[]; // List of active dislocation signals
}

export interface BriefingResponse {
    title: string;
    summary: string;
    content: string; // Markdown
}

/**
 * Generate a daily briefing using Perplexity
 */
export async function generateBriefing(context: BriefingRequest): Promise<BriefingResponse> {
    if (!PERPLEXITY_API_KEY) {
        console.warn('[Perplexity] No API key found, using fallback briefing');
        return getFallbackBriefing();
    }

    const systemPrompt = `
    You are the Chief Investment Officer of the Flex Signal Network, a crypto prediction platform.
    Your goal is to write a high-conviction daily briefing called "The Signal".
    
    Style Guide:
    - Concise, punchy, professional but accessible (like Matt Levine meets Cobie).
    - Focus on PREDICTIVE insights, not just reporting what happened.
    - Highlight "Dislocations" (where the market is wrong).
    - Use Markdown formatting.
    
    Structure:
    1. **The Lead**: The single most important narrative shifting the market.
    2. **The Dislocation**: One specific area where price != reality.
    3. **The Calendar**: Key events/unlocks in the next 48h.
  `;

    const userPrompt = `
    Date: ${context.date}
    
    Market Context:
    ${context.marketContext}
    
    Active Signals:
    ${context.activeSignals.join('\n')}
    
    Generate today's briefing.
  `;

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'sonar-reasoning-pro',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ]
            })
        });

        if (!res.ok) throw new Error(`Perplexity API Error: ${res.status}`);

        const data = await res.json();
        const content = data.choices[0].message.content;

        // Simple parsing to extract title (first line) and summary
        const lines = content.split('\n');
        const title = lines[0].replace(/^#\s*/, '').trim();
        const summary = lines.slice(1, 5).join(' ').replace(/[#*]/g, '').trim().substring(0, 200) + '...';

        return {
            title,
            summary,
            content
        };

    } catch (error) {
        console.error('[Perplexity] Generation failed:', error);
        return getFallbackBriefing();
    }
}

/**
 * Fallback content for development/testing
 */
function getFallbackBriefing(): BriefingResponse {
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

    return {
        title: `The Signal: Volatility Returns`,
        summary: "Bitcoin reclaims $98k as funding rates neutralize. The market is waking up to the Layer 2 rotation thesis.",
        content: `
# The Signal: Volatility Returns
**${dateStr}**

## The Lead: The Funding Reset
After a week of overheated perpetuals, we've finally seen the flush. Open interest has cooled by $2B across major exchanges, resetting funding rates to neutral. This is structurally bullish: the leverage overhang is gone, clearing the runway for spot-driven price discovery.

## The Dislocation: Ethereum L2s
While ETH beta plays are lagging, on-chain activity on Base and Arbitrum is hitting all-time highs. Use the **Crowded Short** signal on ARB as a counter-trade indicator.

## The Calendar
- **Tomorrow**: $120M AVAX unlock
- **Wednesday**: FOMC Minutes
- **Friday**: Options Expiry ($4B notional)
    `
    };
}
