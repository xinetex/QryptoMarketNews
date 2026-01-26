'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ExternalLink, Clock, Zap, Target } from 'lucide-react';
import type { DislocationSignal } from '@/lib/types/dislocation';
import { useState } from 'react';
import CallSubmissionModal from './CallSubmissionModal';

interface DislocationCardProps {
    signal: DislocationSignal;
    index?: number;
}


export default function DislocationCard({ signal, index = 0 }: DislocationCardProps) {
    const [isCallModalOpen, setIsCallModalOpen] = useState(false);
    const isBullish = signal.direction === 'BULLISH_GAP';

    // Color coding based on score
    const scoreColor = signal.score >= 60
        ? 'from-emerald-500 to-green-400'
        : signal.score >= 40
            ? 'from-amber-500 to-yellow-400'
            : 'from-blue-500 to-cyan-400';

    const directionColor = isBullish ? 'text-emerald-400' : 'text-red-400';
    const directionBg = isBullish ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            className="relative overflow-hidden rounded-xl border border-white/10 bg-zinc-900/80 backdrop-blur-sm hover:border-white/20 transition-all group"
        >
            {/* Glow effect */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br ${scoreColor} blur-3xl scale-150`} />

            <div className="relative p-4 space-y-3">
                {/* Header: Score + Direction */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {/* Score Badge */}
                        <div className={`px-2 py-1 rounded-md bg-gradient-to-r ${scoreColor} text-black text-xs font-bold`}>
                            {signal.score}
                        </div>

                        {/* Direction Badge */}
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-md border ${directionBg}`}>
                            {isBullish ? <TrendingUp size={12} className={directionColor} /> : <TrendingDown size={12} className={directionColor} />}
                            <span className={`text-[10px] font-bold ${directionColor}`}>
                                {isBullish ? 'BULLISH' : 'BEARISH'} GAP
                            </span>
                        </div>

                        {/* Conviction */}
                        {signal.conviction === 'HIGH' && (
                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-500/20 border border-purple-500/30">
                                <Zap size={10} className="text-purple-400" />
                                <span className="text-[9px] font-bold text-purple-400">HIGH</span>
                            </div>
                        )}

                        {/* Trend Alignment */}
                        {signal.trend && (
                            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${(isBullish && signal.trend.direction === 'BEARISH') || (!isBullish && signal.trend.direction === 'BULLISH')
                                    ? 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                                    : 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400'
                                }`}>
                                <Target size={10} />
                                <span className="text-[9px] font-bold">
                                    {(isBullish && signal.trend.direction === 'BEARISH') || (!isBullish && signal.trend.direction === 'BULLISH')
                                        ? 'TREND DEFYING'
                                        : 'TREND ALIGNED'
                                    }
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Freshness */}
                    <div className="flex items-center gap-1 text-zinc-500 text-[10px]">
                        <Clock size={10} />
                        {signal.newsItem.publishedAt}
                    </div>
                </div>

                {/* News Title */}
                <a
                    href={signal.newsItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm font-medium text-zinc-100 hover:text-white line-clamp-2 leading-snug"
                >
                    {signal.newsItem.title}
                </a>

                {/* Source */}
                <div className="text-[10px] text-zinc-500 font-mono">
                    via {signal.newsItem.source}
                </div>

                {/* Market Info */}
                <div className="p-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                        <span className="text-xs text-zinc-300 line-clamp-2 flex-1">{signal.market.title}</span>
                        <a
                            href={`https://polymarket.com/event/${signal.market.eventSlug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 shrink-0"
                        >
                            <ExternalLink size={10} />
                            Trade
                        </a>
                    </div>

                    <div className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-3">
                            <span className="text-emerald-400">YES: {Math.round(signal.market.yesPrice * 100)}¢</span>
                            <span className="text-red-400">NO: {Math.round(signal.market.noPrice * 100)}¢</span>
                        </div>
                        <span className="text-zinc-500">
                            ${(signal.market.volume / 1000000).toFixed(1)}M vol
                        </span>
                    </div>
                </div>

                {/* Narrative */}
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                    {signal.narrative}
                </p>

                {/* Actionable Window */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-500">Actionable window:</span>
                        <span className="text-[10px] font-mono text-amber-400">{signal.actionableWindow}</span>
                    </div>

                    <button
                        onClick={() => setIsCallModalOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1 bg-zinc-100 hover:bg-white text-zinc-900 rounded-md text-[10px] font-bold transition-colors shadow-lg shadow-white/5"
                    >
                        <Target size={12} />
                        CALL IT
                    </button>
                </div>
            </div>

            <CallSubmissionModal
                isOpen={isCallModalOpen}
                onClose={() => setIsCallModalOpen(false)}
                signal={signal}
            />
        </motion.div>
    );
}
