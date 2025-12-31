"use client";

import { useEffect, useState } from "react";
import { animate, stagger } from "animejs";
import { ArrowLeft, Zap, Brain, Rocket, Globe, Palette, Gamepad, LucideIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import CoinCard from "@/components/CoinCard";
import SlidePanel from "@/components/SlidePanel";
import CoinDetailPanel from "@/components/CoinDetailPanel";
import { ZONE_CATEGORIES } from "@/lib/coingecko";
import type { CoinGeckoMarketResponse } from "@/lib/types/crypto";

const ICON_MAP: Record<string, LucideIcon> = {
    Zap, Brain, Rocket, Globe, Palette, Gamepad,
};

export default function ZoneDetailPage() {
    const params = useParams();
    const zoneId = params.id as string;
    const [coins, setCoins] = useState<CoinGeckoMarketResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCoin, setSelectedCoin] = useState<string | null>(null);

    const zoneConfig = ZONE_CATEGORIES[zoneId];
    const IconComponent = zoneConfig ? ICON_MAP[zoneConfig.icon] || Zap : Zap;

    useEffect(() => {
        async function fetchCoins() {
            try {
                const response = await fetch(`/api/crypto/zone/${zoneId}`);
                const { data } = await response.json();
                setCoins(data);
            } catch (error) {
                console.error("Failed to fetch coins:", error);
            } finally {
                setLoading(false);
            }
        }

        if (zoneId) {
            fetchCoins();
        }
    }, [zoneId]);

    // Entrance animations
    useEffect(() => {
        animate(".zone-header", {
            translateY: [-30, 0],
            opacity: [0, 1],
            easing: "easeOutExpo",
            duration: 800,
        });
    }, []);

    useEffect(() => {
        if (!loading && coins.length > 0) {
            animate(".coin-card", {
                translateX: [-50, 0],
                opacity: [0, 1],
                delay: stagger(50),
                easing: "easeOutExpo",
                duration: 600,
            });
        }
    }, [loading, coins]);

    const handleCoinClick = (coinId: string) => {
        setSelectedCoin(coinId);
    };

    const handleClosePanel = () => {
        setSelectedCoin(null);
    };

    if (!zoneConfig) {
        return (
            <div className="min-h-screen bg-deep-space flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">Zone Not Found</h1>
                    <Link href="/" className="text-neon-blue hover:underline">
                        ← Back to QChannel
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-deep-space text-white overflow-y-auto">
            {/* Background Gradient */}
            <div className="fixed inset-0 gradient-animate opacity-50 pointer-events-none" />

            {/* Header */}
            <header className="zone-header opacity-0 relative z-10 p-8 border-b border-white/10">
                <div className="max-w-6xl mx-auto flex items-center gap-6">
                    <Link
                        href="/"
                        className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                    >
                        <ArrowLeft size={24} className="text-white/60 group-hover:text-neon-blue transition-colors" />
                    </Link>

                    <div className={`p-4 rounded-2xl bg-white/5 ${zoneConfig.color}`}>
                        <IconComponent size={40} />
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {zoneConfig.name}
                        </h1>
                        <p className="text-white/60 font-mono">Top tokens by market cap</p>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="relative z-10 p-8 pb-20">
                <div className="max-w-6xl mx-auto">
                    {loading ? (
                        <div className="flex flex-col gap-4">
                            {[...Array(8)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-20 rounded-2xl bg-white/5 animate-pulse"
                                />
                            ))}
                        </div>
                    ) : coins.length > 0 ? (
                        <div className="flex flex-col gap-4">
                            {coins.map((coin, index) => (
                                <div
                                    key={coin.id}
                                    className="coin-card opacity-0 cursor-pointer"
                                    onClick={() => handleCoinClick(coin.id)}
                                >
                                    <CoinCard coin={coin} rank={index + 1} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-white/60 text-lg">
                                No coins available for this category
                            </p>
                        </div>
                    )}
                </div>
            </main>

            {/* Sliding Detail Panel */}
            <SlidePanel
                isOpen={!!selectedCoin}
                onClose={handleClosePanel}
                title={coins.find(c => c.id === selectedCoin)?.name || "Coin Details"}
            >
                {selectedCoin && <CoinDetailPanel coinId={selectedCoin} />}
            </SlidePanel>
        </div>
    );
}
