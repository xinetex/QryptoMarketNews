// CoinGecko API Client with AgentCache.ai caching
import type { CoinGeckoMarketResponse, CoinGeckoCategoryResponse, TickerData, ZoneData } from "./types/crypto";
import { cachedCoinGeckoFetch } from "./agentcache";

const COINGECKO_API_BASE = "https://api.coingecko.com/api/v3";

// Top coins to display in the ticker
const TICKER_COINS = ["bitcoin", "ethereum", "solana", "dogecoin", "cardano", "avalanche-2", "chainlink", "polygon"];

// Category mapping for our zones
const ZONE_CATEGORIES: Record<string, { name: string; icon: string; color: string; categoryIds: string[] }> = {
    solana: {
        name: "Solana Ecosystem",
        icon: "Zap",
        color: "text-purple-400",
        categoryIds: ["solana-ecosystem", "solana-meme-coins"],
    },
    ai: {
        name: "AI Agents",
        icon: "Brain",
        color: "text-emerald-400",
        categoryIds: ["artificial-intelligence"],
    },
    memes: {
        name: "Meme Trenches",
        icon: "Rocket",
        color: "text-orange-400",
        categoryIds: ["meme-token"],
    },
    rwa: {
        name: "Real World Assets",
        icon: "Globe",
        color: "text-blue-400",
        categoryIds: ["real-world-assets-rwa", "real-world-assets"],
    },
    nft: {
        name: "NFT Market",
        icon: "Palette",
        color: "text-pink-400",
        categoryIds: ["non-fungible-tokens-nft"],
    },
    gaming: {
        name: "GameFi",
        icon: "Gamepad",
        color: "text-yellow-400",
        categoryIds: ["gaming"],
    },
    defi: {
        name: "DeFi 2.0",
        icon: "Zap",
        color: "text-cyan-400",
        categoryIds: ["decentralized-finance-defi"],
    },
    layer2: {
        name: "L2 Scaling",
        icon: "Globe",
        color: "text-indigo-400",
        categoryIds: ["layer-2"],
    },
    metals: {
        name: "Precious Metals",
        icon: "Gem",
        color: "text-amber-400",
        categoryIds: ["tokenized-gold", "tokenized-commodities"],
    },
};

// Export for use in detail pages
export { ZONE_CATEGORIES };

/**
 * Fetch top coins for the ticker (with AgentCache)
 */
export async function getTopCoins(): Promise<TickerData[]> {
    try {
        // Use AgentCache for caching
        const data = await cachedCoinGeckoFetch<CoinGeckoMarketResponse[]>(
            '/coins/markets',
            {
                vs_currency: 'usd',
                ids: TICKER_COINS.join(','),
                order: 'market_cap_desc',
                sparkline: 'false',
            },
            60 // 1 minute TTL
        );

        return data.map((coin) => ({
            symbol: coin.symbol.toUpperCase(),
            price: coin.current_price,
            change24h: coin.price_change_percentage_24h || 0,
            isPositive: (coin.price_change_percentage_24h || 0) >= 0,
        }));
    } catch (error) {
        console.error("Failed to fetch top coins:", error);
        return [
            { symbol: "BTC", price: 0, change24h: 0, isPositive: true },
            { symbol: "ETH", price: 0, change24h: 0, isPositive: true },
            { symbol: "SOL", price: 0, change24h: 0, isPositive: true },
        ];
    }
}

/**
 * Fetch category data for zones (with AgentCache)
 */
export async function getCategoryData(): Promise<ZoneData[]> {
    try {
        // Use AgentCache for caching
        const data = await cachedCoinGeckoFetch<CoinGeckoCategoryResponse[]>(
            '/coins/categories',
            undefined,
            300 // 5 minute TTL
        );

        const zones: ZoneData[] = [];

        for (const [zoneId, zoneConfig] of Object.entries(ZONE_CATEGORIES)) {
            const matchingCategory = data.find((cat) =>
                zoneConfig.categoryIds.includes(cat.id)
            );

            if (matchingCategory) {
                const change = matchingCategory.market_cap_change_24h || 0;
                zones.push({
                    id: zoneId,
                    name: zoneConfig.name,
                    change: `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`,
                    isPositive: change >= 0,
                    icon: zoneConfig.icon,
                    color: zoneConfig.color,
                });
            } else {
                zones.push({
                    id: zoneId,
                    name: zoneConfig.name,
                    change: "N/A",
                    isPositive: true,
                    icon: zoneConfig.icon,
                    color: zoneConfig.color,
                });
            }
        }

        return zones;
    } catch (error) {
        console.error("Failed to fetch category data:", error);
        return Object.entries(ZONE_CATEGORIES).map(([id, config]) => ({
            id,
            name: config.name,
            change: "N/A",
            isPositive: true,
            icon: config.icon,
            color: config.color,
        }));
    }
}

/**
 * Fetch coins by category for detail pages (with AgentCache)
 */
export async function getCoinsByCategory(categoryId: string): Promise<CoinGeckoMarketResponse[]> {
    try {
        const zoneConfig = ZONE_CATEGORIES[categoryId];
        if (!zoneConfig) {
            throw new Error(`Unknown zone: ${categoryId}`);
        }

        // Use the first category ID for the API call
        const apiCategoryId = zoneConfig.categoryIds[0];

        // Use AgentCache for caching
        const data = await cachedCoinGeckoFetch<CoinGeckoMarketResponse[]>(
            '/coins/markets',
            {
                vs_currency: 'usd',
                category: apiCategoryId,
                order: 'market_cap_desc',
                per_page: '20',
                sparkline: 'true',
            },
            120 // 2 minute TTL
        );

        return data;
    } catch (error) {
        console.error("Failed to fetch category coins:", error);
        return [];
    }
}

/**
 * Fetch market chart data (prices, market_caps, total_volumes)
 */
export async function getMarketChart(coinId: string, days: number = 7): Promise<{ prices: [number, number][], total_volumes: [number, number][] } | null> {
    try {
        const data = await cachedCoinGeckoFetch<{ prices: [number, number][], total_volumes: [number, number][] }>(
            `/coins/${coinId}/market_chart`,
            {
                vs_currency: 'usd',
                days: days.toString(),
            },
            300 // 5 minute TTL
        );
        return data;
    } catch (error) {
        console.error(`Failed to fetch market chart for ${coinId}:`, error);
        return null;
    }
}

/**
 * Fetch minimal coin data for prediction resolution
 */
export async function getCoin(coinId: string): Promise<CoinGeckoMarketResponse> {
    try {
        const data = await cachedCoinGeckoFetch<CoinGeckoMarketResponse[]>(
            '/coins/markets',
            {
                vs_currency: 'usd',
                ids: coinId,
                sparkline: 'false'
            },
            60
        );
        return data[0] || { id: coinId, symbol: coinId, name: coinId, current_price: 0 } as any;
    } catch (error) {
        console.error(`Failed to fetch coin ${coinId}:`, error);
        return { id: coinId, symbol: coinId, name: coinId, current_price: 0 } as any;
    }
}

/**
 * Calculate historical volatility (Standard Deviation of daily returns)
 * Returns a percentage value (e.g., 5.2 for 5.2%)
 */
export async function getHistoricalVolatility(coinId: string, days: number = 30): Promise<number> {
    const chart = await getMarketChart(coinId, days);
    if (!chart || chart.prices.length < 2) return 0;

    // Extract prices (index 1 os value, index 0 is timestamp)
    const prices = chart.prices.map(p => p[1]);

    // Calculate daily returns: ln(P_t / P_t-1)
    const returns: number[] = [];
    for (let i = 1; i < prices.length; i++) {
        const r = Math.log(prices[i] / prices[i - 1]);
        returns.push(r);
    }

    // Calculate Standard Deviation of returns
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);

    // Annualize (Optional, currently returning daily Volatility * sqrt(365) ~ Annualized or just scalar)
    // For Signal purposes, a simple scalar of the stdDev is fine.
    // Let's return annualized volatility percentage.
    const annualizedVol = stdDev * Math.sqrt(365) * 100;

    return parseFloat(annualizedVol.toFixed(2));
}

/**
 * Format price for display
 */
/**
 * Format price for display
 */
export function formatPrice(price: number | undefined | null): string {
    if (price === undefined || price === null || isNaN(price)) return "N/A";
    if (price >= 1000) {
        return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (price >= 1) {
        return `$${price.toFixed(2)}`;
    } else if (price >= 0.01) {
        return `$${price.toFixed(4)}`;
    } else {
        return `$${price.toFixed(6)}`;
    }
}

/**
 * Format percentage change for display
 */
export function formatChange(change: number | undefined | null): string {
    if (change === undefined || change === null || isNaN(change)) return "0%";
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(1)}%`;
}

/**
 * Format market cap
 */
export function formatMarketCap(cap: number | undefined | null): string {
    if (cap === undefined || cap === null || isNaN(cap)) return "N/A";
    if (cap >= 1e12) {
        return `$${(cap / 1e12).toFixed(2)}T`;
    } else if (cap >= 1e9) {
        return `$${(cap / 1e9).toFixed(2)}B`;
    } else if (cap >= 1e6) {
        return `$${(cap / 1e6).toFixed(2)}M`;
    } else {
        return `$${cap.toLocaleString()}`;
    }
}
