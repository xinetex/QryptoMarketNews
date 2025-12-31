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

interface ZoneWithCoins {
    id: string;
    name: string;
    color: string;
    coins: {
        id: string; // Added ID
        name: string;
        symbol: string; // Added Symbol
        price: number; // Added Price
        marketCap: number;
        change: number;
        volume: number; // Added Volume
    }[];
}

export default function GalaxyPage() {
    const [viewMode, setViewMode] = useState<"galaxy" | "scatter">("galaxy");
    const [zones, setZones] = useState<ZoneWithCoins[]>([]);
    const [loading, setLoading] = useState(true);

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
                        coins: (data || []).slice(0, 8).map((coin: CoinGeckoMarketResponse) => ({
                            id: coin.id,
                            name: coin.name,
                            symbol: coin.symbol.toUpperCase(),
                            price: coin.current_price,
                            marketCap: coin.market_cap,
                            change: coin.price_change_percentage_24h || 0,
                            volume: coin.total_volume,
                        })),
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
                id: coin.id,
                symbol: coin.symbol,
                name: coin.name,
                price: coin.price,
                change24h: coin.change,
                marketCap: coin.marketCap,
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
                                🌌 Crypto Galaxy
                            </h1>
                            <p className="text-white/60 font-mono">
                                Explore the universe of crypto markets in 3D
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
                <div className="max-w-6xl mx-auto">
                    {loading ? (
                        <LoadingPlaceholder />
                    ) : (
                        viewMode === "galaxy" ? (
                            <CryptoGalaxy zones={zones} />
                        ) : (
                            <CryptoScatter3D data={scatterData} />
                        )
                    )}

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
