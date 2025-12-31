"use client";

import { useState, useEffect } from "react";
import NeuralCore from "@/components/NeuralCore";
import { Search, Brain, Share2, Save, Lightbulb, TrendingUp, AlertTriangle, Lock } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatChange } from "@/lib/coingecko";

interface AnalysisResult {
    sector: string;
    summary: string;
    gaps: string[];
    innovationScore: number;
    opportunities: { title: string; description: string }[];
    riskLevel: string;
}

function DailyDropsFeed() {
    const [drops, setDrops] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/intelligence/feed').then(res => res.json()).then(data => {
            if (data.ideas) setDrops(data.ideas);
        });
    }, []);

    if (drops.length === 0) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drops.map((drop) => (
                <div key={drop.id} className="glass-card hover:bg-white/5 transition-all p-5 group flex flex-col h-full border border-white/5 hover:border-neon-purple/50">
                    <div className="flex justify-between items-start mb-3">
                        <span className="px-2 py-1 rounded bg-neon-purple/10 text-neon-purple text-[10px] font-bold uppercase tracking-wider">
                            {drop.sector || "Strategy"}
                        </span>
                        <span className="text-[10px] text-zinc-600 font-mono">
                            {new Date(drop.created_at).toLocaleDateString()}
                        </span>
                    </div>

                    <h3 className="text-lg font-bold text-zinc-100 mb-2 group-hover:text-neon-blue transition-colors">
                        {drop.idea_title}
                    </h3>
                    <p className="text-sm text-zinc-400 mb-4 flex-1">
                        {drop.summary || drop.idea_description.substring(0, 100) + "..."}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                        <button className="text-xs font-bold text-zinc-500 hover:text-white flex items-center gap-1 transition-colors">
                            VIEW INTEL <Search size={12} />
                        </button>
                        <div className="flex gap-2">
                            <button className="p-1.5 hover:bg-white/10 rounded text-zinc-500 hover:text-neon-blue transition-colors">
                                <Share2 size={14} />
                            </button>
                            <button className="p-1.5 hover:bg-white/10 rounded text-zinc-500 hover:text-neon-purple transition-colors">
                                <Save size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function IntelligencePage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState("");

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        // Auth Check
        if (!session) {
            router.push("/auth/login");
            return;
        }

        setAnalyzing(true);
        setResult(null);
        setError("");

        try {
            const res = await fetch("/api/intelligence/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ project: query }),
            });

            if (res.status === 403) {
                // Payment required
                setError("Free limit reached. Upgrade to Premium for unlimited access.");
                return;
            }

            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setResult(data);
        } catch (err: any) {
            setError(err.message || "Analysis failed");
        } finally {
            setAnalyzing(false);
        }
    };

    const handleUpgrade = async () => {
        try {
            const res = await fetch("/api/stripe/checkout", { method: "POST" });
            const data = await res.json();
            if (data.url) window.location.href = data.url;
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="min-h-screen bg-[#0b0d17] text-foreground font-sans selection:bg-neon-purple/30">
            {/* Header */}
            <header className="border-b border-white/5 bg-glass-dark backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-zinc-400 hover:text-white transition-colors">← Back</Link>
                        <div className="h-6 w-px bg-white/10"></div>
                        <h1 className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">
                            Q-INTEL
                        </h1>
                        <span className="px-2 py-0.5 rounded-full bg-neon-purple/10 text-neon-purple text-[10px] font-bold tracking-widest uppercase border border-neon-purple/20">
                            BETA
                        </span>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12 relative">

                {/* Search / Input Section */}
                <div className="flex flex-col items-center justify-center mb-16 relative z-10">
                    <div className="mb-8 relative group cursor-pointer" onClick={() => !analyzing && document.getElementById('search-input')?.focus()}>
                        <NeuralCore active={analyzing} />
                        {!analyzing && !result && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="text-neon-blue font-mono text-sm tracking-widest animate-pulse">AWAITING INPUT...</span>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleAnalyze} className="w-full max-w-xl relative">
                        <input
                            id="search-input"
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Enter Project Name or Ticker (e.g. Uniswap)"
                            className="w-full bg-black/50 border border-white/10 rounded-full py-4 pl-6 pr-14 text-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-neon-blue focus:shadow-[0_0_20px_rgba(0,243,255,0.2)] transition-all"
                            disabled={analyzing}
                        />
                        <button
                            type="submit"
                            disabled={analyzing}
                            className="absolute right-2 top-2 bottom-2 aspect-square bg-neon-blue/10 hover:bg-neon-blue/20 text-neon-blue rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                        >
                            {analyzing ? (
                                <div className="w-5 h-5 border-2 border-neon-blue border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <Search size={20} />
                            )}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-6 flex flex-col items-center animate-fade-in-up">
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm mb-4 flex items-center gap-2">
                                <Lock size={16} />
                                {error}
                            </div>
                            <button
                                onClick={handleUpgrade}
                                className="px-8 py-3 bg-gradient-to-r from-neon-purple to-pink-600 rounded-full font-bold text-white shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:shadow-[0_0_30px_rgba(236,72,153,0.6)] transition-all transform hover:scale-105"
                            >
                                UPGRADE TO PRO ($5/mo)
                            </button>
                        </div>
                    )}
                </div>

                {/* Daily Drops Section (Only visible when no search result) */}
                {!result && !analyzing && (
                    <div className="mb-20 animate-fade-in-up">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <span className="w-2 h-8 bg-neon-purple rounded-sm"></span>
                                DAILY STRATEGIC DROPS
                            </h2>
                            <span className="text-xs text-zinc-500 uppercase tracking-widest">
                                AI-Generated Community Initiatives
                            </span>
                        </div>

                        <DailyDropsFeed />
                    </div>
                )}

                {/* Results Grid */}
                {result && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up">

                        {/* Left: Identity & Score */}
                        <div className="space-y-6">
                            <div className="glass-card p-6 border-l-4 border-l-neon-purple">
                                <h2 className="text-3xl font-bold text-white mb-1">{query}</h2>
                                <p className="text-neon-purple font-mono text-sm uppercase tracking-wider mb-4">
                                    // {result.sector}
                                </p>
                                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                                    {result.summary}
                                </p>

                                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                    <span className="text-xs text-zinc-500 uppercase tracking-widest">Innovation Score</span>
                                    <div className="text-4xl font-black text-neon-blue drop-shadow-[0_0_10px_rgba(0,243,255,0.3)]">
                                        {result.innovationScore}<span className="text-lg text-zinc-600">/100</span>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card p-6">
                                <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2 mb-4 uppercase tracking-wider">
                                    <AlertTriangle size={16} className="text-red-400" />
                                    Risk Assessment
                                </h3>
                                <div className={`text-lg font-bold ${result.riskLevel === 'High' ? 'text-red-400' :
                                    result.riskLevel === 'Medium' ? 'text-yellow-400' : 'text-emerald-400'
                                    }`}>
                                    {result.riskLevel} Risk Profile
                                </div>
                            </div>
                        </div>

                        {/* Center: Opportunities */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Innovation Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {result.opportunities.map((opp, idx) => (
                                    <div key={idx} className="glass-card p-6 group hover:border-neon-blue/50 transition-colors cursor-default">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-2 bg-neon-blue/10 rounded-lg text-neon-blue group-hover:bg-neon-blue group-hover:text-black transition-colors">
                                                <Lightbulb size={20} />
                                            </div>
                                            <button className="text-zinc-500 hover:text-white transition-colors" title="Save Idea">
                                                <Save size={18} />
                                            </button>
                                        </div>
                                        <h3 className="text-lg font-bold text-zinc-100 mb-2">{opp.title}</h3>
                                        <p className="text-sm text-zinc-400 leading-relaxed">
                                            {opp.description}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Gaps Analysis */}
                            <div className="glass-card p-6">
                                <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2 mb-4 uppercase tracking-wider">
                                    <TrendingUp size={16} className="text-orange-400" />
                                    Detected Market Gaps
                                </h3>
                                <div className="space-y-3">
                                    {result.gaps.map((gap, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                                            <span className="text-sm text-zinc-300">{gap}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
