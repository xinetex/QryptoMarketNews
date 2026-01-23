'use client';

import { useState, useEffect } from 'react';
import { Trophy, Medal, TrendingUp, Users } from 'lucide-react';
import type { LeaderboardEntry } from '@/lib/types/calls';

export default function LeaderboardWidget() {
    const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/calls?type=leaderboard')
            .then(res => res.json())
            .then(data => {
                if (data.leaderboard) setLeaders(data.leaderboard.slice(0, 5));
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <LeaderboardSkeleton />;

    return (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 overflow-hidden">
            <div className="p-4 border-b border-zinc-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <h3 className="font-bold text-sm text-zinc-200">Top Signal Callers</h3>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">ALL TIME</span>
            </div>

            <div className="divide-y divide-zinc-900">
                {leaders.length === 0 ? (
                    <div className="p-8 text-center text-xs text-zinc-500">
                        No signals yet. Be the first to call it.
                    </div>
                ) : (
                    leaders.map((user, idx) => (
                        <div key={user.userId} className="p-3 flex items-center justify-between hover:bg-zinc-900/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <RankBadge rank={idx + 1} />
                                <div>
                                    <div className="font-medium text-xs text-zinc-200">{user.username}</div>
                                    <div className="text-[10px] text-zinc-500 flex items-center gap-2">
                                        <span>{user.totalCalls} calls</span>
                                        {user.currentStreak > 2 && (
                                            <span className="text-orange-400 font-mono">🔥 {user.currentStreak} streak</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="font-bold text-sm text-emerald-400 font-mono">
                                    {(user.accuracyRate * 100).toFixed(1)}%
                                </div>
                                <div className="text-[9px] text-zinc-600">ACCURACY</div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-2 bg-zinc-900/30 text-center">
                <button className="text-[10px] text-zinc-500 hover:text-indigo-400 transition-colors font-mono uppercase tracking-wider">
                    View Full Rankings
                </button>
            </div>
        </div>
    );
}

function RankBadge({ rank }: { rank: number }) {
    if (rank === 1) return <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-xs">1</div>;
    if (rank === 2) return <div className="w-6 h-6 rounded-full bg-zinc-400/20 text-zinc-400 flex items-center justify-center font-bold text-xs">2</div>;
    if (rank === 3) return <div className="w-6 h-6 rounded-full bg-orange-700/20 text-orange-700 flex items-center justify-center font-bold text-xs">3</div>;

    return <div className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-500 flex items-center justify-center font-mono text-[10px]">{rank}</div>;
}

function LeaderboardSkeleton() {
    return (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4 space-y-4">
            <div className="h-5 w-32 bg-zinc-900 rounded animate-pulse" />
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex justify-between items-center">
                    <div className="flex gap-2">
                        <div className="w-6 h-6 rounded-full bg-zinc-900 animate-pulse" />
                        <div className="w-24 h-6 bg-zinc-900 rounded animate-pulse" />
                    </div>
                    <div className="w-12 h-6 bg-zinc-900 rounded animate-pulse" />
                </div>
            ))}
        </div>
    );
}
