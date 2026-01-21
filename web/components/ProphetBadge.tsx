'use client';

import { useState, useEffect } from 'react';
import { Trophy, Zap, ChevronRight, Star } from 'lucide-react';
import { getProfile, getProgressToNextTier, OracleProfile } from '@/lib/points';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProphetBadge() {
    const [points, setPoints] = useState<OracleProfile | null>(null);
    const [nextLevel, setNextLevel] = useState<any>(null);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        // Hydrate points
        const p = getProfile();
        setPoints(p);
        setNextLevel(getProgressToNextTier(p.totalPoints));

        // Poll for updates (e.g. while watching TV)
        const interval = setInterval(() => {
            const up = getProfile();
            setPoints(up);
            setNextLevel(getProgressToNextTier(up.totalPoints));
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    if (!points || !nextLevel) return null;

    // Level Color Logic
    const getLevelColor = (level: string) => {
        switch (level) {
            case 'Initiate': return 'text-zinc-500 bg-zinc-500/20 border-zinc-500/30';
            case 'Seer': return 'text-orange-400 bg-orange-400/20 border-orange-400/30';
            case 'Augur': return 'text-zinc-300 bg-zinc-300/20 border-zinc-300/30';
            case 'Oracle': return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
            case 'Prophet': return 'text-purple-400 bg-purple-400/20 border-purple-400/30';
            case 'Arch-Prophet': return 'text-pink-500 bg-pink-500/20 border-pink-500/30';
            default: return 'text-zinc-400';
        }
    };

    const colorClass = getLevelColor(points.tier);

    return (
        <motion.div
            className="relative z-50 group"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
        >
            {/* The Island (Collapsed) */}
            <motion.div
                layout
                className={`h-10 lg:h-12 bg-black/80 backdrop-blur-xl border border-white/10 rounded-full flex items-center cursor-pointer transition-all duration-300 ${isHovered ? 'w-[320px] rounded-2xl' : 'w-auto'}`}
                style={{ borderRadius: isHovered ? 20 : 999 }}
            >
                {/* Visible Always: Badge & Count */}
                <div className="flex items-center px-2 lg:px-3 h-full gap-3 w-full">
                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${colorClass.split(' ')[2]} ${colorClass.split(' ')[1]}`}>
                        <Trophy size={14} className={colorClass.split(' ')[0]} />
                    </div>

                    {/* Text (Collapsed) */}
                    <motion.div layout="position" className="flex flex-col flex-1">
                        <span className={`text-[10px] lg:text-xs font-bold uppercase tracking-wider ${colorClass.split(' ')[0]}`}>
                            {points.tier} Prophet
                        </span>
                        {!isHovered && (
                            <span className="text-white font-mono text-xs leading-none">
                                {points.totalPoints.toLocaleString()} PTS
                            </span>
                        )}
                    </motion.div>

                    {/* Progress Ring (Mini) */}
                    {!isHovered && (
                        <div className="relative w-8 h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                                className={`absolute top-0 left-0 h-full ${colorClass.split(' ')[0].replace('text-', 'bg-')}`}
                                style={{ width: `${nextLevel.progress}%` }}
                            />
                        </div>
                    )}
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute top-12 left-0 w-full p-4 bg-black/90 border border-white/10 rounded-2xl backdrop-blur-xl shadow-2xl overflow-hidden"
                        >
                            {/* Header */}
                            <div className="flex justify-between items-end mb-3">
                                <span className="text-2xl font-black text-white">{points.totalPoints.toLocaleString()}</span>
                                <span className="text-xs text-zinc-500 font-mono">PTS</span>
                            </div>

                            {/* Progress Bar logic */}
                            <div className="mb-4">
                                <div className="flex justify-between text-[10px] text-zinc-400 mb-1 uppercase tracking-wider">
                                    <span>Next: {nextLevel.nextTier}</span>
                                    <span>{nextLevel.pointsNeeded} pts to go</span>
                                </div>
                                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${colorClass.split(' ')[0].replace('text-', 'bg-')} transition-all duration-1000`}
                                        style={{ width: `${nextLevel.progress}%` }}
                                    />
                                </div>
                            </div>

                            {/* Metrics Grid */}
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                <div className="p-2 bg-zinc-900/50 rounded-lg text-center border border-white/5">
                                    <span className="block text-[10px] text-zinc-500 uppercase">Accuracy</span>
                                    <span className="text-emerald-400 font-bold">{points.prophetRating}%</span>
                                </div>
                                <div className="p-2 bg-zinc-900/50 rounded-lg text-center border border-white/5">
                                    <span className="block text-[10px] text-zinc-500 uppercase">Streak</span>
                                    <span className="text-orange-400 font-bold flex items-center justify-center gap-1">
                                        <Zap size={10} fill="currentColor" /> {points.currentStreak}d
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px] text-zinc-500 py-1 border-b border-white/5">
                                    <span>Make Prediction</span>
                                    <span className="text-emerald-400">+10</span>
                                </div>
                                <div className="flex justify-between text-[10px] text-zinc-500 py-1 border-b border-white/5">
                                    <span>Correct Call</span>
                                    <span className="text-emerald-400">+50</span>
                                </div>
                                <div className="flex justify-between text-[10px] text-zinc-500 py-1">
                                    <span>Watch Prophet TV</span>
                                    <span className="text-emerald-400">+1/min</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
}
