
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Dynamic import to ensure env vars are loaded BEFORE the modules initialize
async function manualTest() {
    console.log("🦅 Testing Sentinel with Truth Broker Integration...");
    console.log("🔑 API Key Check: GEMINI_API_KEY is", process.env.GEMINI_API_KEY ? "LOADED" : "MISSING");

    try {
        const { sentinel } = await import('../lib/sentinel');

        // LIMITATION: This relies on live data which might be empty.
        // Ideally we'd mock the news fetch, but for a quick "instigation" check:
        await sentinel.scanAndPost();
        console.log("✅ Sentinel scan complete.");
    } catch (error) {
        console.error("❌ Sentinel Failed:", error);
    }
}

manualTest();
