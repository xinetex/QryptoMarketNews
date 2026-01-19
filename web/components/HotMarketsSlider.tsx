"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { animate } from "animejs";
import { ChevronLeft, ChevronRight, Flame, TrendingUp, Clock, ExternalLink } from "lucide-react";
import Image from "next/image";
import { formatMarketCap } from "@/lib/coingecko";

// Dome API Market Interface
interface DomeMarket {
    market_slug: string;
    event_slug: string;
    title: string;
    description: string;
    start_time: number;
    end_time: number;
    volume_total: number;
    side_a: { id: string; label: string; };
    side_b: { id: string; label: string; };
    status: string;
    image: string;
}

interface HotMarketsSliderProps {
    autoPlay?: boolean;
    interval?: number;
}



function getTimeRemaining(endTime: number): string {
    const now = Date.now() / 1000;
    const diff = endTime - now;

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (60 * 60 * 24));
    if (days > 30) {
        const months = Math.floor(days / 30);
        return `${months}mo left`;
    }
    if (days > 0) return `${days}d left`;

    const hours = Math.floor(diff / (60 * 60));
    return `${hours}h left`;
}

export default function HotMarketsSlider({ autoPlay = true, interval = 6000 }: HotMarketsSliderProps) {
    const [markets, setMarkets] = useState<DomeMarket[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const slideRef = useRef<HTMLDivElement>(null);

    // Fetch hot markets from our new API (Dome wired)
    useEffect(() => {
        async function fetchHotMarkets() {
            try {
                const response = await fetch("/api/hot-markets");
                const { markets: hotMarkets } = await response.json();
                setMarkets(hotMarkets || []);
            } catch (error) {
                console.error("Failed to fetch hot markets:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchHotMarkets();
    }, []);

    // Auto-play functionality
    useEffect(() => {
        if (!autoPlay || markets.length === 0) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % markets.length);
        }, interval);

        return () => clearInterval(timer);
    }, [autoPlay, interval, markets.length]);

    // Animate on index change
    useEffect(() => {
        if (slideRef.current) {
            animate(slideRef.current, {
                opacity: [0, 1],
                translateX: [20, 0],
                easing: "easeOutExpo",
                duration: 400,
            });
        }
    }, [currentIndex]);

    const goToPrev = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + markets.length) % markets.length);
    }, [markets.length]);

    const goToNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % markets.length);
    }, [markets.length]);

    if (loading) {
        return (
            <div className="glass-card p-4 h-32 animate-pulse">
                <div className="h-4 bg-white/10 rounded w-3/4 mb-3" />
                <div className="h-4 bg-white/10 rounded w-1/2" />
            </div>
        );
    }

    if (!markets || markets.length === 0) {
        return null; // Or render empty state
    }

    const currentMarket = markets[currentIndex];

    // Dummy odds for visual completeness until pricing endpoint is wired
    // The user specifically asked to wire up the API, but the API lacks odds in the list view.
    // We will show the outcome labels instead of fake odds to be honest.

    return (
        <div className="w-full h-full relative overflow-hidden group">
            {/* Header with Dome Branding */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Flame size={14} className="text-orange-500 animate-pulse" />
                    <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                        Hot Markets
                    </span>
                    {/* Added by request: Dome attribution */}
                    <div className="flex items-center gap-1 opacity-70 ml-1">
                        <span className="text-[10px] text-gray-400">by dome</span>
                        <img
                            src="https://domeapi.io/assets/dome-icon-336KHiVB.png"
                            alt="Dome API"
                            className="w-3 h-3 object-contain"
                        />
                    </div>
                </div>
                <span className="text-xs text-white/50">
                    {currentIndex + 1} / {markets.length}
                </span>
            </div>

            {/* Market Content */}
            <div ref={slideRef} className="min-h-[80px]">
                <a
                    href={`https://polymarket.com/event/${currentMarket.event_slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group/link"
                >
                    {/* Category Badge (using generic icon since tags are array) */}
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-base">🌐</span>
                        <span className="text-[10px] uppercase tracking-wider text-white/40 font-medium">
                            Prediction
                        </span>
                        {currentMarket.volume_total > 1000000 && (
                            <span className="px-1.5 py-0.5 text-[9px] bg-yellow-500/20 text-yellow-400 rounded-full border border-yellow-500/30">
                                HIGH VOL
                            </span>
                        )}
                    </div>

                    {/* Question */}
                    <h4 className="text-white font-medium leading-tight mb-3 group-hover/link:text-orange-400 transition-colors line-clamp-2 text-sm">
                        {currentMarket.title}
                    </h4>
                </a>

                {/* Outcomes Row (Replacing Odds Bar since no price data) */}
                <div className="mb-3 flex items-center justify-between gap-2 px-1">
                    <div className="flex-1 bg-white/5 rounded px-2 py-1 text-center">
                        <span className="text-[10px] text-emerald-400 font-bold">{currentMarket.side_a.label}</span>
                    </div>
                    <span className="text-[10px] text-gray-600">vs</span>
                    <div className="flex-1 bg-white/5 rounded px-2 py-1 text-center">
                        <span className="text-[10px] text-red-400 font-bold">{currentMarket.side_b.label}</span>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="flex items-center gap-3 text-[10px]">
                    <span className="flex items-center gap-1 text-white/50">
                        <TrendingUp size={10} />
                        {formatMarketCap(currentMarket.volume_total)}
                    </span>
                    <span className="flex items-center gap-1 text-white/50">
                        <Clock size={10} />
                        {getTimeRemaining(currentMarket.end_time)}
                    </span>
                    <ExternalLink size={10} className="text-white/30 ml-auto" />
                </div>
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={goToPrev}
                className="absolute left-1 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/5 hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-all"
                aria-label="Previous market"
            >
                <ChevronLeft size={16} className="text-white/70" />
            </button>
            <button
                onClick={goToNext}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/5 hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-all"
                aria-label="Next market"
            >
                <ChevronRight size={16} className="text-white/70" />
            </button>

            {/* Progress Dots */}
            <div className="flex justify-center gap-1 mt-3">
                {markets.slice(0, 5).map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentIndex % 5 ? "bg-orange-500 w-4" : "bg-white/30"
                            }`}
                        aria-label={`Go to market ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
