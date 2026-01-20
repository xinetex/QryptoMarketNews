'use client';

import { useState, useEffect } from 'react';
import { Fingerprint, Terminal, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NeuralHandshake({ onComplete }: { onComplete: () => void }) {
    const [step, setStep] = useState(0);

    useEffect(() => {
        // Step 1: Biometric Scan (Simulated)
        setTimeout(() => setStep(1), 1500);
        // Step 2: Protocol Link
        setTimeout(() => setStep(2), 3500);
        // Step 3: Complete
        setTimeout(() => {
            setStep(3);
            setTimeout(onComplete, 1000); // Auto-dismiss
        }, 5000);
    }, []);

    return (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
            <AnimatePresence mode='wait'>
                {step === 0 && (
                    <motion.div
                        key="scan"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-4"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full" />
                            <Fingerprint size={48} className="text-indigo-400 animate-pulse relative z-10" />
                        </div>
                        <h3 className="text-sm font-bold text-white tracking-widest uppercase">Verifying Identity</h3>
                        <p className="text-[10px] text-zinc-500 font-mono">Scanning wallet reputation vectors...</p>
                    </motion.div>
                )}

                {step === 1 && (
                    <motion.div
                        key="link"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-4"
                    >
                        <Terminal size={48} className="text-emerald-400" />
                        <h3 className="text-sm font-bold text-white tracking-widest uppercase">Establishing Link</h3>
                        <div className="w-full max-w-[150px] h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-emerald-500"
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 1.5 }}
                            />
                        </div>
                        <p className="text-[10px] text-zinc-500 font-mono">Syncing Prophet Protocol...</p>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="done"
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center gap-4"
                    >
                        <CheckCircle2 size={48} className="text-white" />
                        <h3 className="text-lg font-black text-white tracking-tighter uppercase">ACCESS GRANTED</h3>
                        <p className="text-xs text-zinc-400">Welcome to the inner circle.</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
