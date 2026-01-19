'use client';

import { useState, useEffect } from 'react';
import {
    TrendingUp,
    Flame,
    Zap,
    Trophy,
    Vote,
    Tv,
    Coins,
    Globe,
    ChevronRight,
    Sparkles,
    ArrowUpRight
} from 'lucide-react';
import Image from 'next/image';

// Market categories aligned with Prophet ecosystem
const CATEGORIES = [
    { id: 'for-you', name: 'For You', icon: Sparkles, color: 'from-purple-500 to-pink-500' },
    { id: 'crypto', name: 'Crypto', icon: Coins, color: 'from-orange-500 to-yellow-500' },
    { id: 'politics', name: 'Politics', icon: Vote, color: 'from-blue-500 to-indigo-500' },
    { id: 'sports', name: 'Sports', icon: Trophy, color: 'from-green-500 to-emerald-500' },
    { id: 'entertainment', name: 'Entertainment', icon: Tv, color: 'from-pink-500 to-rose-500' },
    { id: 'world', name: 'World', icon: Globe, color: 'from-cyan-500 to-blue-500' },
];

interface DiscoveryMarket {
    id: string;
    title: string;
    category: string;
    yesPrice: number;
    volume24h: number;
    endDate: string;
    trending: boolean;
    hot: boolean;
    image?: string;
}

// Mock discovery markets - in production, fetch from API
const MOCK_MARKETS: DiscoveryMarket[] = [
    {
        id: '1',
        title: 'Will Bitcoin reach $100K before March 2026?',
        category: 'crypto',
        yesPrice: 0.67,
        volume24h: 245000,
        endDate: '2026-03-01',
        trending: true,
        hot: true,
    },
    {
        id: '2',
        title: 'Will the next Fed meeting cut rates?',
        category: 'politics',
        yesPrice: 0.42,
        volume24h: 189000,
        endDate: '2026-02-15',
        trending: true,
        hot: false,
    },
    {
        id: '3',
        title: 'Super Bowl LXII winner: Chiefs vs Eagles?',
        category: 'sports',
        yesPrice: 0.55,
        volume24h: 320000,
        endDate: '2026-02-09',
        trending: false,
        hot: true,
    },
    {
        id: '4',
        title: 'Will Ethereum flip Solana in TVL by Q2?',
        category: 'crypto',
        yesPrice: 0.78,
        volume24h: 156000,
        endDate: '2026-06-30',
        trending: true,
        hot: false,
    },
    {
        id: '5',
        title: 'Oscars 2026: Will an AI-generated film win?',
        category: 'entertainment',
        yesPrice: 0.12,
        volume24h: 89000,
        endDate: '2026-03-15',
        trending: false,
        hot: false,
    },
    {
        id: '6',
        title: 'Global recession in 2026?',
        category: 'world',
        yesPrice: 0.31,
        volume24h: 412000,
        endDate: '2026-12-31',
        trending: true,
        hot: true,
    },
];

interface MarketCardProps {
    market: DiscoveryMarket;
    onPredict: (market: DiscoveryMarket, position: 'YES' | 'NO') => void;
}

function MarketCard({ market, onPredict }: MarketCardProps) {
    const noPrice = 1 - market.yesPrice;
    const daysLeft = Math.ceil((new Date(market.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    return (
        <div className="group relative bg-zinc-900/80 border border-white/10 rounded-2xl p-4 hover:border-white/20 transition-all hover:scale-[1.02] cursor-pointer">
            {/* Badges */}
            <div className="absolute top-3 right-3 flex gap-1">
                {market.hot && (
                    <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-bold flex items-center gap-1">
                        <Flame size={10} /> HOT
                    </span>
                )}
                {market.trending && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold flex items-center gap-1">
                        <TrendingUp size={10} /> TRENDING
                    </span>
                )}
            </div>

            {/* Title */}
            <h3 className="text-white font-medium text-sm pr-20 mb-3 line-clamp-2 group-hover:text-blue-300 transition">
                {market.title}
            </h3>

            {/* Price Bars */}
            <div className="space-y-2 mb-3">
                <button
                    onClick={() => onPredict(market, 'YES')}
                    className="w-full flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 transition group/btn"
                >
                    <span className="text-emerald-400 font-medium text-sm">YES</span>
                    <span className="text-emerald-300 font-bold">{(market.yesPrice * 100).toFixed(0)}¢</span>
                </button>
                <button
                    onClick={() => onPredict(market, 'NO')}
                    className="w-full flex items-center justify-between p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition group/btn"
                >
                    <span className="text-red-400 font-medium text-sm">NO</span>
                    <span className="text-red-300 font-bold">{(noPrice * 100).toFixed(0)}¢</span>
                </button>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>${(market.volume24h / 1000).toFixed(0)}K volume</span>
                <span>{daysLeft} days left</span>
            </div>
        </div>
    );
}

interface MarketDiscoveryFeedProps {
    onPredict?: (market: DiscoveryMarket, position: 'YES' | 'NO') => void;
    compact?: boolean;
}

export default function MarketDiscoveryFeed({ onPredict, compact = false }: MarketDiscoveryFeedProps) {
    const [selectedCategory, setSelectedCategory] = useState('for-you');
    const [markets, setMarkets] = useState<DiscoveryMarket[]>(MOCK_MARKETS);

    // Filter markets by category
    const filteredMarkets = selectedCategory === 'for-you'
        ? markets.filter(m => m.trending || m.hot)
        : markets.filter(m => m.category === selectedCategory);

    const handlePredict = (market: DiscoveryMarket, position: 'YES' | 'NO') => {
        if (onPredict) {
            onPredict(market, position);
        } else {
            // Default: log and could open modal
            console.log(`Predict ${position} on: ${market.title}`);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header with Flex Badge */}
            <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
                    <div>
                        <h2 className="text-base font-bold text-white flex items-center gap-2 leading-none">
                            Market Discovery
                            <span className="px-1.5 py-0.5 rounded bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-[9px] text-indigo-300 font-bold uppercase tracking-wider">
                                Beta
                            </span>
                        </h2>
                    </div>
                </div>
                <button className="text-zinc-500 hover:text-white text-xs font-bold flex items-center gap-1 transition-colors uppercase tracking-wide">
                    View All <ChevronRight size={12} />
                </button>
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
                {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = selectedCategory === cat.id;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${isSelected
                                ? `bg-zinc-800 border-zinc-600 text-white shadow-lg shadow-black/50`
                                : 'bg-zinc-900/50 border-white/5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 hover:border-white/10'
                                }`}
                        >
                            <Icon size={12} className={isSelected ? 'text-indigo-400' : ''} />
                            {cat.name}
                        </button>
                    );
                })}
            </div>

            {/* Markets Grid */}
            {compact ? (
                // Compact: Horizontal scroll
                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2 snap-x">
                    {filteredMarkets.map((market) => (
                        <div key={market.id} className="min-w-[260px] flex-shrink-0 snap-start">
                            <MarketCard market={market} onPredict={handlePredict} />
                        </div>
                    ))}
                </div>
            ) : (
                // Full: Grid
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredMarkets.map((market) => (
                        <MarketCard key={market.id} market={market} onPredict={handlePredict} />
                    ))}
                </div>
            )}

            {/* Empty State */}
            {filteredMarkets.length === 0 && (
                <div className="text-center py-12 text-zinc-500 bg-zinc-900/30 rounded-xl border border-white/5 border-dashed">
                    <Zap size={24} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No markets found.</p>
                </div>
            )}
        </div>
    );
}
