'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Tv, Wallet, Trophy, Shield, ChevronDown, ChevronUp } from 'lucide-react';

const SECTIONS = [
    {
        id: 'mission',
        icon: Shield,
        title: 'THE MISSION',
        content: `Prophet TV is a next-generation market intelligence terminal. We do not just track prices; we track *momentum*. By synthesizing volatility, volume anomalies, and sentiment vectors, our Sentinel AI provides a "living" feed of the crypto markets. This is not financial advice; it is tactical situational awareness.`
    },
    {
        id: 'points',
        icon: Trophy,
        title: 'REPUTATION PROTOCOL (POINTS)',
        content: `In the Prophet ecosystem, Attention is Currency. You earn Reputation Points (RP) for:
        • **Validating the Oracle**: Making correct market predictions (+50 RP).
        • **Standing Watch**: Streaming the Intelligence Feed on Roku or Web (+1 RP/min).
        • **Consistency**: Daily check-ins and streaks.
        
        Your Rank (Bronze -> Prophet) determines your access to advanced tools and "Whale-Tier" insights.`
    },
    {
        id: 'ecosystem',
        icon: Tv,
        title: 'CROSS-PLATFORM SYNC',
        content: `Your identity is portable. Connect your wallet to sync your Reputation across:
        • **The Web Terminal**: Deep analysis and prediction markets.
        • **Prophet TV (Roku)**: Lean-back "ambient" intelligence for your office or living room.
        
        Scan the QR code on your TV to pair detailed analytics with the big screen experience.`
    },
    {
        id: 'wallet',
        icon: Wallet,
        title: 'SMART WALLET INTEGRATION',
        content: `Powered by OnchainKit, our platform uses your wallet as your passport. No passwords, no emails. Just cryptographic proof of identity. We support seamless "Passkey" login via Coinbase Smart Wallet for a friction-free experience.`
    }
];

export default function ProphetManual() {
    const [expanded, setExpanded] = useState<string | null>(null);

    return (
        <div className="w-full max-w-4xl mx-auto mt-12 mb-24 space-y-4">
            <div className="flex items-center gap-4 mb-8">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Book size={12} /> System Manual
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SECTIONS.map((section) => {
                    const isOpen = expanded === section.id;
                    const Icon = section.icon;

                    return (
                        <motion.div
                            key={section.id}
                            className={`border rounded-xl transition-all duration-300 overflow-hidden cursor-pointer ${isOpen
                                    ? 'bg-zinc-900 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.1)] col-span-1 md:col-span-2'
                                    : 'bg-zinc-950/50 border-white/5 hover:border-white/10 hover:bg-zinc-900/50'
                                }`}
                            onClick={() => setExpanded(isOpen ? null : section.id)}
                            layout
                        >
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${isOpen ? 'bg-indigo-500/20 text-indigo-400' : 'bg-zinc-800 text-zinc-400'}`}>
                                        <Icon size={18} />
                                    </div>
                                    <h3 className={`font-bold text-sm tracking-wide ${isOpen ? 'text-white' : 'text-zinc-400'}`}>
                                        {section.title}
                                    </h3>
                                </div>
                                {isOpen ? <ChevronUp size={16} className="text-zinc-500" /> : <ChevronDown size={16} className="text-zinc-500" />}
                            </div>

                            <AnimatePresence>
                                {isOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                    >
                                        <div className="px-4 pb-6 pl-14 text-sm text-zinc-400 leading-relaxed font-mono whitespace-pre-line">
                                            {section.content}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>

            <div className="text-center pt-8">
                <p className="text-[10px] text-zinc-600 uppercase tracking-widest">
                    Authorized Personnel Only • Prophet TV © 2026
                </p>
            </div>
        </div>
    );
}
