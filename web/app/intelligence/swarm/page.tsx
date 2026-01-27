"use client";

import React, { useEffect, useState } from 'react';
import { SwarmChart } from '@/components/SwarmChart';
import { SwarmSignal } from '@/lib/polymarket-analyzer';

// Example Markets (Super Bowl 2026)
const MARKETS = [
    { label: "Cardinals Win SB", id: "0xc319ae3e39f6a0b441fd02d37058ee8af4133967a205c88c9243972deceddbee" },
    { label: "Falcons Win SB", id: "0x6167c4ce9a850c0b5fa34f375a2d9cecfff94ce2c81c9f15ae962d40d0a1230b" },
];

export default function SwarmPage() {
    const [selectedMarket, setSelectedMarket] = useState(MARKETS[0].id);
    const [swarmData, setSwarmData] = useState<SwarmSignal | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/intel/swarm?conditionId=${selectedMarket}`);
            const data = await res.json();
            setSwarmData(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [selectedMarket]);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-sans">
            <header className="mb-8">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                    Swarm Intelligence
                </h1>
                <p className="text-slate-400">Real-time detection of coordinated bot activity and whale movements.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Controls */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                        <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">Target Market</label>
                        <select
                            value={selectedMarket}
                            onChange={(e) => setSelectedMarket(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            {MARKETS.map(m => (
                                <option key={m.id} value={m.id}>{m.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                        <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">Swarm Metrics</label>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Status</span>
                                <span className={swarmData?.detected ? "text-red-400 font-bold" : "text-slate-500"}>
                                    {swarmData?.detected ? "ACTIVE SWARM" : "NORMAL"}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Intensity</span>
                                <span className="capitalize text-slate-300">{swarmData?.intensity || '-'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Size</span>
                                <span className="text-slate-300">{swarmData?.swarmSize || 0} Wallets</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Dominance</span>
                                <span className="text-slate-300">{swarmData?.confidence || 0}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Visualization */}
                <div className="lg:col-span-2">
                    <SwarmChart
                        data={swarmData}
                        marketTitle={MARKETS.find(m => m.id === selectedMarket)?.label}
                    />

                    <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                        <h4 className="text-sm font-semibold text-blue-400 mb-1">Analysis</h4>
                        <p className="text-sm text-slate-300 opacity-90">
                            {swarmData?.description || "Initializing analysis stream..."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
