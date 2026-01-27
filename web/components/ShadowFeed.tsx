'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Eye, TrendingUp, TrendingDown, Crown } from 'lucide-react';
import { detectWhaleShadow, ShadowSignal } from '@/lib/whale-detector';

export default function ShadowFeed() {
    const [signals, setSignals] = useState<ShadowSignal[]>([]);
    const [loading, setLoading] = useState(true);
    const [unlocked, setUnlocked] = useState(false); // Mock unlocking state

    useEffect(() => {
        async function fetchShadows() {
            setLoading(true);
            try {
                // In a real app, this would be an API call to a protected route
                // For MVP, we call the library function directly (client-side simulation)
                // or better, wrap it in an API route. 
                // Let's assume we fetch from our new API (we'll make it next).
                const res = await fetch('/api/shadow');
                const data = await res.json();
                setSignals(data.signals || []);
            } catch (e) {
                console.error("Shadow fetch failed", e);
            } finally {
                setLoading(false);
            }
        }
        if (unlocked) {
            fetchShadows();
        } else {
            setLoading(false);
        }
    }, [unlocked]);

    if (!unlocked) {
        return (
            <div className="w-full h-96 relative rounded-2xl overflow-hidden border border-amber-500/30 bg-black group cursor-pointer transition-all duration-500 hover:border-amber-400/50 hover:shadow-[0_0_50px_rgba(245,158,11,0.2)]">
                {/* Blurred Background Content */}
                <div className="absolute inset-0 opacity-20 blur-sm flex flex-col gap-4 p-6 pointer-events-none">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 rounded-xl bg-zinc-800 border border-zinc-700" />
                    ))}
                </div>

                {/* Lock Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-black via-black/80 to-transparent p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center mb-6 shadow-2xl animate-pulse">
                        <Lock size={32} className="text-black" />
                    </div>

                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 mb-2">
                        THE WHALE SHADOW
                    </h2>

                    <p className="text-zinc-400 text-sm max-w-sm mb-8 font-mono">
                        Access the hidden layer where Smart Money trades against Public Sentiment.
                        <br />
                        <span className="text-amber-500 font-bold">Average APY: +412%</span>
                    </p>

                    <button
                        onClick={() => setUnlocked(true)}
                        className="px-8 py-3 rounded-full bg-amber-500 text-black font-bold uppercase tracking-widest hover:bg-amber-400 hover:scale-105 transition-all shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center gap-2"
                    >
                        <Crown size={18} />
                        Reveal Alpha
                    </button>

                    <div className="mt-4 text-[10px] text-zinc-600 font-mono">
                        *Simulated Unlock for Demo
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30">
                        <Crown size={20} className="text-amber-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-zinc-100">Whale Shadow Feed</h2>
                        <p className="text-xs text-amber-500/80 font-mono tracking-wider">INSTITUTIONAL DIVERGENCE DETECTED</p>
                    </div>
                </div>
                <button
                    onClick={() => setUnlocked(false)}
                    className="p-2 rounded-lg bg-zinc-900 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                    <Lock size={16} />
                </button>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="animate-pulse space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-zinc-900 rounded-xl border border-zinc-800" />)}
                    </div>
                ) : signals.length === 0 ? (
                    <div className="p-12 text-center border border-zinc-800 rounded-xl bg-zinc-900/50">
                        <Eye className="mx-auto w-12 h-12 text-zinc-700 mb-4" />
                        <h3 className="text-zinc-500 font-mono">No Shadow Anomalies Detected</h3>
                        <p className="text-xs text-zinc-600 mt-2">Whales and Crowd are currently aligned.</p>
                    </div>
                ) : (
                    signals.map((signal, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="relative overflow-hidden rounded-xl border border-amber-500/20 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black p-6 group hover:border-amber-500/40 transition-colors"
                        >
                            {/* Glow Effect */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full pointer-events-none group-hover:bg-amber-500/10 transition-colors" />

                            <div className="flex items-start justify-between mb-4 relative z-10">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-2xl font-black text-white">{signal.asset}</h3>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${signal.type === 'SHADOW_LONG'
                                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                                : 'bg-red-500/20 text-red-400 border-red-500/30'
                                            }`}>
                                            {signal.type.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
                                        <span>Gap Score:</span>
                                        <div className="flex gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <div key={i} className={`w-1.5 h-3 rounded-sm ${i < (signal.shadowGap / 20) ? 'bg-amber-500' : 'bg-zinc-800'
                                                    }`} />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Confidence</div>
                                    <div className="text-xl font-bold text-amber-500">
                                        {signal.confidence}%
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4 text-xs relative z-10">
                                <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                                    <div className="text-[10px] text-zinc-500 uppercase mb-1">Whale Action</div>
                                    <div className="text-zinc-200 font-medium">{signal.whaleAction}</div>
                                </div>
                                <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                                    <div className="text-[10px] text-zinc-500 uppercase mb-1">Crowd Consensus</div>
                                    <div className="text-zinc-200 font-medium">{signal.marketConsensus}</div>
                                </div>
                            </div>

                            <div className="text-xs text-zinc-400 italic border-l-2 border-amber-500/50 pl-3 relative z-10">
                                "{signal.narrative}"
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
