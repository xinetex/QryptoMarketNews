'use client';

import { useState, useEffect } from 'react';
import { Activity, Zap, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';
import { generateProphecy } from '@/lib/prophecy-engine';
import { motion, AnimatePresence } from 'framer-motion';

const WATCHLIST = ['bitcoin', 'ethereum', 'solana', 'polymarket'];

export default function MarketPulseCard() {
    const [currentAssetIndex, setCurrentAssetIndex] = useState(0);
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const currentAsset = WATCHLIST[currentAssetIndex];

    useEffect(() => {
        let mounted = true;

        async function fetchPulse() {
            setLoading(true);
            try {
                // If asset is "polymarket", we might need a special handler, but for now use prophecy engine 
                // formatted for generic crypto or mapping 'polymarket' to a proxy if needed.
                // For now, let's stick to crypto assets that work with CoinGecko.
                const queryAsset = currentAsset === 'polymarket' ? 'matic-network' : currentAsset; // Polygon acts as proxy for Polymarket activity

                const prophecy = await generateProphecy(queryAsset);

                if (mounted) {
                    if (currentAsset === 'polymarket') {
                        // Custom override for Polymarket narrative
                        prophecy.narrative = prophecy.narrative.replace(queryAsset.toUpperCase(), "POLYMARKET ACTIVITY");
                        prophecy.coinId = "POLYMARKET";
                    }
                    setStatus(prophecy);
                }
            } catch (e) {
                console.error("Pulse check failed", e);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        fetchPulse();

        // Cycle every 10 seconds
        const interval = setInterval(() => {
            setCurrentAssetIndex(prev => (prev + 1) % WATCHLIST.length);
        }, 12000);

        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, [currentAsset]);

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

    return (
        <div className="h-full w-full flex flex-col relative overflow-hidden bg-zinc-950">
            {/* Background Pulse Effect */}
            <motion.div
                animate={{ opacity: [0.05, 0.15, 0.05] }}
                transition={{ duration: getHeartbeatDuration(), repeat: Infinity, ease: "easeInOut" }}
                className={`absolute inset-0 bg-gradient-to-t ${status ? getPulseColor().replace('text-', 'from-') : 'from-zinc-500'}/20 to-transparent pointer-events-none`}
            />

            <div className="p-4 flex-1 flex flex-col justify-center relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.2, repeat: Infinity, repeatDelay: getHeartbeatDuration() }}
                        >
                            <Activity size={14} className={getPulseColor()} />
                        </motion.div>
                        <strong className={`text-[10px] tracking-wider uppercase ${getPulseColor()}`}>
                            Sentinel: {currentAsset.toUpperCase()}
                        </strong>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-4 space-y-2"
                        >
                            <RefreshCw className="w-6 h-6 text-zinc-700 animate-spin" />
                            <span className="text-[9px] text-zinc-700 font-mono">SCANNING NETWORK...</span>
                        </motion.div>
                    ) : status ? (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Main Status */}
                            <div className="mb-3">
                                <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2 leading-none">
                                    {status.volatility === 'extreme' ? 'EXTREME VOLATILITY' :
                                        status.volatility === 'volatile' ? 'HIGH VOLATILITY' : 'STABLE CONDITIONS'}

                                    {status.momentum === 'moon' && <Zap size={16} className="text-yellow-400 fill-yellow-400" />}
                                </h3>
                            </div>

                            {/* Narrative Snippet */}
                            <div className="text-[10px] text-zinc-400 font-mono leading-relaxed border-l-2 border-zinc-800 pl-2 h-16 overflow-hidden relative">
                                {status.narrative.split('>> VERDICT')[0].split('>> ANALYSIS:')[1] || "Analyzing market conditions..."}
                                <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-zinc-950 to-transparent" />
                            </div>

                            {/* Verdict Badge */}
                            <div className="mt-2 flex items-center gap-2">
                                <span className="text-[9px] text-zinc-600">VERDICT:</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${status.score > 10 ? 'bg-emerald-500/20 text-emerald-400' :
                                        status.score < -10 ? 'bg-red-500/20 text-red-400' :
                                            'bg-zinc-800 text-zinc-400'
                                    }`}>
                                    {status.score > 10 ? "ACCUMULATE" : status.score < -10 ? "DISTRIBUTE" : "HOLD"}
                                </span>
                            </div>
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </div>

            {/* Simulated EKG Line at bottom */}
            <div className="absolute bottom-0 w-full h-8 overflow-hidden opacity-30 pointer-events-none">
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
                        vectorEffect="non-scaling-stroke"
                    />
                </svg>
            </div>
        </div>
    );
}
