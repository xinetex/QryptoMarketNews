'use client';

import { useState } from 'react';
import {
    Sparkles,
    LayoutGrid,
    MessageSquare,
    ChevronRight,
    Zap,
    TrendingUp,
    Target,
    Trophy
} from 'lucide-react';
import Image from 'next/image';
import MarketDiscoveryFeed from './MarketDiscoveryFeed';
import ProphetAgent from './ProphetAgent';

type FlexFeatureTab = 'discovery' | 'agent';

interface FlexFeaturesCardProps {
    defaultTab?: FlexFeatureTab;
    showHeader?: boolean;
}

export default function FlexFeaturesCard({ defaultTab = 'discovery', showHeader = true }: FlexFeaturesCardProps) {
    const [activeTab, setActiveTab] = useState<FlexFeatureTab>(defaultTab);

    return (
        <div className="bg-gradient-to-b from-zinc-900/90 to-zinc-950/90 border border-white/10 rounded-3xl overflow-hidden">
            {/* Header */}
            {showHeader && (
                <div className="p-5 bg-gradient-to-r from-zinc-900 via-zinc-800/40 to-zinc-900 border-b border-white/5">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            {/* Flex Logo */}
                            <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden shadow-lg shadow-black/50">
                                <Image
                                    src="/flex-64x64.png"
                                    alt="Flex Capital"
                                    width={28}
                                    height={28}
                                    className="opacity-90"
                                />
                            </div>

                            <div>
                                <h2 className="text-lg font-bold text-white flex items-center gap-2 tracking-tight">
                                    Flex Innovation
                                </h2>
                                <p className="text-xs text-zinc-500 font-medium tracking-wide uppercase">
                                    Market Intelligence
                                </p>
                            </div>
                        </div>

                        {/* Tab Switcher */}
                        <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
                            <button
                                onClick={() => setActiveTab('discovery')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${activeTab === 'discovery'
                                    ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-white/10'
                                    : 'text-zinc-500 hover:text-zinc-300'
                                    }`}
                            >
                                <LayoutGrid size={12} />
                                Discovery
                            </button>
                            <button
                                onClick={() => setActiveTab('agent')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${activeTab === 'agent'
                                    ? 'bg-zinc-800 text-white shadow-sm ring-1 ring-white/10'
                                    : 'text-zinc-500 hover:text-zinc-300'
                                    }`}
                            >
                                <MessageSquare size={12} />
                                Agent
                            </button>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="mt-4 grid grid-cols-4 gap-2 md:gap-4">
                        <div className="bg-black/20 rounded-lg p-2 md:p-3 text-center border border-white/5">
                            <div className="flex items-center justify-center gap-1 text-emerald-400 mb-0.5">
                                <TrendingUp size={12} />
                                <span className="text-sm md:text-base font-bold font-mono">247</span>
                            </div>
                            <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Markets</span>
                        </div>
                        <div className="bg-black/20 rounded-lg p-2 md:p-3 text-center border border-white/5">
                            <div className="flex items-center justify-center gap-1 text-indigo-400 mb-0.5">
                                <Target size={12} />
                                <span className="text-sm md:text-base font-bold font-mono">72%</span>
                            </div>
                            <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Accuracy</span>
                        </div>
                        <div className="bg-black/20 rounded-lg p-2 md:p-3 text-center border border-white/5">
                            <div className="flex items-center justify-center gap-1 text-orange-400 mb-0.5">
                                <Zap size={12} />
                                <span className="text-sm md:text-base font-bold font-mono">$2.4M</span>
                            </div>
                            <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Vol 24h</span>
                        </div>
                        <div className="bg-black/20 rounded-lg p-2 md:p-3 text-center border border-white/5">
                            <div className="flex items-center justify-center gap-1 text-yellow-400 mb-0.5">
                                <Trophy size={12} />
                                <span className="text-sm md:text-base font-bold font-mono">1.2k</span>
                            </div>
                            <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Prophets</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="p-6">
                {activeTab === 'discovery' ? (
                    <MarketDiscoveryFeed />
                ) : (
                    <ProphetAgent />
                )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-zinc-900/50 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Image src="/flex-16x16.png" alt="Flex" width={12} height={12} className="opacity-60" />
                    <span>Powered by Flex Capital portfolio insights</span>
                </div>
                <button className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition">
                    Learn More <ChevronRight size={12} />
                </button>
            </div>
        </div>
    );
}
