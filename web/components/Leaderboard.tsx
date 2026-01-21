'use client';

import { useState, useEffect } from 'react';
import { Trophy, Target, TrendingUp, Medal } from 'lucide-react';
import { getLeaderboard, type TierName } from '@/lib/points';
import { usePoints } from '@/hooks/usePoints';

// No longer needed as we get color from API, but keeping fallback or we can remove
const TIER_COLORS: Record<TierName, string> = {
    'Initiate': '#71717a',
    'Seer': '#CD7F32',
    'Augur': '#C0C0C0',
    'Oracle': '#FFD700',
    'Prophet': '#8B5CF6',
    'Arch-Prophet': '#EC4899',
};

export default function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const { totalPoints } = usePoints();

    useEffect(() => {
        getLeaderboard().then(setLeaderboard);
    }, []);

    // Find user's rank (mock - would be from API)
    const userRank = leaderboard.findIndex(u => u.points < totalPoints) + 1 || leaderboard.length + 1;

    return (
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Trophy className="text-yellow-400" size={20} />
                        <h2 className="text-lg font-bold text-white">Prophet Leaderboard</h2>
                    </div>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 text-xs bg-white/10 rounded-full text-white">
                            All Time
                        </button>
                        <button className="px-3 py-1 text-xs text-zinc-400 hover:text-white transition">
                            Weekly
                        </button>
                    </div>
                </div>
            </div>

            {/* Your Rank Banner */}
            <div className="px-4 py-3 bg-indigo-500/10 border-b border-white/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                            #{userRank}
                        </div>
                        <div>
                            <p className="text-sm text-white font-medium">Your Rank</p>
                            <p className="text-xs text-zinc-400">{totalPoints.toLocaleString()} points</p>
                        </div>
                    </div>
                    <TrendingUp size={16} className="text-emerald-400" />
                </div>
            </div>

            {/* Leaderboard List */}
            <div className="divide-y divide-white/5">
                {leaderboard.map((user, index) => (
                    <div
                        key={user.rank}
                        className={`px-4 py-3 flex items-center gap-4 hover:bg-white/5 transition ${index < 3 ? 'bg-white/[0.02]' : ''
                            }`}
                    >
                        {/* Rank */}
                        <div className="w-8 text-center">
                            {index === 0 ? (
                                <Medal className="w-6 h-6 text-yellow-400 mx-auto" />
                            ) : index === 1 ? (
                                <Medal className="w-6 h-6 text-zinc-300 mx-auto" />
                            ) : index === 2 ? (
                                <Medal className="w-6 h-6 text-amber-600 mx-auto" />
                            ) : (
                                <span className="text-sm text-zinc-500 font-mono">#{user.rank}</span>
                            )}
                        </div>

                        {/* Level Badge */}
                        <div
                            className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold"
                            style={{ backgroundColor: user.tierColor || TIER_COLORS[user.tier as TierName], color: '#000' }}
                        >
                            {user.tier[0]}
                        </div>

                        {/* Username */}
                        <div className="flex-1">
                            <p className="text-sm text-white font-medium">{user.displayName}</p>
                            <p className="text-xs text-zinc-500">{user.tier} Prophet</p>
                        </div>

                        {/* Stats */}
                        <div className="text-right">
                            <p className="text-sm text-white font-mono font-medium">
                                {user.points.toLocaleString()}
                            </p>
                            <div className="flex items-center justify-end gap-1 text-xs text-emerald-400">
                                <Target size={10} />
                                <span>{user.prophetRating}%</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 text-center">
                <p className="text-xs text-zinc-500">
                    Make predictions to climb the leaderboard
                </p>
            </div>
        </div>
    );
}
