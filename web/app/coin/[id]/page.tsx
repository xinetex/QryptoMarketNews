"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
    ArrowLeft,
    TrendingUp,
    TrendingDown,
    BarChart2,
    Activity,
    PieChart,
    Droplet,
    Globe,
    FileText,
    Twitter,
    MessageCircle,
    Github,
    Coins,
    Users,
    Shield,
    ShieldCheck,
    AlertTriangle,
    Info,
    HeartPulse,
    Map,
    CheckCircle,
    ArrowRightLeft,
    Radio
} from "lucide-react";
import type { CoinGeckoMarketResponse } from "@/lib/types/crypto";
import Sparkline from "@/components/Sparkline";
import PriceHeatmap from "@/components/PriceHeatmap";
import { formatPrice, formatMarketCap, formatChange } from "@/lib/coingecko";

const REFRESH_INTERVAL = 30000; // 30 seconds

export default function CoinDetailPage() {
    const params = useParams();
    const coinId = params.id as string;
    const [coin, setCoin] = useState<CoinGeckoMarketResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const [priceFlash, setPriceFlash] = useState<'up' | 'down' | null>(null);
    const prevPriceRef = useRef<number | null>(null);

    const fetchCoin = useCallback(async () => {
        try {
            const response = await fetch(`/api/crypto/coin/${coinId}`);
            const { data } = await response.json();

            // Detect price change for flash effect
            if (prevPriceRef.current !== null && data?.current_price) {
                if (data.current_price > prevPriceRef.current) {
                    setPriceFlash('up');
                } else if (data.current_price < prevPriceRef.current) {
                    setPriceFlash('down');
                }
                setTimeout(() => setPriceFlash(null), 1000);
            }

            if (data?.current_price) {
                prevPriceRef.current = data.current_price;
            }

            setCoin(data);
            setLastUpdate(new Date());
        } catch (error) {
            console.error("Failed to fetch coin:", error);
        } finally {
            setLoading(false);
        }
    }, [coinId]);

    // Initial fetch
    useEffect(() => {
        if (coinId) {
            fetchCoin();
        }
    }, [coinId, fetchCoin]);

    // Polling for live updates
    useEffect(() => {
        if (!coinId) return;

        const interval = setInterval(fetchCoin, REFRESH_INTERVAL);
        return () => clearInterval(interval);
    }, [coinId, fetchCoin]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
                <div className="text-zinc-400 animate-pulse">Loading...</div>
            </div>
        );
    }

    if (!coin) {
        return (
            <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl text-zinc-100 mb-4">Coin Not Found</h1>
                    <Link href="/" className="text-indigo-400 hover:underline">← Back to QChannel</Link>
                </div>
            </div>
        );
    }

    const isPositive = (coin.price_change_percentage_24h || 0) >= 0;
    const sparklineData = coin.sparkline_in_7d?.price || [];
    const flashClass = priceFlash === 'up'
        ? 'animate-pulse text-emerald-400'
        : priceFlash === 'down'
            ? 'animate-pulse text-red-400'
            : '';

    return (
        <div className="min-h-screen bg-[#09090b] text-zinc-400 font-sans antialiased">

            {/* Navigation */}
            <nav className="border-b border-white/5 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 text-zinc-100">
                            <div className="w-6 h-6 bg-zinc-100 text-zinc-950 rounded flex items-center justify-center font-bold text-xs tracking-tighter">
                                QC
                            </div>
                            <span className="font-medium tracking-tight text-sm">QChannel</span>
                        </Link>

                        {/* Nav Links */}
                        <div className="hidden md:flex items-center gap-6 text-sm">
                            <Link href="/" className="text-zinc-100 font-medium">Markets</Link>
                            <Link href="/galaxy" className="hover:text-zinc-200 transition-colors">Galaxy</Link>
                            <Link href="/intelligence" className="hover:text-zinc-200 transition-colors">Intelligence</Link>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative hidden sm:block">
                        <input
                            type="text"
                            placeholder="Search tokens, pairs..."
                            className="bg-zinc-900 border border-white/10 rounded-md py-1.5 pl-9 pr-4 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-700 w-64 placeholder:text-zinc-600"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] bg-zinc-800 border border-white/5 px-1.5 rounded text-zinc-500">⌘K</span>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">

                {/* Header */}
                <header className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        {/* Token Identity */}
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center overflow-hidden">
                                {coin.image && (
                                    <Image src={coin.image} alt={coin.name} width={48} height={48} className="rounded-lg" />
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <h1 className="text-2xl text-zinc-100 font-medium tracking-tight">{coin.name}</h1>
                                    <span className="text-sm font-medium text-zinc-500 bg-zinc-900 border border-white/5 px-2 py-0.5 rounded uppercase">
                                        {coin.symbol}
                                    </span>
                                    <div className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded ml-2">
                                        <ShieldCheck size={12} />
                                        <span>Verified</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded ml-1 animate-pulse">
                                        <Radio size={12} />
                                        <span>LIVE</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-sm flex-wrap">
                                    <a href="#" className="flex items-center gap-1.5 text-zinc-400 hover:text-indigo-400 transition-colors">
                                        <Globe size={14} />
                                        <span>Website</span>
                                    </a>
                                    <a href="#" className="flex items-center gap-1.5 text-zinc-400 hover:text-indigo-400 transition-colors">
                                        <FileText size={14} />
                                        <span>Whitepaper</span>
                                    </a>
                                    <div className="flex gap-2 border-l border-white/10 pl-4 ml-1">
                                        <a href="#" className="text-zinc-500 hover:text-zinc-300"><Twitter size={14} /></a>
                                        <a href="#" className="text-zinc-500 hover:text-zinc-300"><MessageCircle size={14} /></a>
                                        <a href="#" className="text-zinc-500 hover:text-zinc-300"><Github size={14} /></a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="flex gap-8 items-end">
                            <div className="text-right">
                                <div className="flex items-center justify-end gap-2 text-sm text-zinc-500 mb-1 font-medium">
                                    <span>Current Price</span>
                                    {lastUpdate && (
                                        <span className="text-[10px] text-zinc-600">
                                            Updated {lastUpdate.toLocaleTimeString()}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center justify-end gap-3">
                                    <span className={`text-3xl font-medium tracking-tight transition-all duration-300 ${flashClass || 'text-zinc-100'}`}>
                                        {formatPrice(coin.current_price)}
                                    </span>
                                    <span className={`flex items-center text-sm font-medium px-2 py-0.5 rounded ${isPositive
                                        ? 'text-emerald-400 bg-emerald-400/5 border border-emerald-400/10'
                                        : 'text-red-400 bg-red-400/5 border border-red-400/10'
                                        }`}>
                                        {isPositive ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                                        {formatChange(coin.price_change_percentage_24h || 0)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Key Metrics Bar */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                        <div className="p-4 rounded-lg bg-zinc-900/30 border border-white/5 hover:border-white/10 transition-colors group">
                            <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2 group-hover:text-zinc-400">
                                <BarChart2 size={14} />
                                Market Cap
                            </div>
                            <div className="text-lg text-zinc-200 font-medium tracking-tight">
                                {formatMarketCap(coin.market_cap)}
                            </div>
                            <div className="text-xs text-zinc-600 mt-1">Rank #{coin.market_cap_rank}</div>
                        </div>
                        <div className="p-4 rounded-lg bg-zinc-900/30 border border-white/5 hover:border-white/10 transition-colors group">
                            <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2 group-hover:text-zinc-400">
                                <Activity size={14} />
                                Volume (24h)
                            </div>
                            <div className="text-lg text-zinc-200 font-medium tracking-tight">
                                {formatMarketCap(coin.total_volume)}
                            </div>
                            <div className={`text-xs mt-1 ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                                {formatChange(coin.market_cap_change_percentage_24h || 0)}
                            </div>
                        </div>
                        <div className="p-4 rounded-lg bg-zinc-900/30 border border-white/5 hover:border-white/10 transition-colors group">
                            <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2 group-hover:text-zinc-400">
                                <PieChart size={14} />
                                FDV
                            </div>
                            <div className="text-lg text-zinc-200 font-medium tracking-tight">
                                {formatMarketCap(coin.fully_diluted_valuation || 0)}
                            </div>
                            <div className="text-xs text-zinc-600 mt-1">
                                Ratio {coin.fully_diluted_valuation ? (coin.market_cap / coin.fully_diluted_valuation).toFixed(2) : 'N/A'}
                            </div>
                        </div>
                        <div className="p-4 rounded-lg bg-zinc-900/30 border border-white/5 hover:border-white/10 transition-colors group">
                            <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2 group-hover:text-zinc-400">
                                <Droplet size={14} />
                                ATH
                            </div>
                            <div className="text-lg text-zinc-200 font-medium tracking-tight">
                                {formatPrice(coin.ath)}
                            </div>
                            <div className="text-xs text-red-500 mt-1">
                                {formatChange(coin.ath_change_percentage)}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Column 1: Supply & Trading */}
                    <div className="space-y-6">
                        {/* Trading Activity */}
                        <section className="border border-white/10 bg-zinc-900/20 rounded-xl p-5 backdrop-blur-sm">
                            <h3 className="text-zinc-100 font-medium text-sm flex items-center gap-2 mb-4">
                                <Activity size={14} className="text-green-400" />
                                Trading Activity
                            </h3>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-zinc-950/50 border border-white/5 p-3 rounded-lg">
                                    <div className="text-xs text-zinc-500 mb-1">24h Volume</div>
                                    <div className="text-lg text-zinc-200 font-medium">{formatMarketCap(coin.total_volume)}</div>
                                </div>
                                <div className="bg-zinc-950/50 border border-white/5 p-3 rounded-lg">
                                    <div className="text-xs text-zinc-500 mb-1">Price Δ (24h)</div>
                                    <div className={`text-lg font-medium ${coin.price_change_24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {coin.price_change_24h >= 0 ? '+' : ''}{formatPrice(coin.price_change_24h)}
                                    </div>
                                </div>
                            </div>

                            <div className="text-xs text-zinc-500 flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Last updated: {coin.last_updated ? new Date(coin.last_updated).toLocaleTimeString() : 'N/A'}
                            </div>
                        </section>

                        <section className="border border-white/10 bg-zinc-900/20 rounded-xl p-5 backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-zinc-100 font-medium text-sm flex items-center gap-2">
                                    <Coins size={14} className="text-indigo-400" />
                                    Supply & Tokenomics
                                </h3>
                            </div>

                            {/* Distribution Chart */}
                            <div className="relative h-4 w-full bg-zinc-800 rounded-full overflow-hidden flex mb-2">
                                <div
                                    className="h-full bg-indigo-500"
                                    style={{ width: `${coin.circulating_supply && coin.total_supply ? (coin.circulating_supply / coin.total_supply * 100) : 50}%` }}
                                />
                                <div className="h-full bg-zinc-700 flex-1" />
                            </div>
                            <div className="flex justify-between text-[10px] text-zinc-500 mb-6 font-mono">
                                <span className="flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                    Circulating ({coin.circulating_supply && coin.total_supply ? Math.round(coin.circulating_supply / coin.total_supply * 100) : '--'}%)
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
                                    <span className="text-zinc-400">Circulating Supply</span>
                                    <span className="text-zinc-200 font-mono">
                                        {coin.circulating_supply?.toLocaleString() || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
                                    <span className="text-zinc-400">Total Supply</span>
                                    <span className="text-zinc-200 font-mono">
                                        {coin.total_supply?.toLocaleString() || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-zinc-400">Max Supply</span>
                                    <span className="text-zinc-200 font-mono">
                                        {coin.max_supply?.toLocaleString() || '∞'}
                                    </span>
                                </div>
                            </div>
                        </section>

                        {/* Price Stats */}
                        <section className="border border-white/10 bg-zinc-900/20 rounded-xl p-5 backdrop-blur-sm">
                            <h3 className="text-zinc-100 font-medium text-sm flex items-center gap-2 mb-4">
                                <Activity size={14} className="text-indigo-400" />
                                Price Statistics
                            </h3>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">24h High</span>
                                    <span className="text-zinc-200 font-mono">{formatPrice(coin.high_24h)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">24h Low</span>
                                    <span className="text-zinc-200 font-mono">{formatPrice(coin.low_24h)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">All-Time High</span>
                                    <span className="text-zinc-200 font-mono">{formatPrice(coin.ath)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">All-Time Low</span>
                                    <span className="text-zinc-200 font-mono">{formatPrice(coin.atl)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">ATH Date</span>
                                    <span className="text-zinc-200 font-mono text-xs">
                                        {coin.ath_date ? new Date(coin.ath_date).toLocaleDateString() : 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">ATL Date</span>
                                    <span className="text-zinc-200 font-mono text-xs">
                                        {coin.atl_date ? new Date(coin.atl_date).toLocaleDateString() : 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm pt-2 border-t border-white/5">
                                    <span className="text-zinc-400">From ATH</span>
                                    <span className={`font-mono font-medium ${coin.ath_change_percentage > -20 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {formatChange(coin.ath_change_percentage)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">MCap Change 24h</span>
                                    <span className={`font-mono font-medium ${coin.market_cap_change_percentage_24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {formatChange(coin.market_cap_change_percentage_24h)}
                                    </span>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Column 2: Chart */}
                    <div className="space-y-6">
                        <section className="border border-white/10 bg-zinc-900/20 rounded-xl p-5 backdrop-blur-sm min-h-[300px]">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-zinc-100 font-medium text-sm flex items-center gap-2">
                                    <BarChart2 size={14} className="text-blue-400" />
                                    Price Chart (7D)
                                </h3>
                                <div className="flex gap-1 text-[10px]">
                                    <button className="bg-zinc-800 text-zinc-200 px-2 py-0.5 rounded border border-white/5">7D</button>
                                    <button className="text-zinc-500 hover:text-zinc-300 px-2 py-0.5">30D</button>
                                </div>
                            </div>

                            {/* Sparkline Chart */}
                            {sparklineData.length > 0 ? (
                                <div className="h-48 flex items-center justify-center">
                                    <Sparkline
                                        data={sparklineData}
                                        width={500}
                                        height={180}
                                        color="auto"
                                    />
                                </div>
                            ) : (
                                <div className="h-48 flex items-center justify-center text-zinc-600">
                                    Chart data not available
                                </div>
                            )}
                        </section>

                        {/* Market Info */}
                        <section className="border border-white/10 bg-zinc-900/20 rounded-xl p-5 backdrop-blur-sm">
                            <h3 className="text-zinc-100 font-medium text-sm flex items-center gap-2 mb-6">
                                <Map size={14} className="text-purple-400" />
                                Market Data
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-zinc-950/50 border border-white/5 p-3 rounded-lg">
                                    <div className="text-xs text-zinc-500 mb-1">Market Cap Rank</div>
                                    <div className="text-lg text-zinc-200 font-medium">#{coin.market_cap_rank}</div>
                                </div>
                                <div className="bg-zinc-950/50 border border-white/5 p-3 rounded-lg">
                                    <div className="text-xs text-zinc-500 mb-1">Volume/MCap</div>
                                    <div className="text-lg text-zinc-200 font-medium">
                                        {(coin.total_volume / coin.market_cap * 100).toFixed(2)}%
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Price Heatmap */}
                        <section className="border border-white/10 bg-zinc-900/20 rounded-xl p-5 backdrop-blur-sm">
                            <h3 className="text-zinc-100 font-medium text-sm flex items-center gap-2 mb-4">
                                <Activity size={14} className="text-orange-400" />
                                Price Intensity (7D)
                            </h3>
                            <PriceHeatmap data={sparklineData} width={420} height={50} />
                        </section>
                    </div>

                    {/* Column 3: Risk & Sentiment */}
                    <div className="space-y-6">

                        {(() => {
                            // Dynamic Risk Calculation
                            const liquidityScore = coin.liquidity_score || 50;
                            const mcapRank = coin.market_cap_rank || 500;
                            const volatility = Math.abs(coin.price_change_percentage_24h || 0);
                            const fdvRatio = coin.fully_diluted_valuation ? (coin.market_cap / coin.fully_diluted_valuation) : 1;

                            let score = Math.min(99, Math.round(liquidityScore * 1.5));
                            if (mcapRank < 50) score += 10;
                            if (volatility > 10) score -= 10;
                            if (fdvRatio < 0.5) score -= 15;
                            score = Math.max(10, Math.min(98, score));

                            let riskLevel = "Medium Risk";
                            let colorClass = "text-yellow-400";
                            let strokeColor = "#facc15"; // yellow-400

                            if (score >= 75) {
                                riskLevel = "Low Risk";
                                colorClass = "text-emerald-400";
                                strokeColor = "#34d399"; // emerald-400
                            } else if (score < 50) {
                                riskLevel = "High Risk";
                                colorClass = "text-red-400";
                                strokeColor = "#f87171"; // red-400
                            }

                            const factors = [];
                            if (mcapRank < 100) factors.push({ icon: ShieldCheck, text: "Blue Chip / Established", color: "text-emerald-500" });
                            else if (mcapRank > 500) factors.push({ icon: AlertTriangle, text: "Small Cap / High Volatility", color: "text-orange-500" });

                            if (volatility > 15) factors.push({ icon: Activity, text: "Extreme Price Action", color: "text-red-500" });
                            if (fdvRatio < 0.3) factors.push({ icon: AlertTriangle, text: "High Inflation Risk", color: "text-orange-500" });
                            if (factors.length < 3) factors.push({ icon: CheckCircle, text: "Publicly Traded", color: "text-blue-500" });

                            // SVG Chart calculations
                            const radius = 28;
                            const circumference = 2 * Math.PI * radius;
                            const offset = circumference - (score / 100) * circumference;

                            return (
                                <section className="border border-white/10 bg-zinc-900/20 rounded-xl p-5 backdrop-blur-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-3 opacity-10">
                                        <ShieldCheck size={80} className="text-white" />
                                    </div>

                                    <h3 className="text-zinc-100 font-medium text-sm flex items-center gap-2 mb-4">
                                        <AlertTriangle size={14} className="text-red-400" />
                                        Risk Analysis
                                    </h3>

                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="relative w-16 h-16 flex items-center justify-center">
                                            {/* SVG Donut Chart */}
                                            <svg className="transform -rotate-90 w-16 h-16">
                                                <circle
                                                    cx="32"
                                                    cy="32"
                                                    r={radius}
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                    fill="transparent"
                                                    className="text-zinc-800"
                                                />
                                                <circle
                                                    cx="32"
                                                    cy="32"
                                                    r={radius}
                                                    stroke={strokeColor}
                                                    strokeWidth="4"
                                                    fill="transparent"
                                                    strokeDasharray={circumference}
                                                    strokeDashoffset={offset}
                                                    strokeLinecap="round"
                                                    className="transition-all duration-1000 ease-out"
                                                />
                                            </svg>
                                            <span className="absolute text-lg font-bold text-zinc-100">
                                                {score}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Security Score</div>
                                            <div className={`text-sm ${colorClass}`}>{riskLevel}</div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {factors.slice(0, 3).map((factor, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-2 rounded bg-zinc-950/40 border border-white/5">
                                                <factor.icon size={14} className={factor.color} />
                                                <span className="text-xs text-zinc-300">{factor.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            );
                        })()}

                        {/* Social & Sentiment */}
                        <section className="border border-white/10 bg-zinc-900/20 rounded-xl p-5 backdrop-blur-sm">
                            <h3 className="text-zinc-100 font-medium text-sm flex items-center gap-2 mb-4">
                                <HeartPulse size={14} className="text-pink-400" />
                                Sentiment & Narrative
                            </h3>

                            {/* Narrative Tags */}
                            <div className="flex flex-wrap gap-2 mb-5">
                                <span className="text-[10px] font-medium px-2 py-1 rounded bg-zinc-800 border border-white/5 text-zinc-400">#DeFi</span>
                                <span className="text-[10px] font-medium px-2 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">#L2Scaling</span>
                                <span className="text-[10px] font-medium px-2 py-1 rounded bg-zinc-800 border border-white/5 text-zinc-400">#Yield</span>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-zinc-400">Social Volume</span>
                                        <span className="text-zinc-200">High</span>
                                    </div>
                                    <div className="w-full bg-zinc-800 h-1 rounded-full">
                                        <div className="bg-zinc-200 h-1 rounded-full w-[80%]"></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-zinc-400">Sentiment (24h)</span>
                                        <span className={`font-medium ${(coin.sentiment_votes_up_percentage || 50) > 50 ? 'text-emerald-400' : 'text-red-400'
                                            }`}>
                                            {(coin.sentiment_votes_up_percentage || 50) > 50 ? 'Bullish' : 'Bearish'}
                                        </span>
                                    </div>
                                    {/* Sentiment Bar */}
                                    <div className="flex w-full h-1 rounded-full overflow-hidden gap-0.5">
                                        <div
                                            className="bg-emerald-500 h-full transition-all duration-1000"
                                            style={{ width: `${coin.sentiment_votes_up_percentage || 50}%` }}
                                        />
                                        <div className="bg-zinc-700 flex-1" />
                                        <div
                                            className="bg-red-500 h-full transition-all duration-1000"
                                            style={{ width: `${coin.sentiment_votes_down_percentage || (100 - (coin.sentiment_votes_up_percentage || 50))}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Recent Signal */}
                                <div className="mt-4 pt-4 border-t border-white/5">
                                    <div className="flex gap-3">
                                        <div className="mt-0.5 min-w-[16px]">
                                            <Twitter size={14} className="text-zinc-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-zinc-300 leading-snug">
                                                <span className="text-indigo-400">@DefiWhale</span> mentioned {coin.name} in "Top 5 Altcoins for Q4". Engagement spike detected.
                                            </p>
                                            <span className="text-[10px] text-zinc-600 block mt-1">2 hours ago</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Action Button */}
                        <button className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] flex items-center justify-center gap-2">
                            <ArrowRightLeft size={16} />
                            Trade on Exchange
                        </button>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 py-8 mt-6">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-xs text-zinc-600">
                        © 2024 QChannel Intelligence. Data provided for informational purposes only.
                    </div>
                    <div className="flex gap-4 text-xs text-zinc-500">
                        <a href="#" className="hover:text-zinc-300">Privacy</a>
                        <a href="#" className="hover:text-zinc-300">Terms</a>
                        <a href="#" className="hover:text-zinc-300">API</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
