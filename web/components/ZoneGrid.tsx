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
                            {/* Background Gradient */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-50 group-hover:opacity-80 transition-opacity duration-500`} />

                            {/* Animated Corner Accent */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-neon-blue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            {/* Content */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
                                {/* Icon Container */}
                                <div className={`relative p-5 rounded-2xl bg-white/5 backdrop-blur-sm mb-4 group-hover:scale-110 transition-all duration-300 ${zone.color}`}>
                                    <IconComponent size={36} strokeWidth={1.5} />
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>

                                {/* Zone Name */}
                                <h3 className="text-lg font-bold tracking-wide text-white group-hover:text-neon-blue transition-colors duration-300">
                                    {zone.name}
                                </h3>

                                {/* Change Badge */}
                                <div className={`mt-3 px-4 py-1.5 rounded-full flex items-center gap-2 ${zone.isPositive
                                        ? "bg-green-500/20 border border-green-500/30"
                                        : "bg-red-500/20 border border-red-500/30"
                                    }`}>
                                    {zone.isPositive ? (
                                        <TrendingUp size={14} className="text-green-400" />
                                    ) : (
                                        <TrendingDown size={14} className="text-red-400" />
                                    )}
                                    <span className={`text-sm font-mono font-bold ${zone.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                        {zone.change}
                                    </span>
                                </div>
                            </div>

                            {/* Bottom Glow Line */}
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-blue/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

                            {/* Hover Border Glow */}
                            <div className="absolute inset-0 rounded-2xl border border-neon-blue/0 group-hover:border-neon-blue/50 transition-colors duration-300 pointer-events-none" />
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
