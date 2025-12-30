"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { Zap, Brain, Rocket, Globe, Palette, Gamepad, LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { useCategoryData } from "@/lib/hooks/useCrypto";
import type { ZoneData } from "@/lib/types/crypto";
import Link from "next/link";

// Icon mapping
const ICON_MAP: Record<string, LucideIcon> = {
    Zap,
    Brain,
    Rocket,
    Globe,
    Palette,
    Gamepad,
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

// Fallback static zones
const FALLBACK_ZONES: ZoneData[] = [
    { id: "solana", name: "Solana Ecosystem", icon: "Zap", color: "text-purple-400", change: "...", isPositive: true },
    { id: "ai", name: "AI Agents", icon: "Brain", color: "text-emerald-400", change: "...", isPositive: true },
    { id: "memes", name: "Meme Trenches", icon: "Rocket", color: "text-orange-400", change: "...", isPositive: true },
    { id: "rwa", name: "Real World Assets", icon: "Globe", color: "text-blue-400", change: "...", isPositive: true },
    { id: "nft", name: "NFT Market", icon: "Palette", color: "text-pink-400", change: "...", isPositive: true },
    { id: "gaming", name: "GameFi", icon: "Gamepad", color: "text-yellow-400", change: "...", isPositive: true },
    { id: "defi", name: "DeFi 2.0", icon: "Zap", color: "text-cyan-400", change: "...", isPositive: true },
    { id: "layer2", name: "L2 Scaling", icon: "Globe", color: "text-indigo-400", change: "...", isPositive: true }
];

export default function ZoneGrid() {
    const gridRef = useRef<HTMLDivElement>(null);
    const { categories, loading } = useCategoryData(300000);

    const zones: ZoneData[] = categories.length > 0 ? categories : FALLBACK_ZONES;

    useEffect(() => {
        animate(".zone-card", {
            scale: [0.8, 1],
            opacity: [0, 1],
            delay: stagger(100),
            easing: "easeOutElastic(1, .6)",
            duration: 800
        });
    }, []);

    useEffect(() => {
        if (!loading && categories.length > 0) {
            animate(".zone-card", {
                scale: [0.95, 1],
                opacity: [0.8, 1],
                delay: stagger(50),
                easing: "easeOutExpo",
                duration: 400
            });
        }
    }, [loading, categories]);

    return (
        <div ref={gridRef} className="absolute inset-0 top-32 bottom-24 overflow-y-auto z-10 p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pointer-events-auto">
            {zones.map((zone) => {
                const IconComponent = ICON_MAP[zone.icon] || Zap;
                const gradientClass = ZONE_GRADIENTS[zone.id] || "from-white/10 to-white/5";

                return (
                    <Link href={`/zone/${zone.id}`} key={zone.id}>
                        <div
                            className="zone-card opacity-0 group relative h-52 glass-card neon-border hover-lift shimmer-effect cursor-pointer overflow-hidden"
                        >
                            <Link
                                key={zone.id}
                                href={`/zone/${zone.id}`}
                                className={`min-w-[300px] w-[300px] h-[200px] rounded-xl bg-[#12121A] border border-white/5 p-5 flex flex-col justify-between group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 snap-start
                            ${focusedIndex === index ? 'ring-2 ring-indigo-500 scale-[1.02] shadow-xl shadow-indigo-500/20 z-10' : ''}
                        `}
                            >
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="flex justify-between items-start z-10">
                                    <div className="bg-zinc-900/80 p-2.5 rounded-lg border border-white/5 text-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                        {/* Original icon rendering logic was different, adapting to new structure */}
                                        <IconComponent size={24} strokeWidth={1.5} />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-zinc-500 font-medium mb-0.5">TVL</div>
                                        {/* Assuming zone.tvl exists based on the new structure */}
                                        <div className="text-zinc-200 font-bold tracking-tight">{zone.tvl || 'N/A'}</div>
                                    </div>
                                </div>

                                <div className="z-10">
                                    <h3 className="text-zinc-100 text-lg font-medium tracking-tight mb-1 group-hover:text-white transition-colors">
                                        {zone.name}
                                    </h3>
                                    {/* Assuming zone.description exists based on the new structure */}
                                    <p className="text-xs text-zinc-500 line-clamp-2 md:line-clamp-1 group-hover:text-zinc-400 transition-colors">
                                        {zone.description || 'No description available.'}
                                    </p>

                                    <div className={`text-xs mt-3 flex items-center gap-1 font-medium ${zone.change && zone.change.startsWith('+') ? 'text-emerald-400' : 'text-red-400'
                                        }`}>
                                        <span>{zone.change}</span>
                                        <span className="opacity-60 text-[10px] text-zinc-500 font-normal">24h Change</span>
                                    </div>
                                </div>

                                {/* Selection Indicator */}
                                <div className={`absolute bottom-0 left-0 h-1 bg-indigo-500 transition-all duration-300 ${focusedIndex === index ? 'w-full' : 'w-0 group-hover:w-1/3'
                                    }`} />
                            </Link>
                            );
            })}
                        </div>
                        );
}
