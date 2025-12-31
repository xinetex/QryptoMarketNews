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

export default function TVOverlay() {
    const overlayRef = useRef<HTMLDivElement>(null);
    const tickerRef = useRef<HTMLDivElement>(null);
    const { prices, loading } = useCryptoPrices(60000);
    const { settings } = useAdminSettings();
    const [time, setTime] = useState(new Date());

    useEffect(() => {
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
        imageUrl: "/sponsors/guardians.png", // Default image path
        linkUrl: "https://queef.io"
    };

    return (
        <div ref={overlayRef} className="relative w-full min-h-screen text-foreground overflow-y-auto">
            {/* Breaking News Banner */}
            <BreakingNews
                message="Market Update: Crypto markets show strong momentum heading into 2025"
                type="positive"
                autoHide={15}
            />

            {/* Video Background */}
            <VideoBackground showControls={true} />

            {/* Top Bar */}
            {/* Top Bar */}
            <div className="absolute top-0 left-0 w-full p-4 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center z-20 tv-element opacity-0 pointer-events-none">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-16 w-full md:w-auto pointer-events-auto">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="p-2 md:p-3 bg-neon-purple/20 border border-neon-purple rounded-lg backdrop-blur-md text-neon-purple shadow-[0_0_15px_rgba(188,19,254,0.3)] icon-pulse">
                            <Tv size={24} className="md:w-8 md:h-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]">
                                QCHANNEL
                            </h1>
                            <p className="text-[10px] md:text-sm text-neon-blue/80 font-mono tracking-widest uppercase hidden sm:block">
                                Crypto Market Intelligence
                            </p>
                        </div>
                    </div>

                    {/* Sponsor - Mobile: Small & below logo, Desktop: Beside logo */}
                    {sponsor.enabled && (
                        <a href={sponsor.linkUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 md:gap-3 px-3 py-1 md:px-4 md:py-1.5 bg-glass border border-white/5 rounded-full hover:bg-white/5 transition-colors group">
                            <span className="text-[8px] md:text-[10px] uppercase tracking-widest text-zinc-500 group-hover:text-zinc-400 transition-colors font-bold">Sponsored by</span>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={sponsor.imageUrl} alt="Sponsor" className="h-6 md:h-8 w-auto object-contain" />
                        </a>
                    )}
                </div>

                {/* Desktop Nav */}
                <div className="hidden md:flex gap-4 items-center pointer-events-auto">
                    <div className="text-right">
                        <div className="text-2xl font-mono font-bold text-white tracking-widest drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
                            {formatTime(time)}
                        </div>
                        <div className="text-xs text-neon-blue font-bold tracking-widest uppercase">
                            {formatDate(time)} • NYC
                        </div>
                    </div>
                    <div className="h-10 w-px bg-white/20 mx-2"></div>
                    <div className="hidden lg:block"><MarketPulse /></div>
                    <div className="h-10 w-px bg-white/20 mx-2 hidden lg:block"></div>

                    <Link href="/galaxy" className="px-6 py-2 bg-glass border border-white/10 rounded-full backdrop-blur-md text-sm font-bold tracking-wide hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-2">
                        <span>🌌</span> GALAXY
                    </Link>
                    <Link href="/intelligence" className="px-6 py-2 bg-glass border border-white/10 rounded-full backdrop-blur-md text-sm font-bold tracking-wide hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-2 text-neon-purple hover:text-neon-purple/80 hover:border-neon-purple/50">
                        <Brain size={16} />
                        Q-INTEL
                    </Link>
                </div>

                {/* Mobile Nav Row (Visible only on small screens) */}
                <div className="flex md:hidden w-full justify-between items-center mt-4 pointer-events-auto">
                    <div className="text-xs font-mono text-zinc-400">
                        {formatTime(time)}
                    </div>
                    <div className="flex gap-2">
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
            <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-center">
                <ZoneGrid />
            </div>

            {/* Bottom Ticker */}
            <div className="absolute bottom-4 md:bottom-8 left-0 w-full z-20 tv-element px-2 md:px-8 opacity-0 pointer-events-none">
                <div className="relative w-full h-12 md:h-16 bg-glass border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden flex items-center pointer-events-auto">
                    <div className="px-4 md:px-6 py-2 bg-neon-blue/20 h-full flex items-center border-r border-white/10 z-20 absolute left-0">
                        <TrendingUp size={18} className="text-neon-blue mr-2 md:w-6 md:h-6" />
                        <span className="font-bold text-neon-blue tracking-widest text-xs md:text-base">MARKET</span>
                    </div>
                    <div ref={tickerRef} className="absolute whitespace-nowrap flex gap-8 md:gap-12 text-sm md:text-lg font-mono font-bold items-center pl-28 md:pl-40">
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
        </div>
    );
}
