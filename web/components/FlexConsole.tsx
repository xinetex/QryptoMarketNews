'use client';

import { useState, useEffect } from 'react';
import { Shield, TrendingUp, Zap, Activity, Globe, Lock, Unlock, Wallet as WalletIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { getPoints } from '@/lib/points';
import NeuralHandshake from './NeuralHandshake';
import RSVPDeck from './RSVPDeck';
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

    // Define Cards for RSVP Deck
    const BalanceCard = (
        <div className="h-full flex flex-col p-5 relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <WalletIcon size={80} className="text-white transform rotate-12 translate-x-4 -translate-y-4" />
            </div>
            <div className="flex-1 flex flex-col justify-center relative z-10">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-2">Total Balance</span>
                <div className="text-3xl font-black text-white tracking-tight flex items-baseline gap-2">
                    {balance ? parseFloat(balance.formatted).toFixed(4) : '0.0000'}
                    <span className="text-sm font-bold text-zinc-500">{balance?.symbol || 'ETH'}</span>
                </div>
                <div className="h-px w-12 bg-indigo-500/50 my-4" />
                <p className="text-[10px] text-zinc-400 leading-relaxed max-w-[200px]">
                    Your liquidity is ready for deployment.
                </p>
            </div>
            <div className="flex gap-2 mt-auto relative z-10">
                <a
                    href="https://keys.coinbase.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[10px] font-bold text-zinc-300 text-center transition-colors shadow-lg"
                >
                    Manage
                </a>
                <button className="flex-1 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-lg text-[10px] font-bold text-indigo-400 text-center transition-colors shadow-lg shadow-indigo-500/10">
                    Add Funds
                </button>
            </div>
        </div>
    );

    const RiskCard = (
        <div className="h-full flex flex-col p-5">
            <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] text-zinc-500 font-bold uppercase flex items-center gap-2">
                    <Activity size={12} /> Exposure Risk
                </span>
                <span className={`text-2xl font-black ${riskScore > 70 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                    {riskScore}
                </span>
            </div>

            <div className="flex-1 flex items-center justify-center">
                {/* Big Gauge Visual */}
                <div className="relative w-40 h-20 overflow-hidden">
                    <div className="absolute inset-0 bg-zinc-800 rounded-t-full" />
                    <div className="absolute inset-2 bg-zinc-900 rounded-t-full z-10" />
                    {/* Zones */}
                    <div className="absolute bottom-0 left-0 w-full h-[200%] rounded-full border-[10px] border-emerald-500/20 clip-path-gauge" />

                    {/* Needle */}
                    <motion.div
                        className="absolute bottom-0 left-1/2 w-1 h-full bg-white origin-bottom z-20"
                        initial={{ rotate: -90 }}
                        animate={{ rotate: (riskScore / 100) * 180 - 90 }}
                        transition={{ delay: 0.5, type: 'spring' }}
                    />
                </div>
            </div>

            <p className="mt-4 text-[10px] text-zinc-400 text-center leading-relaxed bg-white/5 p-2 rounded border border-white/5">
                <strong className="text-white block mb-1">Status: Resilient</strong>
                Portfolio structure is robust against current volatility vectors.
            </p>
        </div>
    );

    const SignalsCard = (
        <div className="h-full flex flex-col p-5">
            <div className="flex items-center gap-2 mb-4">
                <Zap size={14} className="text-yellow-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Alpha Signals</span>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
                {signals.slice(0, 3).map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5 hover:border-indigo-500/30 transition-colors group">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                                {s.symbol}
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-zinc-300 group-hover:text-white">{s.symbol}/USD</div>
                                <div className="text-[9px] text-zinc-500">Vol Forecast</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs font-mono font-bold text-white">{s.volatility}%</div>
                            <div className="text-[9px] text-emerald-400">+Low Risk</div>
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full py-2 mt-4 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-widest rounded transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20">
                <Lock size={10} /> Unlock Whale Tier
            </button>
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-zinc-950/50 relative">
            {showHandshake && <NeuralHandshake onComplete={handleHandshakeComplete} />}

            {/* Header: Pro Status */}
            <div className="p-3 border-b border-white/5 flex justify-between items-center bg-zinc-900/50">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase">
                        Flex Intelligence
                    </span>
                </div>
                <div className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-bold text-indigo-400">
                    RSVP DECK
                </div>
            </div>

            {/* RSVP Deck Container */}
            <div className="flex-1 p-2 relative overflow-hidden bg-zinc-950">
                {scanning ? (
                    <motion.div
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 0 }}
                        transition={{ delay: 1.5, duration: 0.5 }}
                        className="absolute inset-0 z-30 bg-zinc-950 flex flex-col items-center justify-center gap-3"
                    >
                        <Activity className="text-indigo-400 animate-spin" size={24} />
                        <span className="text-[10px] font-mono text-indigo-400">INITIALIZING DECK...</span>
                    </motion.div>
                ) : (
                    <RSVPDeck items={[BalanceCard, RiskCard, SignalsCard]} />
                )}
            </div>

            {/* Footer Status */}
            <div className="p-2 border-t border-white/5 bg-black/40 text-[9px] font-mono text-zinc-600 flex justify-between">
                <span>SENTINEL: ONLINE</span>
                <span className="text-indigo-400">REP: {points?.totalPoints?.toLocaleString() || '...'}</span>
            </div>
        </div>
    );
}
