/**
 * AgentCache.ai - CoinGecko API Caching Layer
 * 
 * Reduces CoinGecko API calls by caching responses
 * Free tier: 10-50 calls/min - This helps avoid rate limits
 * 
 * @package agentcache-coingecko
 * @version 1.0.0
 */

import { createHash } from 'crypto';

// Configuration
const AGENTCACHE_URL = process.env.AGENTCACHE_API_URL || 'https://api.agentcache.ai';
const AGENTCACHE_KEY = process.env.AGENTCACHE_API_KEY || '';
const CACHE_PREFIX = 'agentcache:coingecko:';
const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

// Cache TTLs (in seconds)
const TTL_COIN_DATA = 60;          // 1 minute for price data
const TTL_COIN_LIST = 60 * 60;     // 1 hour for coin list
const TTL_MARKET_DATA = 30;        // 30 seconds for market data

// In-memory fallback cache for when Redis/AgentCache unavailable
const memoryCache = new Map<string, { data: any; expires: number }>();

/**
 * Generate cache key from request parameters
 */
function generateCacheKey(endpoint: string, params?: Record<string, string>): string {
    const data = { endpoint, params: params || {} };
    const hash = createHash('sha256')
        .update(JSON.stringify(data))
        .digest('hex')
        .slice(0, 16);
    return `${CACHE_PREFIX}${endpoint.replace(/\//g, ':')}:${hash}`;
}

/**
 * Get from AgentCache.ai hosted service
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
                console.log('🎯 AgentCache.ai HIT:', key.slice(-20));
                return JSON.parse(data.value);
            }
        }
    } catch (error) {
        console.warn('AgentCache get failed:', (error as Error).message);
    }

    return null;
}

/**
 * Store in AgentCache.ai hosted service
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
        console.log('💾 AgentCache.ai STORED:', key.slice(-20));
    } catch (error) {
        console.warn('AgentCache set failed:', (error as Error).message);
    }
}

/**
 * Fallback to in-memory cache
 */
function getFromMemory(key: string): any | null {
    const cached = memoryCache.get(key);
    if (cached && Date.now() < cached.expires) {
        console.log('🎯 Memory Cache HIT:', key.slice(-20));
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
 * Fetch from CoinGecko with caching
 */
export async function cachedCoinGeckoFetch<T>(
    endpoint: string,
    params?: Record<string, string>,
    ttl: number = TTL_COIN_DATA
): Promise<T> {
    const cacheKey = generateCacheKey(endpoint, params);

    // Try AgentCache.ai first
    const agentCached = await getFromAgentCache(cacheKey);
    if (agentCached) return agentCached as T;

    // Try memory cache
    const memoryCached = getFromMemory(cacheKey);
    if (memoryCached) return memoryCached as T;

    // Cache miss - fetch from CoinGecko
    console.log('💸 Cache MISS, fetching:', endpoint);

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

    const data = await response.json();

    // Store in both caches
    await setInAgentCache(cacheKey, data, ttl);
    setInMemory(cacheKey, data, ttl);

    return data as T;
}

// Convenience functions for common endpoints

/**
 * Get coin data by ID
 */
export async function getCoin(coinId: string) {
    return cachedCoinGeckoFetch(
        `/coins/${coinId}`,
        { localization: 'false', tickers: 'false', community_data: 'false', developer_data: 'false' },
        TTL_COIN_DATA
    );
}

/**
 * Get coin markets (list with prices)
 */
export async function getCoinMarkets(
    vs_currency: string = 'usd',
    ids?: string[],
    category?: string,
    per_page: number = 50
) {
    const params: Record<string, string> = {
        vs_currency,
        per_page: per_page.toString(),
        page: '1',
        sparkline: 'false',
    };
    if (ids?.length) params.ids = ids.join(',');
    if (category) params.category = category;

    return cachedCoinGeckoFetch('/coins/markets', params, TTL_MARKET_DATA);
}

/**
 * Get coin list (all coins)
 */
export async function getCoinList() {
    return cachedCoinGeckoFetch('/coins/list', undefined, TTL_COIN_LIST);
}

/**
 * Search coins
 */
export async function searchCoins(query: string) {
    return cachedCoinGeckoFetch('/search', { query }, TTL_COIN_LIST);
}

/**
 * Get simple price for multiple coins
 */
export async function getSimplePrices(ids: string[], vs_currencies: string = 'usd') {
    return cachedCoinGeckoFetch(
        '/simple/price',
        {
            ids: ids.join(','),
            vs_currencies,
            include_24hr_change: 'true',
            include_market_cap: 'true',
        },
        TTL_COIN_DATA
    );
}

/**
 * Clear memory cache (for testing)
 */
export function clearMemoryCache(): void {
    memoryCache.clear();
    console.log('🗑️ Memory cache cleared');
}

/**
 * Get cache stats
 */
export function getCacheStats() {
    return {
        memoryEntries: memoryCache.size,
        agentCacheConfigured: !!AGENTCACHE_KEY,
    };
}
