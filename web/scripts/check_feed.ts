
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

console.log("ENV CHECK:", {
    MOLTBOOK_KEY_EXISTS: !!process.env.MOLTBOOK_API_KEY,
});

import { MoltbookService } from '../lib/moltbook';

async function checkFeed() {
    // Manually instance to ensure env vars are picked up if the singleton initialized too early
    const molty = new MoltbookService(process.env.MOLTBOOK_API_KEY);

    try {
        console.log("🦅 Sentinel Eye: Scanning Moltbook Feed...");

        const submolts = ['qcrypto', 'agents', 'general'];

        for (const sub of submolts) {
            console.log(`\n--- Feed: ${sub} ---`);
            try {
                const feed = await molty.getSubmoltFeed(sub, 5);
                if (feed && feed.posts && feed.posts.length > 0) {
                    feed.posts.forEach((p: any) => {
                        console.log(`[${new Date(p.created_at).toLocaleTimeString()}] @${p.author_id}: ${p.title}`);
                        console.log(`   > ${p.content.substring(0, 50)}...`);
                        console.log(`   (❤️ ${p.upvotes || 0}  💬 ${p.comments_count || 0})`);
                    });
                } else {
                    console.log("No recent posts.");
                }
            } catch (e: any) {
                console.log(`Could not fetch ${sub}: ${e.message}`);
            }
        }

    } catch (error) {
        console.error("Error scanning feed:", error);
    }
}

checkFeed();
