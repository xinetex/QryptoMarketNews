"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { Zap, Brain, Rocket, Globe, Palette, Gamepad, LucideIcon } from "lucide-react";
import { useCategoryData } from "@/lib/hooks/useCrypto";
import type { ZoneData } from "@/lib/types/crypto";
import Link from "next/link";
import NewsSlider from "./NewsSlider";

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
                // Find market data if available
                const marketData = categories.find(c => c.id === adminZone.coingeckoCategory || c.id === adminZone.id);

                return {
                    id: adminZone.id, // Use admin ID for routing
                    name: adminZone.name,
                    icon: adminZone.icon,
                    color: adminZone.color,
                    // Use live data if available, else placeholders
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
    }, [zones.length]); // Re-run when zones are populated

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
            className="relative z-10 px-4 md:px-8 pt-32 md:pt-4 pb-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 pointer-events-auto"
        >
            {/* YouTube Live Radio Card */}
            {settings?.youtube?.enabled && (
                <YouTubeCard
                    videoId={settings.youtube.videoId || "9ASXINLKuNE"}
                    title={settings.youtube.title || "QCrypto Radio"}
                />
            )}

            {/* Market News Card */}
            {settings?.features?.newsEnabled && (
                <div className="zone-card group relative h-52 rounded-xl bg-[#12121A] border border-white/5 p-5 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:border-neon-blue/50 hover:shadow-xl hover:shadow-neon-blue/10">
                    <div className="w-full h-full">
                        <NewsSlider autoPlay={true} interval={6000} />
                    </div>
                </div>
            )}

            {zones.map((zone) => {
                const IconComponent = ICON_MAP[zone.icon] || Zap;
                const gradientClass = ZONE_GRADIENTS[zone.id] || "from-white/10 to-white/5";

                return (
                    <Link
                        key={zone.id}
                        href={`/zone/${zone.id}`}
                        className="zone-card group relative h-52 rounded-xl bg-[#12121A] border border-white/5 p-5 flex flex-col justify-between overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10"
                    >
                        {/* Gradient Overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-50 group-hover:opacity-80 transition-opacity duration-500`} />

                        {/* Header */}
                        <div className="flex justify-between items-start z-10">
                            <div className={`${zone.color} bg-zinc-900/80 p-2.5 rounded-lg border border-white/5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                <IconComponent size={24} strokeWidth={1.5} />
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-zinc-500 font-medium mb-0.5">24h</div>
                                <div className={`font-bold tracking-tight ${zone.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {zone.change}
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="z-10">
                            <h3 className="text-zinc-100 text-lg font-medium tracking-tight mb-1 group-hover:text-white transition-colors">
                                {zone.name}
                            </h3>
                            <p className="text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">
                                Explore {zone.name.toLowerCase()} tokens
                            </p>
                        </div>

                        {/* Selection Indicator */}
                        <div className="absolute bottom-0 left-0 h-1 bg-indigo-500 transition-all duration-300 w-0 group-hover:w-1/3" />
                    </Link>
                );
            })}
        </div>
    );
}
