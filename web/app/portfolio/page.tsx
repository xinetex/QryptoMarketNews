"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function PortfolioPage() {
    const [watchlist, setWatchlist] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchWatchlist();
    }, []);

    const fetchWatchlist = async () => {
        const res = await fetch('/api/user/watchlist');
        const data = await res.json();
        setWatchlist(data.items || []);
        setLoading(false);
    };

    const updateWatchlist = async (action: 'add' | 'remove', coin: any) => {
        // Optimistic update
        if (action === 'remove') {
            setWatchlist(prev => prev.filter(c => c.id !== coin.id));
        }

        await fetch('/api/user/watchlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, coin })
        });

        if (action === 'add') fetchWatchlist();
    };

    // SEARCH MOCK (Ideally hits CoinGecko search API)
    const SEARCH_RESULTS = [
        { id: "pepe", symbol: "pepe", name: "Pepe", price: 0.000008 },
        { id: "dogecoin", symbol: "doge", name: "Dogecoin", price: 0.16 },
        { id: "cardano", symbol: "ada", name: "Cardano", price: 0.45 },
        { id: "fetch-ai", symbol: "fet", name: "Fetch.ai", price: 2.10 }
    ].filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="min-h-screen bg-black text-white p-6 pb-24">
            <h1 className="text-2xl font-bold mb-2 tracking-wide text-[#10b981]">MY PORTFOLIO</h1>
            <p className="text-gray-500 mb-8 text-sm">Manage your TV watchlist from here.</p>

            {/* WATCHLIST */}
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Watching ({watchlist.length})</h2>
            <div className="space-y-3 mb-10">
                {watchlist.map(coin => (
                    <motion.div layout key={coin.id} className="bg-[#111] p-4 rounded-xl border border-[#333] flex justify-between items-center">
                        <div>
                            <div className="font-bold">{coin.name}</div>
                            <div className="text-xs text-gray-500 uppercase">{coin.symbol}</div>
                        </div>
                        <button
                            onClick={() => updateWatchlist('remove', coin)}
                            className="text-red-500 bg-red-500/10 px-3 py-1 rounded-lg text-xs font-bold"
                        >
                            REMOVE
                        </button>
                    </motion.div>
                ))}
            </div>

            {/* ADD COIN */}
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Add Coins</h2>
            <input
                type="text"
                placeholder="Search coins..."
                className="w-full bg-[#222] border border-[#333] p-4 rounded-xl mb-4 text-white focus:outline-none focus:border-[#10b981]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            {search && (
                <div className="space-y-3">
                    {SEARCH_RESULTS.map(coin => (
                        <div key={coin.id} className="bg-[#111] p-4 rounded-xl border border-[#333] flex justify-between items-center opacity-80 hover:opacity-100">
                            <div>
                                <div className="font-bold">{coin.name}</div>
                                <div className="text-xs text-green-400">${coin.price}</div>
                            </div>
                            <button
                                onClick={() => {
                                    updateWatchlist('add', coin);
                                    setSearch("");
                                }}
                                className="text-[#10b981] bg-[#10b981]/10 px-3 py-1 rounded-lg text-xs font-bold"
                            >
                                ADD +
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
