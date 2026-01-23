'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Newspaper, ChevronDown, ChevronUp, RefreshCw, Calendar, AlertTriangle, Cpu } from 'lucide-react';

interface Briefing {
    title: string;
    summary: string;
    content: string;
    generatedAt: string;
}

export default function DailyBriefingCard() {
    const [briefing, setBriefing] = useState<Briefing | null>(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        fetch('/api/briefing')
            .then(res => res.json())
            .then(data => {
                if (data.briefing) setBriefing(data.briefing);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <BriefingSkeleton />;
    if (!briefing) return null;

    // Simple Markdown Parser (very basic)
    const renderContent = (md: string) => {
        return md.split('\n').map((line, i) => {
            // Headers
            if (line.startsWith('## ')) {
                return <h3 key={i} className="text-lg font-bold text-indigo-400 mt-4 mb-2">{line.replace('## ', '')}</h3>;
            }
            if (line.startsWith('# ')) {
                return null; // Skip title as it's already shown
            }
            // Bullets
            if (line.trim().startsWith('- ')) {
                return (
                    <li key={i} className="ml-4 text-zinc-300 text-sm leading-relaxed mb-1 list-disc">
                        {parseBold(line.replace('- ', ''))}
                    </li>
                );
            }
            // Paragraphs
            if (line.trim().length > 0) {
                return <p key={i} className="text-zinc-300 text-sm leading-relaxed mb-3">{parseBold(line)}</p>;
            }
            return null;
        });
    };

    const parseBold = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*)/);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="text-zinc-100 font-bold">{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    return (
        <div className="rounded-2xl border border-indigo-500/20 bg-zinc-950/80 backdrop-blur-sm overflow-hidden">
            {/* Header */}
            <div
                onClick={() => setExpanded(!expanded)}
                className="p-5 cursor-pointer hover:bg-zinc-900/50 transition-colors"
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center gap-1">
                                <Cpu size={10} />
                                PERPLEXITY SYNTHESIS
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono">
                                {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                            </span>
                        </div>

                        <h2 className="text-xl font-bold text-zinc-100 tracking-tight">
                            {briefing.title}
                        </h2>

                        <p className="text-sm text-zinc-400 leading-relaxed line-clamp-2">
                            {briefing.summary}
                        </p>
                    </div>

                    <button className="p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 shrink-0">
                        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                </div>
            </div>

            {/* Expanded Content */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-zinc-900 bg-zinc-900/20"
                    >
                        <div className="p-6 pt-2">
                            {renderContent(briefing.content)}

                            <div className="mt-8 pt-4 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-600 font-mono">
                                <span>Generated via Perplexity sonar-reasoning-pro</span>
                                <span>ID: {briefing.generatedAt?.split('T')[0] || 'cache'}</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function BriefingSkeleton() {
    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-5 space-y-4">
            <div className="flex items-center gap-2">
                <div className="w-24 h-5 rounded bg-zinc-900 animate-pulse" />
                <div className="w-32 h-5 rounded bg-zinc-900 animate-pulse" />
            </div>
            <div className="w-3/4 h-8 rounded bg-zinc-900 animate-pulse" />
            <div className="space-y-2">
                <div className="w-full h-4 rounded bg-zinc-900 animate-pulse" />
                <div className="w-full h-4 rounded bg-zinc-900 animate-pulse" />
                <div className="w-2/3 h-4 rounded bg-zinc-900 animate-pulse" />
            </div>
        </div>
    );
}
