'use client';

import { useState, useEffect } from 'react';
import RSVPDeck from './RSVPDeck';
import { Shield, TrendingUp, Zap, Activity, Globe, Lock, Unlock, Wallet as WalletIcon, QrCode, Send, Copy, ArrowRight, ArrowDownLeft } from 'lucide-react';
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

    // --- HYBRID NANO-DECK NODES ---

    // 1. Command Node (Wallet Core)
    const CommandNode = (
        <div className="h-full flex flex-col bg-zinc-900/50 p-3 justify-between">
            {/* Balance Section */}
            <div>
                <div className="text-[8px] text-zinc-600 mb-0.5 uppercase tracking-widest">Active Balance</div>
                <div className="text-2xl text-white font-bold tracking-tighter flex items-baseline gap-1.5">
                    {balance ? parseFloat(balance.formatted).toFixed(4) : '0.000'}
                    <span className="text-[10px] text-zinc-500 font-normal mt-2">{balance?.symbol || 'ETH'}</span>
                </div>
                <div className="flex items-center gap-2 mt-2 p-1.5 bg-black/40 border border-white/5 rounded w-fit hover:border-emerald-500/30 transition-colors cursor-pointer group/addr">
                    <span className="text-[9px] font-mono text-zinc-300">
                        {address ? (
                            <>
                                <span className="text-emerald-400/80">{address.slice(0, 4)}</span>
                                <span className="text-zinc-500">...</span>
                                <span>{address.slice(-4)}</span>
                            </>
                        ) : (
                            'CONNECT'
                        )}
                    </span>
                    <Copy size={8} className="text-zinc-600 group-hover/addr:text-emerald-400 transition-colors" />
                </div>
            </div>

            {/* Micro Actions */}
            <div className="grid grid-cols-3 gap-1.5">
                <button className="py-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900 text-[8px] font-bold text-zinc-400 hover:text-white rounded uppercase tracking-wider transition-colors flex flex-col items-center gap-1 group">
                    <ArrowRight size={10} className="group-hover:-rotate-45 transition-transform" />
                    Send
                </button>
                <button className="py-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900 text-[8px] font-bold text-zinc-400 hover:text-white rounded uppercase tracking-wider transition-colors flex flex-col items-center gap-1 group">
                    <ArrowDownLeft size={10} className="group-hover:translate-y-0.5 transition-transform" />
                    Receive
                </button>
                <button className="py-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900 text-[8px] font-bold text-zinc-400 hover:text-white rounded uppercase tracking-wider transition-colors flex flex-col items-center gap-1">
                    <QrCode size={10} />
                    Identity
                </button>
            </div>
        </div>
    );

    // 2. Telemetry Node (System Grid)
    const TelemetryNode = (
        <div className="h-full flex flex-col bg-zinc-900/50 p-3">
            <div className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                <Activity size={10} /> System Telemetry
            </div>

            <div className="grid grid-cols-2 gap-2 flex-1">
                {/* Gas */}
                <div className="p-2 border border-white/5 bg-black/40 rounded flex flex-col gap-1 relative overflow-hidden">
                    <span className="text-[7px] text-zinc-600 font-bold uppercase">Gas Vector</span>
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-zinc-300 font-bold">14</span>
                        <span className="text-[7px] text-zinc-500">GWEI</span>
                    </div>
                    <div className="w-full h-0.5 bg-zinc-800 rounded-full overflow-hidden mt-auto">
                        <div className="h-full w-1/3 bg-emerald-500/50"></div>
                    </div>
                </div>

                {/* Sentinel */}
                <div className="p-2 border border-white/5 bg-black/40 rounded flex flex-col gap-1 relative overflow-hidden">
                    <span className="text-[7px] text-zinc-600 font-bold uppercase">Sentinel</span>
                    <div className="flex items-center gap-1.5">
                        <Shield size={10} className="text-emerald-500" />
                        <span className="text-[9px] text-emerald-400/80">SECURE</span>
                    </div>
                    {/* Blinking Light */}
                    <div className="absolute top-2 right-2 flex gap-0.5">
                        <div className="w-0.5 h-0.5 bg-emerald-500 animate-[pulse_2s_infinite]"></div>
                    </div>
                </div>

                {/* Sync Status */}
                <div className="p-2 border border-white/5 bg-black/40 rounded flex flex-col gap-1 col-span-2 justify-center">
                    <div className="flex justify-between items-center mb-0.5">
                        <span className="text-[7px] text-zinc-600 font-bold uppercase">Prophet Sync</span>
                        <span className="text-[7px] text-indigo-400">98%</span>
                    </div>
                    <div className="w-full h-1 bg-zinc-900 border border-white/5 rounded-full p-[1px]">
                        <motion.div
                            className="h-full bg-indigo-500 rounded-full"
                            initial={{ width: "0%" }}
                            animate={{ width: "98%" }}
                            transition={{ duration: 2, delay: 1 }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    // 3. Risk Node (Visual Infographic)
    const RiskNode = (
        <div className="h-full flex flex-col bg-zinc-900/50 p-3 items-center justify-center">
            <div className="w-full flex justify-between items-center mb-2 px-1">
                <span className="text-[8px] text-zinc-500 font-bold uppercase flex items-center gap-2">
                    <Activity size={10} /> Threat Radar
                </span>
                <span className={`text-base font-black ${riskScore > 70 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                    {riskScore}
                </span>
            </div>

            <div className="relative w-40 h-20 mb-1">
                {/* Gauge Background */}
                <div className="absolute inset-x-4 inset-y-2 bg-zinc-800/50 rounded-t-full border-t border-x border-white/5" />

                {/* Colored Zones (CSS Conic Gradient approximation or manual segments) */}
                <div className="absolute bottom-0 left-4 right-4 h-[200%] rounded-full opacity-30 box-border border-[12px] border-emerald-500 border-b-0 border-l-yellow-500 border-r-emerald-500"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)' }}
                />

                {/* Needle */}
                <motion.div
                    className="absolute bottom-0 left-1/2 h-[85%] w-0.5 bg-white origin-bottom z-10 shadow-[0_0_10px_white]"
                    initial={{ rotate: -90 }}
                    animate={{ rotate: (riskScore / 100) * 180 - 90 }}
                    transition={{ delay: 0.5, type: 'spring', stiffness: 60 }}
                >
                    <div className="w-2 h-2 bg-white rounded-full absolute bottom-0 -left-[3px]" />
                </motion.div>

                {/* Grid Lines */}
                <div className="absolute inset-0 flex justify-center items-end opacity-20">
                    <div className="w-[1px] h-full bg-white rotate-[-45deg] origin-bottom absolute" />
                    <div className="w-[1px] h-full bg-white rotate-[45deg] origin-bottom absolute" />
                    <div className="w-[1px] h-full bg-white rotate-[0deg] origin-bottom absolute" />
                </div>
            </div>

            <div className="text-center">
                <div className="text-[9px] font-bold text-white tracking-widest">RESILIENT STRUCTURE</div>
                <div className="text-[7px] text-zinc-500 uppercase mt-0.5">Zero vectors detected</div>
            </div>
        </div>
    );

    // 4. Signals Node (Nano)
    const SignalNode = (
        <div className="h-full flex flex-col bg-zinc-900/50 p-3">
            <div className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                <Zap size={10} className="text-yellow-500" /> Active Streams
            </div>

            <div className="flex-1 space-y-1">
                {signals.slice(0, 3).map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-1.5 rounded bg-black/40 border border-white/5 hover:border-indigo-500/30 transition-colors">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-white/5 flex items-center justify-center text-[8px] font-bold text-zinc-400">{s.symbol[0]}</div>
                            <span className="text-[9px] font-bold text-zinc-300">{s.symbol}</span>
                        </div>
                        <span className="text-[8px] font-mono text-emerald-400">{s.volatility}% VOL</span>
                    </div>
                ))}
            </div>
        </div>
    );

    // --- NANO WALLET UI ---

    return (
        <div className="h-full flex flex-col bg-zinc-950 relative font-mono select-none">
            {showHandshake && <NeuralHandshake onComplete={handleHandshakeComplete} />}

            {/* Header / Status Bar */}
            <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between text-[8px] tracking-widest bg-zinc-900/50">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-bold text-emerald-400 tracking-widest uppercase">
                        Prophet Core
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_5px_currentColor]"></div>
                        <span className="text-emerald-500/80 font-bold hidden sm:inline">MAINNET</span>
                    </div>
                    <div className="text-zinc-600">v4.2</div>
                </div>
            </div>

            {/* Deck Content */}
            <div className="flex-1 p-2 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/40 to-zinc-950 relative overflow-hidden">
                {scanning ? (
                    <motion.div
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 0 }}
                        transition={{ delay: 1.5, duration: 0.5 }}
                        className="absolute inset-0 z-30 bg-zinc-950 flex flex-col items-center justify-center gap-2"
                    >
                        <Activity className="text-emerald-500/50 animate-pulse" size={16} />
                        <span className="text-[8px] text-emerald-500/50 tracking-[0.2em]">INITIALIZING LINK...</span>
                    </motion.div>
                ) : (
                    <RSVPDeck items={[CommandNode, TelemetryNode, RiskNode, SignalNode]} speed={5000} />
                )}
            </div>

            {/* Footer System Line */}
            <div className="px-2 py-1 border-t border-white/5 bg-black/60 flex items-center justify-between">
                <div className="flex gap-2 text-[7px] text-zinc-600 uppercase font-bold">
                    <span>UPTIME: 14:029:01</span>
                    <span className="text-zinc-700">|</span>
                    <span>RPC: <span className="text-emerald-500/80">SYNCED</span></span>
                </div>
            </div>
        </div>
    );
}
