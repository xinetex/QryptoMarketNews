import { generateBriefing as callPerplexity, BriefingResponse } from './perplexity';
import { detectDislocations } from './dislocation-engine';
import { analyzeDerivatives } from './coinglass';
import { sql } from './db';

export async function getTodaysBriefing() {
    // Check DB cache first
    if (sql) {
        try {
            const today = new Date().toISOString().split('T')[0];
            const rows = await sql`
        SELECT * FROM daily_briefings WHERE date = ${today}
      `;
            if (rows.length > 0) {
                return {
                    title: rows[0].title,
                    summary: rows[0].summary,
                    content: rows[0].content,
                    generatedAt: rows[0].generated_at
                };
            }
        } catch (e) { console.error('DB Cache Check Failed', e); }
    }

    // Generate new briefing
    return await createNewBriefing();
}

async function createNewBriefing() {
    console.log('[Briefing Engine] Starting generation...');

    // 1. Gather Context
    const [dislocations, derivatives] = await Promise.all([
        detectDislocations(),
        analyzeDerivatives(['BTC', 'ETH', 'SOL'])
    ]);

    // 2. Format Context for AI
    const marketContext = `
    Top Derivatives Signals:
    ${derivatives.map(d => `- ${d.symbol}: Funding ${d.fundingRate.toFixed(4)}% | OI Change ${d.oiChange24h.toFixed(1)}% | Signal: ${d.fundingSignal}`).join('\n')}
  `;

    const activeSignals = dislocations.signals
        .filter(s => s.score > 30) // Only high conviction
        .map(s => `- ${s.market.title}: ${s.narrative} (Score: ${s.score})`);

    // 3. Call Perplexity
    const briefing = await callPerplexity({
        date: new Date().toLocaleDateString(),
        marketContext,
        activeSignals
    });

    // 4. Save to DB
    if (sql) {
        try {
            const today = new Date().toISOString().split('T')[0];
            await sql`
        INSERT INTO daily_briefings (date, title, summary, content, is_published)
        VALUES (${today}, ${briefing.title}, ${briefing.summary}, ${briefing.content}, true)
        ON CONFLICT (date) DO UPDATE SET
          content = ${briefing.content},
          title = ${briefing.title},
          summary = ${briefing.summary},
          generated_at = NOW()
      `;
        } catch (e) {
            console.error('[Briefing Engine] Failed to save to DB:', e);
        }
    }

    return briefing;
}
