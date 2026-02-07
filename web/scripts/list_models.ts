
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function listModels() {
    const key = process.env.GOOGLE_GEMINI_API || process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!key) {
        console.error("❌ No API Key found in .env.local");
        return;
    }

    console.log(`🔑 Using Key: ${key.slice(0, 8)}...`);
    console.log("📡 Querying Google API for available models...");

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();

        if (data.error) {
            console.error("❌ API Error:", data.error);
            return;
        }

        if (data.models) {
            console.log("\n✅ Available Models:");
            data.models.forEach((m: any) => {
                if (m.name.includes("gemini")) {
                    console.log(`- ${m.name} (${m.displayName})`);
                    console.log(`  Supported: ${m.supportedGenerationMethods.join(', ')}`);
                }
            });
        } else {
            console.log("⚠️ No models found (Unexpected response format).", data);
        }

    } catch (error) {
        console.error("❌ Network Request Failed:", error);
    }
}

listModels();
