"use client";

import { useEffect, useRef, useState } from "react";
import { animate, stagger } from "animejs";
import { Tv, TrendingUp } from "lucide-react";
import ZoneGrid from "./ZoneGrid";
import VideoBackground from "./VideoBackground";
import NewsSlider from "./NewsSlider";
import { useCryptoPrices } from "@/lib/hooks/useCrypto";
import { formatPrice, formatChange } from "@/lib/coingecko";

export default function TVOverlay() {
    const overlayRef = useRef<HTMLDivElement>(null);
    const tickerRef = useRef<HTMLDivElement>(null);
    const { prices, loading } = useCryptoPrices(60000);
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

    return (
        <div ref={overlayRef} className="relative w-full h-screen text-foreground overflow-hidden">
            {/* Video Background */}
            <VideoBackground showControls={true} />

            {/* Top Bar */}
            <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-start z-20 tv-element opacity-0">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-neon-purple/20 border border-neon-purple rounded-lg backdrop-blur-md text-neon-purple shadow-[0_0_15px_rgba(188,19,254,0.3)] icon-pulse">
                        <Tv size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]">
                            QCHANNEL
                        </h1>
                        <p className="text-sm text-neon-blue/80 font-mono tracking-widest uppercase">
                            Crypto Market Intelligence
                        </p>
                    </div>
                </div>

                <div className="flex gap-4 items-center">
                    <div className="text-right hidden md:block">
                        <div className="text-2xl font-mono font-bold text-white tracking-widest drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
                            {formatTime(time)}
                        </div>
                        <div className="text-xs text-neon-blue font-bold tracking-widest uppercase">
                            {formatDate(time)} • NYC
                        </div>
                    </div>
                    <div className="h-10 w-px bg-white/20 mx-2 hidden md:block"></div>

                    <div className="px-6 py-2 bg-glass border border-white/10 rounded-full backdrop-blur-md text-sm font-bold tracking-wide hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        LIVE
                    </div>
                    <div className="px-6 py-2 bg-glass border border-white/10 rounded-full backdrop-blur-md text-sm font-bold tracking-wide hover:bg-white/10 transition-colors cursor-pointer">
                        MARKETS
                    </div>
                </div>
            </div>

            {/* News Slider - Top Right */}
            <div className="absolute top-28 right-8 w-80 z-20 tv-element opacity-0">
                <NewsSlider autoPlay={true} interval={6000} />
            </div>

            {/* Main Content Area (Zone Grid) */}
            <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-center">
                <ZoneGrid />
            </div>

            {/* Bottom Ticker */}
            <div className="absolute bottom-8 left-0 w-full z-20 tv-element px-8 opacity-0">
                <div className="relative w-full h-16 bg-glass border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden flex items-center">
                    <div className="px-6 py-2 bg-neon-blue/20 h-full flex items-center border-r border-white/10 z-20 absolute left-0">
                        <TrendingUp size={24} className="text-neon-blue mr-2" />
                        <span className="font-bold text-neon-blue tracking-widest">MARKET</span>
                    </div>
                    <div ref={tickerRef} className="absolute whitespace-nowrap flex gap-12 text-lg font-mono font-bold items-center pl-40">
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
