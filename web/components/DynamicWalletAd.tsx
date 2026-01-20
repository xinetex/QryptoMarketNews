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
import { syncPoints, clearPoints } from "@/lib/points";
import { fetchAdDecision, type AdCreative, trackImpression } from "@/lib/ad-network-client";

/* 
  Dynamic Wallet Ad Component
  - Disconnected: Prompts to connect
  - Connected: Fetches Real Ad from Ad Network (Prophet Ads)
  - Fallback: Shows "Volatility Pulse" if no ad available
*/

import FlexConsole from "./FlexConsole";

// ... (imports remain)

export default function DynamicWalletAd() {
    const { address, isConnected } = useAccount();
    const [ad, setAd] = useState<AdCreative | null>(null);
    const [signals, setSignals] = useState<{ symbol: string; volatility: number }[]>([]);
    const [viewMode, setViewMode] = useState<'console' | 'ad'>('console');

    // Sync Points & Fetch Ad on Connect
    useEffect(() => {
        if (address && isConnected) {
            syncPoints(address).catch(console.error);

            // Fetch Prophet Ad
            fetchAdDecision(address).then(decision => {
                if (decision && decision.ads.length > 0) {
                    setAd(decision.ads[0]);
                    trackImpression(decision.ads[0].id);
                }
            });
        } else if (!address || !isConnected) {
            // Handle cleanup on disconnect
            // We clear local points so badges/UI reset to default
            clearPoints();
            setAd(null);
        }
    }, [address, isConnected]);

    // ... (fetch signals effect remains)

    // 1. DISCONNECTED STATE (Keep existing)
    if (!isConnected) {
        return (
            <div className="rounded-xl bg-gradient-to-br from-indigo-900/40 to-black border border-indigo-500/20 p-5 flex flex-col items-center justify-center text-center relative overflow-hidden group min-h-[260px]">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                <div className="absolute -top-10 -right-10 w-20 h-20 bg-indigo-500/30 blur-3xl rounded-full" />

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/50 flex items-center justify-center mb-3 text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                        <WalletIcon size={20} />
                    </div>
                    <h3 className="font-bold text-white mb-1">Unlock Flex Intelligence</h3>
                    <p className="text-[10px] text-zinc-400 mb-4 max-w-[200px] leading-relaxed">
                        Connect with <strong>Coinbase Smart Wallet</strong> to access professional risk scoring, whale signals, and alpha vectors.
                    </p>

                    <Wallet>
                        <ConnectWallet className="bg-white text-black hover:bg-indigo-50 border-none font-bold text-xs px-4 py-2">
                            <span className="hidden sm:inline">Connect Passport</span>
                            <span className="sm:hidden">Connect</span>
                        </ConnectWallet>
                    </Wallet>
                </div>
            </div>
        );
    }

    // 2. CONNECTED: FLEX CONSOLE (Pro Dashboard)
    return (
        <div className="rounded-xl bg-zinc-900/80 border border-white/5 overflow-hidden flex flex-col h-full relative group min-h-[260px]">
            {/* Console Header / Tabs */}
            <div className="border-b border-white/5 bg-black/40 flex">
                <button
                    onClick={() => setViewMode('console')}
                    className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider ${viewMode === 'console' ? 'text-indigo-400 bg-white/5' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    Intelligence
                </button>
                {ad && (
                    <button
                        onClick={() => setViewMode('ad')}
                        className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 ${viewMode === 'ad' ? 'text-emerald-400 bg-white/5' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Offers <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    </button>
                )}
                <div className="flex-none px-2 flex items-center">
                    <Wallet>
                        <ConnectWallet className="!h-5 !min-h-0 !px-1.5 !py-0 !text-[9px] bg-transparent text-zinc-500 border border-white/5 hover:bg-white/5 rounded-full">
                            <Avatar className="h-3.5 w-3.5" />
                        </ConnectWallet>
                        <WalletDropdown>
                            <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                                <Avatar />
                                <Name />
                                <Address />
                                <EthBalance />
                            </Identity>
                            <WalletDropdownDisconnect className="hover:bg-red-500/10 hover:text-red-400 text-zinc-400 text-[10px] font-bold uppercase tracking-wider transition-colors" />
                        </WalletDropdown>
                    </Wallet>
                </div>
            </div>

            {/* View Switching */}
            {viewMode === 'console' ? (
                <FlexConsole key={address} address={address || ''} signals={signals} />
            ) : ad ? (
                <>
                    {/* Ad View (Existing Logic) */}
                    {/* Ad Tag */}
                    <div className="absolute top-40 right-2 flex gap-1 z-20">
                        <span className="px-1.5 py-0.5 roundedElement bg-white/10 backdrop-blur text-[8px] font-bold text-white/50 uppercase tracking-widest border border-white/5">
                            Ad
                        </span>
                    </div>

                    <div className="relative h-28 overflow-hidden mt-0">
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent z-10 opacity-90" />
                        {ad.contentType.includes('video') ? (
                            <video
                                src={ad.streamUrl}
                                autoPlay muted loop playsInline
                                className="w-full h-full object-cover opacity-90"
                            />
                        ) : (
                            <img
                                src={ad.streamUrl || ad.hdPosterUrl || "https://images.unsplash.com/photo-1639762681485-074b7f938ba0"}
                                alt="Ad"
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>

                    <div className="p-4 pt-2 relative z-10 flex-1 flex flex-col">
                        <div className="text-[10px] font-bold text-indigo-400 mb-1 flex items-center gap-1.5">
                            {ad.customData?.campaignName || 'Partner'} Offer
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
                                className="w-full py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-xs text-emerald-400 transition-colors flex items-center justify-center gap-2 font-bold cursor-pointer"
                            >
                                View Offer <ExternalLink size={12} />
                            </a>
                        </div>
                    </div>
                </>
            ) : null}
        </div>
    );
}

