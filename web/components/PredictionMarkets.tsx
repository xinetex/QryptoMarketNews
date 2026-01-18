'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Market {
    title: string;
    description: string;
    image: string;
    volume_total: number;
    end_time: number;
    market_slug: string;
    side_a: { label: string };
    side_b: { label: string };
}

export default function PredictionMarkets() {
    const [markets, setMarkets] = useState<Market[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMarkets = async () => {
            try {
                const res = await fetch('/api/markets');
                const data = await res.json();
                if (data.markets) {
                    setMarkets(data.markets.slice(0, 6)); // Show top 6
                }
            } catch (e) {
                console.error("Failed to load markets", e);
            } finally {
                setLoading(false);
            }
        };

        fetchMarkets();
    }, []);

    if (loading) return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-gray-900/50 rounded-xl animate-pulse border border-gray-800" />
            ))}
        </div>
    );

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="text-2xl">🔮</span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    Live Prediction Markets
                </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {markets.map((market, idx) => (
                    <motion.a
                        key={idx}
                        href={`https://polymarket.com/event/${market.market_slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="group relative bg-gray-900/40 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/10"
                    >
                        {/* Image Header */}
                        <div className="h-32 w-full overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent z-10" />
                            <img
                                src={market.image}
                                alt={market.title}
                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute top-2 right-2 z-20 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs text-white border border-white/10 flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                Live
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-3">
                            <h3 className="font-semibold text-sm line-clamp-2 text-gray-200 group-hover:text-white transition-colors">
                                {market.title}
                            </h3>

                            {/* Volume & Time Badge */}
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                    📊 ${(market.volume_total / 1000000).toFixed(1)}M Vol
                                </span>
                                <span>
                                    {new Date(market.end_time * 1000).toLocaleDateString()}
                                </span>
                            </div>

                            {/* Outcomes (Visual Only) */}
                            <div className="flex items-center gap-2 pt-2 border-t border-gray-800/50">
                                <div className="flex-1 bg-gray-800/50 rounded px-2 py-1.5 text-xs text-center text-gray-400">
                                    {market.side_a.label}
                                </div>
                                <div className="text-gray-600 text-xs">vs</div>
                                <div className="flex-1 bg-gray-800/50 rounded px-2 py-1.5 text-xs text-center text-gray-400">
                                    {market.side_b.label}
                                </div>
                            </div>
                        </div>
                    </motion.a>
                ))}
            </div>
        </div>
    );
}
