import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Clock, Layers, Zap, Filter, ChevronDown, ChevronUp, Maximize2, Minimize2 } from "lucide-react";
import { animate, stagger } from "animejs";

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
    scenario: "normal" | "btc_crash" | "eth_surge" | "liquidations" | "stable_depeg";
    onScenarioChange: (scenario: "normal" | "btc_crash" | "eth_surge" | "liquidations" | "stable_depeg") => void;
    severity: number;
    onSeverityChange: (severity: number) => void;
    portfolioStats?: {
        currentVal: number;
        projectedVal: number;
        pnl: number;
        pnlPercent: number;
    } | null;
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
    onScenarioChange,
    severity,
    onSeverityChange,
    portfolioStats
}: GalaxyControlsProps) {
    const [isMinimized, setIsMinimized] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const timeRef = useRef<HTMLDivElement>(null);
    const layersRef = useRef<HTMLDivElement>(null);
    const axesRef = useRef<HTMLDivElement>(null);
    const colorsRef = useRef<HTMLDivElement>(null);
    const riskRef = useRef<HTMLDivElement>(null);

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        onTimeChange(val);
    };

    // ... existing useEffect ...
    useEffect(() => {
        if (!containerRef.current) return;

        // Animate container up
        animate(containerRef.current, {
            translateY: [50, 0],
            opacity: [0, 1],
            duration: 800,
            easing: "easeOutExpo",
            delay: 200
        });

        // Stagger children
        animate(
            [
                timeRef.current,
                layersRef.current,
                axesRef.current,
                colorsRef.current,
                riskRef.current
            ],
            {
                translateY: [20, 0],
                opacity: [0, 1],
                delay: stagger(100, { start: 400 }),
                duration: 600,
                easing: "easeOutQuad"
            }
        );
    }, []);

    const toggleMinimize = () => {
        setIsMinimized(!isMinimized);
        // Animate height/content
        if (contentRef.current) {
            if (!isMinimized) {
                // Minimizing
                animate(contentRef.current, {
                    height: 0,
                    opacity: 0,
                    duration: 400,
                    easing: "easeInOutQuad"
                });
            } else {
                // Maximizing
                animate(contentRef.current, {
                    height: ["0px", "180px"], // Approx height
                    opacity: [0, 1],
                    duration: 400,
                    easing: "easeInOutQuad"
                });
            }
        }
    };

    return (
        <div
            ref={containerRef}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50 opacity-0"
        >
            <div className="bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl w-[700px] shadow-2xl overflow-hidden ring-1 ring-white/5 relative">

                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neon-blue/50 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

                {/* Header / Toggle */}
                <div
                    className="flex items-center justify-between px-6 py-3 cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={toggleMinimize}
                >
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-neon-blue/10 border border-neon-blue/30">
                            <Filter size={14} className="text-neon-blue" />
                        </div>
                        <span className="text-white font-bold tracking-wide text-sm font-mono uppercase">Galaxy Control Deck</span>

                        {/* Live Indicator */}
                        {isPlaying && (
                            <span className="flex h-2 w-2 relative ml-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-blue opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-blue"></span>
                            </span>
                        )}
                    </div>

                    <button className="text-white/40 hover:text-white transition-colors">
                        {isMinimized ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                </div>

                {/* Main Content Area */}
                <div ref={contentRef} className="overflow-hidden">
                    <div className="px-6 pb-6 pt-2 grid grid-cols-[1.2fr_auto_auto_auto_auto] gap-8">

                        {/* Time Controls */}
                        <div ref={timeRef} className="space-y-3 opacity-0">
                            <div className="flex items-center justify-between text-[10px] text-white/40 uppercase tracking-widest font-bold">
                                <div className="flex items-center gap-1.5">
                                    <Clock size={10} /> Time Travel
                                </div>
                                <span className={`font-mono ${timeOffset === 0 ? "text-neon-blue" : "text-amber-400"}`}>
                                    {timeOffset === 0 ? "LIVE FEED" : `T-${timeOffset}H`}
                                </span>
                            </div>

                            <div className="bg-white/5 rounded-xl p-2 flex items-center gap-3 border border-white/5">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onTogglePlay(); }}
                                    className={`p-2 rounded-lg transition-all active:scale-95 ${isPlaying ? "bg-neon-blue text-black shadow-glow-blue" : "bg-white/10 text-white hover:bg-white/20"}`}
                                >
                                    {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                                </button>

                                <input
                                    type="range"
                                    min="0"
                                    max="24"
                                    step="1"
                                    dir="rtl"
                                    value={timeOffset}
                                    onChange={handleTimeChange}
                                    className="w-full accent-neon-blue h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer hover:bg-white/20 transition-colors"
                                />

                                <button
                                    onClick={(e) => { e.stopPropagation(); onTimeChange(0); }}
                                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors text-[10px] font-bold"
                                    title="Reset to Live"
                                >
                                    LIVE
                                </button>
                            </div>
                        </div>

                        {/* Layer Toggles */}
                        <div ref={layersRef} className="flex flex-col gap-2 pl-6 border-l border-white/5 opacity-0">
                            <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold flex items-center gap-1.5 mb-1">
                                <Layers size={10} /> Layers
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer group select-none">
                                <div className={`w-3 h-3 rounded-full border transition-all ${activeLayers.trails ? "bg-neon-blue border-neon-blue shadow-glow-blue-sm" : "border-white/30 bg-transparent"}`} />
                                <input type="checkbox" className="hidden" checked={activeLayers.trails} onChange={(e) => onToggleLayer('trails', e.target.checked)} />
                                <span className="text-xs text-white/60 group-hover:text-white transition-colors">Trails</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer group select-none">
                                <div className={`w-3 h-3 rounded-full border transition-all ${activeLayers.ghost ? "bg-purple-500 border-purple-500 shadow-glow-purple-sm" : "border-white/30 bg-transparent"}`} />
                                <input type="checkbox" className="hidden" checked={activeLayers.ghost} onChange={(e) => onToggleLayer('ghost', e.target.checked)} />
                                <span className="text-xs text-white/60 group-hover:text-white transition-colors">Ghost (7d)</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer group select-none">
                                <div className={`w-3 h-3 rounded-full border transition-all ${activeLayers.halo ? "bg-pink-500 border-pink-500 shadow-glow-pink-sm" : "border-white/30 bg-transparent"}`} />
                                <input type="checkbox" className="hidden" checked={activeLayers.halo} onChange={(e) => onToggleLayer('halo', e.target.checked)} />
                                <span className="text-xs text-white/60 group-hover:text-white transition-colors">Risk Halos</span>
                            </label>
                        </div>

                        {/* Axis Controls */}
                        <div ref={axesRef} className="flex flex-col gap-2 pl-6 border-l border-white/5 opacity-0">
                            <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Dimensions</div>
                            {["x", "y", "z"].map((axis) => (
                                <div key={axis} className="flex items-center gap-2 text-xs group">
                                    <span className="uppercase text-white/20 font-mono w-3 font-bold group-hover:text-neon-blue transition-colors">{axis}</span>
                                    <select
                                        value={axes[axis as "x" | "y" | "z"]}
                                        onChange={(e) => onAxisChange(axis as "x" | "y" | "z", e.target.value)}
                                        className="bg-transparent border-b border-white/10 py-0.5 text-white/80 focus:outline-none focus:border-neon-blue focus:text-neon-blue hover:text-white transition-colors cursor-pointer text-[11px]"
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
                        <div ref={colorsRef} className="flex flex-col gap-2 pl-6 border-l border-white/5 opacity-0">
                            <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Coloring</div>
                            <div className="flex flex-col gap-2">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="colorMode"
                                        checked={colorMode === "category"}
                                        onChange={() => onColorModeChange("category")}
                                        className="w-3 h-3 border-white/30 bg-transparent checked:bg-neon-blue accent-neon-blue"
                                    />
                                    <span className={`text-xs transition-colors ${colorMode === "category" ? "text-white font-medium" : "text-white/60"}`}>Category</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="colorMode"
                                        checked={colorMode === "volatility"}
                                        onChange={() => onColorModeChange("volatility")}
                                        className="w-3 h-3 border-white/30 bg-transparent checked:bg-red-500 accent-red-500"
                                    />
                                    <span className={`text-xs transition-colors ${colorMode === "volatility" ? "text-white font-medium" : "text-white/60"}`}>Risk/Vol</span>
                                </label>
                            </div>
                        </div>

                        {/* Risk Engine */}
                        <div ref={riskRef} className={`flex flex-col gap-2 pl-6 border-l border-white/5 opacity-0 w-[160px] transition-colors duration-500 ${scenario !== 'normal' ? 'bg-red-500/5 -my-4 py-4 rounded-r-2xl pr-4' : ''}`}>
                            <div className={`text-[10px] uppercase tracking-widest font-bold mb-1 flex items-center gap-1.5 ${scenario !== 'normal' ? 'text-red-400 animate-pulse' : 'text-white/40'}`}>
                                <Zap size={10} /> Risk Engine
                            </div>

                            <select
                                value={scenario}
                                onChange={(e) => onScenarioChange(e.target.value as any)}
                                className={`w-full bg-red-500/10 border border-red-500/20 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-red-500 focus:bg-red-500/20 transition-all cursor-pointer font-medium hover:bg-red-500/15 ${scenario !== 'normal' ? 'text-red-100 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'text-red-200/50'}`}
                            >
                                <option value="normal">Normal Market</option>
                                <option value="btc_crash">BTC Crash</option>
                                <option value="eth_surge">ETH Surge</option>
                                <option value="liquidations">Liquidation Cascade</option>
                                <option value="stable_depeg">Stablecoin Depeg</option>
                            </select>

                            {scenario !== 'normal' && (
                                <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="flex justify-between text-[10px] text-red-300/80 font-mono">
                                        <span>Intensity</span>
                                        <span>{Math.round(severity * 100)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0.05"
                                        max="0.5"
                                        step="0.05"
                                        value={severity}
                                        onChange={(e) => onSeverityChange(parseFloat(e.target.value))}
                                        className="w-full h-1 bg-red-900/40 rounded-lg appearance-none cursor-pointer accent-red-500 hover:accent-red-400"
                                    />

                                    {portfolioStats && (
                                        <div className="mt-2 pt-2 border-t border-red-500/10">
                                            <div className="text-[9px] uppercase tracking-wider text-red-300/60 mb-0.5">Your Portfolio</div>
                                            <div className="flex items-baseline justify-between">
                                                <span className={`font-mono font-bold text-sm ${portfolioStats.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {portfolioStats.pnl >= 0 ? '+' : ''}{portfolioStats.pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
                                                </span>
                                                <span className={`text-[9px] px-1 rounded ${portfolioStats.pnl >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                                    {(portfolioStats.pnlPercent * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {scenario === 'normal' && (
                                <div className="text-[9px] text-white/30 leading-tight mt-1 border-l-2 border-white/5 pl-2">
                                    Simulate black swan events.
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
