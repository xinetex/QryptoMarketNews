
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

export const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function analyzeProject(projectName: string) {
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set");
    }

    const prompt = `
    You are Q-INTEL, an advanced crypto intelligence consultant. 
    Analyze the crypto project "${projectName}".
    
    Return a valid JSON object with the following structure (no markdown, just JSON):
    {
        "sector": "Primary Industry Sector (e.g. DeFi, L1, Gaming)",
        "summary": "One sentence summary of what it does",
        "gaps": ["Gap 1: Brief description of market inefficiency", "Gap 2", "Gap 3"],
        "innovationScore": 85,
        "opportunities": [
            {
                "title": "Innovative Idea 1",
                "description": "Detailed proposal for expansion or pivot"
            },
            {
                "title": "Innovative Idea 2",
                "description": " Another idea"
            }
        ],
        "riskLevel": "Low/Medium/High"
    }
    
    Keep the tone professional, futuristic, and insightful.
    Focus on gaps in the current market and how this project can innovate.
    `;

    try {
        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean markdown code blocks if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        return null;
    }
}
