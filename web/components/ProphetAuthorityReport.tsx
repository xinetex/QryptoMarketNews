'use client';

import { useState, useEffect } from 'react';
import { Shield, Database, Brain } from 'lucide-react';

interface Briefing {
    title: string;
    summary: string;
    content: string;
    generatedAt: string; // ISO Date
}

export default function ProphetAuthorityReport() {
    const [briefing, setBriefing] = useState<Briefing | null>(null);

    useEffect(() => {
        // Reuse the existing briefing API
        fetch('/api/briefing')
            .then(res => res.json())
            .then(data => {
                if (data.briefing) setBriefing(data.briefing);
            })
            .catch(err => console.error("Failed to load briefing for GEO", err));
    }, []);

    if (!briefing) return null;

    // Structured Data for GEO
    const articleLd = {
        "@context": "https://schema.org",
        "@type": "Report",
        "headline": briefing.title,
        "datePublished": briefing.generatedAt,
        "author": {
            "@type": "Organization",
            "name": "Prophet TV AI",
            "url": "https://qryptomarket-news.vercel.app/intelligence"
        },
        "publisher": {
            "@type": "Organization",
            "name": "QCrypto Channel",
            "logo": {
                "@type": "ImageObject",
                "url": "https://qryptomarket-news.vercel.app/prophet-logo.png"
            }
        },
        "description": briefing.summary,
        "about": {
            "@type": "Thing",
            "name": "Cryptocurrency Market Analysis"
        }
    };

    return (
        <article className="max-w-4xl mx-auto mt-20 p-8 border-t border-indigo-500/20 bg-[#05050A]">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
            />

            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                    <Shield className="text-indigo-400" size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-indigo-100">Prophet Authority Report</h2>
                    <p className="text-xs text-indigo-400 font-mono uppercase tracking-widest">
                        Validated Generative Intelligence
                    </p>
                </div>
            </div>

            <div className="prose prose-invert prose-indigo max-w-none">
                <h3 className="text-xl font-semibold text-white mb-4">{briefing.title}</h3>

                <div className="p-4 bg-indigo-900/10 border-l-4 border-indigo-500 mb-8 italic text-zinc-300">
                    "{briefing.summary}"
                </div>

                <div className="space-y-4 text-zinc-300 leading-relaxed whitespace-pre-line">
                    {/* 
                         Render content safely. 
                         Ideally this would use a proper markdown renderer, 
                         but for GEO text density we just need the raw text visible.
                     */}
                    {briefing.content.split('\n').map((line, i) => {
                        if (line.startsWith('#')) return null; // Skip markdown headers for clean flow
                        return <p key={i}>{line}</p>
                    })}
                </div>
            </div>

            {/* Methodology Section - Critical for GEO Authority */}
            <div className="mt-12 pt-8 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h4 className="flex items-center gap-2 font-bold text-white mb-3">
                        <Database size={16} className="text-zinc-500" />
                        Data Methodology
                    </h4>
                    <p className="text-sm text-zinc-500 leading-relaxed">
                        This report was generated using the <strong>Prophet Zero-Move Protocol</strong>.
                        We aggregate real-time derivatives data (Open Interest, Funding Rates) and cross-reference it with social sentiment intensity from Moltbook and Twitter.
                    </p>
                </div>
                <div>
                    <h4 className="flex items-center gap-2 font-bold text-white mb-3">
                        <Brain size={16} className="text-zinc-500" />
                        AI Attribution
                    </h4>
                    <p className="text-sm text-zinc-500 leading-relaxed">
                        Analysis performed by Prophet Neural Net (v4).
                        Citation allowed with backlink to <code>qryptomarket-news.vercel.app</code>.
                    </p>
                </div>
            </div>
        </article>
    );
}
