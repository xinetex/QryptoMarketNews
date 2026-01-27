'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Activity, Waves } from 'lucide-react';
import type { WhaleAlert } from '@/lib/whale-engine/types';

export default function WhaleFeed() {
    const [alerts, setAlerts] = useState<WhaleAlert[]>([]);
    const [loading, setLoading] = useState(true);

    async function fetchAlerts() {
        try {
            const res = await fetch('/api/whale-alerts');
            const data = await res.json();
            if (data.alerts) {
                setAlerts(data.alerts);
            }
        } catch (e) {
            console.error("Whale sonar failed", e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchAlerts();
        const interval = setInterval(fetchAlerts, 30000); // 30s poll
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Waves className="text-indigo-400" size={20} />
                    <h3 className="text-zinc-100 font-bold tracking-wider">DEEP SOUNDER</h3>
                </div>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">LIVE SONAR</span>
                </div>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
                <AnimatePresence>
                    {alerts.map((alert) => (
                        <motion.div
                            key={alert.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-3 relative overflow-hidden group hover:border-indigo-500/30 transition-colors"
                        >
                            {/* Alert Type Indicator */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${alert.type.includes('INFLOW') ? 'bg-red-500' :
                                    alert.type.includes('OUTFLOW') ? 'bg-emerald-500' : 'bg-indigo-500'
                                }`} />

                            <div className="flex justify-between items-start pl-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-zinc-200">{alert.transaction.symbol}</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${alert.type.includes('INFLOW') ? 'bg-red-500/10 text-red-400' :
                                                alert.type.includes('OUTFLOW') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'
                                            }`}>
                                            {alert.type.replace('_EXCHANGE', '')}
                                        </span>
                                    </div>
                                    <p className="text-xs text-zinc-400 mt-1 font-mono leading-relaxed">
                                        {alert.narrative}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-zinc-300">
                                        ${(alert.transaction.amountUsd / 1000000).toFixed(1)}M
                                    </div>
                                    <div className="text-[10px] text-zinc-600 mt-1">
                                        {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {alerts.length === 0 && !loading && (
                    <div className="text-center py-8 text-zinc-600 font-mono text-xs">
                        NO ANOMALIES DETECTED IN SECTOR
                    </div>
                )}
            </div>
        </div>
    );
}
