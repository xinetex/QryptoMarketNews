"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Activity, Minus } from "lucide-react";
import { useCryptoPrices } from "@/lib/hooks/useCrypto";

interface MarketStatus {
    status: "bullish" | "bearish" | "neutral" | "positive" | "negative";
    upCount: number;
    downCount: number;
    avgChange: number;
}

export default function MarketPulse() {
    const { prices } = useCryptoPrices();
    const [marketStatus, setMarketStatus] = useState<MarketStatus>({
        status: "neutral",
        upCount: 0,
        downCount: 0,
        avgChange: 0,
    });

    useEffect(() => {
        if (!prices || prices.length === 0) return;

        let upCount = 0;
        let downCount = 0;
        let totalChange = 0;

        prices.forEach((coin) => {
            const change = coin.price_change_percentage_24h || 0;
            totalChange += change;
            if (change >= 0) upCount++;
            else downCount++;
        });

        const avgChange = totalChange / prices.length;
        let status: MarketStatus["status"] = "neutral";

        if (upCount > downCount * 1.5) status = "bullish";
        else if (downCount > upCount * 1.5) status = "bearish";
        else if (Math.abs(avgChange) < 1) status = "neutral";
        else if (avgChange > 0) status = "positive";
        else status = "negative";

        setMarketStatus({ status, upCount, downCount, avgChange });
    }, [prices]);

    const statusConfig = {
        bullish: { color: "emerald", icon: TrendingUp, label: "BULLISH", bg: "bg-emerald-500/20" },
        bearish: { color: "red", icon: TrendingDown, label: "BEARISH", bg: "bg-red-500/20" },
        positive: { color: "emerald", icon: TrendingUp, label: "POSITIVE", bg: "bg-emerald-500/10" },
        negative: { color: "red", icon: TrendingDown, label: "NEGATIVE", bg: "bg-red-500/10" },
        neutral: { color: "amber", icon: Minus, label: "NEUTRAL", bg: "bg-amber-500/10" },
    };

    const config = statusConfig[marketStatus.status];
    const Icon = config.icon;

    return (
        <div className={`flex items-center gap-3 px-4 py-2 rounded-lg ${config.bg} border border-white/5`}>
            {/* Pulse Indicator */}
            <div className="relative">
                <div className={`w-3 h-3 rounded-full bg-${config.color}-500 animate-pulse`} />
                <div className={`absolute inset-0 w-3 h-3 rounded-full bg-${config.color}-500 animate-ping opacity-50`} />
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
                <Icon size={14} className={`text-${config.color}-400`} />
                <span className={`text-xs font-bold text-${config.color}-400`}>{config.label}</span>
            </div>

            {/* Divider */}
            <div className="w-px h-4 bg-white/10" />

            {/* Counts */}
            <div className="flex items-center gap-3 text-xs font-mono">
                <span className="text-emerald-400">↑ {marketStatus.upCount}</span>
                <span className="text-red-400">↓ {marketStatus.downCount}</span>
            </div>
        </div>
    );
}
