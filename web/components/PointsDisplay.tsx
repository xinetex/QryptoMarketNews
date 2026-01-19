'use client';

import { useState, useEffect } from 'react';
import { Trophy, Flame, Target, ChevronUp } from 'lucide-react';
import { usePoints } from '@/hooks/usePoints';

interface PointsDisplayProps {
    showDetails?: boolean;
}

export default function PointsDisplay({ showDetails = false }: PointsDisplayProps) {
    const { totalPoints, level, levelColor, accuracy, streak, nextLevelInfo, isLoading } = usePoints();
    const [isExpanded, setIsExpanded] = useState(false);

    if (isLoading) {
        return (
            <div className="animate-pulse bg-white/5 rounded-lg px-3 py-1.5 h-8 w-24" />
        );
    }

    return (
        <div className="relative">
            {/* Compact Display */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all group"
            >
                {/* Points Badge */}
                <div
                    className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold"
                    style={{ backgroundColor: levelColor, color: '#000' }}
                >
                    {level[0]}
                </div>

                {/* Points Count */}
                <span className="text-sm font-mono font-medium text-white">
                    {totalPoints.toLocaleString()}
                </span>

                {/* Streak indicator */}
                {streak > 0 && (
                    <div className="flex items-center gap-0.5 text-orange-400">
                        <Flame size={12} />
                        <span className="text-[10px] font-bold">{streak}</span>
                    </div>
                )}

                <ChevronUp
                    size={14}
                    className={`text-white/50 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Expanded Details */}
            {(isExpanded || showDetails) && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-zinc-900 border border-white/10 rounded-xl p-4 shadow-2xl z-50">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Trophy size={16} style={{ color: levelColor }} />
                            <span className="font-medium text-white">{level} Prophet</span>
                        </div>
                        <span className="text-2xl font-bold text-white">{totalPoints.toLocaleString()}</span>
                    </div>

                    {/* Progress to next level */}
                    {nextLevelInfo.nextLevel && (
                        <div className="mb-4">
                            <div className="flex justify-between text-xs text-zinc-400 mb-1">
                                <span>Next: {nextLevelInfo.nextLevel}</span>
                                <span>{nextLevelInfo.pointsNeeded} pts to go</span>
                            </div>
                            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${nextLevelInfo.progress}%`,
                                        backgroundColor: levelColor
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
                            <div className="flex items-center justify-center gap-1 text-emerald-400 mb-1">
                                <Target size={12} />
                                <span className="text-xs">Accuracy</span>
                            </div>
                            <span className="text-lg font-bold text-white">{accuracy}%</span>
                        </div>
                        <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
                            <div className="flex items-center justify-center gap-1 text-orange-400 mb-1">
                                <Flame size={12} />
                                <span className="text-xs">Streak</span>
                            </div>
                            <span className="text-lg font-bold text-white">{streak} days</span>
                        </div>
                    </div>

                    {/* How to earn */}
                    <div className="mt-4 pt-3 border-t border-white/10">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Earn Points</p>
                        <div className="space-y-1 text-xs text-zinc-400">
                            <div className="flex justify-between">
                                <span>Prediction</span>
                                <span className="text-emerald-400">+10</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Correct call</span>
                                <span className="text-emerald-400">+50</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Daily streak</span>
                                <span className="text-emerald-400">+10/day</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
