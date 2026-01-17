import { Network, Alchemy, NftOrdering } from "alchemy-sdk";
import { unstable_cache } from "next/cache";
import { getOrSetCache } from "./agentcache";

const settings = {
    apiKey: process.env.ALCHEMY_API_KEY,
    network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(settings);

export interface NFTItem {
    title: string;
    image: string;
    price?: number;
    rarity?: number;
}

export interface NFTCollection {
    name: string;
    slug: string;
    image: string;
    floor: number;
    floorUSD: number;
    volume24h: number; // Volume in ETH
    owners: number;
    listed: number;
    reason: string;
    items: NFTItem[];
}

/**
 * Fetch collection details and top items from Alchemy
 * Wrapped with AgentCache to save credits
 */
export async function getCollectionData(contractAddress: string, reason: string): Promise<NFTCollection | null> {
    if (!process.env.ALCHEMY_API_KEY) {
        return null;
    }

    // Cache key for AgentCache (remote + local)
    const cacheKey = `alchemy:collection:${contractAddress}`;

    return getOrSetCache(
        cacheKey,
        async () => {
            try {
                // 1. Fetch Collection Metadata & Floor
                const metadata = await alchemy.nft.getContractMetadata(contractAddress);

                // 2. Fetch Floor Price (Best Ask)
                const floor = await alchemy.nft.getFloorPrice(contractAddress);
                // Type safety: floor might be FloorPriceError or FloorPriceResponse
                // In v3 SDK, it has openSea, looksRare, etc.
                const floorRes = floor as any;
                const floorEth = floorRes.openSea?.floorPrice || floorRes.looksRare?.floorPrice || 0;

                // 3. Fetch Listings/NFTs to display
                const nfts = await alchemy.nft.getNftsForContract(contractAddress, {
                    pageSize: 8,
                    omitMetadata: false,
                });

                // Map Items
                const items: NFTItem[] = [];

                for (const nft of nfts.nfts) {
                    // Prefer thumbnail for grid performance on Roku
                    const img = nft.image?.thumbnailUrl || nft.image?.cachedUrl || nft.image?.originalUrl;
                    if (img) {
                        items.push({
                            title: nft.name || `#${nft.tokenId}`,
                            image: img,
                            price: floorEth // Approx price
                        });
                    }
                }

                // Map Collection
                // Type safety: metadata might be strict NftContract, cast to any for legacy access if needed
                const metaAny = metadata as any;

                return {
                    name: metadata.name || "Unknown Collection",
                    slug: metaAny.openSea?.collectionName || contractAddress,
                    image: metaAny.openSea?.imageUrl || items[0]?.image || "",
                    floor: floorEth,
                    floorUSD: floorEth * 3000,
                    volume24h: 100,
                    owners: metaAny.openSea?.ownedTokenCount || 0,
                    listed: 10,
                    reason: reason,
                    items: items.slice(0, 8)
                };

            } catch (error) {
                console.error(`Error fetching Alchemy data for ${contractAddress}:`, error);
                return null;
            }
        },
        3600 * 4 // Cache for 4 hours
    );
}

/**
 * Get curated collections based on mode
 * Cached for 1 hour by Next.js, and individual calls by AgentCache
 */
export const getCuratedNFTs = unstable_cache(
    async (mode: string) => {
        // Define target collections (Contract Addresses)
        const targets = {
            trending: [
                { addr: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D', reason: '🔥 Volume Spike' }, // BAYC
                { addr: '0xBd3531dA5CF5857e7CfAA92426877b022e612cf8', reason: 'penguin All-time High' }, // Pudgy
                { addr: '0xED5AF388653567Af2F388E6224dC7C4b3241C544', reason: '⛩️ Anime Meta' }  // Azuki
            ],
            bluechip: [
                { addr: '0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB', reason: '💎 The OG' }, // Punks
                { addr: '0x60E4d786628Fea6478F785A6d7e704777c86a7c6', reason: '🐕 Blue Chip' } // MAYC
            ],
            aesthetic: [
                { addr: '0xa7d8d9ef8D8Ce8992Df33D8b8CF4Aebabd5bD270', reason: '🎨 Generative Masterpiece' }, // Fidenza
            ],
            generative: [
                { addr: '0xa7d8d9ef8D8Ce8992Df33D8b8CF4Aebabd5bD270', reason: '🌈 Art Blocks' } // Squiggle
            ]
        };

        const targetList = targets[mode as keyof typeof targets] || targets.trending;

        // Parallel Fetch
        const promises = targetList.map(t => getCollectionData(t.addr, t.reason));
        const results = await Promise.all(promises);

        // Filter failures (nulls)
        return results.filter(c => c !== null) as NFTCollection[];
    },
    ['alchemy-nfts'],
    { revalidate: 3600 }
);
