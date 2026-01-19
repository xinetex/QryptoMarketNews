'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Target, Flame, TrendingUp, RefreshCw } from 'lucide-react';
import { useOracle } from '@/hooks/useOracle';
import ProphecyCard from './ProphecyCard';

export default function ProphecyFeed() {
    const { prophecies, stats, isLoading, accuracy, streak, totalProphecies, refresh } = useOracle();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = () => {
        setIsRefreshing(true);
        refresh();
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    if (isLoading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-32 bg-zinc-800/50 rounded-xl" />
                <div className="h-24 bg-zinc-800/50 rounded-xl" />
                <div className="h-24 bg-zinc-800/50 rounded-xl" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Oracle Stats Header */}
            <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                            <Sparkles className="text-white" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Prophet Oracle</h2>
                            <p className="text-xs text-zinc-400">AI-Powered Market Predictions</p>
                        </div>
                    </div>
                    <button
                        onClick={handleRefresh}
                        className="p-2 hover:bg-white/10 rounded-lg transition"
                    >
                        <RefreshCw size={16} className={`text-zinc-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-zinc-900/50 rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-emerald-400 mb-1">
                            <Target size={14} />
                            <span className="text-xl font-bold">{accuracy}%</span>
                        </div>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Accuracy</span>
                    </div>
                    <div className="bg-zinc-900/50 rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-orange-400 mb-1">
                            <Flame size={14} />
                            <span className="text-xl font-bold">{streak}</span>
                        </div>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Streak</span>
                    </div>
                    <div className="bg-zinc-900/50 rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center gap-1 text-indigo-400 mb-1">
                            <TrendingUp size={14} />
                            <span className="text-xl font-bold">{totalProphecies}</span>
                        </div>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Predictions</span>
                    </div>
                </div>
            </div>

            {/* Prophecies List */}
            <div className="space-y-4">
                <h3 className="text-sm font-medium text-zinc-400">Recent Prophecies</h3>
                {prophecies.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500">
                        <Sparkles size={24} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No prophecies yet. Generate your first prediction!</p>
                    </div>
                ) : (
                    prophecies.map((prophecy) => (
                        <ProphecyCard key={prophecy.id} prophecy={prophecy} />
                    ))
                )}
            </div>
        </div>
    );
}
