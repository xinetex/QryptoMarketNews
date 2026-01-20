
import { getContractCreation, getContractAbi } from "./etherscan";
import { getHistoricalVolatility } from "./coingecko";

export interface RiskMetrics {
    score: number; // 0-100 (100 = Safe, 0 = REKT)
    components: {
        volatility: number; // 0-100 (0 = High Vol, 100 = Low Vol)
        liquidity: number;  // 0-100 (Volume/Cap ratio)
        safety: number;     // 0-100 (Contract age & audit)
    };
    vectors: string[]; // Reasons for risk penalty e.g. "Low Liquidity", "Unverified Contract"
}

// Token contracts to check (placeholder list for demo)
// In production, we'd check the specific token being analyzed
const DEMO_CONTRACTS = {
    'PEPE': '0x6982508145454Ce325dDbE47a25d4ec3d2311933',
    'SHIB': '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce',
    'UNI': '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984'
};


/**
 * Calculate Risk Score for an asset or portfolio
 */
export async function calculateRiskScore(symbol: string = 'ETH'): Promise<RiskMetrics> {

    // 1. Volatility Score (Real)
    // Get annualized vol from CoinGecko
    // Map 100% vol -> Score 50. 200% vol -> Score 0. 20% vol -> Score 90.
    const volRaw = await getHistoricalVolatility(symbol.toLowerCase(), 30);
    let volScore = Math.max(0, 100 - (volRaw / 2));

    // 2. Safety Score (Real Etherscan Data)
    let safetyScore = 50; // Default Neutral
    const address = DEMO_CONTRACTS[symbol as keyof typeof DEMO_CONTRACTS];
    const vectors: string[] = [];

    if (address) {
        const [created, verified] = await Promise.all([
            getContractCreation(address),
            getContractAbi(address)
        ]);

        if (created) {
            // Age Bonus: +10 pts per year, max 40
            const ageYears = (Date.now() - created) / (1000 * 3600 * 24 * 365);
            safetyScore += Math.min(40, ageYears * 10);
        }

        if (verified) {
            safetyScore += 10;
        } else {
            safetyScore -= 20;
            vectors.push("Unverified Contract");
        }
    } else {
        // If no contract (Native ETH/BTC), assume safe base
        if (['ETH', 'BTC', 'SOL'].includes(symbol)) {
            safetyScore = 95;
        }
    }

    // 3. Liquidity Score (Mocked for now)
    const liquidityScore = 60 + (Math.random() * 20); // 60-80

    // Composite
    const totalScore = (volScore * 0.4) + (safetyScore * 0.4) + (liquidityScore * 0.2);

    if (volRaw > 100) vectors.push("Extreme Volatility");
    if (liquidityScore < 40) vectors.push("Low Liquidity");

    return {
        score: Math.round(totalScore),
        components: {
            volatility: Math.round(volScore),
            liquidity: Math.round(liquidityScore),
            safety: Math.round(safetyScore)
        },
        vectors
    };
}
