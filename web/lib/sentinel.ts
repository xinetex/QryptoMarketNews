
import { getLatestNews } from "./news";
import { prophetParser } from "./prophet-parser";
import { detectWhaleShadow } from "./whale-detector";
import { moltbook } from "./moltbook";

/**
 * The Sentinel 🦅
 * An autonomous event loop that filters for high-signal events and posts them.
 */
export class SentinelService {

    /**
     * Scan for anomalies and post if threshold is met.
     */
    async scanAndPost() {
        console.log("[Sentinel] Starting scan...");
        const results = [];

        // 1. Shadow Divergence (Whales vs Crowd)
        // High Signal, Low Frequency
        const shadows = await detectWhaleShadow();
        const criticalShadows = shadows.filter(s => s.shadowGap > 30 || s.confidence > 80);

        for (const shadow of criticalShadows) {
            console.log(`[Sentinel] Found Shadow: ${shadow.asset} Gap: ${shadow.shadowGap}`);
            await this.tryPost(
                `qcrypto`,
                `🐋 WHALE ALERT: ${shadow.asset} Divergence`,
                `${shadow.narrative}\n\nConfidence: ${shadow.confidence}% | Gap: ${shadow.shadowGap}`,
                undefined,
                `shadow-${shadow.asset}-${Date.now()}` // Unique key (simple for now)
            );
            results.push({ type: 'shadow', asset: shadow.asset });
        }

        // 2. Critical News (Alpha Score > 80)
        // Medium Signal, Medium Frequency
        const news = await getLatestNews();
        // The getLatestNews call already scores them via ProphetParser implicitly 
        // (if we used the updated version which does batch scoring).
        // Let's verify we filter for high score.

        const criticalNews = news.filter(n => (n.alpha_score || 0) >= 80);

        for (const item of criticalNews) {
            console.log(`[Sentinel] Found Alpha: ${item.title} (${item.alpha_score})`);
            await this.tryPost(
                `qcrypto`,
                `🚨 ALPHA: ${item.title}`,
                `${item.reasoning || "High impact market event detected."}\n\nSource: ${item.source} | Score: ${item.alpha_score}/100`,
                item.url,
                `news-${item.id}`
            );
            results.push({ type: 'news', title: item.title });
        }

        return results;
    }

    /**
     * Post to Moltbook with deduplication check.
     * (Basic dedupe: Fetch last 10 posts and check titles)
     */
    private async tryPost(submolt: string, title: string, content: string, url?: string, dedupKey?: string) {
        try {
            // 1. Semantic Check (Anti-Duplicate & Context Awareness)
            // Instead of just checking exact titles, we search for the concept.
            const searchResults = await moltbook.search(title, 'posts', 5);

            // Check if any result is highly similar (> 0.85) AND recent
            // Note: In a real implementation we would check dates, but for now we trust the semantic match
            // If similar content exists, we skip to avoid noise.
            const similarPost = searchResults.results?.find((r: any) => r.similarity > 0.85);

            if (similarPost) {
                console.log(`[Sentinel] Skipping duplicate/similar topic: ${title} (Matches: ${similarPost.title}, Sim: ${similarPost.similarity})`);

                // OPTIONAL: If it's a really high alpha event, we might UPVOTE the existing one instead!
                if (dedupKey?.startsWith('shadow')) {
                    console.log(`[Sentinel] Upvoting existing Alpha: ${similarPost.id}`);
                    await moltbook.vote(similarPost.id, 'post', 'up');
                }
                return;
            }

            // 2. Post
            console.log(`[Sentinel] Posting: ${title}`);
            const result = await moltbook.post(submolt, title, content, url);
            console.log(`[Sentinel] Posted ID: ${result.post?.id}`);

        } catch (error) {
            console.error(`[Sentinel] Failed to post: ${title}`, error);
        }
    }
}

export const sentinel = new SentinelService();
