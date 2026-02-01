
const BASE_URL = "https://www.moltbook.com/api/v1";
const API_KEY = process.env.MOLTBOOK_API_KEY || "moltbook_sk_VR5HtTCw2XwnGETtXevWRbSzGaE5ehkO";

async function createSubmolt(name: string, displayName: string, description: string) {
    console.log(`Creating submolt: ${name}...`);

    // Explicitly add key here if env var fails in script context
    const key = API_KEY;

    const response = await fetch(`${BASE_URL}/submolts`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${key}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name,
            display_name: displayName,
            description,
        }),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`API Error ${response.status}: ${text}`);
    }

    return response.json();
}

async function main() {
    try {
        const result = await createSubmolt(
            "qcrypto",
            "QCrypto Intelligence",
            "AI-First Crypto Intelligence & Search Authority. Home of the Prophet TV Swarm."
        );
        console.log("Success! Community created:", JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("Failed:", error);
    }
}

main();
