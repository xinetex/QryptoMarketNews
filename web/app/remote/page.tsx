"use client";

import { useState } from "react";

export default function RemotePage() {
    const [activeZone, setActiveZone] = useState("Home");

    // Mock list of zones to control
    const zones = [
        { id: "solana", name: "Solana" },
        { id: "ai", name: "AI Agents" },
        { id: "memes", name: "Meme Trenches" },
        { id: "rwa", name: "Real World Assets" },
    ];

    return (
        <div className="min-h-screen bg-black text-white p-4">
            <header className="flex justify-between items-center mb-8 pt-4">
                <h1 className="text-xl font-bold text-purple-400">Prophet TV Remote</h1>
                <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                    CONNECTED
                </div>
            </header>

            <div className="grid grid-cols-2 gap-4 mb-8">
                {zones.map((zone) => (
                    <button
                        key={zone.id}
                        onClick={() => setActiveZone(zone.name)}
                        className={`p-6 rounded-2xl border transition-all ${activeZone === zone.name
                                ? "bg-purple-600 border-purple-400 shadow-lg shadow-purple-900/30"
                                : "bg-slate-900 border-slate-800 hover:bg-slate-800"
                            }`}
                    >
                        <div className="font-bold text-lg">{zone.name}</div>
                    </button>
                ))}
            </div>

            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
                <h2 className="text-xs uppercase tracking-widest text-slate-500 mb-4">
                    Now Playing
                </h2>
                <div className="text-2xl font-bold mb-2">{activeZone}</div>
                <div className="text-slate-400 text-sm">
                    Displaying market intelligence on big screen...
                </div>
            </div>

            <div className="mt-8 text-center text-xs text-slate-700">
                Phase 2 Complete • Remote Active
            </div>
        </div>
    );
}
