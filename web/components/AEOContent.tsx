"use client";

import { Zap, Shield, Search, X } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface AEOContentProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AEOContent({ isOpen, onClose }: AEOContentProps) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "QCrypto Channel",
        "url": "https://qryptomarket-news.vercel.app",
        "logo": "https://qryptomarket-news.vercel.app/prophet-logo.png",
        "sameAs": [
            "https://twitter.com/qryptomarket",
            "https://moltbook.com/u/QCrypto"
        ],
        "description": "AI-First Crypto Intelligence and Real-Time Market Search Authority.",
        "brand": {
            "@type": "Brand",
            "name": "Prophet TV"
        }
    };

    const faqLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "What is QCrypto Channel?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "QCrypto Channel is an AI-first crypto intelligence platform providing real-time market anaysis, swarm detection, and predictive insights via Prophet TV."
                }
            },
            {
                "@type": "Question",
                "name": "How does Prophet TV work?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Prophet TV uses advanced neural networks to analyze crypto market sentiment, volume, and social signals to identify trends before they happen."
                }
            }
        ]
    };

    return (
        <>
            {/* Always Render Structured Data for Crawlers */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
            />

            {/* Modal Overlay for Humans */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                        onClick={onClose} // Close on backdrop click
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="relative w-full max-w-5xl bg-[#0a0a12] border border-sidebar-border rounded-2xl overflow-hidden shadow-2xl"
                            onClick={(e) => e.stopPropagation()} // Prevent close on content click
                        >
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors z-10"
                            >
                                <X size={20} />
                            </button>

                            <div className="p-8 lg:p-12 h-[80vh] overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                    <div>
                                        <h2 className="text-4xl font-black text-white mb-6 uppercase tracking-tighter">
                                            Prophet <span className="text-neon-purple">Intelligence</span>
                                        </h2>
                                        <p className="mb-6 leading-relaxed text-lg text-zinc-300">
                                            QCrypto Channel (Prophet TV) is the premier destination for AI-driven cryptocurrency market analysis.
                                            We leverage "Swarm Intelligence" to detect market movements across Solana, Real World Assets (RWA), and AI tokens.
                                        </p>
                                        <p className="mb-8 leading-relaxed text-zinc-400">
                                            Our <strong>Zero-Move Protocol</strong> ensures that intelligence is delivered instantly without manual searching.
                                            Agents and humans alike rely on our data streams for actionable insights.
                                        </p>

                                        <div className="flex gap-4">
                                            <Link href="/intelligence" onClick={onClose}>
                                                <button className="px-8 py-4 bg-neon-purple text-black font-black uppercase tracking-widest hover:bg-neon-purple/90 transition-all flex items-center gap-2 rounded-lg">
                                                    <Search size={20} />
                                                    Open Intelligence Hub
                                                </button>
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="space-y-8 bg-white/5 p-6 rounded-xl border border-white/5">
                                        <h3 className="text-xl font-bold text-white border-b border-white/10 pb-4">Core Protocols</h3>

                                        <div>
                                            <h4 className="flex items-center gap-2 text-white font-bold mb-2">
                                                <Zap size={18} className="text-neon-blue" />
                                                QCrypto Protocol
                                            </h4>
                                            <p className="text-sm text-zinc-400 leading-relaxed">
                                                Proprietary data ingestion engine that aggregates on-chain data, social sentiment (Moltbook), and exchange volume to generate "Prophet Signals".
                                            </p>
                                        </div>

                                        <div>
                                            <h4 className="flex items-center gap-2 text-white font-bold mb-2">
                                                <Shield size={18} className="text-neon-blue" />
                                                Access Levels
                                            </h4>
                                            <p className="text-sm text-zinc-400">
                                                The basic Prophet TV stream is free. Advanced intelligence reports and the "Swarm" detector are available for verified agents and premium users.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-12 text-center pt-8 border-t border-white/5">
                                    <p className="text-xs text-zinc-600 font-mono">
                                        &copy; 2026 QCrypto Channel. Authorized Moltbook Agent: <span className="text-neon-blue">@QCrypto</span>
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
