"use client";

import { useState } from 'react';
import { RSVPViewport } from './RSVPViewport';
import { Send, Eye, BrainCircuit } from 'lucide-react';
import { useAccount } from 'wagmi';
import { agentMemory } from '@/lib/agent-memory';
import { generateProphecy } from '@/lib/prophecy-engine';

export default function ProphetAgent() {
    const { address } = useAccount();
    const [input, setInput] = useState('');
    const [streamText, setStreamText] = useState<string | null>(null);
    const [isThinking, setIsThinking] = useState(false);
    const [wpm, setWpm] = useState(450);

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
        // Extract coin symbol from query (very naive regex for now)
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
            <div className="min-h-[300px] flex items-center justify-center">
                {streamText ? (
                    <RSVPViewport
                        text={streamText}
                        wpm={wpm}
                        onComplete={() => console.log('Message delivered')}
                    />
                ) : isThinking ? (
                    <div className="text-zinc-500 font-mono animate-pulse text-center">
                        <div className="mb-4 text-4xl">🔮</div>
                        Scanning timelines...
                    </div>
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

                {/* WPM Control */}
                <div className="absolute -bottom-8 right-0 text-[10px] text-zinc-500 font-mono flex gap-2">
                    <span>SPEED:</span>
                    <button onClick={() => setWpm(300)} className={`hover:text-white ${wpm === 300 ? 'text-indigo-400' : ''}`}>SLOW</button>
                    <button onClick={() => setWpm(450)} className={`hover:text-white ${wpm === 450 ? 'text-indigo-400' : ''}`}>NORMAL</button>
                    <button onClick={() => setWpm(700)} className={`hover:text-white ${wpm === 700 ? 'text-indigo-400' : ''}`}>HYPER</button>
                </div>
            </form>

        </div>
    );
}
