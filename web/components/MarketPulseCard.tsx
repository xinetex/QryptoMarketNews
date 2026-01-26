'use client';

import { useState, useEffect } from 'react';
import { Activity, Zap, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { generateProphecy } from '@/lib/prophecy-engine';
import { motion, AnimatePresence } from 'framer-motion';

export default function MarketPulseCard() {
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPulse() {
            try {
                // Bitcoin as the bellwether
                const prophecy = await generateProphecy('bitcoin');
                setStatus(prophecy);
            } catch (e) {
                console.error("Pulse check failed", e);
            } finally {
                setLoading(false);
            }
        }
        fetchPulse();
    }, []);

    // Heartbeat variants based on volatility
    const getHeartbeatDuration = () => {
        if (!status) return 2;
        if (status.volatility === 'extreme') return 0.5; // Racing heart
        if (status.volatility === 'volatile') return 1; // Elevated
        return 3; // Calm
    };

    const getPulseColor = () => {
        if (!status) return 'text-zinc-500';
        if (status.momentum === 'bullish' || status.momentum === 'moon') return 'text-emerald-400';
        if (status.momentum === 'bearish' || status.momentum === 'crash') return 'text-red-400';
        return 'text-zinc-400';
    };

    if (loading) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center p-4 space-y-3">
                <Activity className="w-8 h-8 text-zinc-600 animate-pulse" />
                <span className="text-[10px] uppercase tracking-widest text-zinc-600">Acquiring Signal...</span>
            </div>
        );
    }

    if (!status) return null;

    return (
        <div className="h-full w-full flex flex-col relative overflow-hidden">
            {/* Background Pulse Effect */}
            <motion.div
                animate={{ opacity: [0.05, 0.15, 0.05] }}
                transition={{ duration: getHeartbeatDuration(), repeat: Infinity, ease: "easeInOut" }}
                className={`absolute inset-0 bg-gradient-to-t ${getPulseColor().replace('text-', 'from-')}/20 to-transparent pointer-events-none`}
            />

            <div className="p-4 flex-1 flex flex-col justify-center relative z-10">
                {/* Header */}
                <div className="flex items-center gap-2 mb-2">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.2, repeat: Infinity, repeatDelay: getHeartbeatDuration() }}
                    >
                        <Activity size={14} className={getPulseColor()} />
                    </motion.div>
                    <strong className={`text-[10px] tracking-wider uppercase ${getPulseColor()}`}>Market Pulse</strong>
                </div>

                {/* Main Status */}
                <div className="mb-2">
                    <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                        {status.volatility === 'extreme' ? 'EXTREME VOLATILITY' :
                            status.volatility === 'volatile' ? 'HIGH VOLATILITY' : 'STABLE CONDITIONS'}

                        {status.momentum === 'moon' && <Zap size={16} className="text-yellow-400 fill-yellow-400" />}
                    </h3>
                </div>

                {/* Narrative Snippet - Truncated for card */}
                <div className="text-[10px] text-zinc-400 font-mono leading-relaxed border-l-2 border-zinc-800 pl-2">
                    {status.narrative.split('>> VERDICT')[0].split('>> ANALYSIS:')[1]?.slice(0, 80) || "Analyzing market conditions..."}...
                </div>

                {/* Verdict Badge */}
                <div className="mt-3 flex items-center gap-2">
                    <span className="text-[9px] text-zinc-600">VERDICT:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${status.score > 0 ? 'bg-emerald-500/20 text-emerald-400' :
                            status.score < 0 ? 'bg-red-500/20 text-red-400' :
                                'bg-zinc-800 text-zinc-400'
                        }`}>
                        {status.score > 0 ? "ACCUMULATE" : status.score < 0 ? "DISTRIBUTE" : "HOLD"}
                    </span>
                </div>
            </div>

            {/* Simulated EKG Line at bottom */}
            <div className="absolute bottom-0 w-full h-8 overflow-hidden opacity-30">
                <svg viewBox="0 0 100 20" className="w-full h-full" preserveAspectRatio="none">
                    <motion.path
                        d="M0,10 L10,10 L15,2 L20,18 L25,10 L35,10 L40,0 L45,20 L50,10 L100,10"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        className={getPulseColor()}
                        initial={{ pathLength: 0, x: -100 }}
                        animate={{ pathLength: 1, x: 0 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                </svg>
            </div>
        </div>
    );
}
