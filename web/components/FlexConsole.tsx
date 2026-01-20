'use client';

import { useState, useEffect } from 'react';
import { Shield, TrendingUp, Zap, Activity, Globe, Lock, Unlock, Wallet as WalletIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { getPoints } from '@/lib/points';
import NeuralHandshake from './NeuralHandshake';
import { useBalance } from 'wagmi';

function ChevronRight({ size, className }: any) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6" /></svg>;
}

export default function FlexConsole({ address, signals }: { address: string, signals: any[] }) {
    const [riskScore, setRiskScore] = useState(72);
    const [scanning, setScanning] = useState(true);
    const [points, setPoints] = useState<any>(null);
    const [showHandshake, setShowHandshake] = useState(false);

    // Fetch Balance
    const { data: balance } = useBalance({ address: address as `0x${string}` });

    useEffect(() => {
        // Check Onboarding Status
        const hasOnboarded = localStorage.getItem('prophet_onboarded');
        if (!hasOnboarded) {
            setShowHandshake(true);
        }

        // Simulate "Analysis" phase
        const timer = setTimeout(() => setScanning(false), 2000);

        // Load Points
        setPoints(getPoints());

        return () => clearTimeout(timer);
    }, []);

    const handleHandshakeComplete = () => {
        localStorage.setItem('prophet_onboarded', 'true');
        setShowHandshake(false);
    };

    return (
        <div className="h-full flex flex-col bg-zinc-950/50 relative">
            {showHandshake && <NeuralHandshake onComplete={handleHandshakeComplete} />}

            {/* Header: Pro Status */}
            <div className="p-3 border-b border-white/5 flex justify-between items-center bg-zinc-900/50">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase">
                        Flex Intelligence Active
                    </span>
                </div>
                <div className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-bold text-indigo-400">
                    PRO TIER
                </div>
            </div>

            {/* Main Dashboard */}
            <div className="flex-1 p-4 relative overflow-hidden">
                {scanning && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 0 }}
                        transition={{ delay: 1.5, duration: 0.5 }}
                        className="absolute inset-0 z-20 bg-zinc-950 flex flex-col items-center justify-center gap-3"
                    >
                        <Activity className="text-indigo-400 animate-spin" size={24} />
                        <span className="text-[10px] font-mono text-indigo-400">ANALYZING WALLET VECTORS...</span>
                    </motion.div>
                )}

                {/* Portfolio Value Card (NEW) */}
                <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-zinc-900 to-black border border-white/5 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-20">
                        <WalletIcon size={48} className="text-white transform rotate-12 translate-x-2 -translate-y-2" />
                    </div>
                    <div className="relative z-10">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Total Balance</span>
                        <div className="text-2xl font-black text-white tracking-tight flex items-baseline gap-1">
                            {balance ? parseFloat(balance.formatted).toFixed(4) : '0.0000'}
                            <span className="text-sm font-bold text-zinc-500">{balance?.symbol || 'ETH'}</span>
                        </div>
                        <div className="flex gap-2 mt-3">
                            <a
                                href="https://keys.coinbase.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded text-[10px] font-bold text-zinc-300 text-center transition-colors"
                            >
                                Send / Receive
                            </a>
                            <button className="flex-1 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded text-[10px] font-bold text-indigo-400 transition-colors">
                                Add Funds
                            </button>
                        </div>
                    </div>
                </div>

                {/* Risk Radar */}
                <div className="mb-6 relative">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase">Exposure Risk</span>
                        <span className={`text-xl font-black ${riskScore > 70 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                            {riskScore}/100
                        </span>
                    </div>
                    {/* Visual Meter */}
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden flex">
                        <div className="h-full bg-red-500/50 w-[20%]" />
                        <div className="h-full bg-yellow-500/50 w-[30%]" />
                        <div className="h-full bg-emerald-500/50 w-[50%]" />
                        {/* Indicator */}
                        <motion.div
                            className="absolute top-6 bottom-0 w-1 bg-white h-3 mt-[-4px] shadow-[0_0_10px_white]"
                            initial={{ left: '0%' }}
                            animate={{ left: `${riskScore}%` }}
                            transition={{ delay: 2, duration: 1, type: "spring" }}
                        />
                    </div>
                    <p className="mt-2 text-[10px] text-zinc-400 leading-tight">
                        Your portfolio shows <span className="text-white font-bold">Resilient</span> structure against current volatility vectors.
                    </p>
                </div>

                {/* Alpha Signals */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap size={12} className="text-yellow-400" />
                        <span className="text-[10px] font-bold text-zinc-300 uppercase">Active Alpha Signals</span>
                    </div>

                    {signals.slice(0, 3).map((s, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-2">
                                <Shield size={10} className="text-zinc-600 group-hover:text-indigo-400" />
                                <span className="text-xs font-bold text-zinc-300">{s.symbol}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-zinc-500">Vol: {s.volatility}%</span>
                                <ChevronRight size={10} className="text-zinc-600" />
                            </div>
                        </div>
                    ))}

                    <div className="flex items-center justify-between p-2 rounded bg-indigo-500/10 border border-indigo-500/20 mt-2">
                        <div className="flex items-center gap-2">
                            <Lock size={10} className="text-indigo-400" />
                            <span className="text-[10px] font-bold text-indigo-300">Whale Accumulation (BTC)</span>
                        </div>
                        <button className="px-2 py-0.5 bg-indigo-500 text-[9px] font-bold text-white rounded hover:bg-indigo-400 transition-colors">
                            UNLOCK
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer Status */}
            <div className="p-2 border-t border-white/5 bg-black/40 text-[9px] font-mono text-zinc-600 flex justify-between">
                <span>SENTINEL: ONLINE</span>
                <span className="text-indigo-400">REP: {points?.totalPoints?.toLocaleString() || '...'}</span>
            </div>
        </div>
    );
}
