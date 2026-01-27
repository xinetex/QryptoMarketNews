import { getTopMarkets } from "./polymarket";

const DATA_API_BASE = "https://data-api.polymarket.com";

export interface WalletStats {
    address: string;
    totalProfit: number;
    winRate: number;
    totalTrades: number;
    marketsTraded: number;
    lastActive: string;
}

interface Trade {
    asset: string;
    conditionId: string;
    matchTime: number; // timestamp
    price: string;
    side: "BUY" | "SELL";
    size: string; // amount of shares
    maker_address?: string;
    taker_address?: string;
    owner?: string; // usually the taker
    proxyWallet?: string;
    timestamp: string;
}

export async function findProfitableWallets(
    minProfit: number = 0,
    minWinRate: number = 0.5,
    minTrades: number = 5
): Promise<WalletStats[]> {
    console.log("Starting wallet analysis...");

    // 1. Get Top Active Markets to sample traders from
    const topMarkets = await getTopMarkets(10);
    console.log(`Scanning ${topMarkets.length} markets for traders...`);

    const walletMap = new Map<string, Trade[]>();

    // 2. Fetch trades for each market
    for (const event of topMarkets) {
        // Use the first market in the event for simplicity, or iterate all
        for (const market of event.markets) {
            if (!market.conditionId) continue;

            try {
                // Fetch recenttrades
                const trades = await fetchTrades(market.conditionId);
                // console.log(`Fetched ${trades.length} trades for ${market.conditionId}`);


                trades.forEach(trade => {
                    const trader = trade.proxyWallet || trade.maker_address || trade.owner;
                    if (trader) {
                        const userTrades = walletMap.get(trader) || [];
                        userTrades.push(trade);
                        walletMap.set(trader, userTrades);
                    }
                });
            } catch (e) {
                console.warn(`Failed to fetch trades for market ${market.id}:`, e);
            }
        }
    }

    console.log(`Found ${walletMap.size} unique wallets. Analyzing stats...`);

    // 3. Analyze each wallet
    const results: WalletStats[] = [];

    for (const [address, trades] of walletMap.entries()) {
        if (trades.length < minTrades) continue;

        const stats = calculateWalletStats(address, trades);

        if (stats.totalProfit >= minProfit && stats.winRate >= minWinRate) {
            results.push(stats);
        }
    }

    // Sort by profit descending
    return results.sort((a, b) => b.totalProfit - a.totalProfit);
}

export interface WhaleSignal {
    sentiment: 'bullish' | 'bearish' | 'neutral';
    strength: number; // 0-100
    whaleCount: number;
    buyVolume: number;
    sellVolume: number;
    description: string;
}

export async function analyzeMarketWhales(conditionId: string): Promise<WhaleSignal> {
    try {
        const trades = await fetchTrades(conditionId);

        let whaleBuyVol = 0;
        let whaleSellVol = 0;
        let whaleCount = 0;
        const seenWallets = new Set<string>();

        // Heuristic: Whales are those trading > $1000 or frequent traders?
        // For Oracle speed, we just look at "Large Trades" (> $500 value)
        const LARGE_TRADE_THRESHOLD = 500;

        for (const trade of trades) {
            const size = parseFloat(trade.size);
            const price = parseFloat(trade.price);
            const value = size * price;

            if (value > LARGE_TRADE_THRESHOLD) {
                const wallet = trade.proxyWallet || trade.maker_address || trade.owner;
                if (wallet && !seenWallets.has(wallet)) {
                    seenWallets.add(wallet);
                    whaleCount++;
                }

                if (trade.side === "BUY") {
                    whaleBuyVol += value;
                } else {
                    whaleSellVol += value;
                }
            }
        }

        const totalVol = whaleBuyVol + whaleSellVol;
        let sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
        let strength = 0;

        if (totalVol > 0) {
            const buyRatio = whaleBuyVol / totalVol;
            if (buyRatio > 0.6) {
                sentiment = 'bullish';
                strength = Math.round(buyRatio * 100);
            } else if (buyRatio < 0.4) {
                sentiment = 'bearish';
                strength = Math.round((1 - buyRatio) * 100);
            } else {
                strength = 50;
            }
        }

        return {
            sentiment,
            strength,
            whaleCount,
            buyVolume: whaleBuyVol,
            sellVolume: whaleSellVol,
            description: `${whaleCount} large traders moved $${Math.round(totalVol)}. Bias: ${sentiment.toUpperCase()}`
        };

    } catch (error) {
        console.warn("Whale Analysis Error:", error);
        return {
            sentiment: 'neutral',
            strength: 0,
            whaleCount: 0,
            buyVolume: 0,
            sellVolume: 0,
            description: "Insufficient data"
        };
    }
}

export async function fetchTrades(conditionId: string): Promise<Trade[]> {
    const url = `${DATA_API_BASE}/trades?market=${conditionId}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Data API error: ${res.status}`);
    const data = await res.json();
    return data;
}

export interface SwarmSignal {
    detected: boolean;
    intensity: 'low' | 'medium' | 'high' | 'nuclear';
    swarmSize: number; // unique wallets in burst
    side: 'BUY' | 'SELL' | 'NEUTRAL';
    timestamp: string;
    confidence: number;
    description: string;
}

export async function analyzeSwarmActivity(conditionId: string): Promise<SwarmSignal> {
    try {
        const trades = await fetchTrades(conditionId);
        if (trades.length === 0) {
            return {
                detected: false,
                intensity: 'low',
                swarmSize: 0,
                side: 'NEUTRAL',
                timestamp: new Date().toISOString(),
                confidence: 0,
                description: "No recent trades"
            };
        }

        // 1. Bucket trades by time (1-minute windows)
        const windows = new Map<number, Trade[]>();

        trades.forEach(trade => {
            const ts = parseInt(trade.timestamp || "0");
            const minuteKey = Math.floor(ts / 60); // Unix timestamp / 60

            const windowTrades = windows.get(minuteKey) || [];
            windowTrades.push(trade);
            windows.set(minuteKey, windowTrades);
        });

        // 2. Analyze each window for Swarm behavior
        let maxSwarmSize = 0;
        let bestWindow: { key: number; trades: Trade[] } | null = null;

        for (const [key, windowTrades] of windows.entries()) {
            const uniqueWallets = new Set(
                windowTrades.map(t => t.proxyWallet || t.maker_address || t.owner).filter(Boolean)
            );

            if (uniqueWallets.size > maxSwarmSize) {
                maxSwarmSize = uniqueWallets.size;
                bestWindow = { key, trades: windowTrades };
            }
        }

        // 3. Determine if it's a swarm
        // Threshold: at least 3 unique wallets in 1 minute? 
        // For a niche market, 3 is a crowd. For a hot market, maybe 10.
        // Let's stick to > 3 for detection.
        const SWARM_THRESHOLD = 3;

        if (maxSwarmSize < SWARM_THRESHOLD || !bestWindow) {
            return {
                detected: false,
                intensity: 'low',
                swarmSize: maxSwarmSize,
                side: 'NEUTRAL',
                timestamp: new Date().toISOString(),
                confidence: 0,
                description: `Max density: ${maxSwarmSize} traders/min (Normal)`
            };
        }

        // 4. Analyze Swarm Characteristics (Side Dominance)
        let buyVol = 0;
        let sellVol = 0;
        bestWindow.trades.forEach(t => {
            const size = parseFloat(t.size);
            const price = parseFloat(t.price);
            const val = size * price;
            if (t.side === "BUY") buyVol += val;
            else sellVol += val;
        });

        const totalVol = buyVol + sellVol;
        let side: 'BUY' | 'SELL' | 'NEUTRAL' = 'NEUTRAL';
        let dominance = 0;

        if (totalVol > 0) {
            if (buyVol > sellVol) {
                side = 'BUY';
                dominance = buyVol / totalVol;
            } else {
                side = 'SELL';
                dominance = sellVol / totalVol;
            }
        }

        // Intensity Score
        let intensity: SwarmSignal['intensity'] = 'low';
        if (maxSwarmSize > 15) intensity = 'nuclear';
        else if (maxSwarmSize > 10) intensity = 'high';
        else if (maxSwarmSize > 5) intensity = 'medium';

        return {
            detected: true,
            intensity,
            swarmSize: maxSwarmSize,
            side,
            timestamp: new Date(bestWindow.key * 60 * 1000).toISOString(),
            confidence: Math.round(dominance * 100),
            description: `SWARM DETECTED: ${maxSwarmSize} unique wallets swarmed ${side} (${Math.round(dominance * 100)}% dominance)`
        };

    } catch (error) {
        console.error("Swarm Analysis Failed:", error);
        return {
            detected: false,
            intensity: 'low',
            swarmSize: 0,
            side: 'NEUTRAL',
            timestamp: new Date().toISOString(),
            confidence: 0,
            description: "Analysis Error"
        };
    }
}

function calculateWalletStats(address: string, trades: Trade[]): WalletStats {
    // Simplified Profit Logic:
    // We don't have full history, only the sampled trades.
    // So we estimate realized profit roughly:
    // - Buy side: Cost = price * size
    // - Sell side: Revenue = price * size
    // - Profit = Revenue - Cost

    let totalCost = 0;
    let totalRevenue = 0;
    let winCount = 0;
    let tradeCount = trades.length; // Approximate, as one 'trade' object is one side
    let lastActive = 0;

    // We need to match buys and sells or estimate position value.
    // For this MVP, we will count "profitable trades" as trades where the user sold for more than avg buy?
    // Actually, without full history, accurate PnL is hard.
    // BUT, we can identify "Winners" by checking if they are holding "Winning" positions in resolved markets?
    // Or just check if their Sell sum > Buy sum (Net Realized).
    // Let's use Net Realized Cashflow for now: (Sells - Buys).
    // POSITIVE means they took money OUT (Profit). NEGATIVE means they put money IN (Investment/Loss).
    // This is skewed if they are still holding valuable positions.

    // Better heuristic for this snippet:
    // Just count Win Rate of resolved info? No, we don't have resolution info easily here.

    // Let's stick to simple "Activity" metrics + Net Transfer for now, 
    // but acknowledging "Profit" is "Net Realized".

    for (const trade of trades) {
        const size = parseFloat(trade.size);
        const price = parseFloat(trade.price);
        const value = size * price;
        const ts = parseInt(trade.timestamp || "0") * 1000;
        if (ts > lastActive) lastActive = ts;

        if (trade.maker_address?.toLowerCase() === address.toLowerCase()) {
            // Maker side logic - complicate, depends on side
            // If Side=BUY, Maker is SELLING.
            // If Side=SELL, Maker is BUYING.
            if (trade.side === "BUY") {
                totalRevenue += value;
            } else {
                totalCost += value;
            }
        } else {
            // Taker side (owner)
            // If Side=BUY, Taker is BUYING.
            if (trade.side === "BUY") {
                totalCost += value;
            } else {
                totalRevenue += value;
            }
        }
    }

    const netProfit = totalRevenue - totalCost;
    // Winrate is hard without resolution. 
    // We will fake it as "Positive Cashflow Trades / Total Trades" (very rough).
    // Or just return 0.5 as placeholder if we can't verify outcome.

    return {
        address,
        totalProfit: netProfit,
        winRate: 0.5, // Placeholder
        totalTrades: tradeCount,
        marketsTraded: 1, // simplified
        lastActive: new Date(lastActive).toISOString()
    };
}
