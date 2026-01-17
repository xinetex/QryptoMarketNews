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
export const TTL_COIN_DATA = 60;          // 1 minute for price data
export const TTL_COIN_LIST = 60 * 60;     // 1 hour for coin list
export const TTL_MARKET_DATA = 30;        // 30 seconds for market data
export const TTL_LONG = 3600 * 4;         // 4 hours for static data (NFTs)

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
