"use client";

import { useState, useEffect } from "react";

const STEPS = [
    "INITIALIZING SENTINEL CORE...",
    "SCANNING MEMPOOL VECTORS...",
    "CALCULATING LIQUIDATION CASCADES...",
    "TRIANGULATING MARKET SENTIMENT...",
    "DECRYPTING SIGNAL PATTERNS...",
    "PREDICTION MODEL CONVERGING..."
];

export function AttunementLoader() {
    const [stepIndex, setStepIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setStepIndex(prev => (prev + 1) % STEPS.length);
        }, 800); // Change text every 800ms to keep it dynamic

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-500">
            {/* The Mystic Orb */}
            <div className="relative">
                <div className="text-6xl animate-bounce duration-[3000ms]">🔮</div>
                <div className="absolute inset-0 bg-indigo-500/30 blur-2xl rounded-full animate-pulse" />
            </div>

            {/* The Narrative Text */}
            <div className="h-6 overflow-hidden">
                <p
                    key={stepIndex}
                    className="text-indigo-300 font-mono text-xs uppercase tracking-widest animate-[slideUp_0.5s_ease-out]"
                >
                    {STEPS[stepIndex]}
                </p>
            </div>

            <style jsx>{`
                @keyframes slideUp {
                    from { transform: translateY(10px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
