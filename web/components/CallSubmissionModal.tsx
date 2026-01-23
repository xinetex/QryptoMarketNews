'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import type { DislocationSignal } from '@/lib/types/dislocation';
import type { CallDirection, CallSubmission } from '@/lib/types/calls';

interface CallSubmissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    signal: DislocationSignal;
}

export default function CallSubmissionModal({ isOpen, onClose, signal }: CallSubmissionModalProps) {
    const [direction, setDirection] = useState<CallDirection>(
        signal.direction === 'BULLISH_GAP' ? 'YES' : 'NO'
    );
    const [confidence, setConfidence] = useState(75);
    const [thesis, setThesis] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    async function handleSubmit() {
        setSubmitting(true);
        setError(null);

        try {
            // Mock user ID for now - normally from NextAuth
            const userId = 'user_demo_1';
            const username = 'DemoTrader';

            const callData: CallSubmission = {
                marketId: signal.market.id,
                marketTitle: signal.market.title,
                marketSlug: signal.market.slug,
                marketSource: 'polymarket',
                direction,
                confidence,
                entryPrice: direction === 'YES' ? signal.market.yesPrice : signal.market.noPrice,
                thesis,
                isPublic: true
            };

            const res = await fetch('/api/calls', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, username, call: callData })
            });

            if (!res.ok) throw new Error('Failed to submit call');

            setSubmitted(true);
            setTimeout(() => {
                onClose();
                setSubmitted(false);
            }, 2000);
        } catch (e) {
            setError('Unable to submit call. Please try again.');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
                >
                    {submitted ? (
                        <div className="p-12 text-center space-y-4">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto"
                            >
                                <CheckCircle className="w-10 h-10 text-emerald-500" />
                            </motion.div>
                            <h3 className="text-xl font-bold text-white">Call Locked In!</h3>
                            <p className="text-zinc-400">Your prediction is live on the network.</p>
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
                                <div className="flex items-center gap-2">
                                    <Target className="w-5 h-5 text-indigo-400" />
                                    <h2 className="text-lg font-bold text-white">Make a Prediction</h2>
                                </div>
                                <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-6">

                                {/* Market Summary */}
                                <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                                    <div className="text-xs text-zinc-500 mb-1">Target Market</div>
                                    <div className="font-medium text-sm text-zinc-200 line-clamp-2">
                                        {signal.market.title}
                                    </div>
                                    <div className="flex items-center gap-4 mt-2 text-xs">
                                        <span className="text-zinc-400">Current YES: {Math.round(signal.market.yesPrice * 100)}¢</span>
                                        <span className="text-zinc-400">Current NO: {Math.round(signal.market.noPrice * 100)}¢</span>
                                    </div>
                                </div>

                                {/* Direction Selector */}
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setDirection('YES')}
                                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${direction === 'YES'
                                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                                : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                                            }`}
                                    >
                                        <span className="font-black text-xl">YES</span>
                                        <span className="text-[10px] uppercase tracking-wider">Price will rise</span>
                                    </button>
                                    <button
                                        onClick={() => setDirection('NO')}
                                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${direction === 'NO'
                                                ? 'bg-red-500/20 border-red-500 text-red-400'
                                                : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                                            }`}
                                    >
                                        <span className="font-black text-xl">NO</span>
                                        <span className="text-[10px] uppercase tracking-wider">Price will fall</span>
                                    </button>
                                </div>

                                {/* Confidence Slider */}
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <label className="text-xs font-medium text-zinc-400">Confidence Level</label>
                                        <span className="text-xs font-bold text-indigo-400">{confidence}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="100"
                                        value={confidence}
                                        onChange={(e) => setConfidence(Number(e.target.value))}
                                        className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                    />
                                    <div className="flex justify-between text-[10px] text-zinc-600 font-mono">
                                        <span>Moonshot (1-30%)</span>
                                        <span>Conviction (70-90%)</span>
                                    </div>
                                </div>

                                {/* Thesis Input */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-400 flex items-center gap-2">
                                        Why? <span className="text-zinc-600 font-normal">(Optional thesis)</span>
                                    </label>
                                    <textarea
                                        value={thesis}
                                        onChange={(e) => setThesis(e.target.value)}
                                        placeholder="E.g. Recent whale movement suggests..."
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 min-h-[80px]"
                                    />
                                </div>

                                {/* Points Stake Estimate */}
                                <div className="flex items-center gap-3 p-3 rounded bg-indigo-500/10 border border-indigo-500/20">
                                    <Info className="w-4 h-4 text-indigo-400" />
                                    <div className="text-xs text-indigo-300">
                                        Staking <strong className="text-white">100 points</strong> on this call.
                                        Win to earn <strong className="text-white">+{Math.round(100 * (1 + confidence / 100))} pts</strong>.
                                    </div>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 p-2 rounded">
                                        <AlertTriangle size={14} />
                                        {error}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 flex justify-end gap-3">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {submitting ? 'Submitting...' : 'Confirm Prediction'}
                                </button>
                            </div>
                        </>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
