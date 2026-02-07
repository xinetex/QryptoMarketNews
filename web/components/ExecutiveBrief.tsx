'use client';
import { Newspaper, Sparkles } from 'lucide-react';

export default function ExecutiveBrief() {
    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-zinc-400 font-mono text-sm tracking-widest flex items-center gap-2">
                    <Newspaper className="w-4 h-4 text-zinc-500" />
                    EXECUTIVE BRIEF
                </h2>
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            </div>

            <div className="space-y-4 font-mono text-sm leading-relaxed text-zinc-300">
                <div className="flex gap-3">
                    <span className="text-zinc-600 select-none">01</span>
                    <p>
                        <span className="text-white font-bold">Regulatory Headwind:</span> SEC enforcement action against Kraken staking services may impact ETH yield. Consider rotating 20% of staked ETH to decentralized providers (Lido/RocketPool) to mitigate improved counterparty risk.
                    </p>
                </div>
                <div className="flex gap-3">
                    <span className="text-zinc-600 select-none">02</span>
                    <p>
                        <span className="text-white font-bold">Solana Congestion:</span> Network degradation expected over next 48h due to new NFT mint. bridging large SOL positions may face delays/slippage. Recommendation: Hold transfer execution.
                    </p>
                </div>
                <div className="flex gap-3">
                    <span className="text-zinc-600 select-none">03</span>
                    <p>
                        <span className="text-white font-bold">Macro Correlation:</span> BTC/SPX correlation hitting 6-month lows. Good time to re-balance hedging strategy as crypto decouples from trad-fi risk assets.
                    </p>
                </div>
            </div>

            <div className="mt-auto pt-6 text-center">
                <button className="text-xs text-zinc-500 hover:text-white transition-colors border-b border-zinc-800 hover:border-white pb-0.5">
                    REQUEST DEEP DIVE ANALYSIS
                </button>
            </div>
        </div>
    );
}
