"use client";

import { useEffect, useRef, useState } from "react";
import { animate, stagger } from "animejs";
import Link from "next/link";
import { Tv, TrendingUp, Brain } from "lucide-react";
import ZoneGrid from "./ZoneGrid";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import VideoBackground from "./VideoBackground";
import MarketPulse from "./MarketPulse";
import BreakingNews from "./BreakingNews";
import { useCryptoPrices } from "@/lib/hooks/useCrypto";
import { formatPrice, formatChange } from "@/lib/coingecko";
import ProphetBadge from "./ProphetBadge";
import AEOContent from "./AEOContent";

export default function TVOverlay() {
    const overlayRef = useRef<HTMLDivElement>(null);
    const tickerRef = useRef<HTMLDivElement>(null);
    const { prices, loading } = useCryptoPrices(60000);
    const { settings } = useAdminSettings();
    const [time, setTime] = useState<Date | null>(null);

    const [showInfo, setShowInfo] = useState(false);

    useEffect(() => {
        setTime(new Date()); // Set initial client time
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
        });
    };

    useEffect(() => {
        animate(".tv-element", {
            translateY: [50, 0],
            opacity: [0, 1],
            delay: stagger(200),
            easing: "easeOutExpo",
            duration: 1500,
        });

        if (tickerRef.current) {
            animate(tickerRef.current, {
                translateX: ["100%", "-100%"],
                easing: "linear",
                duration: 20000,
                loop: true,
            });
        }
    }, []);

    useEffect(() => {
        if (tickerRef.current && prices.length > 0) {
            animate(tickerRef.current, {
                translateX: ["100%", "-100%"],
                easing: "linear",
                duration: 25000,
                loop: true,
            });
        }
    }, [prices]);

    const sponsor = settings?.sponsor || {
        enabled: true,
        imageUrl: "https://domeapi.io/assets/dome-icon-336KHiVB.png",
        linkUrl: "https://domeapi.io"
    };

    return (
        <div ref={overlayRef} className="relative w-full min-h-screen text-foreground overflow-y-auto">
            {/* Breaking News Banner */}
            {/* Breaking News Banner Removed */}

            {/* Video Background */}
            <VideoBackground showControls={true} />

            {/* Top Bar */}
            {/* Top Bar */}
            <div className="absolute top-0 left-0 w-full p-3 lg:p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center z-20 tv-element opacity-0 pointer-events-none">
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 lg:gap-16 w-full lg:w-auto pointer-events-auto">
                    <div className="flex items-center gap-2 lg:gap-4">
                        <div className="bg-neon-purple/20 border border-neon-purple rounded-lg backdrop-blur-md shadow-[0_0_15px_rgba(188,19,254,0.3)] icon-pulse overflow-hidden">
                            <img
                                src="/prophet-logo.png"
                                alt="Prophet TV"
                                className="w-9 h-9 lg:w-14 lg:h-14 object-cover"
                            />
                        </div>
                        <div>
                            <h1 className="text-2xl lg:text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]">
                                PROPHET TV
                            </h1>
                            <p className="text-[10px] lg:text-sm text-neon-blue/80 font-mono tracking-widest uppercase hidden md:block">
                                Crypto Market Intelligence
                            </p>
                        </div>
                    </div>

                    {/* Sponsor - Mobile: Small & below logo, Desktop: Beside logo */}
                    {sponsor.enabled && (
                        <a href={sponsor.linkUrl || "https://domeapi.io"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 lg:gap-3 px-3 py-1 lg:px-4 lg:py-1.5 bg-glass border border-white/5 rounded-full hover:bg-white/5 transition-colors group">
                            <span className="text-[8px] lg:text-[10px] uppercase tracking-widest text-zinc-500 group-hover:text-zinc-400 transition-colors font-bold">
                                Powered by <span className="text-zinc-300">Dome</span>
                            </span>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={sponsor.imageUrl || "https://domeapi.io/assets/dome-icon-336KHiVB.png"}
                                alt="Dome API"
                                className="h-5 lg:h-7 w-auto object-contain"
                            />
                        </a>
                    )}
                </div>

                {/* Dynamic Island: Prophet Badge */}
                <div className="hidden lg:block pointer-events-auto">
                    <ProphetBadge />
                </div>

                {/* Desktop Nav (lg and up) */}
                <div className="hidden lg:flex gap-4 items-center pointer-events-auto">
                    <div className="text-right">
                        <div className="text-2xl font-mono font-bold text-white tracking-widest drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
                            {time ? formatTime(time as Date) : "00:00:00"}
                        </div>
                        <div className="text-xs text-neon-blue font-bold tracking-widest uppercase">
                            {time ? formatDate(time as Date) : "..."} • NYC
                        </div>
                    </div>
                    <div className="h-10 w-px bg-white/20 mx-2"></div>
                    <div className="hidden xl:block"><MarketPulse /></div>
                    <div className="h-10 w-px bg-white/20 mx-2 hidden xl:block"></div>

                    <button
                        onClick={() => setShowInfo(true)}
                        className="px-6 py-2 bg-glass border border-white/10 rounded-full backdrop-blur-md text-sm font-bold tracking-wide hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-2 text-zinc-400 hover:text-white"
                    >
                        <span>ℹ️</span> INFO
                    </button>

                    <Link href="/galaxy" className="px-6 py-2 bg-glass border border-white/10 rounded-full backdrop-blur-md text-sm font-bold tracking-wide hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-2">
                        <span>🌌</span> GALAXY
                    </Link>
                    <Link href="/intelligence" className="px-6 py-2 bg-glass border border-white/10 rounded-full backdrop-blur-md text-sm font-bold tracking-wide hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-2 text-neon-purple hover:text-neon-purple/80 hover:border-neon-purple/50">
                        <Brain size={16} />
                        Q-INTEL
                    </Link>
                </div>

                {/* Tablet/Mobile Nav Row (Visible on screens smaller than lg) */}
                <div className="flex lg:hidden w-full justify-between items-center mt-1 pointer-events-auto">
                    <div className="text-[10px] font-mono text-zinc-400">
                        {time ? formatTime(time as Date) : "..."}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowInfo(true)}
                            className="px-3 py-1.5 bg-glass border border-white/10 rounded-full text-xs font-bold hover:bg-white/10 text-zinc-400"
                        >
                            ℹ️
                        </button>
                        <Link href="/galaxy" className="px-3 py-1.5 bg-glass border border-white/10 rounded-full text-xs font-bold hover:bg-white/10">
                            🌌 GALAXY
                        </Link>
                        <Link href="/intelligence" className="px-3 py-1.5 bg-glass border border-neon-purple/30 rounded-full text-xs font-bold text-neon-purple hover:bg-neon-purple/10 flex items-center gap-1">
                            <Brain size={12} /> INTEL
                        </Link>
                    </div>
                </div>
            </div>



            {/* Main Content Area (Zone Grid) */}
            <div className="relative z-10 pointer-events-none flex flex-col md:justify-center min-h-screen">
                <ZoneGrid />
            </div>

            {/* Bottom Ticker */}
            <div className="absolute bottom-4 lg:bottom-8 left-0 w-full z-20 tv-element px-2 lg:px-8 opacity-0 pointer-events-none">
                <div className="relative w-full h-12 lg:h-16 bg-glass border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden flex items-center pointer-events-auto">
                    <div className="px-4 lg:px-6 py-2 bg-neon-blue/20 h-full flex items-center border-r border-white/10 z-20 absolute left-0">
                        <TrendingUp size={18} className="text-neon-blue mr-2 lg:w-6 lg:h-6" />
                        <span className="font-bold text-neon-blue tracking-widest text-xs lg:text-base">MARKET</span>
                    </div>
                    <div ref={tickerRef} className="absolute whitespace-nowrap flex gap-8 lg:gap-12 text-sm lg:text-lg font-mono font-bold items-center pl-28 lg:pl-40">
                        {loading ? (
                            <span className="text-white/50">Loading market data...</span>
                        ) : prices.length > 0 ? (
                            <>
                                {prices.map((coin) => (
                                    <span key={coin.symbol} className="text-white">
                                        {coin.symbol}{" "}
                                        <span className={coin.isPositive ? "text-green-400" : "text-red-400"}>
                                            {formatPrice(coin.price)} ({formatChange(coin.change24h)})
                                        </span>
                                    </span>
                                ))}
                                {prices.map((coin) => (
                                    <span key={`${coin.symbol}-dup`} className="text-white">
                                        {coin.symbol}{" "}
                                        <span className={coin.isPositive ? "text-green-400" : "text-red-400"}>
                                            {formatPrice(coin.price)} ({formatChange(coin.change24h)})
                                        </span>
                                    </span>
                                ))}
                            </>
                        ) : (
                            <span className="text-white/50">No market data available</span>
                        )}
                    </div>
                </div>
            </div>

            {/* AEO Search Authority Modal */}
            <AEOContent isOpen={showInfo} onClose={() => setShowInfo(false)} />
        </div>
    );
}
