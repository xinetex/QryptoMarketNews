"use client";

import { useState } from "react";
import { Play, Pause, RotateCcw, Clock, Layers, Zap, Filter } from "lucide-react";

interface GalaxyControlsProps {
    onTimeChange: (offset: number) => void;
    timeOffset: number;
    onToggleLayer: (layer: string, active: boolean) => void;
    activeLayers: Record<string, boolean>;
    isPlaying: boolean;
    onTogglePlay: () => void;
    axes: { x: string; y: string; z: string };
    onAxisChange: (axis: "x" | "y" | "z", value: string) => void;
    colorMode: "category" | "volatility";
    onColorModeChange: (mode: "category" | "volatility") => void;
    scenario: "normal" | "btc_crash" | "eth_surge" | "liquidations";
    onScenarioChange: (scenario: "normal" | "btc_crash" | "eth_surge" | "liquidations") => void;
}

export default function GalaxyControls({
    onTimeChange,
    timeOffset,
    onToggleLayer,
    activeLayers,
    isPlaying,
    onTogglePlay,
    axes,
    onAxisChange,
    colorMode,
    onColorModeChange,
    scenario,
    onScenarioChange
}: GalaxyControlsProps) {
    const [isOpen, setIsOpen] = useState(true);

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        onTimeChange(val);
    };

    return (
        <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-all duration-300 z-20 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 w-[600px] shadow-2xl">
                {/* Header / Toggle */}
                <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                    <div className="flex items-center gap-2 text-white font-bold">
                        <Filter size={16} className="text-neon-blue" />
                        <span>Galaxy Control Deck</span>
                    </div>
                </div>

                <div className="grid grid-cols-[1fr_auto] gap-6">
                    {/* Time Controls */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-white/60 uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                                <Clock size={12} /> Time Travel
                            </div>
                            <span className="text-neon-blue font-mono">{timeOffset === 0 ? "LIVE" : `-${timeOffset}h`}</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={onTogglePlay}
                                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                            >
                                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                            </button>

                            <input
                                type="range"
                                min="0"
                                max="24"
                                step="1"
                                dir="rtl" // Right to left so 0 (Live) is on right? Or standard left-to-right: 24h ago -> Live
                                value={timeOffset}
                                onChange={handleTimeChange}
                                className="w-full accent-neon-blue h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                            />

                            <button
                                onClick={() => { onTimeChange(0); }}
                                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                            >
                                <RotateCcw size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Layer Toggles */}
                    <div className="flex flex-col gap-2 pl-6 border-l border-white/10">
                        <div className="text-xs text-white/60 uppercase tracking-wider flex items-center gap-2 mb-1">
                            <Layers size={12} /> Layers
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={activeLayers.trails}
                                onChange={(e) => onToggleLayer('trails', e.target.checked)}
                                className="w-4 h-4 rounded border-white/30 bg-white/5 checked:bg-neon-blue"
                            />
                            <span className="text-sm text-white/80 group-hover:text-white transition-colors">Orbit Trails</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={activeLayers.ghost}
                                onChange={(e) => onToggleLayer('ghost', e.target.checked)}
                                className="w-4 h-4 rounded border-white/30 bg-white/5 checked:bg-purple-500"
                            />
                            <span className="text-sm text-white/80 group-hover:text-white transition-colors">Ghost Layer (7d)</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={activeLayers.halo}
                                onChange={(e) => onToggleLayer('halo', e.target.checked)}
                                className="w-4 h-4 rounded border-white/30 bg-white/5 checked:bg-pink-500"
                            />
                            <span className="text-sm text-white/80 group-hover:text-white transition-colors">Risk Halos</span>
                        </label>
                    </div>

                    {/* Axis Controls */}
                    <div className="flex flex-col gap-2 pl-6 border-l border-white/10">
                        <div className="text-xs text-white/60 uppercase tracking-wider mb-1">Dimensions</div>
                        {["x", "y", "z"].map((axis) => (
                            <div key={axis} className="flex items-center gap-2 text-xs">
                                <span className="uppercase text-white/40 w-2">{axis}</span>
                                <select
                                    value={axes[axis as "x" | "y" | "z"]}
                                    onChange={(e) => onAxisChange(axis as "x" | "y" | "z", e.target.value)}
                                    className="bg-white/5 border border-white/10 rounded px-2 py-1 text-white/80"
                                >
                                    <option value="mcap">Market Cap</option>
                                    <option value="volume">Volume</option>
                                    <option value="change">24h Change</option>
                                    <option value="volatility">Volatility</option>
                                    <option value="fdv">FDV</option>
                                </select>
                            </div>
                        ))}
                    </div>

                    {/* Color Mode */}
                    <div className="flex flex-col gap-2 pl-6 border-l border-white/10">
                        <div className="text-xs text-white/60 uppercase tracking-wider mb-1">Coloring</div>
                        <div className="flex flex-col gap-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="colorMode"
                                    checked={colorMode === "category"}
                                    onChange={() => onColorModeChange("category")}
                                    className="w-4 h-4 border-white/30 bg-white/5 checked:bg-neon-blue"
                                />
                                <span className="text-sm text-white/80">Category</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="colorMode"
                                    checked={colorMode === "volatility"}
                                    onChange={() => onColorModeChange("volatility")}
                                    className="w-4 h-4 border-white/30 bg-white/5 checked:bg-red-500"
                                />
                                <span className="text-sm text-white/80">Risk/Vol</span>
                            </label>
                        </div>
                    </div>

                    {/* Risk Engine / Scenarios */}
                    <div className="flex flex-col gap-2 pl-6 border-l border-white/10">
                        <div className="text-xs text-neon-red uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Zap size={12} /> Risk Engine
                        </div>
                        <select
                            value={scenario}
                            onChange={(e) => onScenarioChange(e.target.value as any)}
                            className="bg-red-900/20 border border-red-500/30 rounded px-2 py-1 text-white/90 text-sm focus:outline-none focus:border-red-500"
                        >
                            <option value="normal">Normal Market</option>
                            <option value="btc_crash">BTC Crash (-20%)</option>
                            <option value="eth_surge">ETH Surge (+15%)</option>
                            <option value="liquidations">Liquidation Cascade</option>
                        </select>
                        <div className="text-[10px] text-white/40 max-w-[120px] leading-tight">
                            Simulate market stress events to test portfolio resilience.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
