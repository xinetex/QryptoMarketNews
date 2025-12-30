"use client";

import { useL2Comparison } from "@/lib/hooks/useDefi";
import { formatTVL } from "@/lib/defillama";

const L2_COLORS: Record<string, string> = {
    Arbitrum: "bg-blue-500",
    Optimism: "bg-red-500",
    Base: "bg-blue-400",
    "zkSync Era": "bg-purple-500",
    "Polygon zkEVM": "bg-violet-500",
    Linea: "bg-teal-500",
    Scroll: "bg-amber-500",
    Blast: "bg-yellow-500",
};

export default function L2Dashboard() {
    const { l2Data, loading } = useL2Comparison(300000);

    // Find max TVL for bar scaling
    const maxTVL = Math.max(...l2Data.map((l) => l.tvl), 1);

    return (
        <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">L2 TVL Comparison</h3>
                <span className="text-xs text-white/50 font-mono">via DeFiLlama</span>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-8 bg-white/5 rounded animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="space-y-3">
                    {l2Data.map((l2) => {
                        const widthPercent = (l2.tvl / maxTVL) * 100;
                        const colorClass = L2_COLORS[l2.name] || "bg-gray-500";

                        return (
                            <div key={l2.name} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="text-white font-medium">{l2.name}</span>
                                    <span className="text-white/70 font-mono">{l2.formatted}</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${colorClass} rounded-full transition-all duration-500`}
                                        style={{ width: `${widthPercent}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
