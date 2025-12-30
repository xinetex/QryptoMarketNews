"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { CoinGeckoMarketResponse } from "@/lib/types/crypto";
import { ZONE_CATEGORIES } from "@/lib/coingecko";

// Dynamic import for Three.js (SSR off)
const CryptoGalaxy = dynamic(() => import("@/components/CryptoGalaxy"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[600px] rounded-3xl bg-black/50 flex items-center justify-center">
            <div className="text-white/50">Loading Galaxy...</div>
        </div>
    ),
});

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
    coins: { name: string; marketCap: number; change: number }[];
}

export default function GalaxyPage() {
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
                        coins: (data || []).slice(0, 5).map((coin: CoinGeckoMarketResponse) => ({
                            name: coin.symbol.toUpperCase(),
                            marketCap: coin.market_cap,
                            change: coin.price_change_percentage_24h || 0,
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

    return (
        <div className="min-h-screen bg-deep-space text-white">
            {/* Background */}
            <div className="fixed inset-0 gradient-animate opacity-30 pointer-events-none" />

            {/* Header */}
            <header className="relative z-10 p-8 border-b border-white/10">
                <div className="max-w-6xl mx-auto flex items-center gap-6">
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
            </header>

            {/* Galaxy View */}
            <main className="relative z-10 p-8">
                <div className="max-w-6xl mx-auto">
                    {loading ? (
                        <div className="w-full h-[600px] rounded-3xl bg-black/50 flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-4xl mb-4 animate-spin">🌐</div>
                                <div className="text-white/60">Mapping the crypto universe...</div>
                            </div>
                        </div>
                    ) : (
                        <CryptoGalaxy zones={zones} />
                    )}

                    {/* Zone Stats */}
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
