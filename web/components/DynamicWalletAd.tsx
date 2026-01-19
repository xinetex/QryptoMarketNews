"use client";

import { useState, useEffect } from "react";
import { Wallet as WalletIcon, ExternalLink, Activity, Sparkles, Target } from "lucide-react";
import { getHistoricalVolatility } from "@/lib/coingecko";
import { useAccount } from 'wagmi';
import {
    ConnectWallet,
    Wallet,
    WalletDropdown,
    WalletDropdownDisconnect,
    WalletDropdownLink
} from '@coinbase/onchainkit/wallet';
import {
    Address,
    Avatar,
    Name,
    Identity,
    EthBalance,
} from '@coinbase/onchainkit/identity';
import { syncPoints } from "@/lib/points";
import { fetchAdDecision, type AdCreative, trackImpression } from "@/lib/ad-network-client";

/* 
  Dynamic Wallet Ad Component
  - Disconnected: Prompts to connect
  - Connected: Fetches Real Ad from Ad Network (Prophet Ads)
  - Fallback: Shows "Volatility Pulse" if no ad available
*/

export default function DynamicWalletAd() {
    const { address, isConnected } = useAccount();
    const [ad, setAd] = useState<AdCreative | null>(null);
    const [signals, setSignals] = useState<{ symbol: string; volatility: number }[]>([]);

    // Sync Points & Fetch Ad on Connect
    useEffect(() => {
        if (address) {
            syncPoints(address).catch(console.error);

            // Fetch Prophet Ad
            fetchAdDecision(address).then(decision => {
                if (decision && decision.ads.length > 0) {
                    setAd(decision.ads[0]);
                    trackImpression(decision.ads[0].id);
                }
            });
        }
    }, [address]);

    // Data Fetching Effect (Pulse Signals)
    useEffect(() => {
        const fetchData = async () => {
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
        };
        fetchData();
    }, []);

    // 1. DISCONNECTED STATE
    if (!isConnected) {
        return (
            <div className="rounded-xl bg-gradient-to-br from-indigo-900/40 to-black border border-indigo-500/20 p-5 flex flex-col items-center justify-center text-center relative overflow-hidden group min-h-[220px]">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                <div className="absolute -top-10 -right-10 w-20 h-20 bg-indigo-500/30 blur-3xl rounded-full" />

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/50 flex items-center justify-center mb-3 text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                        <WalletIcon size={20} />
                    </div>
                    <h3 className="font-bold text-white mb-1">Unlock Pro Signals</h3>
                    <p className="text-[10px] text-zinc-400 mb-4 max-w-[200px] leading-relaxed">
                        Connect with <strong>Coinbase Smart Wallet</strong> (Passkeys) or any wallet to access personalized risk analysis.
                    </p>

                    <Wallet>
                        <ConnectWallet className="bg-white text-black hover:bg-indigo-50 border-none font-bold text-xs">
                            <Avatar className="h-6 w-6" />
                            <Name />
                        </ConnectWallet>
                    </Wallet>
                </div>
            </div>
        );
    }

    // 2. CONNECTED: SHOW AD OR PULSE
    // Use Ad if available, otherwise Pulse display is essentially the container below

    return (
        <div className="rounded-xl bg-zinc-900/80 border border-white/5 overflow-hidden flex flex-col h-full relative group min-h-[220px]">

            {/* HEADER: Always show Pulse summary + Identity */}
            <div className="border-b border-white/5 bg-black/20 p-3">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Activity size={12} className="text-emerald-400" />
                        <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">30d Volatility Pulse</span>
                    </div>
                    <Wallet>
                        <ConnectWallet className="!h-6 !min-h-0 !px-2 !py-0 !text-[10px] bg-transparent border border-white/10 hover:bg-white/5">
                            <Avatar className="h-4 w-4" />
                            <Name className="text-zinc-400" />
                        </ConnectWallet>
                        <WalletDropdown>
                            <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                                <Avatar />
                                <Name />
                                <Address />
                                <EthBalance />
                            </Identity>
                            <WalletDropdownLink icon="wallet" href="https://keys.coinbase.com">Wallet</WalletDropdownLink>
                            <WalletDropdownDisconnect />
                        </WalletDropdown>
                    </Wallet>
                </div>
                {/* Mini Signal Bar */}
                <div className="flex gap-2">
                    {signals.map(s => (
                        <div key={s.symbol} className="flex-1 bg-white/5 rounded p-1.5 text-center">
                            <div className="text-[9px] text-zinc-500 font-bold">{s.symbol}</div>
                            <div className={`text-[10px] font-mono font-bold ${s.volatility > 50 ? 'text-orange-400' : 'text-zinc-300'}`}>
                                {s.volatility}%
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* AD CONTENT AREA */}
            {ad ? (
                <>
                    {/* Ad Tag */}
                    <div className="absolute top-36 right-2 flex gap-1 z-20">
                        <span className="px-1.5 py-0.5 roundedElement bg-white/10 backdrop-blur text-[8px] font-bold text-white/50 uppercase tracking-widest border border-white/5">
                            Ad
                        </span>
                        {ad.customData?.walletTargeted && (
                            <span className="px-1.5 py-0.5 roundedElement bg-indigo-500/80 backdrop-blur text-[8px] font-bold text-white uppercase tracking-widest border border-indigo-400/20 flex items-center gap-1">
                                <Target size={8} /> Pick
                            </span>
                        )}
                    </div>

                    <div className="relative h-24 overflow-hidden mt-0">
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent z-10 opacity-90" />
                        {ad.contentType.includes('video') ? (
                            <video
                                src={ad.streamUrl}
                                autoPlay muted loop playsInline
                                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition duration-500"
                            />
                        ) : (
                            <img
                                src={ad.streamUrl || ad.hdPosterUrl || "https://images.unsplash.com/photo-1639762681485-074b7f938ba0"}
                                alt="Ad"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                        )}
                    </div>

                    <div className="p-4 pt-0 relative z-10 flex-1 flex flex-col">
                        <div className="text-[10px] font-bold text-indigo-400 mb-1 flex items-center gap-1.5">
                            {ad.customData?.campaignName || 'Partner'} <span className="w-1 h-1 rounded-full bg-zinc-600" /> Offer
                        </div>
                        <h3 className="text-sm font-bold text-white leading-tight mb-2">
                            {ad.title}
                        </h3>
                        <p className="text-[10px] text-zinc-400 line-clamp-2 mb-3">
                            {ad.description || 'Exclusive offer for our premium users.'}
                        </p>

                        <div className="mt-auto">
                            <a
                                href={ad.tracking?.clickUrl || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => console.log('Clicked ad:', ad.id)}
                                className="w-full py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-xs text-white transition-colors flex items-center justify-center gap-2 group/btn cursor-pointer"
                            >
                                View Offer <ExternalLink size={12} className="group-hover/btn:translate-x-0.5 transition-transform" />
                            </a>
                        </div>
                    </div>
                </>
            ) : (
                /* NO AD FALLBACK (e.g. Just a placeholder or nothing) */
                <div className="flex-1 flex items-center justify-center text-zinc-600 text-xs p-4">
                    <span className="opacity-50">Market Intelligence Active</span>
                </div>
            )}
        </div>
    );
}
