'use client';

import { useState, useRef, useEffect } from 'react';
import {
    Sparkles,
    Send,
    Mic,
    MicOff,
    Loader2,
    TrendingUp,
    AlertCircle,
    ChevronDown,
    Target,
    Zap
} from 'lucide-react';
import Image from 'next/image';

interface ProphetAgentMessage {
    id: string;
    role: 'user' | 'agent';
    content: string;
    markets?: AgentMarketSuggestion[];
    timestamp: Date;
}

interface AgentMarketSuggestion {
    id: string;
    title: string;
    yesPrice: number;
    confidence: number;
    reasoning: string;
    action: 'BUY_YES' | 'BUY_NO' | 'HOLD';
}

// Example prompts for users
const EXAMPLE_PROMPTS = [
    "Find me the best political bets this week",
    "What crypto markets are heating up?",
    "Show me undervalued markets with high volume",
    "What's the safest bet right now?",
    "Find markets expiring this month with edge",
];

export default function ProphetAgent() {
    const [messages, setMessages] = useState<ProphetAgentMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Mock AI response - in production, call Prophet Oracle API
    const generateAgentResponse = async (query: string): Promise<ProphetAgentMessage> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mock response based on query
        const lowerQuery = query.toLowerCase();

        let responseContent = '';
        let markets: AgentMarketSuggestion[] = [];

        if (lowerQuery.includes('crypto') || lowerQuery.includes('bitcoin') || lowerQuery.includes('eth')) {
            responseContent = "I found 3 crypto markets with strong signals based on on-chain data and sentiment analysis:";
            markets = [
                {
                    id: 'btc-100k',
                    title: 'Bitcoin $100K before March 2026',
                    yesPrice: 0.67,
                    confidence: 78,
                    reasoning: 'Whale accumulation + ETF inflows suggest bullish momentum',
                    action: 'BUY_YES',
                },
                {
                    id: 'eth-sol-tvl',
                    title: 'Ethereum flips Solana in TVL by Q2',
                    yesPrice: 0.78,
                    confidence: 65,
                    reasoning: 'L2 activity increasing, but Solana DeFi growing faster',
                    action: 'HOLD',
                },
                {
                    id: 'sol-500',
                    title: 'Solana reaches $500',
                    yesPrice: 0.23,
                    confidence: 52,
                    reasoning: 'High risk/reward. Network metrics positive but macro uncertain',
                    action: 'BUY_YES',
                },
            ];
        } else if (lowerQuery.includes('politic') || lowerQuery.includes('election') || lowerQuery.includes('fed')) {
            responseContent = "Here are the political markets with the best edge right now:";
            markets = [
                {
                    id: 'fed-rate',
                    title: 'Fed cuts rates in February meeting',
                    yesPrice: 0.42,
                    confidence: 71,
                    reasoning: 'CPI data suggests room for cuts, but Fed rhetoric is hawkish',
                    action: 'BUY_NO',
                },
                {
                    id: 'gop-senate',
                    title: 'GOP maintains Senate majority in 2026',
                    yesPrice: 0.61,
                    confidence: 68,
                    reasoning: 'Map favors incumbents, but special elections unpredictable',
                    action: 'HOLD',
                },
            ];
        } else if (lowerQuery.includes('safe') || lowerQuery.includes('low risk')) {
            responseContent = "Looking for safer bets with high probability of payout:";
            markets = [
                {
                    id: 'super-bowl',
                    title: 'Super Bowl total viewers over 100M',
                    yesPrice: 0.92,
                    confidence: 95,
                    reasoning: 'Historical data: Every Super Bowl since 2015 exceeded 100M',
                    action: 'BUY_YES',
                },
            ];
        } else {
            responseContent = "Based on my analysis of current markets, here are my top picks:";
            markets = [
                {
                    id: 'recession-2026',
                    title: 'Global recession in 2026',
                    yesPrice: 0.31,
                    confidence: 62,
                    reasoning: 'Yield curve inverted, but labor market strong. Mixed signals.',
                    action: 'HOLD',
                },
                {
                    id: 'ai-oscar',
                    title: 'AI-generated film wins Oscar 2026',
                    yesPrice: 0.12,
                    confidence: 45,
                    reasoning: 'Long shot but asymmetric upside. Academy historically conservative.',
                    action: 'BUY_YES',
                },
            ];
        }

        return {
            id: `msg-${Date.now()}`,
            role: 'agent',
            content: responseContent,
            markets,
            timestamp: new Date(),
        };
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: ProphetAgentMessage = {
            id: `msg-${Date.now()}`,
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await generateAgentResponse(userMessage.content);
            setMessages(prev => [...prev, response]);
        } catch (error) {
            const errorMessage: ProphetAgentMessage = {
                id: `msg-${Date.now()}`,
                role: 'agent',
                content: "Sorry, I encountered an error analyzing markets. Please try again.",
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExampleClick = (prompt: string) => {
        setInput(prompt);
    };

    const toggleVoice = () => {
        setIsListening(!isListening);
        // In production: implement Web Speech API
    };

    return (
        <div className="flex flex-col h-[600px] bg-zinc-900/50 border border-white/10 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <Sparkles className="text-white" size={20} />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            Prophet Agent
                            <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-red-500/20 to-white/10 text-[10px] flex items-center gap-1">
                                <Image src="/flex-16x16.png" alt="Flex" width={10} height={10} />
                                <span className="text-white/70">Flex AI</span>
                            </span>
                        </h2>
                        <p className="text-xs text-zinc-400">AI-powered market analysis</p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    // Empty state with examples
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        <Sparkles size={40} className="text-indigo-400 mb-4" />
                        <h3 className="text-white font-medium mb-2">Ask Prophet anything about markets</h3>
                        <p className="text-zinc-500 text-sm mb-6 max-w-sm">
                            I can analyze prediction markets, find opportunities, and give you AI-powered insights.
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center max-w-md">
                            {EXAMPLE_PROMPTS.slice(0, 3).map((prompt, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleExampleClick(prompt)}
                                    className="px-3 py-1.5 rounded-full bg-zinc-800 text-zinc-300 text-xs hover:bg-zinc-700 transition"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-2' : ''}`}>
                                {/* Message bubble */}
                                <div className={`rounded-2xl px-4 py-3 ${msg.role === 'user'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-zinc-800 text-zinc-100'
                                    }`}>
                                    <p className="text-sm">{msg.content}</p>
                                </div>

                                {/* Market suggestions */}
                                {msg.markets && msg.markets.length > 0 && (
                                    <div className="mt-2 space-y-2">
                                        {msg.markets.map((market) => (
                                            <div key={market.id} className="bg-zinc-800/50 border border-white/10 rounded-xl p-3">
                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                    <h4 className="text-white text-sm font-medium">{market.title}</h4>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${market.action === 'BUY_YES' ? 'bg-emerald-500/20 text-emerald-400' :
                                                            market.action === 'BUY_NO' ? 'bg-red-500/20 text-red-400' :
                                                                'bg-zinc-500/20 text-zinc-400'
                                                        }`}>
                                                        {market.action.replace('_', ' ')}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-4 mb-2">
                                                    <div className="flex items-center gap-1">
                                                        <TrendingUp size={12} className="text-emerald-400" />
                                                        <span className="text-emerald-400 text-xs font-bold">
                                                            {(market.yesPrice * 100).toFixed(0)}¢
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Target size={12} className="text-indigo-400" />
                                                        <span className="text-indigo-400 text-xs">
                                                            {market.confidence}% confidence
                                                        </span>
                                                    </div>
                                                </div>

                                                <p className="text-zinc-400 text-xs">{market.reasoning}</p>

                                                <div className="mt-2 flex gap-2">
                                                    <button className="flex-1 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/30 transition">
                                                        Buy YES
                                                    </button>
                                                    <button className="flex-1 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/30 transition">
                                                        Buy NO
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Timestamp */}
                                <p className="text-[10px] text-zinc-600 mt-1 px-2">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))
                )}

                {/* Loading indicator */}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-zinc-800 rounded-2xl px-4 py-3 flex items-center gap-2">
                            <Loader2 size={16} className="animate-spin text-indigo-400" />
                            <span className="text-zinc-400 text-sm">Analyzing markets...</span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={toggleVoice}
                        className={`p-2 rounded-xl transition ${isListening
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-zinc-800 text-zinc-400 hover:text-white'
                            }`}
                    >
                        {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>

                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask Prophet about markets..."
                        className="flex-1 bg-zinc-800 border border-white/10 rounded-xl px-4 py-2 text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500/50"
                        disabled={isLoading}
                    />

                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </form>
        </div>
    );
}
