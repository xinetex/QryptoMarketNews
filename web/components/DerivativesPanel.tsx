'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertTriangle, Activity, RefreshCw, Minus } from 'lucide-react';

interface DerivativesSignal {
    symbol: string;
    fundingRate: number;
    fundingSignal: 'EXTREME_LONG' | 'LONG' | 'NEUTRAL' | 'SHORT' | 'EXTREME_SHORT';
    openInterest: number;
    oiChange24h: number;
    squeezePotential: 'HIGH' | 'MEDIUM' | 'LOW';
    narrative: string;
}

interface DerivativesSummary {
    totalSymbols: number;
    highSqueezeAlerts: number;
    averageFunding: number;
    marketBias: 'LONG' | 'SHORT' | 'NEUTRAL';
}

export default function DerivativesPanel() {
    const [signals, setSignals] = useState<DerivativesSignal[]>([]);
    const [summary, setSummary] = useState<DerivativesSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDerivatives = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/derivatives');
            if (!res.ok) throw new Error('API Error');
            const data = await res.json();
            setSignals(data.signals || []);
            setSummary(data.summary);
        } catch (e) {
            setError('Unable to load derivatives data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDerivatives();
        const interval = setInterval(fetchDerivatives, 60000);
        return () => clearInterval(interval);
    }, []);

    if (loading && signals.length === 0) {
        return (
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50">
                <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span className="text-sm font-medium text-zinc-300">Loading derivatives...</span>
                </div>
                <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-12 bg-zinc-800/50 rounded animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 rounded-xl border border-cyan-500/20 bg-zinc-900/80 backdrop-blur-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Activity className="w-5 h-5 text-cyan-400" />
                        {summary?.highSqueezeAlerts && summary.highSqueezeAlerts > 0 && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        )}
                    </div>
                    <h3 className="text-sm font-bold text-zinc-100">Derivatives Positioning</h3>

                    {summary?.marketBias && (
                        <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${summary.marketBias === 'LONG' ? 'bg-emerald-500/20 text-emerald-400' :
                                summary.marketBias === 'SHORT' ? 'bg-red-500/20 text-red-400' :
                                    'bg-zinc-700 text-zinc-400'
                            }`}>
                            {summary.marketBias} BIAS
                        </div>
                    )}
                </div>

                <button
                    onClick={fetchDerivatives}
                    disabled={loading}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 transition-colors"
                >
                    <RefreshCw className={`w-3 h-3 text-zinc-400 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Squeeze Alerts */}
            {summary?.highSqueezeAlerts && summary.highSqueezeAlerts > 0 && (
                <div className="mb-3 p-2 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-xs text-red-400 font-medium">
                        {summary.highSqueezeAlerts} squeeze alert{summary.highSqueezeAlerts > 1 ? 's' : ''} detected
                    </span>
                </div>
            )}

            {/* Signals Grid */}
            <div className="space-y-2">
                {signals.map((signal, idx) => (
                    <motion.div
                        key={signal.symbol}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`p-3 rounded-lg border ${signal.squeezePotential === 'HIGH'
                                ? 'border-red-500/30 bg-red-500/5'
                                : 'border-zinc-800 bg-zinc-800/30'
                            }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-zinc-100">{signal.symbol}</span>
                                <FundingBadge signal={signal.fundingSignal} />
                                {signal.squeezePotential === 'HIGH' && (
                                    <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-[9px] font-bold text-red-400 animate-pulse">
                                        SQUEEZE
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-mono">
                                <span className={signal.fundingRate >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                                    {(signal.fundingRate * 100).toFixed(3)}%
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-[10px] text-zinc-500">
                            <span>OI: ${(signal.openInterest / 1e9).toFixed(1)}B</span>
                            <span className={signal.oiChange24h >= 0 ? 'text-emerald-500' : 'text-red-500'}>
                                {signal.oiChange24h >= 0 ? '+' : ''}{signal.oiChange24h.toFixed(1)}% 24h
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {error && (
                <div className="mt-3 p-2 rounded bg-red-500/10 text-xs text-red-400 text-center">
                    {error}
                </div>
            )}
        </div>
    );
}

function FundingBadge({ signal }: { signal: DerivativesSignal['fundingSignal'] }) {
    const config = {
        'EXTREME_LONG': { icon: TrendingUp, color: 'text-red-400', bg: 'bg-red-500/20', label: 'CROWDED LONG' },
        'LONG': { icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'LONG' },
        'NEUTRAL': { icon: Minus, color: 'text-zinc-400', bg: 'bg-zinc-700', label: 'NEUTRAL' },
        'SHORT': { icon: TrendingDown, color: 'text-red-400', bg: 'bg-red-500/10', label: 'SHORT' },
        'EXTREME_SHORT': { icon: TrendingDown, color: 'text-emerald-400', bg: 'bg-emerald-500/20', label: 'CROWDED SHORT' },
    };

    const { icon: Icon, color, bg, label } = config[signal];

    return (
        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${bg}`}>
            <Icon size={10} className={color} />
            <span className={`text-[9px] font-bold ${color}`}>{label}</span>
        </div>
    );
}
