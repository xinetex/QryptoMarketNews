"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { animate } from "animejs";
import { ChevronLeft, ChevronRight, Flame, TrendingUp, Clock, ExternalLink } from "lucide-react";

interface Market {
    id: string;
    slug: string;
    question: string;
    description: string;
    category: string;
    categoryIcon: string;
    yesOdds: number;
    noOdds: number;
    totalVolume: number;
    endDate: string;
    isHot: boolean;
    isFeatured: boolean;
}

interface HotMarketsSliderProps {
    autoPlay?: boolean;
    interval?: number;
}

function formatVolume(volume: number): string {
    if (volume >= 1_000_000) {
        return `$${(volume / 1_000_000).toFixed(1)}M`;
    } else if (volume >= 1_000) {
        return `$${(volume / 1_000).toFixed(0)}K`;
    }
    return `$${volume}`;
}

function getTimeRemaining(endDate: string): string {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 30) {
        const months = Math.floor(days / 30);
        return `${months}mo left`;
    }
    if (days > 0) return `${days}d left`;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    return `${hours}h left`;
}

export default function HotMarketsSlider({ autoPlay = true, interval = 6000 }: HotMarketsSliderProps) {
    const [markets, setMarkets] = useState<Market[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const slideRef = useRef<HTMLDivElement>(null);

    // Fetch hot markets from QPPBet API
    useEffect(() => {
        async function fetchHotMarkets() {
            try {
                const response = await fetch("https://qppbet.vercel.app/api/markets");
                const data: Market[] = await response.json();
                // Filter for hot markets only
                const hotMarkets = data.filter(m => m.isHot);
                setMarkets(hotMarkets.length > 0 ? hotMarkets : data.slice(0, 5));
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

    if (markets.length === 0) {
        return null;
    }

    const currentMarket = markets[currentIndex];
    const yesPercentage = currentMarket.yesOdds;
    const noPercentage = currentMarket.noOdds;

    return (
        <div className="w-full h-full relative overflow-hidden group">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Flame size={14} className="text-orange-500 animate-pulse" />
                    <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                        Hot Markets
                    </span>
                </div>
                <span className="text-xs text-white/50">
                    {currentIndex + 1} / {markets.length}
                </span>
            </div>

            {/* Market Content */}
            <div ref={slideRef} className="min-h-[80px]">
                <a
                    href={`https://qppbet.vercel.app/markets/${currentMarket.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group/link"
                >
                    {/* Category Badge */}
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-base">{currentMarket.categoryIcon}</span>
                        <span className="text-[10px] uppercase tracking-wider text-white/40 font-medium">
                            {currentMarket.category}
                        </span>
                        {currentMarket.isFeatured && (
                            <span className="px-1.5 py-0.5 text-[9px] bg-yellow-500/20 text-yellow-400 rounded-full border border-yellow-500/30">
                                FEATURED
                            </span>
                        )}
                    </div>

                    {/* Question */}
                    <h4 className="text-white font-medium leading-tight mb-3 group-hover/link:text-orange-400 transition-colors line-clamp-2 text-sm">
                        {currentMarket.question}
                    </h4>
                </a>

                {/* Odds Bar */}
                <div className="mb-2">
                    <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-emerald-400 font-bold">YES {yesPercentage}%</span>
                        <span className="text-red-400 font-bold">NO {noPercentage}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden flex">
                        <div
                            className="bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                            style={{ width: `${yesPercentage}%` }}
                        />
                        <div
                            className="bg-gradient-to-r from-red-400 to-red-500 transition-all duration-500"
                            style={{ width: `${noPercentage}%` }}
                        />
                    </div>
                </div>

                {/* Stats Row */}
                <div className="flex items-center gap-3 text-[10px]">
                    <span className="flex items-center gap-1 text-white/50">
                        <TrendingUp size={10} />
                        {formatVolume(currentMarket.totalVolume)}
                    </span>
                    <span className="flex items-center gap-1 text-white/50">
                        <Clock size={10} />
                        {getTimeRemaining(currentMarket.endDate)}
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
