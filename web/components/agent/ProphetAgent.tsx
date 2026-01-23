"use client";

import { useState, useEffect } from 'react';
import { RSVPViewport } from './RSVPViewport';
import { StreamingViewport } from './StreamingViewport';
import { AttunementLoader } from './AttunementLoader';
import { Send, Eye, BrainCircuit } from 'lucide-react';
import { useAccount } from 'wagmi';
import { agentMemory } from '@/lib/agent-memory';
import { generateProphecy } from '@/lib/prophecy-engine';
import { usePoints } from '@/hooks/usePoints';

export default function ProphetAgent() {
    const { address } = useAccount();
    const [input, setInput] = useState('');
    const [streamText, setStreamText] = useState<string | null>(null);
    const [isThinking, setIsThinking] = useState(false);
    const [wpm, setWpm] = useState(450);

    const [displayMode, setDisplayMode] = useState<'rsvp' | 'stream'>('stream');
    const { points } = usePoints();
    const [hasWelcomed, setHasWelcomed] = useState(false);

    // Initial Onboarding Welcome
    useEffect(() => {
        if (points && points.predictionsTotal === 0 && !hasWelcomed) {
            const welcomeMsg = "Welcome, Initiate. The timeline is shifting. I sense potential in you. Read the Daily Briefing above for context, then scroll down to the Dislocation Feed. When you see an edge, click 'CALL IT' to stake your reputation. Your journey to Oracle status begins now.";
            setStreamText(welcomeMsg);
            setHasWelcomed(true);
        }
    }, [points, hasWelcomed]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        setIsThinking(true);
        const query = input.trim();
        setInput(''); // Clear input immediately

        // 1. Check Memory (L1)
        const cached = await agentMemory.recall(query);
        if (cached) {
            console.log("Memory HIT:", cached);
            setStreamText(cached.response);
            setIsThinking(false);
            return;
        }

        // 2. Real Prophecy Engine Logic
        const coinMatch = query.match(/(bitcoin|ethereum|solana|dogecoin|btc|eth|sol|doge)/i);
        let coinId = 'bitcoin'; // Default fallback
        if (coinMatch) {
            const symbol = coinMatch[0].toLowerCase();
            if (symbol === 'btc') coinId = 'bitcoin';
            else if (symbol === 'eth') coinId = 'ethereum';
            else if (symbol === 'sol') coinId = 'solana';
            else if (symbol === 'doge') coinId = 'dogecoin';
            else coinId = symbol;
        }

        console.log(`🔮 Generating Prophecy for: ${coinId}`);

        try {
            const prophecy = await generateProphecy(coinId);
            const response = prophecy.narrative;

            // 3. Store in Memory
            await agentMemory.remember(query, response);

            setStreamText(response);
        } catch (error) {
            console.error("Prophecy failed:", error);
            setStreamText("The mists are too thick. I cannot see the timeline clearly right now.");
        } finally {
            setIsThinking(false);
        }
    };

    const formatAddress = (addr: string) => addr.slice(0, 6) + '...' + addr.slice(-4);

    return (
        <div className="w-full max-w-4xl mx-auto p-4 space-y-6">

            {/* Header / Sentinel Status */}
            <div className="flex items-center justify-between text-zinc-400 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-mono uppercase tracking-widest text-[10px]">Sentinel Active</span>
                </div>
                <div className="flex items-center gap-2">
                    <BrainCircuit size={14} className={isThinking ? "animate-pulse text-indigo-400" : ""} />
                    <span className="font-mono text-[10px]">PROPHET ORACLE V1</span>
                </div>
            </div>

            {/* Display Area */}
            <div className="min-h-[300px] flex items-center justify-center w-full">
                {streamText ? (
                    displayMode === 'rsvp' ? (
                        <RSVPViewport
                            text={streamText}
                            wpm={wpm}
                            onComplete={() => console.log('Message delivered')}
                        />
                    ) : (
                        <StreamingViewport
                            text={streamText}
                            onComplete={() => console.log('Message delivered')}
                        />
                    )
                ) : isThinking ? (
                    <AttunementLoader />
                ) : (
                    <div className="text-center space-y-4 opacity-50">
                        <Eye size={48} className="mx-auto text-zinc-700" />
                        <p className="text-zinc-600 font-mono text-sm">
                            "Ask and the timeline shall reveal itself."
                        </p>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                <div className="relative flex items-center bg-black rounded-xl p-1 border border-white/10">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask Prophet (e.g., 'What is the risk on SOL today?')"
                        className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-zinc-200 placeholder-zinc-600 font-medium"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isThinking}
                        className="p-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <Send size={18} />
                    </button>
                </div>

                {/* WPM & Display Mode Control */}
                <div className="absolute -bottom-8 right-0 text-[10px] text-zinc-500 font-mono flex items-center gap-6">
                    {/* Mode Toggle */}
                    <div className="flex gap-2 items-center">
                        <span>MODE:</span>
                        <button
                            type="button"
                            onClick={() => setDisplayMode('rsvp')}
                            className={`hover:text-white transition-colors ${displayMode === 'rsvp' ? 'text-indigo-400 font-bold' : ''}`}
                        >
                            RSVP
                        </button>
                        <span className="text-zinc-700">|</span>
                        <button
                            type="button"
                            onClick={() => setDisplayMode('stream')}
                            className={`hover:text-white transition-colors ${displayMode === 'stream' ? 'text-indigo-400 font-bold' : ''}`}
                        >
                            STREAM
                        </button>
                    </div>

                    {/* Speed only for RSVP/Stream multiplier? Let's keep WPM for RSVP and just rely on that state for both roughly */}
                    {displayMode === 'rsvp' && (
                        <div className="flex gap-2 items-center">
                            <span>SPEED:</span>
                            <button type="button" onClick={() => setWpm(300)} className={`hover:text-white ${wpm === 300 ? 'text-indigo-400' : ''}`}>SLOW</button>
                            <button type="button" onClick={() => setWpm(450)} className={`hover:text-white ${wpm === 450 ? 'text-indigo-400' : ''}`}>NORMAL</button>
                            <button type="button" onClick={() => setWpm(700)} className={`hover:text-white ${wpm === 700 ? 'text-indigo-400' : ''}`}>HYPER</button>
                        </div>
                    )}
                </div>
            </form>

        </div>
    );
}
