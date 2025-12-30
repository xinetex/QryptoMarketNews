"use client";

import { formatPrice, formatChange, formatMarketCap } from "@/lib/coingecko";
import type { CoinGeckoMarketResponse } from "@/lib/types/crypto";
import { TrendingUp, TrendingDown } from "lucide-react";
import Image from "next/image";

interface CoinCardProps {
    coin: CoinGeckoMarketResponse;
    rank: number;
}

export default function CoinCard({ coin, rank }: CoinCardProps) {
    const isPositive = (coin.price_change_percentage_24h || 0) >= 0;

    return (
        <div className="glass-card hover-lift group relative p-4 flex items-center gap-4 cursor-pointer overflow-hidden">
            {/* Rank Badge */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white/60">
                {rank}
            </div>

            {/* Coin Image */}
            <div className="flex-shrink-0 w-10 h-10 relative">
                <Image
                    src={coin.image}
                    alt={coin.name}
                    fill
                    className="rounded-full object-cover"
                    sizes="40px"
                />
            </div>

            {/* Coin Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h3 className="text-white font-bold truncate group-hover:text-neon-blue transition-colors">
                        {coin.name}
                    </h3>
                    <span className="text-white/50 text-sm font-mono uppercase">
                        {coin.symbol}
                    </span>
                </div>
                <div className="text-white/60 text-sm">
                    MCap: {formatMarketCap(coin.market_cap)}
                </div>
            </div>

            {/* Price & Change */}
            <div className="flex-shrink-0 text-right">
                <div className="text-white font-mono font-bold">
                    {formatPrice(coin.current_price)}
                </div>
                <div className={`flex items-center justify-end gap-1 text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    <span className="font-mono">{formatChange(coin.price_change_percentage_24h || 0)}</span>
                </div>
            </div>

            {/* Hover Glow */}
            <div className="absolute inset-0 rounded-2xl border border-neon-blue/0 group-hover:border-neon-blue/30 transition-colors pointer-events-none" />
        </div>
    );
}
