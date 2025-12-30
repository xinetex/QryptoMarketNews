"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { animate } from "animejs";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus, ExternalLink } from "lucide-react";
import type { NewsItem } from "@/lib/types/news";

interface NewsSliderProps {
    autoPlay?: boolean;
    interval?: number;
}

export default function NewsSlider({ autoPlay = true, interval = 5000 }: NewsSliderProps) {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const slideRef = useRef<HTMLDivElement>(null);

    // Fetch news
    useEffect(() => {
        async function fetchNews() {
            try {
                const response = await fetch("/api/news");
                const { data } = await response.json();
                setNews(data);
            } catch (error) {
                console.error("Failed to fetch news:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchNews();
    }, []);

    // Auto-play functionality
    useEffect(() => {
        if (!autoPlay || news.length === 0) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % news.length);
        }, interval);

        return () => clearInterval(timer);
    }, [autoPlay, interval, news.length]);

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
        setCurrentIndex((prev) => (prev - 1 + news.length) % news.length);
    }, [news.length]);

    const goToNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % news.length);
    }, [news.length]);

    if (loading) {
        return (
            <div className="glass-card p-4 h-32 animate-pulse">
                <div className="h-4 bg-white/10 rounded w-3/4 mb-3" />
                <div className="h-4 bg-white/10 rounded w-1/2" />
            </div>
        );
    }

    if (news.length === 0) {
        return null;
    }

    const currentNews = news[currentIndex];
    const sentimentIcon = currentNews.sentiment === "positive" ? (
        <TrendingUp size={16} className="text-green-400" />
    ) : currentNews.sentiment === "negative" ? (
        <TrendingDown size={16} className="text-red-400" />
    ) : (
        <Minus size={16} className="text-white/50" />
    );

    const sentimentBg = currentNews.sentiment === "positive"
        ? "bg-green-500/20 border-green-500/30"
        : currentNews.sentiment === "negative"
            ? "bg-red-500/20 border-red-500/30"
            : "bg-white/10 border-white/20";

    return (
        <div className="glass-card p-4 relative overflow-hidden group">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-neon-blue rounded-full animate-pulse" />
                    <span className="text-xs font-bold text-neon-blue uppercase tracking-wider">
                        Market News
                    </span>
                </div>
                <span className="text-xs text-white/50">
                    {currentIndex + 1} / {news.length}
                </span>
            </div>

            {/* News Content */}
            <div ref={slideRef} className="min-h-[80px]">
                <a
                    href={currentNews.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group/link"
                >
                    <h4 className="text-white font-medium leading-tight mb-2 group-hover/link:text-neon-blue transition-colors line-clamp-2">
                        {currentNews.title}
                    </h4>
                </a>

                <div className="flex items-center gap-3 text-xs">
                    <span className={`px-2 py-1 rounded-full border ${sentimentBg} flex items-center gap-1`}>
                        {sentimentIcon}
                        <span className="capitalize">{currentNews.sentiment}</span>
                    </span>
                    <span className="text-white/50">{currentNews.source}</span>
                    <span className="text-white/50">•</span>
                    <span className="text-white/50">{currentNews.published}</span>
                </div>
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={goToPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/5 hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-all"
                aria-label="Previous news"
            >
                <ChevronLeft size={18} className="text-white/70" />
            </button>
            <button
                onClick={goToNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/5 hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-all"
                aria-label="Next news"
            >
                <ChevronRight size={18} className="text-white/70" />
            </button>

            {/* Progress Dots */}
            <div className="flex justify-center gap-1 mt-3">
                {news.slice(0, 5).map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentIndex % 5 ? "bg-neon-blue w-4" : "bg-white/30"
                            }`}
                        aria-label={`Go to news ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
