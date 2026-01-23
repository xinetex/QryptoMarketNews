'use client';

import { useState } from 'react';
import { usePoints } from '@/hooks/usePoints';
import { TIERS, POINT_VALUES, BADGES, TierName } from '@/lib/points';
import { Trophy, Star, Zap, Shield, Award, Lock, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PointsSystemInfo() {
    const { totalPoints, level, levelColor, nextLevelInfo, isLoading } = usePoints();
    const [activeTab, setActiveTab] = useState<'status' | 'rules' | 'badges'>('status');

    if (isLoading) {
        return <div className="p-4 text-center text-zinc-500 animate-pulse">Loading Oracle Data...</div>;
    }

    return (
        <div className="flex flex-col h-full bg-zinc-950/50">
            {/* Sub-tabs for points info */}
            <div className="flex border-b border-white/5 bg-black/20">
                <button
                    onClick={() => setActiveTab('status')}
                    className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'status' ? 'text-white bg-white/5' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                >
                    Status
                </button>
                <button
                    onClick={() => setActiveTab('rules')}
                    className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'rules' ? 'text-white bg-white/5' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                >
                    Rules
                </button>
                <button
                    onClick={() => setActiveTab('badges')}
                    className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'badges' ? 'text-white bg-white/5' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                >
                    Badges
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                <AnimatePresence mode="wait">
                    {activeTab === 'status' && (
                        <motion.div
                            key="status"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                        >
                            {/* Current Tier Card */}
                            <div className="text-center space-y-2">
                                <div
                                    className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl shadow-lg border-2 border-white/10"
                                    style={{ backgroundColor: `${levelColor}20`, borderColor: levelColor }}
                                >
                                    {TIERS.find(t => t.name === level)?.icon || '🌑'}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white text-shadow-glow" style={{ textShadow: `0 0 10px ${levelColor}40` }}>
                                        {level}
                                    </h3>
                                    <p className="text-xs text-zinc-400 font-mono">
                                        {totalPoints.toLocaleString()} PTS
                                    </p>
                                </div>
                            </div>

                            {/* Progress */}
                            {nextLevelInfo.nextTier && (
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-[10px] uppercase font-bold text-zinc-500">
                                        <span>Current</span>
                                        <span>Next: {nextLevelInfo.nextTier}</span>
                                    </div>
                                    <div className="h-2 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                                        <div
                                            className="h-full rounded-full transition-all duration-1000 ease-out"
                                            style={{
                                                width: `${nextLevelInfo.progress}%`,
                                                backgroundColor: levelColor,
                                                boxShadow: `0 0 10px ${levelColor}80`
                                            }}
                                        />
                                    </div>
                                    <div className="text-right text-[10px] text-zinc-600">
                                        {nextLevelInfo.pointsNeeded.toLocaleString()} pts to ascend
                                    </div>
                                </div>
                            )}

                            {/* Tiers List */}
                            <div className="space-y-2 pt-2">
                                <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3">Hierarchy</h4>
                                {TIERS.map((tier) => {
                                    const isCurrent = tier.name === level;
                                    const isPast = totalPoints >= tier.minPoints;

                                    return (
                                        <div
                                            key={tier.name}
                                            className={`flex items-center gap-3 p-2 rounded border ${isCurrent
                                                ? 'bg-white/5 border-white/20'
                                                : 'border-transparent opacity-60'
                                                }`}
                                        >
                                            <div className="w-6 h-6 flex items-center justify-center text-sm">
                                                {tier.icon}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center">
                                                    <span className={`text-xs font-bold ${isCurrent ? 'text-white' : 'text-zinc-400'}`}>
                                                        {tier.name}
                                                    </span>
                                                    <span className="text-[10px] font-mono text-zinc-600">
                                                        {tier.minPoints > 0 ? `${(tier.minPoints / 1000).toFixed(0)}k` : '0'}
                                                    </span>
                                                </div>
                                            </div>
                                            {isCurrent && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />}
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'rules' && (
                        <motion.div
                            key="rules"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                        >
                            <div className="space-y-4">
                                <div>
                                    <h4 className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">
                                        <Zap size={12} /> Prediction Game
                                    </h4>
                                    <p className="text-[10px] text-zinc-500 mb-3 leading-relaxed">
                                        Spot dislocations in the market. Click <strong>"CALL IT"</strong> to stake your reputation.
                                        Earn massive points for high-confidence calls that pay off.
                                    </p>
                                    <div className="space-y-1">
                                        <RuleRow label="Make a Prediction" points={POINT_VALUES.PREDICTION_MADE} />
                                        <RuleRow label="Correct Call" points={POINT_VALUES.PREDICTION_CORRECT} highlight />
                                        <RuleRow label="Contrarian Win (vs Crowd)" points={POINT_VALUES.PREDICTION_AGAINST_CROWD_WIN} highlight />
                                        <RuleRow label="3x Win Streak" points={POINT_VALUES.PREDICTION_STREAK_BONUS} />
                                    </div>
                                </div>

                                <div>
                                    <h4 className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">
                                        <Star size={12} /> Engagement
                                    </h4>
                                    <div className="space-y-1">
                                        <RuleRow label="Read Daily Briefing" points={50} highlight />
                                        <RuleRow label="Daily Login" points={POINT_VALUES.DAILY_LOGIN} />
                                        <RuleRow label="7-Day Streak" points={POINT_VALUES.STREAK_WEEK_BONUS} />
                                        <RuleRow label="Watch / min" points={POINT_VALUES.WATCH_MINUTE} />
                                        <RuleRow label="Social Share" points={POINT_VALUES.SHARE_SOCIAL} />
                                    </div>
                                </div>

                                <div>
                                    <h4 className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                                        <Trophy size={12} /> Bonuses
                                    </h4>
                                    <div className="space-y-1">
                                        <RuleRow label="Roku Install" points={POINT_VALUES.ROKU_INSTALL} highlight />
                                        <RuleRow label="Referral" points={POINT_VALUES.REFERRAL_SIGNUP} />
                                        <RuleRow label="Perfect Week" points={POINT_VALUES.PREDICTION_PERFECT_WEEK} highlight />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'badges' && (
                        <motion.div
                            key="badges"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="grid grid-cols-2 gap-2">
                                {Object.values(BADGES).map((badge) => (
                                    <div
                                        key={badge.id}
                                        className="bg-white/5 border border-white/5 rounded-lg p-3 flex flex-col items-center text-center gap-2 hover:bg-white/10 transition-colors group"
                                    >
                                        <div className="text-2xl group-hover:scale-110 transition-transform duration-300">
                                            {badge.icon}
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-zinc-200 leading-tight mb-0.5">
                                                {badge.name}
                                            </div>
                                            <div className="text-[9px] text-zinc-500 leading-tight">
                                                {badge.description}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function RuleRow({ label, points, highlight = false }: { label: string; points: number; highlight?: boolean }) {
    return (
        <div className={`flex justify-between items-center text-xs p-1.5 rounded ${highlight ? 'bg-white/5' : ''}`}>
            <span className="text-zinc-400">{label}</span>
            <span className={`font-mono font-medium ${highlight ? 'text-emerald-400' : 'text-zinc-500'}`}>
                +{points}
            </span>
        </div>
    );
}
