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
                <div className="p-6 bg-gradient-to-r from-zinc-900 via-zinc-800/50 to-zinc-900 border-b border-white/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* Flex Logo */}
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-zinc-800 to-black border border-white/10 flex items-center justify-center overflow-hidden">
                                <Image
                                    src="/flex-64x64.png"
                                    alt="Flex Capital"
                                    width={32}
                                    height={32}
                                />
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    Flex-Powered Features
                                </h2>
                                <p className="text-sm text-zinc-400">
                                    AI-driven market intelligence
                                </p>
                            </div>
                        </div>

                        {/* Tab Switcher */}
                        <div className="flex bg-zinc-800/50 rounded-xl p-1">
                            <button
                                onClick={() => setActiveTab('discovery')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'discovery'
                                        ? 'bg-white/10 text-white'
                                        : 'text-zinc-400 hover:text-white'
                                    }`}
                            >
                                <LayoutGrid size={14} />
                                Discovery
                            </button>
                            <button
                                onClick={() => setActiveTab('agent')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'agent'
                                        ? 'bg-white/10 text-white'
                                        : 'text-zinc-400 hover:text-white'
                                    }`}
                            >
                                <MessageSquare size={14} />
                                Agent
                            </button>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="mt-4 grid grid-cols-4 gap-4">
                        <div className="bg-zinc-800/30 rounded-xl p-3 text-center">
                            <div className="flex items-center justify-center gap-1 text-emerald-400 mb-1">
                                <TrendingUp size={14} />
                                <span className="text-lg font-bold">247</span>
                            </div>
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Active Markets</span>
                        </div>
                        <div className="bg-zinc-800/30 rounded-xl p-3 text-center">
                            <div className="flex items-center justify-center gap-1 text-indigo-400 mb-1">
                                <Target size={14} />
                                <span className="text-lg font-bold">72%</span>
                            </div>
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Oracle Accuracy</span>
                        </div>
                        <div className="bg-zinc-800/30 rounded-xl p-3 text-center">
                            <div className="flex items-center justify-center gap-1 text-orange-400 mb-1">
                                <Zap size={14} />
                                <span className="text-lg font-bold">$2.4M</span>
                            </div>
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">24h Volume</span>
                        </div>
                        <div className="bg-zinc-800/30 rounded-xl p-3 text-center">
                            <div className="flex items-center justify-center gap-1 text-yellow-400 mb-1">
                                <Trophy size={14} />
                                <span className="text-lg font-bold">1,247</span>
                            </div>
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Prophets</span>
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
