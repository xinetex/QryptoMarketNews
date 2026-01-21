import ProphetAgent from '@/components/agent/ProphetAgent';
import ProphetManual from '@/components/ProphetManual';

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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono text-zinc-600 pt-12 border-t border-zinc-900">
                    <div className="p-4 border border-zinc-900 rounded bg-zinc-950/50">
                        <strong className="text-zinc-400 block mb-2">MEMORY (L1)</strong>
                        Agent retains short-term context of your queries locally.
                    </div>
                    <div className="p-4 border border-zinc-900 rounded bg-zinc-950/50">
                        <strong className="text-zinc-400 block mb-2">SENTINEL MODE</strong>
                        Passive scanning of 30d volatility and volume anomalies.
                    </div>
                    <div className="p-4 border border-zinc-900 rounded bg-zinc-950/50">
                        <strong className="text-zinc-400 block mb-2">RSVP DISPLAY</strong>
                        400-800 WPM transmission for rapid insight ingestion.
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
