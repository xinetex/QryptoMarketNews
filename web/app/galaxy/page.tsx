"use client";

import { useEffect, useState, useMemo } from "react";
import { ArrowLeft, Spline, Activity } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { CoinGeckoMarketResponse } from "@/lib/types/crypto";
import { ZONE_CATEGORIES } from "@/lib/coingecko";

// Dynamic imports (SSR off)
const CryptoGalaxy = dynamic(() => import("@/components/CryptoGalaxy"), {
    ssr: false,
    loading: () => <LoadingPlaceholder />,
});
const CryptoScatter3D = dynamic(() => import("@/components/CryptoScatter3D"), {
    ssr: false,
    loading: () => <LoadingPlaceholder />,
});

import GalaxyControls from "@/components/galaxy/GalaxyControls";

const LoadingPlaceholder = () => (
    <div className="w-full h-[600px] rounded-3xl bg-black/50 flex items-center justify-center">
        <div className="text-center">
            <div className="text-4xl mb-4 animate-spin">🌐</div>
            <div className="text-white/50">Loading visualization...</div>
        </div>
    </div>
);

// Zone colors for 3D display
const ZONE_COLORS: Record<string, string> = {
    solana: "#9945FF",
    defi: "#00f3ff",
    memes: "#fcd34d",
    nft: "#bc13fe",
    gaming: "#10b981",
    ai: "#ef4444",
    rwa: "#06b6d4",
    metals: "#d4af37",
};

// Enhanced data types
export interface ExtendedCoinData {
    id: string;
    name: string;
    symbol: string;
    price: number;
    marketCap: number;
    fdv: number;               // Fully Diluted Valuation
    change: number;
    volume: number;
    volatility: number;        // 0-1 score
    history: {                 // For trails
        price: number;
        timestamp: number;
    }[];
    price7d: number;          // For ghost layer
}

interface ZoneWithCoins {
    id: string;
    name: string;
    color: string;
    coins: ExtendedCoinData[];
}

// Simulation helper
function generateMockHistory(currentPrice: number, volatility: number) {
    const history = [];
    let price = currentPrice;
    const now = Date.now();
    for (let i = 0; i < 24; i++) { // Last 24 hours
        history.push({
            price,
            timestamp: now - i * 3600000
        });
        // Random walk backwards
        const change = (Math.random() - 0.5) * volatility * 0.2;
        price = price * (1 - change);
    }
    return history.reverse();
}

export default function GalaxyPage() {
    const [viewMode, setViewMode] = useState<"galaxy" | "scatter">("galaxy");
    const [zones, setZones] = useState<ZoneWithCoins[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeOffset, setTimeOffset] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [layers, setLayers] = useState({
        trails: false,
        ghost: false,
        halo: true
    });
    const [axes, setAxes] = useState({
        x: "mcap",
        y: "change",
        z: "volume"
    });
    const [colorMode, setColorMode] = useState<"category" | "volatility">("category");
    const [scenario, setScenario] = useState<"normal" | "btc_crash" | "eth_surge" | "liquidations">("normal");

    // Time Travel Animation
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying) {
            interval = setInterval(() => {
                setTimeOffset(prev => {
                    const next = prev + 1;
                    return next > 24 ? 0 : next;
                });
            }, 500);
        }
        return () => clearInterval(interval);
    }, [isPlaying]);

    useEffect(() => {
        async function fetchAllZones() {
            try {
                const zonePromises = Object.entries(ZONE_CATEGORIES).slice(0, 8).map(async ([zoneId, config]) => {
                    const response = await fetch(`/api/crypto/zone/${zoneId}`);
                    const { data } = await response.json() as { data: CoinGeckoMarketResponse[] };

                    return {
                        id: zoneId,
                        name: config.name,
                        color: ZONE_COLORS[zoneId] || "#ffffff",
                        coins: (data || []).slice(0, 8).map((coin: CoinGeckoMarketResponse) => {
                            // Calculate derived/simulated metrics
                            const volatility = (Math.abs(coin.price_change_percentage_24h || 0) / 100) + 0.05 + (Math.random() * 0.1);

                            return {
                                id: coin.id,
                                name: coin.name,
                                symbol: coin.symbol.toUpperCase(),
                                price: coin.current_price,
                                marketCap: coin.market_cap,
                                fdv: coin.fully_diluted_valuation || coin.market_cap * (1.1 + Math.random() * 0.5),
                                change: coin.price_change_percentage_24h || 0,
                                volume: coin.total_volume,
                                volatility,
                                history: generateMockHistory(coin.current_price, volatility),
                                price7d: coin.current_price * (1 - (coin.price_change_percentage_24h || 0) / 100 * (1 + (Math.random() - 0.5))),
                            };
                        }),
                    };
                });

                const results = await Promise.all(zonePromises);
                setZones(results);
            } catch (error) {
                console.error("Failed to fetch zones:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchAllZones();
    }, []);

    // Flatten data for scatter plot
    const scatterData = useMemo(() => {
        return zones.flatMap(zone =>
            zone.coins.map(coin => ({
                ...coin,
                change24h: coin.change,
                volume24h: coin.volume,
                zoneColor: zone.color
            }))
        );
    }, [zones]);

    return (
        <div className="min-h-screen bg-deep-space text-white">
            {/* Background */}
            <div className="fixed inset-0 gradient-animate opacity-30 pointer-events-none" />

            {/* Header */}
            <header className="relative z-10 p-8 border-b border-white/10">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <Link
                            href="/"
                            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                        >
                            <ArrowLeft size={24} className="text-white/60 group-hover:text-neon-blue transition-colors" />
                        </Link>

                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                🌌 Prophet Galaxy
                            </h1>
                            <p className="text-white/60 font-mono">
                                Explore the universe of Prophet markets in 3D
                            </p>
                        </div>
                    </div>

                    {/* View Switcher */}
                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                        <button
                            onClick={() => setViewMode("galaxy")}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${viewMode === "galaxy" ? "bg-neon-blue text-black font-bold" : "text-white/60 hover:text-white"
                                }`}
                        >
                            <Spline size={18} />
                            Galaxy Spiral
                        </button>
                        <button
                            onClick={() => setViewMode("scatter")}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${viewMode === "scatter" ? "bg-neon-blue text-black font-bold" : "text-white/60 hover:text-white"
                                }`}
                        >
                            <Activity size={18} />
                            3D Scatter
                        </button>
                    </div>
                </div>
            </header>

            {/* Main View */}
            <main className="relative z-10 p-8">
                <div className="max-w-6xl mx-auto relative">
                    {/* Visualization Area */}
                    <div className="relative group">
                        {/* Controls Overlay (only for Scatter mode) */}
                        {viewMode === "scatter" && !loading && (
                            <GalaxyControls
                                onTimeChange={setTimeOffset}
                                timeOffset={timeOffset}
                                onToggleLayer={(layer: string, active: boolean) => setLayers(prev => ({ ...prev, [layer]: active }))}
                                activeLayers={layers}
                                isPlaying={isPlaying}
                                onTogglePlay={() => setIsPlaying(!isPlaying)}
                                axes={axes}
                                onAxisChange={(axis: "x" | "y" | "z", value: string) => setAxes(prev => ({ ...prev, [axis]: value }))}
                                colorMode={colorMode}
                                onColorModeChange={setColorMode}
                                scenario={scenario}
                                onScenarioChange={setScenario}
                            />
                        )}

                        {loading ? (
                            <LoadingPlaceholder />
                        ) : (
                            viewMode === "galaxy" ? (
                                <CryptoGalaxy zones={zones} />
                            ) : (
                                <CryptoScatter3D
                                    data={scatterData}
                                    timeOffset={timeOffset}
                                    showTrails={layers.trails}
                                    showGhost={layers.ghost}
                                    showHalos={layers.halo}
                                    axes={axes}
                                    colorMode={colorMode}
                                    scenario={scenario}
                                />
                            )
                        )}
                    </div>

                    {/* Zone Stats / Legend */}
                    <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {zones.map((zone) => (
                            <Link
                                key={zone.id}
                                href={`/zone/${zone.id}`}
                                className="glass-card p-4 hover-lift group cursor-pointer"
                            >
                                <div
                                    className="w-4 h-4 rounded-full mb-2"
                                    style={{ backgroundColor: zone.color }}
                                />
                                <div className="text-white font-bold group-hover:text-neon-blue transition-colors">
                                    {zone.name}
                                </div>
                                <div className="text-white/50 text-sm">
                                    {zone.coins.length} coins
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
