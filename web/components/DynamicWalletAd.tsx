"use client";

import { useState, useEffect } from "react";

import { Wallet, Sparkles, X, ExternalLink, Activity, Zap } from "lucide-react";
import { getUserPortfolio } from "@/lib/portfolio-service";
import { getHistoricalVolatility, formatChange } from "@/lib/coingecko";

/* 
  Dynamic Wallet Ad Component
  - Disconnected: Prompts to connect for "Premium Signals" + "Rewards"
  - Connected: Shows Targeted Ad (Whale/DeFi) + Portfolio Summary
*/

export default function DynamicWalletAd() {
    const [isConnected, setIsConnected] = useState(false);
    const [ad, setAd] = useState<any>(null);
    const [signals, setSignals] = useState<{ symbol: string; volatility: number }[]>([]);
    const [loading, setLoading] = useState(false);

    // Mock Wallet Connection
    const handleConnect = async () => {
        setLoading(true);

        // 1. Fetch Real Market Signals
        try {
            const [btcVol, ethVol, solVol] = await Promise.all([
                getHistoricalVolatility("bitcoin", 30),
                getHistoricalVolatility("ethereum", 30),
                getHistoricalVolatility("solana", 30)
            ]);

            setSignals([
                { symbol: "BTC", volatility: btcVol },
                { symbol: "ETH", volatility: ethVol },
                { symbol: "SOL", volatility: solVol }
            ]);
        } catch (e) {
            console.error("Failed to fetch signals", e);
        }

        // Simulate delay & profiling
        setTimeout(async () => {
            setIsConnected(true);
            setLoading(false);

            // Mock Ad Fetching based on 'whale' segment (simulated)
            // In production: fetch('http://localhost:3000/api/decision', ...);
            setAd({
                id: 'ad_123',
                title: 'Ledger Stax: Exclusive Edition',
                description: 'Secure your assets in style. Reserved for Whale tier users.',
                cta: 'Shop Now',
                image: 'https://images.unsplash.com/photo-1621416894569-0f39e8467132?auto=format&fit=crop&q=80&w=1000', // Hardware wallet vibe
                sponsor: 'Ledger'
            });
        }, 1500);
    };

    if (!isConnected) {
        return (
            <div className="rounded-xl bg-gradient-to-br from-indigo-900/40 to-black border border-indigo-500/20 p-5 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                {/* Decoration */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                <div className="absolute -top-10 -right-10 w-20 h-20 bg-indigo-500/30 blur-3xl rounded-full" />

                <div className="relative z-10">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/50 flex items-center justify-center mx-auto mb-3 text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                        <Wallet size={20} />
                    </div>
                    <h3 className="font-bold text-white mb-1">Unlock Pro Signals</h3>
                    <p className="text-[10px] text-zinc-400 mb-4 max-w-[200px] leading-relaxed">
                        Connect your wallet to access personalized risk analysis and exclusive airdrops.
                    </p>

                    <button
                        onClick={handleConnect}
                        disabled={loading}
                        className="px-4 py-2 bg-white text-black rounded-lg text-xs font-bold hover:bg-indigo-50 transition-colors shadow-lg shadow-indigo-900/20 disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? 'Connecting...' : (
                            <>
                                Connect Wallet <Sparkles size={12} className="text-indigo-600" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl bg-zinc-900/80 border border-white/5 overflow-hidden flex flex-col h-full relative group">

            {/* Market Pulse Signals (Real Data) */}
            <div className="border-b border-white/5 bg-black/20 p-3">
                <div className="flex items-center gap-2 mb-2">
                    <Activity size={12} className="text-emerald-400" />
                    <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">30d Volatility Pulse</span>
                </div>
                <div className="flex gap-2">
                    {signals.map(s => (
                        <div key={s.symbol} className="flex-1 bg-white/5 rounded p-1.5 text-center">
                            <div className="text-[9px] text-zinc-500 font-bold">{s.symbol}</div>
                            <div className={`text-[10px] font-mono font-bold ${s.volatility > 50 ? 'text-orange-400' : 'text-zinc-300'}`}>
                                {s.volatility}%
                            </div>
                        </div>
                    ))}
                    {signals.length === 0 && <div className="text-[9px] text-zinc-600">Loading signals...</div>}
                </div>
            </div>

            {/* Ad Tag */}
            <div className="absolute top-36 right-2 px-1.5 py-0.5 roundedElement bg-white/10 backdrop-blur text-[8px] font-bold text-white/50 uppercase tracking-widest border border-white/5 z-20">
                Sponsored
            </div>

            {/* Ad Image / Creative */}
            <div className="relative h-24 overflow-hidden mt-0">
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent z-10 opacity-90" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={ad?.image || "https://images.unsplash.com/photo-1639762681485-074b7f938ba0"}
                    alt="Ad"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
            </div>

            {/* Content */}
            <div className="p-4 pt-0 relative z-10 flex-1 flex flex-col">
                <div className="text-[10px] font-bold text-indigo-400 mb-1 flex items-center gap-1.5">
                    {ad?.sponsor} <span className="w-1 h-1 rounded-full bg-zinc-600" /> Wallet Offer
                </div>
                <h3 className="text-sm font-bold text-white leading-tight mb-2">
                    {ad?.title}
                </h3>
                <p className="text-[10px] text-zinc-400 line-clamp-2 mb-3">
                    {ad?.description}
                </p>

                <div className="mt-auto">
                    <button className="w-full py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-xs text-white transition-colors flex items-center justify-center gap-2 group/btn">
                        {ad?.cta} <ExternalLink size={12} className="group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
}
