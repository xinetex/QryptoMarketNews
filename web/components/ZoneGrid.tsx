"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { Zap, Brain, Rocket, Globe, Palette, Gamepad, LucideIcon } from "lucide-react";
import { useCategoryData } from "@/lib/hooks/useCrypto";
import type { ZoneData } from "@/lib/types/crypto";
import Link from "next/link";
import NewsSlider from "./NewsSlider";
import HotMarketsSlider from "./HotMarketsSlider";
import ProphetOracleCard from "./ProphetOracleCard";
// Import FlexColumnSwap
import FlexColumnSwap from "./FlexColumnSwap";
import AlertableZoneCard from "./AlertableZoneCard";

import { useAdminSettings } from "@/hooks/useAdminSettings";

// Icon mapping
const ICON_MAP: Record<string, LucideIcon> = {
    Zap, Brain, Rocket, Globe, Palette, Gamepad,
};

// Color gradients for each zone
const ZONE_GRADIENTS: Record<string, string> = {
    solana: "from-purple-500/20 to-purple-900/10",
    ai: "from-emerald-500/20 to-emerald-900/10",
    memes: "from-orange-500/20 to-orange-900/10",
    rwa: "from-blue-500/20 to-blue-900/10",
    nft: "from-pink-500/20 to-pink-900/10",
    gaming: "from-yellow-500/20 to-yellow-900/10",
    defi: "from-cyan-500/20 to-cyan-900/10",
    layer2: "from-indigo-500/20 to-indigo-900/10",
};

// Insights for specific zones
const ZONE_INSIGHTS: Record<string, string[]> = {
    rwa: [
        "RWA = Claims on assets like Treasuries & Real Estate.",
        "Top Protocols: Ondo, Maple, TrueFi, Centrifuge.",
        "Major Listings: Binance, OKX, Coinbase.",
        "Requirement: Many RWAs require KYC/Accreditation."
    ],
    ai: [
        "Agents are autonomous trading entities.",
        "DePIN Compute Layer is scaling rapidly.",
        "Prophet Neural Net optimization active."
    ],
    solana: [
        "High throughput, low latency execution.",
        "Home to DePIN and Memecoin liquidity.",
        "Firedancer upgrade imminent."
    ]
};

// YouTube Card Component
function YouTubeCard({ videoId, title }: { videoId: string; title: string }) {
    return (
        <div className="zone-card group relative h-52 rounded-xl bg-[#12121A] border border-red-500/20 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:border-red-500/50 hover:shadow-xl hover:shadow-red-500/10">
            <iframe
                className="w-full h-full pointer-events-auto"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&loop=1&playlist=${videoId}`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
            {/* Live Indicator Overlay */}
            <div className="absolute top-0 left-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent w-full pointer-events-none">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse box-shadow-glow-red"></div>
                    <span className="text-white/90 text-xs font-bold tracking-wider uppercase font-mono">LIVE RADIO</span>
                </div>
            </div>
        </div>
    );
}

export default function ZoneGrid() {
    const gridRef = useRef<HTMLDivElement>(null);
    const { settings, zones: adminZones, loading: configLoading } = useAdminSettings();
    const { categories, loading: marketLoading } = useCategoryData(300000);
    const loading = configLoading || marketLoading;

    // Merge admin config with market data
    const zones: ZoneData[] = Array.isArray(adminZones)
        ? adminZones
            .filter(z => z.enabled)
            .sort((a, b) => a.order - b.order)
            .map(adminZone => {
                const marketData = categories.find(c => c.id === adminZone.coingeckoCategory || c.id === adminZone.id);
                return {
                    id: adminZone.id,
                    name: adminZone.name,
                    icon: adminZone.icon,
                    color: adminZone.color,
                    change: marketData?.change || "...",
                    isPositive: marketData ? marketData.isPositive : true
                };
            })
        : [];

    useEffect(() => {
        // Only animate if elements exist
        if (document.querySelectorAll(".zone-card").length > 0) {
            animate(".zone-card", {
                scale: [0.8, 1],
                opacity: [0, 1],
                delay: stagger(100),
                easing: "easeOutElastic(1, .6)",
                duration: 800
            });
        }
    }, [zones.length]);

    useEffect(() => {
        if (!loading && zones.length > 0) {
            if (document.querySelectorAll(".zone-card").length > 0) {
                animate(".zone-card", {
                    scale: [0.95, 1],
                    opacity: [0.8, 1],
                    delay: stagger(50),
                    easing: "easeOutExpo",
                    duration: 400
                });
            }
        }
    }, [loading, categories, zones.length]);

    return (
        <div
            ref={gridRef}
            className="relative z-10 px-4 md:px-8 pt-44 md:pt-56 lg:pt-20 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-6 pointer-events-auto h-[calc(100vh-100px)] lg:overflow-hidden"
        >
            {/* COLUMN 1: Essentials (Video, News, Oracle) - Span 3 */}
            <div className="lg:col-span-3 flex flex-col gap-6 lg:overflow-y-auto no-scrollbar lg:pr-2">
                {/* YouTube */}
                {settings?.youtube?.enabled && (
                    <YouTubeCard
                        videoId={settings.youtube.videoId || "9ASXINLKuNE"}
                        title={settings.youtube.title || "QCrypto Radio"}
                    />
                )}

                {/* News */}
                {settings?.features?.newsEnabled && (
                    <div className="zone-card group relative h-52 rounded-xl bg-[#12121A] border border-white/5 p-5 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:border-neon-blue/50 hover:shadow-xl hover:shadow-neon-blue/10 shrink-0">
                        <div className="w-full h-full">
                            <NewsSlider autoPlay={true} interval={6000} />
                        </div>
                    </div>
                )}

                {/* Oracle */}
                <div className="shrink-0">
                    <ProphetOracleCard />
                </div>
            </div>

            {/* COLUMN 2: Zones Grid - Span 6 */}
            <div className="lg:col-span-6 lg:overflow-y-auto no-scrollbar lg:px-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20 lg:pb-0">
                    {zones.map((zone) => {
                        const IconComponent = ICON_MAP[zone.icon] || Zap;
                        const gradientClass = ZONE_GRADIENTS[zone.id] || "from-white/10 to-white/5";

                        return (
                            <AlertableZoneCard
                                key={zone.id}
                                zone={zone}
                                icon={IconComponent}
                                gradientClass={gradientClass}
                                insights={ZONE_INSIGHTS[zone.id]}
                            />
                        );
                    })}
                </div>
            </div>

            {/* COLUMN 3: Flex Swap Column - Span 3 */}
            <div className="lg:col-span-3 lg:overflow-y-auto no-scrollbar lg:pl-2 h-full">
                <FlexColumnSwap />
            </div>
        </div>
    );
}
