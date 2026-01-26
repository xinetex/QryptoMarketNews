import ProphetAgent from '@/components/agent/ProphetAgent';
import ProphetManual from '@/components/ProphetManual';
import RSVPDeck from '@/components/RSVPDeck';
import NewsSlider from '@/components/NewsSlider';
import DislocationFeed from '@/components/DislocationFeed';
import DerivativesPanel from '@/components/DerivativesPanel';
import DailyBriefingCard from '@/components/DailyBriefingCard';
import MarketPulseCard from '@/components/MarketPulseCard';
import { Activity } from 'lucide-react';

export default function IntelligencePage() {
    return (
        <div className="min-h-screen bg-black text-zinc-100 flex flex-col items-center pt-24 pb-12 px-4">

            <div className="w-full max-w-4xl space-y-8">
                <div className="text-center space-y-4">
                    <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        MARKET INTELLIGENCE
                    </h1>
                    <p className="text-zinc-500 font-mono text-sm max-w-md mx-auto">
                        Connect your consciousness to the timeline.
                        <br />
                        High-bandwidth information transmission active.
                    </p>
                </div>

                <div className="relative">
                    {/* Glow effect underneath */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-2xl bg-indigo-900/20 blur-3xl rounded-full pointer-events-none" />

                    <ProphetAgent />
                </div>

                {/* Daily Briefing - The "What Changed" */}
                <div className="mt-8 max-w-3xl mx-auto">
                    <DailyBriefingCard />
                </div>

                {/* Market Intelligence Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-12">
                    {/* Market Dislocation Detector - 2/3 width */}
                    <div className="lg:col-span-2 relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-red-500/5 blur-3xl rounded-3xl pointer-events-none" />
                        <div className="relative p-6 rounded-2xl border border-amber-500/20 bg-zinc-950/80 backdrop-blur-sm h-full">
                            <DislocationFeed maxItems={5} autoRefresh={true} refreshInterval={60000} />
                        </div>
                    </div>

                    {/* Derivatives Panel - 1/3 width */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-indigo-500/5 blur-3xl rounded-3xl pointer-events-none" />
                        <div className="relative h-full">
                            <DerivativesPanel />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono text-zinc-600 pt-12 border-t border-zinc-900">
                    <div className="p-4 border border-zinc-900 rounded bg-zinc-950/50">
                        <strong className="text-zinc-400 block mb-2">MEMORY (L1)</strong>
                        Agent retains short-term context of your queries locally.
                    </div>
                    <div className="p-4 border border-zinc-900 rounded bg-zinc-950/50">
                        <strong className="text-zinc-400 block mb-2">SENTINEL MODE</strong>
                        Passive scanning of 30d volatility and volume anomalies.
                    </div>
                    <div className="h-40 relative">
                        <RSVPDeck
                            autoPlay={true}
                            items={[
                                // Card 1: Market Pulse (Dynamic)
                                <div key="pulse" className="h-full">
                                    <MarketPulseCard />
                                </div>,

                                // Card 2: News Feed
                                <div key="news" className="h-full pt-2 px-2">
                                    <NewsSlider autoPlay={false} />
                                </div>
                            ]}
                        />
                    </div>
                </div>

                {/* System Manual / Help Section */}
                <ProphetManual />
            </div>

            {/* Persistent FlexConsole Sidebar (Fixed Right) */}
            <div className="fixed right-6 top-24 bottom-12 w-64 hidden xl:block pointer-events-auto">
                <div className="h-full rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-950">
                    <FlexConsole />
                </div>
            </div>

        </div>
    );
}

import FlexConsole from '@/components/FlexConsole';
