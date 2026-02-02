
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

// Initialize with same key as prophet-parser
const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GEMINI_API || process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export interface VerificationResult {
    verdict: 'TRUE' | 'FALSE' | 'UNCERTAIN';
    confidence: number;
    reasoning: string;
    sources?: string[];
}

const VerificationSchema = z.object({
    verdict: z.enum(['TRUE', 'FALSE', 'UNCERTAIN']),
    confidence: z.number().min(0).max(1),
    reasoning: z.string(),
});

export class TrustBrokerService {
    // Use available model from list_models.ts
    private model = google('gemini-2.0-flash');

    /**
     * Verify a specific text claim using logical analysis.
     */
    async verifyClaim(claim: string): Promise<VerificationResult> {
        console.log(`[TrustBroker] Verifying claim: "${claim.slice(0, 50)}..."`);

        try {
            const prompt = `
You are a Fact-Checking Engine. Your goal is to verify the following claim using logic, general knowledge, and critical thinking.

CLAIM: "${claim}"

Analyze the claim step-by-step.
1. Identify the core assertion.
2. Check against known facts (up to your knowledge cutoff).
3. Look for logical fallacies or signs of misinformation (e.g. "free money", "guaranteed returns").

Output strictly valid JSON conforming to the schema.
`;

            const { object } = await generateObject({
                model: this.model,
                schema: VerificationSchema,
                prompt: prompt,
                temperature: 0.1, // Low temp for factual consistency
            });

            return {
                verdict: object.verdict as any,
                confidence: object.confidence,
                reasoning: object.reasoning,
                sources: ['Gemini 1.5 Flash (Internal Knowledge)']
            };

        } catch (error: any) {
            console.error(`[TrustBroker] Verification failed: ${error.message}`);
            return {
                verdict: 'UNCERTAIN',
                confidence: 0,
                reasoning: `Internal Error: ${error.message}`
            };
        }
    }
}

export const trustBroker = new TrustBrokerService();
