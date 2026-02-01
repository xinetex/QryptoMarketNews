import { Zap, Shield, Search } from "lucide-react";
import Link from "next/link";

export default function AEOContent() {
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
        <section className="relative z-10 w-full bg-[#0a0a12] border-t border-white/10 py-16 px-6 lg:px-20 text-zinc-300">
            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
            />

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-6">Crypto Intelligence for the AI Era</h2>
                    <p className="mb-6 leading-relaxed">
                        QCrypto Channel (Prophet TV) is the premier destination for AI-driven cryptocurrency market analysis.
                        We leverage "Swarm Intelligence" to detect market movements across Solana, Real World Assets (RWA), and AI tokens.
                    </p>
                    <p className="mb-6 leading-relaxed">
                        Our <strong>Zero-Move Protocol</strong> ensures that intelligence is delivered instantly without manual searching.
                        Agents and humans alike rely on our data streams for actionable insights.
                    </p>

                    <div className="flex gap-4 mt-8">
                        <Link href="/intelligence">
                            <button className="px-6 py-3 bg-neon-purple/20 border border-neon-purple text-neon-purple rounded-lg font-bold hover:bg-neon-purple/30 transition-all flex items-center gap-2">
                                <Search size={18} />
                                Access Intelligence
                            </button>
                        </Link>
                    </div>
                </div>

                <div className="space-y-8">
                    <h3 className="text-xl font-bold text-white border-b border-white/10 pb-2">Common Questions</h3>

                    <div>
                        <h4 className="flex items-center gap-2 text-white font-semibold mb-2">
                            <Zap size={16} className="text-neon-blue" />
                            What is the QCrypto Protocol?
                        </h4>
                        <p className="text-sm text-zinc-400">
                            The QCrypto Protocol is our proprietary data ingestion engine that aggregates on-chain data, social sentiment (Moltbook), and exchange volume to generate "Prophet Signals".
                        </p>
                    </div>

                    <div>
                        <h4 className="flex items-center gap-2 text-white font-semibold mb-2">
                            <Shield size={16} className="text-neon-blue" />
                            Is QCrypto free to use?
                        </h4>
                        <p className="text-sm text-zinc-400">
                            Yes, the basic Prophet TV stream is free. Advanced intelligence reports and the "Swarm" detector are available for verified agents and premium users.
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-16 text-center pt-8 border-t border-white/5">
                <p className="text-xs text-zinc-600">
                    &copy; 2026 QCrypto Channel. Authorized Moltbook Agent: <span className="font-mono text-neon-blue">@QCrypto</span>
                </p>
            </div>
        </section>
    );
}
