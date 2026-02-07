'use client';
import { ArrowRight, Eye, Globe, Anchor } from 'lucide-react';
import { useState, useEffect } from 'react';

interface AlphaEvent {
    id: string;
    time: string;
    entity: string;
    action: string;
    asset: string;
    amount: string;
    chain: string;
    impact: 'high' | 'medium' | 'low';
}

export default function AlphaStream() {
    const [events, setEvents] = useState<AlphaEvent[]>([
        {
            id: '1',
            time: '10:42 AM',
            entity: 'Wintermute',
            action: 'Transfer -> Arbitrum Bridge',
            asset: 'USDC',
            amount: '$10.5M',
            chain: 'ETH',
            impact: 'high'
        },
        {
            id: '2',
            time: '10:38 AM',
            entity: 'Amber Group',
            action: 'Deposit -> Binance',
            asset: 'ETH',
            amount: '4,500 ETH',
            chain: 'ETH',
            impact: 'medium'
        },
        {
            id: '3',
            time: '10:15 AM',
            entity: 'Jump Trading',
            action: 'Accumulation',
            asset: 'SOL',
            amount: '$2.3M',
            chain: 'SOL',
            impact: 'medium'
        }
    ]);

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-zinc-400 font-mono text-sm tracking-widest flex items-center gap-2">
                    <Eye className="w-4 h-4 text-indigo-500" />
                    INSTITUTIONAL FLOW (SHADOW)
                </h2>
                <div className="flex gap-2">
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/30">OTC</span>
                    <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-zinc-700">CEX</span>
                </div>
            </div>

            <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                {events.map((event) => (
                    <div key={event.id} className="group relative pl-4 pb-4 border-l border-zinc-800 last:border-0 last:pb-0">
                        <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-zinc-800 group-hover:bg-indigo-500 transition-colors border border-zinc-950" />

                        <div className="bg-zinc-950/30 hover:bg-zinc-900 transition-colors p-3 rounded border border-zinc-800/50">
                            <div className="flex justify-between items-start mb-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-zinc-200 text-sm">{event.entity}</span>
                                    <span className="text-[10px] text-zinc-500 font-mono">{event.time}</span>
                                </div>
                                <div className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${event.impact === 'high' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-zinc-800 text-zinc-500'
                                    }`}>
                                    {event.impact}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
                                <span className="text-zinc-500">{event.action}</span>
                            </div>

                            <div className="flex items-center justify-between bg-zinc-950 rounded p-2 border border-zinc-800/30">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold">
                                        {event.asset.substring(0, 1)}
                                    </div>
                                    <span className="font-mono text-sm text-white">{event.amount}</span>
                                </div>
                                <div className="text-[10px] text-zinc-600 font-mono flex items-center gap-1">
                                    <Globe className="w-3 h-3" />
                                    {event.chain}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
