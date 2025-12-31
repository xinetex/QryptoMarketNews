"use client";

import { useEffect, useState } from "react";
import {
    TrendingUp, TrendingDown, DollarSign, BarChart3,
    Activity, Globe, RefreshCw
} from "lucide-react";
import Image from "next/image";

interface CoinData {
    id: string;
    name: string;
    symbol: string;
    image: { large: string };
    market_data: {
        current_price: { usd: number };
        price_change_percentage_24h: number;
        market_cap: { usd: number };
        total_volume: { usd: number };
        high_24h: { usd: number };
        low_24h: { usd: number };
        ath: { usd: number };
        atl: { usd: number };
        circulating_supply: number;
        total_supply: number;
        max_supply: number | null;
        fully_diluted_valuation: { usd: number };
    };
    description: { en: string };
}

interface CoinDetailPanelProps {
    coinId: string;
}

export default function CoinDetailPanel({ coinId }: CoinDetailPanelProps) {
    const [coin, setCoin] = useState<CoinData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!coinId) return;

        setLoading(true);
        setError(null);

        fetch(`/api/crypto/coin/${coinId}`)
            .then(r => r.json())
            .then(data => {
                if (data.error) throw new Error(data.error);
                setCoin(data);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [coinId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <RefreshCw size={32} className="animate-spin text-indigo-400 mb-4" />
                <p className="text-zinc-400">Loading coin data...</p>
            </div>
        );
    }

    if (error || !coin) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <p className="text-red-400 mb-2">Failed to load</p>
                <p className="text-zinc-500 text-sm">{error}</p>
            </div>
        );
    }

    const md = coin.market_data;

    // Safety check for required market data
    if (!md || !md.current_price) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <p className="text-amber-400 mb-2">Incomplete data</p>
                <p className="text-zinc-500 text-sm">Some market data is unavailable</p>
            </div>
        );
    }

    const isPositive = (md.price_change_percentage_24h || 0) >= 0;

    const formatPrice = (n: number | undefined | null) => {
        if (n === undefined || n === null) return 'N/A';
        if (n >= 1) return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
        return `$${n.toPrecision(4)}`;
    };

    const formatLarge = (n: number | undefined | null) => {
        if (n === undefined || n === null) return 'N/A';
        if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
        if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
        if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
        return `$${n.toLocaleString()}`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Image
                    src={coin.image.large}
                    alt={coin.name}
                    width={64}
                    height={64}
                    className="rounded-full"
                />
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        {coin.name}
                        <span className="text-zinc-500 text-lg font-normal uppercase">
                            {coin.symbol}
                        </span>
                    </h1>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-3xl font-bold">
                            {formatPrice(md.current_price.usd)}
                        </span>
                        <span className={`flex items-center gap-1 text-lg font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                            {Math.abs(md.price_change_percentage_24h || 0).toFixed(2)}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Market Cap", value: formatLarge(md.market_cap?.usd), icon: DollarSign },
                    { label: "24h Volume", value: formatLarge(md.total_volume?.usd), icon: BarChart3 },
                    { label: "24h High", value: formatPrice(md.high_24h?.usd), icon: TrendingUp },
                    { label: "24h Low", value: formatPrice(md.low_24h?.usd), icon: TrendingDown },
                ].map((stat) => (
                    <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
                            <stat.icon size={12} />
                            {stat.label}
                        </div>
                        <div className="text-white font-semibold">{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Supply Info */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-zinc-400 mb-3 flex items-center gap-2">
                    <Activity size={14} />
                    Supply Information
                </h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                        <div className="text-zinc-500 text-xs">Circulating</div>
                        <div className="text-white font-medium">
                            {md.circulating_supply?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || 'N/A'}
                        </div>
                    </div>
                    <div>
                        <div className="text-zinc-500 text-xs">Total Supply</div>
                        <div className="text-white font-medium">
                            {md.total_supply?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || 'N/A'}
                        </div>
                    </div>
                    <div>
                        <div className="text-zinc-500 text-xs">Max Supply</div>
                        <div className="text-white font-medium">
                            {md.max_supply?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || '∞'}
                        </div>
                    </div>
                </div>

                {/* Progress bar */}
                {md.max_supply && (
                    <div className="mt-3">
                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                                style={{ width: `${(md.circulating_supply / md.max_supply) * 100}%` }}
                            />
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-1">
                            {((md.circulating_supply / md.max_supply) * 100).toFixed(1)}% in circulation
                        </div>
                    </div>
                )}
            </div>

            {/* All-time stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                    <div className="text-emerald-400 text-xs mb-1">All-Time High</div>
                    <div className="text-white font-bold text-lg">{formatPrice(md.ath?.usd)}</div>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <div className="text-red-400 text-xs mb-1">All-Time Low</div>
                    <div className="text-white font-bold text-lg">{formatPrice(md.atl?.usd)}</div>
                </div>
            </div>

            {/* Description */}
            {coin.description?.en && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-zinc-400 mb-2 flex items-center gap-2">
                        <Globe size={14} />
                        About {coin.name}
                    </h3>
                    <p
                        className="text-sm text-zinc-400 leading-relaxed line-clamp-4"
                        dangerouslySetInnerHTML={{
                            __html: coin.description.en.split('.').slice(0, 3).join('.') + '.'
                        }}
                    />
                </div>
            )}
        </div>
    );
}
