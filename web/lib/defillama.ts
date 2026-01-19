// DeFiLlama API Client
import type { DeFiProtocol, DeFiChain, ZoneEnhancedData } from "./types/defi";

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
export async function getEnhancedZoneData(): Promise<ZoneEnhancedData[]> {
    const [protocols, chains] = await Promise.all([
        getAllProtocols(),
        getChainsTVL(),
    ]);

    const zones: ZoneEnhancedData[] = [];

    // DeFi Zone - aggregate DEXes, Lending, etc.
    const defiProtocols = protocols.filter((p) =>
        ["Dexes", "Lending", "Yield", "Derivatives", "CDP", "Liquid Staking"].includes(p.category)
    );
    const defiTVL = defiProtocols.reduce((sum, p) => sum + (p.tvl || 0), 0);
    zones.push({
        id: "defi",
        name: "DeFi 2.0",
        tvl: defiTVL,
        tvlFormatted: formatTVL(defiTVL),
        change24h: calculateAvgChange(defiProtocols),
        topProtocols: getTopProtocols(defiProtocols, 5),
    });

    // L2 Zone - aggregate L2 chain TVL
    const l2TVL = L2_CHAINS.reduce((sum, l2Name) => {
        const chain = chains.find((c) => c.name.toLowerCase() === l2Name.toLowerCase());
        return sum + (chain?.tvl || 0);
    }, 0);
    zones.push({
        id: "layer2",
        name: "L2 Scaling",
        tvl: l2TVL,
        tvlFormatted: formatTVL(l2TVL),
        change24h: null, // Chains don't have change data in free API
        topProtocols: [], // We'll populate with L2 comparison instead
    });

    // RWA Zone
    const rwaProtocols = protocols.filter((p) => p.category === "RWA");
    const rwaTVL = rwaProtocols.reduce((sum, p) => sum + (p.tvl || 0), 0);
    zones.push({
        id: "rwa",
        name: "Real World Assets",
        tvl: rwaTVL,
        tvlFormatted: formatTVL(rwaTVL),
        change24h: calculateAvgChange(rwaProtocols),
        topProtocols: getTopProtocols(rwaProtocols, 5),
    });

    // Gaming Zone
    const gamingProtocols = protocols.filter((p) => p.category === "Gaming");
    const gamingTVL = gamingProtocols.reduce((sum, p) => sum + (p.tvl || 0), 0);
    zones.push({
        id: "gaming",
        name: "GameFi",
        tvl: gamingTVL,
        tvlFormatted: formatTVL(gamingTVL),
        change24h: calculateAvgChange(gamingProtocols),
        topProtocols: getTopProtocols(gamingProtocols, 5),
    });

    // Solana Zone - filter by chain
    const solanaChain = chains.find((c) => c.name === "Solana");
    const solanaProtocols = protocols.filter((p) => p.chains?.includes("Solana"));
    zones.push({
        id: "solana",
        name: "Solana Ecosystem",
        tvl: solanaChain?.tvl || 0,
        tvlFormatted: formatTVL(solanaChain?.tvl || 0),
        change24h: calculateAvgChange(solanaProtocols.slice(0, 20)),
        topProtocols: getTopProtocols(solanaProtocols, 5),
    });

    // NFT Zone
    const nftProtocols = protocols.filter((p) =>
        ["NFT Lending", "NFT Marketplace"].includes(p.category)
    );
    const nftTVL = nftProtocols.reduce((sum, p) => sum + (p.tvl || 0), 0);
    zones.push({
        id: "nft",
        name: "NFT Market",
        tvl: nftTVL,
        tvlFormatted: formatTVL(nftTVL),
        change24h: calculateAvgChange(nftProtocols),
        topProtocols: getTopProtocols(nftProtocols, 5),
    });

    return zones;
}

function getTopProtocols(protocols: DeFiProtocol[], count: number) {
    return protocols
        .filter((p) => p.tvl > 0)
        .sort((a, b) => b.tvl - a.tvl)
        .slice(0, count)
        .map((p) => ({
            name: p.name,
            tvl: p.tvl,
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
