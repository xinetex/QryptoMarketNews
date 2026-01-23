'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, RefreshCw, AlertTriangle, Zap } from 'lucide-react';
import DislocationCard from './DislocationCard';
import type { DislocationSignal, DislocationMeta } from '@/lib/types/dislocation';

interface DislocationFeedProps {
    maxItems?: number;
    autoRefresh?: boolean;
    refreshInterval?: number; // ms
}

export default function DislocationFeed({
    maxItems = 5,
    autoRefresh = true,
    refreshInterval = 60000
}: DislocationFeedProps) {
    const [signals, setSignals] = useState<DislocationSignal[]>([]);
    const [meta, setMeta] = useState<DislocationMeta | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

    const fetchDislocations = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/dislocations');
            if (!res.ok) throw new Error(`API error: ${res.status}`);

            const data = await res.json();
            setSignals(data.signals?.slice(0, maxItems) || []);
            setMeta(data.meta);
            setLastRefresh(new Date());
        } catch (e) {
            console.error('Failed to fetch dislocations:', e);
            setError('Unable to detect market dislocations');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDislocations();

        if (autoRefresh) {
            const interval = setInterval(() => fetchDislocations(false), refreshInterval);
            return () => clearInterval(interval);
        }
    }, [maxItems, autoRefresh, refreshInterval]);

    // Loading state
    if (loading && signals.length === 0) {
        return (
            <div className="space-y-4">
                <FeedHeader loading={true} meta={null} lastRefresh={lastRefresh} onRefresh={() => { }} />
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-zinc-900/50 rounded-xl animate-pulse border border-zinc-800" />
                    ))}
                </div>
            </div>
        );
    }

    // Error state
    if (error && signals.length === 0) {
        return (
            <div className="space-y-4">
                <FeedHeader loading={false} meta={null} lastRefresh={lastRefresh} onRefresh={() => fetchDislocations()} />
                <div className="p-6 rounded-xl border border-red-500/20 bg-red-500/5 text-center">
                    <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                    <p className="text-sm text-red-400">{error}</p>
                    <button
                        onClick={() => fetchDislocations()}
                        className="mt-3 px-4 py-2 text-xs bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Empty state
    if (signals.length === 0) {
        return (
            <div className="space-y-4">
                <FeedHeader loading={loading} meta={meta} lastRefresh={lastRefresh} onRefresh={() => fetchDislocations()} />
                <div className="p-8 rounded-xl border border-zinc-800 bg-zinc-900/50 text-center">
                    <Activity className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                    <p className="text-sm text-zinc-500 mb-1">No significant dislocations detected</p>
                    <p className="text-xs text-zinc-600">Markets are currently aligned with news sentiment</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <FeedHeader
                loading={loading}
                meta={meta}
                lastRefresh={lastRefresh}
                onRefresh={() => fetchDislocations()}
            />

            <AnimatePresence mode="popLayout">
                <div className="space-y-3">
                    {signals.map((signal, idx) => (
                        <DislocationCard key={signal.id} signal={signal} index={idx} />
                    ))}
                </div>
            </AnimatePresence>
        </div>
    );
}

// Header component
function FeedHeader({
    loading,
    meta,
    lastRefresh,
    onRefresh
}: {
    loading: boolean;
    meta: DislocationMeta | null;
    lastRefresh: Date;
    onRefresh: () => void;
}) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Zap className="w-5 h-5 text-amber-400" />
                        <div className="absolute inset-0 w-5 h-5 text-amber-400 animate-ping opacity-30">
                            <Zap className="w-5 h-5" />
                        </div>
                    </div>
                    <h2 className="text-lg font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                        Market Dislocations
                    </h2>
                </div>

                {meta && meta.signalCount > 0 && (
                    <div className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30">
                        <span className="text-[10px] font-bold text-amber-400">
                            {meta.signalCount} ACTIVE
                        </span>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3">
                <span className="text-[10px] text-zinc-500 font-mono">
                    {lastRefresh.toLocaleTimeString()}
                </span>
                <button
                    onClick={onRefresh}
                    disabled={loading}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 transition-colors"
                >
                    <RefreshCw className={`w-3.5 h-3.5 text-zinc-400 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>
        </div>
    );
}
