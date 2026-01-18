import { Network, Alchemy, NftOrdering } from "alchemy-sdk";
import { unstable_cache } from "next/cache";
import { getOrSetCache } from "./agentcache";

// Settings for different chains
const API_KEY = process.env.ALCHEMY_API_KEY;

const getAlchemy = (network: Network) => {
    return new Alchemy({
        apiKey: API_KEY,
        network: network,
    });
};

export interface NFTItem {
    title: string;
    image: string;
    price?: number;
    rarity?: number;
    chain?: string;
    market?: string;
}

export interface NFTCollection {
    name: string;
    slug: string;
    image: string;
    floor: number;
    floorUSD: number;
    volume24h: number; // Volume in native token
    owners: number;
    listed: number;
    reason: string;
    chain: string;
    items: NFTItem[];
}

/**
 * Fetch collection details and top items from Alchemy
 * Wrapped with AgentCache to save credits
 */
export async function getCollectionData(contractAddress: string, reason: string, chain: Network = Network.ETH_MAINNET): Promise<NFTCollection | null> {
    if (!API_KEY) {
        return null;
    }

    // Cache key for AgentCache (remote + local)
    const cacheKey = `alchemy:collection:${chain}:${contractAddress}`;

    return getOrSetCache(
        cacheKey,
        async () => {
            try {
                const alchemy = getAlchemy(chain);

                // 1. Fetch Collection Metadata & Floor
                const metadata = await alchemy.nft.getContractMetadata(contractAddress);

                // 2. Fetch Floor Price
                const floor = await alchemy.nft.getFloorPrice(contractAddress);
                const floorRes = floor as any;
                const floorVal = floorRes.openSea?.floorPrice || floorRes.looksRare?.floorPrice || 0;

                // 3. Fetch Listings/NFTs to display
                const nfts = await alchemy.nft.getNftsForContract(contractAddress, {
                    pageSize: 8,
                    omitMetadata: false,
                });

                // Map Items
                const items: NFTItem[] = [];
                const chainName = chain === Network.ETH_MAINNET ? "ETH" :
                    chain === Network.MATIC_MAINNET ? "MATIC" :
                        chain === Network.ARB_MAINNET ? "ARB" : "ETH";

                for (const nft of nfts.nfts) {
                    // Prefer thumbnail for grid performance on Roku
                    const img = nft.image?.thumbnailUrl || nft.image?.cachedUrl || nft.image?.originalUrl;
                    if (img) {
                        items.push({
                            title: nft.name || `#${nft.tokenId}`,
                            image: img,
                            price: floorVal,
                            chain: chainName,
                            market: "OpenSea" // Default for generalized view
                        });
                    }
                }

                const metaAny = metadata as any;

                return {
                    name: metadata.name || "Unknown Collection",
                    slug: metaAny.openSea?.collectionName || contractAddress,
                    image: metaAny.openSea?.imageUrl || items[0]?.image || "",
                    floor: floorVal,
                    floorUSD: floorVal * (chain === Network.MATIC_MAINNET ? 0.8 : 3000), // Approx conversion
                    volume24h: 100,
                    owners: metaAny.openSea?.ownedTokenCount || 0,
                    listed: 10,
                    reason: reason,
                    chain: chainName,
                    items: items.slice(0, 8)
                };

            } catch (error) {
                console.error(`Error fetching Alchemy data for ${contractAddress} on ${chain}:`, error);
                return null;
            }
        },
        3600 * 4 // Cache for 4 hours
    );
}

// Import the dynamic fetcher
import { getTrendingNFTCollections } from "./agentcache";

/**
 * Get curated collections based on mode
 * Cached for 1 hour by Next.js, and individual calls by AgentCache
 */
export const getCuratedNFTs = unstable_cache(
    async (mode: string) => {
        let targetList: { addr: string, reason: string, chain: Network }[] = [];

        if (mode === 'trending') {
            // DYNAMIC DISCOVERY: Fetch from AgentCache/CoinGecko
            const dynamicTrending = await getTrendingNFTCollections(6);

            targetList = dynamicTrending.map(t => ({
                addr: t.address,
                reason: t.reason,
                chain: Network.ETH_MAINNET // Defaulting to simple ETH for now as CG filter was ETH
            }));

            // If dynamic failed (empty), fallback is handled inside getTrendingNFTCollections, 
            // but we can add strict safety here if needed.
        }
        else {
            // Specialized/Static Lists for specific curation modes
            const targets = {
                bluechip: [
                    { addr: '0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB', reason: '💎 The OG', chain: Network.ETH_MAINNET }, // Punks
                    { addr: '0x60E4d786628Fea6478F785A6d7e704777c86a7c6', reason: '🐕 Blue Chip', chain: Network.ETH_MAINNET } // MAYC
                ],
                aesthetic: [
                    { addr: '0xa7d8d9ef8D8Ce8992Df33D8b8CF4Aebabd5bD270', reason: '🎨 Art Blocks', chain: Network.ETH_MAINNET }, // Fidenza
                ],
                generative: [
                    { addr: '0x99a9B7c1116f9ceEB1652de04d5969CcCE509B0b', reason: '🖌️ Chromie', chain: Network.ETH_MAINNET } // Squiggle (approx)
                ]
            };
            targetList = targets[mode as keyof typeof targets] || [];
        }

        // Parallel Fetch
        const promises = targetList.map(t => getCollectionData(t.addr, t.reason, t.chain));
        const results = await Promise.all(promises);

        // Filter failures (nulls)
        return results.filter(c => c !== null) as NFTCollection[];
    },
    ['alchemy-nfts-v3-dynamic'],
    { revalidate: 3600 }
);
