"use client";

import { useState, useEffect, useRef } from "react";
import { animate } from "animejs";
import { X, Sparkles, TrendingUp, AlertTriangle } from "lucide-react";
import { useCryptoPrices } from "@/lib/hooks/useCrypto";

type OracleState = "analyzing" | "bullish" | "bearish" | "neutral" | "warning";

const ORACLE_MESSAGES = {
    analyzing: ["Scanning liquidity pools...", "Calculating correlations...", "Parsing on-chain velocity..."],
    bullish: ["Momentum detected in L1s. 🟢", "Accumulation phase complete.", "Breakout probability: 78%"],
    bearish: ["Distribution pattern detected. 🔴", "Volume diverging from price.", "Risk off advised."],
    neutral: ["Market in equilibrium. ⚖️", "Awaiting catalyst.", "Volatility compression active."],
    warning: ["Abnormal volatility detected! ⚠️", "Liquidation cascade imminent.", "Protect capital."],
};

export default function ProphetOracleCard() {
    const { prices } = useCryptoPrices(60000);
    const btc = prices.find(p => p.symbol.toUpperCase() === "BTC");
    const btcTrend = btc ? (btc.change24h > 0.5 ? "Bullish" : btc.change24h < -0.5 ? "Bearish" : "Neutral") : "Neutral";
    const btcColor = btc ? (btc.change24h > 0 ? "text-emerald-400" : "text-red-400") : "text-white";

    const [state, setState] = useState<OracleState>("analyzing");
    const [message, setMessage] = useState("Initializing Prophet AI...");
    const [confidence, setConfidence] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);

    const cardRef = useRef<HTMLDivElement>(null);

    // Simulation of Oracle Analysis
    useEffect(() => {
        const interval = setInterval(() => {
            // Randomly switch states for demo purposes
            const states: OracleState[] = ["bullish", "bearish", "neutral", "warning"];
            const nextState = states[Math.floor(Math.random() * states.length)];

            setState("analyzing");
            setMessage(ORACLE_MESSAGES.analyzing[Math.floor(Math.random() * ORACLE_MESSAGES.analyzing.length)]);

            setTimeout(() => {
                setState(nextState);
                setMessage(ORACLE_MESSAGES[nextState][Math.floor(Math.random() * ORACLE_MESSAGES[nextState].length)]);
                setConfidence(Math.floor(Math.random() * 30) + 70); // 70-100%
            }, 2000);

        }, 15000);
        return () => clearInterval(interval);
    }, []);

    const toggleExpand = () => {
        if (!cardRef.current) return;
        const expanded = !isExpanded;
        setIsExpanded(expanded);
        animate(cardRef.current, {
            height: expanded ? [200, 320] : [320, 200],
            duration: 400,
            easing: expanded ? "easeOutExpo" : "easeInExpo",
        });
    };

    const getStateColor = (s: OracleState) => {
        switch (s) {
            case "bullish": return "#10b981"; // Green
            case "bearish": return "#ef4444"; // Red
            case "warning": return "#f59e0b"; // Amber
            default: return "#6366f1"; // Blue
        }
    };

    const currentColor = getStateColor(state);

    return (
        <div
            ref={cardRef}
            className="zone-card relative h-[200px] rounded-xl border border-white/10 overflow-hidden cursor-pointer hover:border-neon-blue/50 bg-black/40 backdrop-blur-md"
            onClick={() => !isExpanded && toggleExpand()}
        >
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80" />
            <div
                className="absolute inset-x-0 bottom-0 h-1/2 opacity-20 transition-colors duration-1000"
                style={{ background: `radial-gradient(circle at center bottom, ${currentColor}, transparent 70%)` }}
            />

            {/* Content */}
            <div className="relative z-20 h-full p-4 flex flex-col items-center text-center">

                {/* Header */}
                <div className="flex items-center gap-2 mb-4 w-full justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles size={14} className="text-neon-blue" />
                        <span className="text-xs font-bold tracking-widest uppercase text-neon-blue">Prophet Oracle</span>
                    </div>
                    {isExpanded && (
                        <button onClick={(e) => { e.stopPropagation(); toggleExpand(); }}>
                            <X size={14} className="text-white/50 hover:text-white" />
                        </button>
                    )}
                </div>

                {/* Orb Visual */}
                <div className="relative mb-4">
                    <div
                        className="w-16 h-16 rounded-full blur-md transition-all duration-1000 animate-pulse"
                        style={{ backgroundColor: currentColor }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        {state === "analyzing" ? (
                            <div className="animate-spin text-white"><Sparkles size={24} /></div>
                        ) : state === "warning" ? (
                            <AlertTriangle size={24} className="text-white" />
                        ) : (
                            <TrendingUp size={24} className="text-white" />
                        )}
                    </div>
                </div>

                {/* Message */}
                <div className="mb-4">
                    <p className="text-sm font-medium text-white/90 animate-fadeIn">{message}</p>
                    {state !== "analyzing" && (
                        <p className="text-[10px] text-white/50 mt-1 uppercase tracking-wider">
                            Confidence: <span style={{ color: currentColor }}>{confidence}%</span>
                        </p>
                    )}
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                    <div className="w-full space-y-3 animate-fadeIn border-t border-white/10 pt-3">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-white/5 rounded p-2 text-left">
                                <p className="text-[9px] text-white/40 uppercase">BTC Trend</p>
                                <p className={`text-xs font-bold ${btcColor}`}>{btcTrend}</p>
                            </div>
                            <div className="bg-white/5 rounded p-2 text-left">
                                <p className="text-[9px] text-white/40 uppercase">Alt Season</p>
                                <p className="text-xs font-bold text-emerald-400">Loading...</p>
                            </div>
                        </div>
                        <button className="w-full py-2 bg-white/10 hover:bg-white/15 rounded text-[10px] uppercase font-bold tracking-wider transition-colors">
                            View Full Analysis
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
