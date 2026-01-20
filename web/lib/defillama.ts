// DeFiLlama API Client
import type { DeFiProtocol, DeFiChain, ZoneEnhancedData, ZoneConfig } from "./types/defi";

const DEFILLAMA_API = "https://api.llama.fi";

// Category mappings for our zones
const ZONE_CATEGORY_MAP: Record<string, string[]> = {
    defi: ["Dexes", "Lending", "Derivatives", "Yield", "CDP"],
    layer2: ["Chain"], // We'll filter L2-specific chains
    rwa: ["RWA"],
    nft: ["NFT Lending", "NFT Marketplace"],
    gaming: ["Gaming"],
    ai: ["AI"], // Check if DeFiLlama has AI category
    solana: ["Solana"], // Filter by chain
    memes: ["Meme"], // Not a DeFiLlama category, use different approach
};

// L2 chains to track
const L2_CHAINS = ["Arbitrum", "Optimism", "Base", "zkSync Era", "Polygon zkEVM", "Linea", "Scroll", "Blast"];

/**
 * Fetch all protocols from DeFiLlama
 */
export async function getAllProtocols(): Promise<DeFiProtocol[]> {
    try {
        const response = await fetch(`${DEFILLAMA_API}/protocols`, {
            next: { revalidate: 300 }, // Cache 5 min
        });

        if (!response.ok) {
            throw new Error(`DeFiLlama API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to fetch protocols:", error);
        return [];
    }
}

/**
 * Fetch TVL for all chains
 */
export async function getChainsTVL(): Promise<DeFiChain[]> {
    try {
        const response = await fetch(`${DEFILLAMA_API}/v2/chains`, {
            next: { revalidate: 300 },
        });

        if (!response.ok) {
            throw new Error(`DeFiLlama API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to fetch chains:", error);
        return [];
    }
}

/**
 * Get L2 comparison data
 */
export async function getL2Comparison(): Promise<{ name: string; tvl: number; formatted: string }[]> {
    const chains = await getChainsTVL();

    return L2_CHAINS.map((l2Name) => {
        const chain = chains.find((c) => c.name.toLowerCase() === l2Name.toLowerCase());
        return {
            name: l2Name,
            tvl: chain?.tvl || 0,
            formatted: formatTVL(chain?.tvl || 0),
        };
    }).sort((a, b) => b.tvl - a.tvl);
}

/**
 * Get enhanced zone data with TVL from DeFiLlama
 */

/**
 * Get enhanced zone data with TVL from DeFiLlama
 */
export async function getEnhancedZoneData(zoneConfigs: ZoneConfig[]): Promise<ZoneEnhancedData[]> {
    const [protocols, chains] = await Promise.all([
        getAllProtocols(),
        getChainsTVL(),
    ]);

    const results: ZoneEnhancedData[] = [];

    for (const zone of zoneConfigs) {
        let zoneTVL = 0;
        let change24h: number | null = null;
        let topProtocols: any[] = [];
        let matchingProtocols: DeFiProtocol[] = [];

        // Determine logic based on slug
        switch (zone.slug) {
            case 'layer2':
                // Special handling for L2
                zoneTVL = L2_CHAINS.reduce((sum, l2Name) => {
                    const chain = chains.find((c) => c.name.toLowerCase() === l2Name.toLowerCase());
                    return sum + (chain?.tvl || 0);
                }, 0);
                // L2 doesn't have protocol-level 24h change easily, maybe just leave null
                topProtocols = []; // Or L2 comparison
                break;

            case 'solana':
                const solanaChain = chains.find((c) => c.name === "Solana");
                zoneTVL = solanaChain?.tvl || 0;
                matchingProtocols = protocols.filter((p) => p.chains?.includes("Solana"));
                change24h = calculateAvgChange(matchingProtocols.slice(0, 20));
                topProtocols = getTopProtocols(matchingProtocols, 5);
                break;

            default:
                // Category-based mapping
                const categories = ZONE_CATEGORY_MAP[zone.slug];
                if (categories) {
                    matchingProtocols = protocols.filter((p) =>
                        categories.includes(p.category)
                    );
                    zoneTVL = matchingProtocols.reduce((sum, p) => sum + (p.tvl || 0), 0);
                    change24h = calculateAvgChange(matchingProtocols);
                    topProtocols = getTopProtocols(matchingProtocols, 5);
                } else {
                    // Fallback or empty if unknown slug
                    console.warn(`Unknown logic for zone slug: ${zone.slug}`);
                }
        }

        results.push({
            ...zone,
            tvl: zoneTVL,
            tvlFormatted: formatTVL(zoneTVL),
            change24h: change24h,
            topProtocols: topProtocols,
        });
    }

    return results;
}

function getTopProtocols(protocols: DeFiProtocol[], count: number) {
    return protocols
        .filter((p) => p.tvl > 0)
        .sort((a, b) => b.tvl - a.tvl)
        .slice(0, count)
        .map((p) => ({
            name: p.name,
            symbol: p.symbol,
            tvl: p.tvl,
            change1d: p.change_1d,
            logo: p.logo,
            chain: p.chain,
        }));
}

function calculateAvgChange(protocols: DeFiProtocol[]): number | null {
    const withChange = protocols.filter((p) => p.change_1d !== null);
    if (withChange.length === 0) return null;
    const sum = withChange.reduce((s, p) => s + (p.change_1d || 0), 0);
    return sum / withChange.length;
}

/**
 * Format TVL for display
 */
export function formatTVL(tvl: number | undefined | null): string {
    if (tvl === undefined || tvl === null || isNaN(tvl)) return "N/A";
    if (tvl >= 1e12) {
        return `$${(tvl / 1e12).toFixed(2)}T`;
    } else if (tvl >= 1e9) {
        return `$${(tvl / 1e9).toFixed(2)}B`;
    } else if (tvl >= 1e6) {
        return `$${(tvl / 1e6).toFixed(2)}M`;
    } else if (tvl >= 1e3) {
        return `$${(tvl / 1e3).toFixed(2)}K`;
    } else {
        return `$${tvl.toFixed(2)}`;
    }
}
