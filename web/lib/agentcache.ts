/**
 * AgentCache.ai - Generic API Caching Layer
 * 
 * Reduces API calls by caching responses locally and remotely.
 * 
 * @package agentcache
 */

import { createHash } from 'crypto';

// Configuration
const AGENTCACHE_URL = process.env.AGENTCACHE_API_URL || 'https://api.agentcache.ai';
const AGENTCACHE_KEY = process.env.AGENTCACHE_API_KEY || '';
const CACHE_PREFIX = 'agentcache:v1:';
const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

// Cache TTLs (in seconds)
export const TTL_COIN_DATA = 300;         // 5 minutes (Conservatively cache price data)
export const TTL_COIN_LIST = 86400;       // 24 hours (Coin list rarely changes)
export const TTL_MARKET_DATA = 120;       // 2 minutes (Market data)
export const TTL_LONG = 3600 * 24;        // 24 hours for static data (NFTs)

// In-memory fallback cache
const memoryCache = new Map<string, { data: any; expires: number }>();

/**
 * Generate cache key
 */
function generateCacheKey(segment: string, params?: Record<string, string>): string {
    const data = { segment, params: params || {} };
    const hash = createHash('sha256')
        .update(JSON.stringify(data))
        .digest('hex')
        .slice(0, 16);
    return `${CACHE_PREFIX}${segment.replace(/\//g, ':')}:${hash}`;
}

/**
 * Get from AgentCache.ai
 */
async function getFromAgentCache(key: string): Promise<any | null> {
    if (!AGENTCACHE_KEY) return null;

    try {
        const res = await fetch(`${AGENTCACHE_URL}/cache/get`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': AGENTCACHE_KEY,
            },
            body: JSON.stringify({ key }),
        });

        if (res.ok) {
            const data = await res.json();
            if (data?.hit && data?.value) {
                console.log('🎯 AgentCache.ai HIT:', key);
                return JSON.parse(data.value);
            }
        }
    } catch (error) {
        // Silent fail
    }

    return null;
}

/**
 * Store in AgentCache.ai
 */
async function setInAgentCache(key: string, value: any, ttl: number): Promise<void> {
    if (!AGENTCACHE_KEY) return;

    try {
        await fetch(`${AGENTCACHE_URL}/cache/set`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': AGENTCACHE_KEY,
            },
            body: JSON.stringify({ key, value: JSON.stringify(value), ttl }),
        });
    } catch (error) {
        // Silent fail
    }
}

/**
 * Memory Cache Helpers
 */
function getFromMemory(key: string): any | null {
    const cached = memoryCache.get(key);
    if (cached && Date.now() < cached.expires) {
        console.log('🎯 Memory Cache HIT:', key);
        return cached.data;
    }
    memoryCache.delete(key);
    return null;
}

function setInMemory(key: string, value: any, ttlSeconds: number): void {
    memoryCache.set(key, {
        data: value,
        expires: Date.now() + (ttlSeconds * 1000)
    });
}

/**
 * Generic Cache Wrapper
 * Tries AgentCache -> Memory -> Fetcher -> Stores Result
 */
export async function getOrSetCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 3600
): Promise<T> {
    // 1. Try AgentCache
    const agentCached = await getFromAgentCache(key);
    if (agentCached) return agentCached as T;

    // 2. Try Memory
    const memoryCached = getFromMemory(key);
    if (memoryCached) return memoryCached as T;

    // 3. Fetch
    console.log(`💸 Cache MISS: ${key}`);
    const data = await fetcher();

    // 4. Store
    if (data) {
        // Fire and forget storage to simpler/faster response
        setInAgentCache(key, data, ttl);
        setInMemory(key, data, ttl);
    }

    return data;
}

// ===== COINGECKO LEGACY SUPPORT =====

export async function cachedCoinGeckoFetch<T>(
    endpoint: string,
    params?: Record<string, string>,
    ttl: number = TTL_COIN_DATA
): Promise<T> {
    const cacheKey = generateCacheKey(endpoint, params);

    return getOrSetCache(cacheKey, async () => {
        const url = new URL(`${COINGECKO_BASE}${endpoint}`);
        if (params) {
            Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
        }

        const response = await fetch(url.toString(), {
            headers: { 'Accept': 'application/json' },
        });

        if (!response.ok) {
            throw new Error(`CoinGecko API error: ${response.status}`);
        }

        return response.json();
    }, ttl);
}

// Re-export specific getters for backward compatibility if needed, 
// but ideally we migrate to using cachedCoinGeckoFetch or getOrSetCache directly.
// Keeping original exports for safety:

export async function getCoin(coinId: string) {
    return cachedCoinGeckoFetch(`/coins/${coinId}`, { localization: 'false', tickers: 'false' }, TTL_COIN_DATA);
}

/**
 * Fetch Trending NFT Collections (Dynamic Discovery)
 * Uses CoinGecko to find top collections by volume
 */
export async function getTrendingNFTCollections(limit: number = 10): Promise<{ address: string; reason: string; chain: string }[]> {
    const cacheKey = `agentcache:nfts:trending:v1`;

    return getOrSetCache(cacheKey, async () => {
        try {
            // Fetch top NFTs by 24h volume on Ethereum
            // Note: CoinGecko Free API has rate limits, be gentle
            const params = {
                asset_platform_id: 'ethereum',
                order: 'h24_volume_native_desc',
                per_page: String(limit + 5), // Fetch a few extra to filter
                page: '1'
            };

            const data: any[] = await cachedCoinGeckoFetch('/nfts/markets', params, TTL_LONG);

            if (!Array.isArray(data)) return [];

            return data
                .filter(c => c.contract_address) // Ensure contract address exists
                .slice(0, limit)
                .map(c => ({
                    address: c.contract_address,
                    reason: `🔥 Vol: ${Math.round(c.volume_24h_native || 0)} ETH`,
                    chain: 'ETH_MAINNET' // Mapping to Alchemy Network enum key effectively
                }));

        } catch (error) {
            console.error("Error fetching trending NFTs:", error);
            // Fallback list if API fails
            return [
                { address: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D', reason: '🔥 Fallback Vol', chain: 'ETH_MAINNET' }, // BAYC
                { address: '0x60E4d786628Fea6478F785A6d7e704777c86a7c6', reason: '🦍 Fallback Vol', chain: 'ETH_MAINNET' }, // MAYC
                { address: '0xBd3531dA5CF5857e7CfAA92426877b022e612cf8', reason: '🐧 Fallback Vol', chain: 'ETH_MAINNET' }  // Pudgy
            ];
        }
    }, 3600); // 1 hour cache
}
