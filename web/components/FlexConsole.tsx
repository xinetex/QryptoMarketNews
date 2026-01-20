'use client';

import { useState, useEffect } from 'react';
import RSVPDeck from './RSVPDeck';
import { Shield, TrendingUp, Zap, Activity, Globe, Lock, Unlock, Wallet as WalletIcon, QrCode, Send, Copy, ArrowRight, ArrowDownLeft, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
    const [copied, setCopied] = useState(false);

    // Fetch Balance
    const { data: balance } = useBalance({ address: address as `0x${string}` });

    // Fetched Alpha Vector State
    const [alphaVector, setAlphaVector] = useState<any>(null);

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

        // Fetch Alpha Vector
        const fetchAlpha = async () => {
            try {
                const res = await fetch('/api/alpha/vector', { method: 'POST' });
                const data = await res.json();
                if (data && data.components) {
                    setAlphaVector(data);
                    // Update risk score from engine
                    setRiskScore(data.components.risk);
                }
            } catch (e) {
                console.error("Alpha link failed", e);
            }
        };
        fetchAlpha();

        // Poll every 30s
        const poll = setInterval(fetchAlpha, 30000);

        return () => {
            clearTimeout(timer);
            clearInterval(poll);
        }
    }, []);

    const handleHandshakeComplete = () => {
        localStorage.setItem('prophet_onboarded', 'true');
        setShowHandshake(false);
    };

    // --- HYBRID NANO-DECK NODES ---

    // Deck Control State
    const [deckIndex, setDeckIndex] = useState(0);
    const DECK_ITEMS = 5; // Total items

    const handleNextDeck = () => setDeckIndex((prev) => (prev + 1) % DECK_ITEMS);
    const handlePrevDeck = () => setDeckIndex((prev) => (prev - 1 + DECK_ITEMS) % DECK_ITEMS);

    // --- HYBRID NANO-DECK NODES ---

    const [commandView, setCommandView] = useState<'main' | 'receive' | 'send'>('main');

    // 1. Command Node (Wallet Core)
    const CommandNode = (
        <div className="h-full flex flex-col bg-zinc-900/50 p-2 justify-between relative overflow-hidden">
            <motion.div
                key={commandView}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full flex flex-col justify-between"
            >
                {commandView === 'main' ? (
                    <>
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
                            <button
                                onClick={() => setCommandView('send')}
                                className="py-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900 text-[8px] font-bold text-zinc-400 hover:text-white rounded uppercase tracking-wider transition-colors flex flex-col items-center gap-1 group"
                            >
                                <ArrowRight size={10} className="group-hover:-rotate-45 transition-transform" />
                                Send
                            </button>
                            <button
                                onClick={() => setCommandView('receive')}
                                className="py-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900 text-[8px] font-bold text-zinc-400 hover:text-white rounded uppercase tracking-wider transition-colors flex flex-col items-center gap-1 group"
                            >
                                <ArrowDownLeft size={10} className="group-hover:translate-y-0.5 transition-transform" />
                                Receive
                            </button>
                            <button className="py-2 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900 text-[8px] font-bold text-zinc-400 hover:text-white rounded uppercase tracking-wider transition-colors flex flex-col items-center gap-1">
                                <QrCode size={10} />
                                Identity
                            </button>
                        </div>
                    </>
                ) : commandView === 'receive' ? (
                    <>
                        {/* HEADER */}
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                                <ArrowDownLeft size={10} /> Receive
                            </span>
                            <button
                                onClick={() => setCommandView('main')}
                                className="text-[8px] text-zinc-500 hover:text-white uppercase tracking-wider font-bold"
                            >
                                Cancel
                            </button>
                        </div>

                        {/* QR CODE + ADDR */}
                        <div className="flex-1 flex flex-col items-center justify-center bg-white/5 rounded-lg border border-white/5 p-2 mb-2 relative group overflow-hidden">
                            {/* QR */}
                            {address ? (
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${address}&bgcolor=18181b&color=34d399&margin=10`}
                                    alt="QR"
                                    className="w-16 h-16 rounded opacity-90 group-hover:opacity-100 transition-opacity"
                                />
                            ) : (
                                <div className="w-16 h-16 bg-black/40 rounded flex items-center justify-center text-[8px] text-zinc-600">NO ADDR</div>
                            )}

                            {/* Addr Copier */}
                            <div className="mt-2 w-full flex items-center justify-between bg-black/40 px-2 py-1.5 rounded border border-white/5 text-[8px] font-mono text-zinc-400">
                                <span>{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '...'}</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (address) {
                                            navigator.clipboard.writeText(address);
                                            // Optional: simple visual feedback could be managed here or by parent
                                            // But let's do a quick inline feedback:
                                            const btn = e.currentTarget;
                                            const originalText = btn.innerHTML;
                                            // This is a bit hacky for inline SVG, better to use state if full generic
                                            // For now we assume the user just wants it to work.
                                            // Let's rely on global toast or just the act of copying. 
                                            // Actually, let's add a state for "copied" in the component.
                                            setCopied(true);
                                            setTimeout(() => setCopied(false), 2000);
                                        }
                                    }}
                                    className="cursor-pointer hover:text-emerald-400 transition-colors"
                                >
                                    {copied ? <Check size={8} className="text-emerald-400" /> : <Copy size={8} />}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        {/* SEND VIEW */}
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                                <ArrowRight size={10} /> Send
                            </span>
                            <button
                                onClick={() => setCommandView('main')}
                                className="text-[8px] text-zinc-500 hover:text-white uppercase tracking-wider font-bold"
                            >
                                Cancel
                            </button>
                        </div>

                        <div className="flex-1 flex flex-col gap-2">
                            <div className="space-y-1">
                                <span className="text-[7px] text-zinc-500 uppercase font-bold">Recipient</span>
                                <input
                                    type="text"
                                    placeholder="0x..."
                                    className="w-full bg-black/40 border border-white/5 focus:border-indigo-500/50 rounded px-2 py-1.5 text-[9px] text-white font-mono outline-none transition-colors"
                                />
                            </div>
                            <div className="space-y-1">
                                <span className="text-[7px] text-zinc-500 uppercase font-bold">Amount (ETH)</span>
                                <input
                                    type="text"
                                    placeholder="0.0"
                                    className="w-full bg-black/40 border border-white/5 focus:border-indigo-500/50 rounded px-2 py-1.5 text-[9px] text-white font-mono outline-none transition-colors"
                                />
                            </div>
                        </div>

                        <button className="mt-2 w-full py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 text-[8px] font-bold uppercase tracking-widest rounded transition-colors">
                            Confirm Transaction
                        </button>
                    </>
                )}
            </motion.div>
        </div>
    );

    // 2. Telemetry Node (System Grid)
    // Dynamic Simulation State
    const [telemetry, setTelemetry] = useState({ gas: 14, tps: 2400, sync: 98, sentinel: true });

    useEffect(() => {
        const interval = setInterval(() => {
            setTelemetry(prev => ({
                gas: Math.max(8, Math.min(30, prev.gas + (Math.random() - 0.5) * 4)),
                tps: Math.max(1000, prev.tps + (Math.random() - 0.5) * 200),
                sync: Math.min(100, Math.max(95, prev.sync + (Math.random() - 0.5))),
                sentinel: true
            }));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const TelemetryNode = (
        <div className="h-full flex flex-col bg-zinc-900/50 p-2 relative overflow-hidden">
            {/* Decoding Effect Background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #4f46e5 1px, transparent 1px)', backgroundSize: '12px 12px' }}
            />

            <div className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-2 relative z-10">
                <Activity size={10} /> System Telemetry
            </div>

            <div className="grid grid-cols-2 gap-2 flex-1 relative z-10">
                {/* Gas Vector (Histogram) */}
                <div className="p-2 border border-white/5 bg-black/40 rounded flex flex-col gap-1 relative overflow-hidden group">
                    <span className="text-[7px] text-zinc-600 font-bold uppercase group-hover:text-zinc-400 transition-colors">Gas Vector</span>
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-zinc-300 font-bold">{Math.round(telemetry.gas)}</span>
                        <span className="text-[7px] text-zinc-500">GWEI</span>
                    </div>
                    {/* Fake Histogram */}
                    <div className="mt-auto flex items-end gap-0.5 h-3">
                        {[0.4, 0.7, 0.5, 0.9, 0.6].map((h, i) => (
                            <motion.div
                                key={i}
                                className="w-1 bg-indigo-500/50 rounded-t-[1px]"
                                animate={{ height: `${Math.max(20, Math.min(100, (telemetry.gas / 30) * 100 * h))}%` }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            />
                        ))}
                    </div>
                </div>

                {/* Network Load (TPS) */}
                <div className="p-2 border border-white/5 bg-black/40 rounded flex flex-col gap-1 relative overflow-hidden">
                    <span className="text-[7px] text-zinc-600 font-bold uppercase">Network TPS</span>
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-emerald-400 font-bold">{Math.round(telemetry.tps)}</span>
                    </div>
                    <div className="overflow-hidden mt-1 relative h-2">
                        <div className="flex gap-1 absolute top-0 left-0 animate-[scroll_2s_linear_infinite]">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <div key={i} className="w-0.5 h-full bg-emerald-500/30 transform skew-x-12" />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sentinel */}
                <div className="p-2 border border-white/5 bg-black/40 rounded flex flex-col gap-1 relative overflow-hidden">
                    <span className="text-[7px] text-zinc-600 font-bold uppercase">Sentinel</span>
                    <div className="flex items-center gap-1.5">
                        <Shield size={10} className="text-emerald-500" />
                        <span className="text-[9px] text-emerald-400/80">SECURE</span>
                    </div>
                </div>

                {/* Sync Status */}
                <div className="p-2 border border-white/5 bg-black/40 rounded flex flex-col gap-1 relative overflow-hidden">
                    <span className="text-[7px] text-zinc-600 font-bold uppercase">Node Sync</span>
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-indigo-400 font-bold">{telemetry.sync.toFixed(1)}%</span>
                        <Activity size={8} className="text-indigo-500 animate-spin" style={{ animationDuration: '3s' }} />
                    </div>
                    <div className="w-full h-0.5 bg-zinc-800 rounded-full overflow-hidden mt-1">
                        <motion.div
                            className="h-full bg-indigo-500 box-shadow-[0_0_5px_indigo]"
                            animate={{ width: `${telemetry.sync}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    // 3. Risk Node (Visual Infographic)
    const RiskNode = (
        <div className="h-full flex flex-col bg-zinc-900/50 p-2 items-center justify-center relative overflow-hidden">
            {/* Background Scanner Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(16,185,129,0.05)_50%,transparent_100%)] animate-[scan_3s_linear_infinite]" style={{ backgroundSize: '100% 200%' }} />

            <div className="w-full flex justify-between items-center mb-2 px-1 relative z-10">
                <span className="text-[8px] text-zinc-500 font-bold uppercase flex items-center gap-2">
                    <Activity size={10} /> Threat Radar
                </span>
                <span className={`text-xl font-black ${riskScore > 70 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                    {riskScore}
                </span>
            </div>

            {/* Central Radar Visual */}
            <div className="relative w-full flex-1 flex items-center justify-center mb-1">
                <div className="w-32 h-1 bg-zinc-800 rounded-full overflow-hidden relative">
                    {/* Safety Zone */}
                    <div className="absolute left-0 top-0 bottom-0 w-[70%] bg-emerald-900/40" />
                    {/* Danger Zone */}
                    <div className="absolute right-0 top-0 bottom-0 w-[30%] bg-red-900/40" />

                    {/* Indicator */}
                    <motion.div
                        className="absolute top-0 bottom-0 w-8 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                        initial={{ left: '0%' }}
                        animate={{ left: `${riskScore}%` }}
                        transition={{ type: "spring", stiffness: 50 }}
                    >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full" />
                    </motion.div>
                </div>
            </div>

            <div className="text-center relative z-10">
                <div className="text-[9px] font-bold text-white tracking-widest uppercase">{alphaVector ? "LIVE ENGINE LINKED" : "RESILIENT STRUCTURE"}</div>
                <div className="text-[7px] text-zinc-500 uppercase mt-0.5">{alphaVector?.driver_breakdown?.primary_driver || "Zero vectors detected"}</div>
            </div>
        </div>
    );

    // 4. Signals Node (Nano)
    const SignalNode = (
        <div className="h-full flex flex-col bg-zinc-900/50 p-2 relative">
            <div className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                <Zap size={10} className="text-yellow-500" /> Active Streams
            </div>

            {/* Dynamic Signal List */}
            <div className="flex-1 space-y-2 overflow-hidden">
                <AnimatePresence mode="popLayout">
                    {(alphaVector?.signals?.length > 0 ? alphaVector.signals : signals.slice(0, 3)).map((s: any, i: number) => (
                        <motion.div
                            key={s.symbol || s.asset}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center justify-between p-2 rounded bg-black/40 border border-white/5 hover:border-yellow-500/30 group transition-colors cursor-pointer"
                        >
                            <div className="flex items-center gap-2">
                                <span className={`text-[7px] font-bold px-1 py-0.5 rounded ${s.confidence > 75 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                    {s.confidence > 80 ? 'HIGH' : 'MED'}
                                </span>
                                <span className="text-[9px] font-bold text-zinc-300 group-hover:text-white">{s.asset || s.symbol}</span>
                            </div>

                            <div className="flex flex-col items-end">
                                <span className="text-[9px] font-mono text-white">{(s.metrics?.volatility || s.volatility || 0).toFixed(1)}%</span>
                                <span className="text-[7px] text-zinc-600 uppercase">VOLATILITY</span>
                            </div>
                        </motion.div>
                    ))}
                    {(!alphaVector?.signals?.length && !signals.length) && (
                        // Empty State if no signals
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center h-20 text-zinc-600 gap-1"
                        >
                            <Globe size={16} className="opacity-20 animate-pulse" />
                            <span className="text-[8px] tracking-widest">SEARCHING...</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Corner Decor */}
            <div className="absolute bottom-2 right-2 w-2 h-2 border-r border-b border-yellow-500/20" />
        </div>
    );

    // 5. Prediction Node (Interactive)
    const [predictionStep, setPredictionStep] = useState<'IDLE' | 'SELECT_ASSET' | 'SELECT_DIR' | 'CONFIRMING' | 'SUCCESS'>('IDLE');
    const [predAsset, setPredAsset] = useState<string>('');
    const [predDir, setPredDir] = useState<'UP' | 'DOWN'>('UP');

    const handlePredict = async () => {
        setPredictionStep('CONFIRMING');
        try {
            await fetch('/api/predict', {
                method: 'POST',
                body: JSON.stringify({ wallet: address, symbol: predAsset, direction: predDir, rationale: 'FlexConsole Alpha' }),
                headers: { 'Content-Type': 'application/json' }
            });
            setPredictionStep('SUCCESS');
            setTimeout(() => {
                setPredictionStep('IDLE');
                setPredAsset('');
            }, 3000); // Reset after success
        } catch (e) {
            console.error(e);
            setPredictionStep('IDLE');
        }
    };

    const PredictionNode = (
        <div className="h-full flex flex-col bg-zinc-900/50 p-2 relative overflow-hidden">
            <div className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                <Globe size={10} className="text-indigo-500" /> Prophecy Uplink
            </div>

            <AnimatePresence mode="wait">
                {predictionStep === 'IDLE' ? (
                    <motion.button
                        key="idle"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setPredictionStep('SELECT_ASSET')}
                        className="flex-1 flex flex-col items-center justify-center gap-2 border border-dashed border-white/10 rounded hover:bg-white/5 hover:border-white/20 transition-all group"
                    >
                        <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Zap size={14} className="text-indigo-400" />
                        </div>
                        <span className="text-[9px] font-bold text-zinc-400 group-hover:text-white mt-1">INITIATE FORECAST</span>
                    </motion.button>
                ) : predictionStep === 'SELECT_ASSET' ? (
                    <motion.div key="asset" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="flex-1 flex flex-col gap-2">
                        <span className="text-[8px] text-zinc-500 font-bold text-center">SELECT TARGET ASSET</span>
                        <div className="grid grid-cols-2 gap-2">
                            {['bitcoin', 'ethereum', 'solana', 'dogecoin'].map(c => (
                                <button key={c} onClick={() => { setPredAsset(c); setPredictionStep('SELECT_DIR'); }}
                                    className="p-2 bg-black/40 border border-white/5 hover:border-indigo-500/50 rounded text-[9px] font-bold text-zinc-300 hover:text-white uppercase transition-colors">
                                    {c}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setPredictionStep('IDLE')} className="mt-auto text-[8px] text-zinc-600 hover:text-zinc-400 text-center uppercase">Cancel</button>
                    </motion.div>
                ) : predictionStep === 'SELECT_DIR' ? (
                    <motion.div key="dir" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="flex-1 flex flex-col gap-2">
                        <span className="text-[8px] text-zinc-500 font-bold text-center">PREDICT 24H MOVE ({predAsset.substring(0, 3).toUpperCase()})</span>
                        <div className="flex-1 flex flex-col gap-2 justify-center">
                            <button onClick={() => { setPredDir('UP'); handlePredict(); }} className="flex-1 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 rounded flex items-center justify-center gap-2 group">
                                <TrendingUp size={14} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-bold text-emerald-400">HIGHER</span>
                            </button>
                            <button onClick={() => { setPredDir('DOWN'); handlePredict(); }} className="flex-1 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 rounded flex items-center justify-center gap-2 group">
                                <TrendingUp size={14} className="text-red-500 rotate-180 group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-bold text-red-400">LOWER</span>
                            </button>
                        </div>
                    </motion.div>
                ) : predictionStep === 'CONFIRMING' ? (
                    <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center gap-2">
                        <Activity className="text-indigo-500 animate-spin" size={20} />
                        <span className="text-[8px] font-bold text-indigo-400 animate-pulse">ENCRYPTING SIGNAL...</span>
                    </motion.div>
                ) : (
                    <motion.div key="success" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center gap-2 bg-emerald-500/10 rounded border border-emerald-500/20">
                        <Check size={24} className="text-emerald-400" />
                        <div className="text-center">
                            <div className="text-[10px] font-black text-emerald-400 uppercase">PREDICTION LOCKED</div>
                            <div className="text-[8px] text-emerald-500/70 uppercase font-bold">+10 REPUTATION EARNED</div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
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
                    {/* Navigation Controls in Header */}
                    <div className="flex items-center gap-1 bg-black/40 rounded px-1.5 py-0.5 border border-white/5">
                        <button onClick={handlePrevDeck} className="hover:text-white transition-colors"><ChevronRight size={10} className="rotate-180" /></button>
                        <span className="font-mono text-zinc-500 w-4 text-center">{deckIndex + 1}/{DECK_ITEMS}</span>
                        <button onClick={handleNextDeck} className="hover:text-white transition-colors"><ChevronRight size={10} /></button>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_5px_currentColor]"></div>
                        <span className="text-emerald-500/80 font-bold hidden sm:inline">MAINNET</span>
                    </div>
                    <div className="text-zinc-600">v4.3</div>
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
                    <RSVPDeck
                        items={[CommandNode, TelemetryNode, RiskNode, SignalNode, PredictionNode]}
                        speed={5000}
                        activeIndex={deckIndex}
                        onIndexChange={setDeckIndex}
                        hideToolbar={true}
                    />
                )}
            </div>

            {/* Footer System Line */}
            <div className="px-2 py-1 border-t border-white/5 bg-black/60 flex items-center justify-between">
                <div className="flex gap-2 text-[7px] text-zinc-600 uppercase font-bold">
                    <span>UPTIME: 14:029:01</span>
                    <span className="text-zinc-700">|</span>
                    <span>RPC: <span className="text-emerald-500/80">SYNCED</span></span>
                </div>
                <Lock size={8} className="text-red-900/50" />
            </div>
        </div>
    );
}
