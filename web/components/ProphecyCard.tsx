'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Target, Zap, Clock, ChevronRight } from 'lucide-react';
import type { Prophecy } from '@/lib/oracle';

interface ProphecyCardProps {
    prophecy: Prophecy;
    compact?: boolean;
}

export default function ProphecyCard({ prophecy, compact = false }: ProphecyCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const predictionColors = {
        YES: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
        NO: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
        NEUTRAL: { bg: 'bg-zinc-500/10', text: 'text-zinc-400', border: 'border-zinc-500/30' },
    };

    const outcomeColors = {
        CORRECT: 'text-emerald-400',
        INCORRECT: 'text-red-400',
        PENDING: 'text-zinc-500',
    };

    const PredictionIcon = prophecy.prediction === 'YES'
        ? TrendingUp
        : prophecy.prediction === 'NO'
            ? TrendingDown
            : Minus;

    const colors = predictionColors[prophecy.prediction];
    const formattedDate = new Date(prophecy.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    if (compact) {
        return (
            <div
                className={`p-3 rounded-lg border ${colors.border} ${colors.bg} cursor-pointer hover:bg-white/5 transition`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-8 h-8 rounded-lg ${colors.bg} ${colors.text} flex items-center justify-center flex-shrink-0`}>
                            <PredictionIcon size={16} />
                        </div>
                        <p className="text-sm text-white font-medium truncate">{prophecy.marketTitle}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs font-bold ${colors.text}`}>{prophecy.prediction}</span>
                        <span className="text-xs text-zinc-500">{prophecy.confidence}%</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`rounded-xl border ${colors.border} bg-zinc-900/50 overflow-hidden`}>
            {/* Header */}
            <div className={`p-4 ${colors.bg} border-b ${colors.border}`}>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${colors.bg} ${colors.text} flex items-center justify-center border ${colors.border}`}>
                            <PredictionIcon size={20} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className={`text-lg font-bold ${colors.text}`}>{prophecy.prediction}</span>
                                <span className="text-zinc-400 text-sm">prediction</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-zinc-500">
                                <Clock size={10} />
                                <span>{formattedDate}</span>
                            </div>
                        </div>
                    </div>

                    {/* Confidence Meter */}
                    <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                            <Target size={12} className={colors.text} />
                            <span className={`text-sm font-bold ${colors.text}`}>{prophecy.confidence}%</span>
                        </div>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider">confidence</span>
                    </div>
                </div>
            </div>

            {/* Market Question */}
            <div className="p-4 border-b border-white/5">
                <p className="text-white font-medium">{prophecy.marketTitle}</p>
            </div>

            {/* Reasoning */}
            <div className="p-4">
                <div className="flex items-start gap-2">
                    <Zap size={14} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-zinc-400">{prophecy.reasoning}</p>
                </div>
            </div>

            {/* Factors */}
            {prophecy.factors.length > 0 && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full p-3 border-t border-white/5 flex items-center justify-between hover:bg-white/5 transition"
                >
                    <span className="text-xs text-zinc-500">
                        {prophecy.factors.length} factors analyzed
                    </span>
                    <ChevronRight
                        size={14}
                        className={`text-zinc-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    />
                </button>
            )}

            {isExpanded && (
                <div className="p-4 pt-0 space-y-2">
                    {prophecy.factors.map((factor, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                            <div className={`w-2 h-2 rounded-full ${factor.sentiment === 'bullish' ? 'bg-emerald-400' :
                                factor.sentiment === 'bearish' ? 'bg-red-400' : 'bg-zinc-400'
                                }`} />
                            <span className="text-zinc-400">{factor.name}:</span>
                            <span className="text-zinc-300">{factor.description}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Outcome Badge */}
            {prophecy.outcome && prophecy.outcome !== 'PENDING' && (
                <div className={`p-2 text-center text-xs font-bold ${outcomeColors[prophecy.outcome]} bg-white/5`}>
                    {prophecy.outcome === 'CORRECT' ? '✓ Correct Prediction' : '✗ Incorrect Prediction'}
                </div>
            )}
        </div>
    );
}
