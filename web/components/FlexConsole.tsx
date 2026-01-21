"use client";

import { useState, useEffect } from "react";
import { Wallet as WalletIcon, ExternalLink, LogOut, Trophy, Activity } from "lucide-react";
import { useAccount, useDisconnect } from 'wagmi';
import {
    ConnectWallet,
    Wallet,
    WalletDropdown,
    WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import {
    Address,
    Avatar,
    Name,
    Identity,
    EthBalance,
} from '@coinbase/onchainkit/identity';
import { syncWithBackend as syncPoints, clearProfile as clearPoints } from "@/lib/points";
import { fetchAdDecision, type AdCreative, trackImpression } from "@/lib/ad-network-client";
import PointsSystemInfo from "./PointsSystemInfo";

/* 
  FlexConsole Component
  - Disconnected: Prompts to connect
  - Connected: Tabbed Interface (Wallet | Oracle)
    - Wallet Tab: Displays Ad/Signals logic (Legacy DynamicWalletAd)
    - Oracle Tab: Displays PointsSystemInfo
*/

export default function FlexConsole() {
    const { address, isConnected } = useAccount();
    const { disconnect } = useDisconnect();

    // Global Console State
    const [activeTab, setActiveTab] = useState<'wallet' | 'oracle'>('wallet');

    // Wallet/Ad State
    const [ad, setAd] = useState<AdCreative | null>(null);
    const [walletViewMode, setWalletViewMode] = useState<'console' | 'ad'>('console');

    // Sync Points & Fetch Ad on Connect
    useEffect(() => {
        if (address && isConnected) {
            syncPoints(address).catch(console.error);

            // Fetch Prophet Ad
            fetchAdDecision(address).then(decision => {
                if (decision && decision.ads.length > 0) {
                    setAd(decision.ads[0]);
                    trackImpression(decision.ads[0].id);
                    // Optional: Auto-switch to ad if desired, but maybe intrusive
                }
            });
        } else if (!address || !isConnected) {
            clearPoints();
            setAd(null);
        }
    }, [address, isConnected]);

    // 1. DISCONNECTED STATE
    if (!isConnected) {
        return (
            <div className="rounded-xl bg-gradient-to-br from-indigo-900/40 to-black border border-indigo-500/20 p-5 flex flex-col items-center justify-center text-center relative overflow-hidden group min-h-[500px] h-full">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/30 blur-3xl rounded-full" />

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/50 flex items-center justify-center mb-4 text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                        <WalletIcon size={24} />
                    </div>
                    <h3 className="font-bold text-white text-lg mb-2">Flex Intelligence</h3>
                    <p className="text-xs text-zinc-400 mb-6 max-w-[200px] leading-relaxed">
                        Connect with <strong>Coinbase Smart Wallet</strong> to access professional risk scoring, whale signals, and your Oracle profile.
                    </p>

                    <Wallet>
                        <ConnectWallet className="bg-white text-black hover:bg-indigo-50 border-none font-bold text-xs px-6 py-3 rounded-full transition-all hover:scale-105">
                            <span>Connect Passport</span>
                        </ConnectWallet>
                    </Wallet>
                </div>
            </div>
        );
    }

    // 2. CONNECTED: FLEX CONSOLE
    return (
        <div className="rounded-xl bg-zinc-900/80 border border-white/5 overflow-hidden flex flex-col h-full relative group shadow-2xl backdrop-blur-sm">
            {/* Console Header / Navigation */}
            <div className="flex items-center justify-between border-b border-white/5 bg-black/40 px-2 py-1.5 shrink-0">
                {/* Tabs */}
                <div className="flex gap-1 bg-white/5 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('wallet')}
                        className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${activeTab === 'wallet'
                            ? 'bg-indigo-500/20 text-indigo-300 shadow-sm'
                            : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                            }`}
                    >
                        <Activity size={12} />
                        Wallet
                    </button>
                    <button
                        onClick={() => setActiveTab('oracle')}
                        className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${activeTab === 'oracle'
                            ? 'bg-purple-500/20 text-purple-300 shadow-sm'
                            : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                            }`}
                    >
                        <Trophy size={12} />
                        Oracle
                    </button>
                </div>

                {/* Identity / Disconnect */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            disconnect();
                            clearPoints();
                        }}
                        className="p-1.5 rounded-full hover:bg-red-500/10 text-zinc-600 hover:text-red-400 transition-colors"
                        title="Disconnect"
                    >
                        <LogOut size={12} />
                    </button>
                    <div className="scale-90 origin-right">
                        <Wallet>
                            <ConnectWallet className="!h-6 !min-h-0 !px-2 !py-0 !text-[10px] bg-transparent text-zinc-400 border border-white/10 hover:bg-white/5 rounded-full">
                                <Avatar className="h-4 w-4" />
                                <Name className="!text-zinc-300" />
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
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative">
                {activeTab === 'wallet' && (
                    <div className="h-full flex flex-col">
                        {/* Sub-Tabs for Wallet View (Console vs Ad) */}
                        <div className="flex border-b border-white/5 bg-black/20">
                            <button
                                onClick={() => setWalletViewMode('console')}
                                className={`flex-1 py-1.5 text-[9px] font-bold uppercase tracking-wider ${walletViewMode === 'console' ? 'text-indigo-400 bg-white/5' : 'text-zinc-600 hover:text-zinc-400'}`}
                            >
                                Signals
                            </button>
                            {ad && (
                                <button
                                    onClick={() => setWalletViewMode('ad')}
                                    className={`flex-1 py-1.5 text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 ${walletViewMode === 'ad' ? 'text-emerald-400 bg-white/5' : 'text-zinc-600 hover:text-zinc-400'}`}
                                >
                                    Offers <span className="w-1 h-1 rounded-full bg-emerald-500" />
                                </button>
                            )}
                        </div>

                        {/* Wallet Content */}
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            {walletViewMode === 'console' ? (
                                <div className="space-y-4">
                                    <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                                        <div className="flex items-center gap-2 mb-2 text-indigo-400">
                                            <Activity size={14} />
                                            <span className="text-xs font-bold uppercase">Market Pulse</span>
                                        </div>
                                        <div className="text-2xl font-bold text-white mb-1">
                                            {/* Logic from getHistoricalVolatility or similar could go here */}
                                            {/* For now, simplified placeholder logic matching previous component if needed */}
                                            Low Volatility
                                        </div>
                                        <p className="text-[10px] text-zinc-500">
                                            Market conditions are currently stable. Good for accumulation.
                                        </p>
                                    </div>
                                    {/* Add more wallet/signal stats here */}
                                </div>
                            ) : ad ? (
                                <div className="h-full flex flex-col">
                                    <div className="relative h-32 overflow-hidden rounded-lg mb-3 shrink-0">
                                        {ad.contentType.includes('video') ? (
                                            <video
                                                src={ad.streamUrl}
                                                autoPlay muted loop playsInline
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <img
                                                src={ad.streamUrl || ad.hdPosterUrl || "https://images.unsplash.com/photo-1639762681485-074b7f938ba0"}
                                                alt="Ad"
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur text-[8px] font-bold text-white/50 uppercase border border-white/10">
                                            Ad
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="font-bold text-white">{ad.title}</h3>
                                        <p className="text-xs text-zinc-400">{ad.description}</p>
                                        <a
                                            href={ad.tracking?.clickUrl || '#'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block w-full py-2 mt-4 text-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-colors"
                                        >
                                            View Offer <ExternalLink size={10} className="inline ml-1" />
                                        </a>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                )}

                {activeTab === 'oracle' && (
                    <PointsSystemInfo />
                )}
            </div>
        </div>
    );
}
