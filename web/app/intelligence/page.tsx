'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import PredictionMarkets from '@/components/PredictionMarkets';

const missions = [
    { id: 'sentiment', label: '📊 Market Sentiment', icon: '🐦', prompt: 'Analyze current sentiment on X (Twitter) for...' },
    { id: 'gem-hunter', label: '💎 Gem Hunter', icon: '🚀', prompt: 'Find early-stage projects with 100x potential in the sector...' },
    { id: 'project-eval', label: '🧐 Project Due Diligence', icon: '📝', prompt: 'Evaluate this project like a VC analyst: ' },
    { id: 'whale-watch', label: '🐋 Whale Watch', icon: '🌊', prompt: 'Track whale movements and smart money flow for...' }
];

export default function IntelligencePage() {
    const [mission, setMission] = useState('sentiment');
    const [input, setInput] = useState('');

    // @ts-ignore - useChat types might be missing proper return type inference for input helpers
    const { messages, append, isLoading } = useChat({
        api: '/api/intelligence',
        body: { mission }
    } as any);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        // append or sendMessage depending on version, append is safer for array updates
        if (append) {
            await append({ role: 'user', content: input });
        }
        setInput('');
    };

    return (
        <div className="min-h-screen bg-black text-white p-8 font-sans">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                        Prophet Intelligence
                    </h1>
                    <p className="text-gray-400">AI-Powered Market Analysis Agent</p>
                </div>
                <div className="flex gap-2">
                    {missions.map(m => (
                        <button
                            key={m.id}
                            onClick={() => setMission(m.id)}
                            className={`px-4 py-2 rounded-full border border-gray-800 transition-all ${mission === m.id ? 'bg-purple-600 border-purple-500' : 'bg-gray-900 hover:bg-gray-800'
                                }`}
                        >
                            <span className="mr-2">{m.icon}</span>
                            {m.label}
                        </button>
                    ))}
                </div>
            </header>

            <main className="max-w-4xl mx-auto grid grid-cols-1 gap-6">

                {/* Chat Area */}
                <div className="bg-gray-900/50 rounded-xl p-6 min-h-[500px] flex flex-col border border-gray-800">
                    <div className="flex-1 space-y-4 mb-4 overflow-y-auto max-h-[600px]">
                        {messages.length === 0 && (
                            <div className="text-center text-gray-500 mt-20">
                                <div className="text-6xl mb-4 opacity-20">🧠</div>
                                <p>Select a mission and enter a token or topic to begin.</p>
                                <p className="text-xs mt-2 opacity-50">Powered by OpenAI & Real-Time Data</p>
                            </div>
                        )}

                        {messages.map((m: any) => (
                            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-lg p-4 ${m.role === 'user'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-800 text-gray-200 border border-gray-700'
                                    }`}>
                                    <div className="whitespace-pre-wrap font-mono text-sm">
                                        {m.content}
                                    </div>
                                    {/* Tool Invocations Visualization would go here */}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-800 rounded-lg p-4 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-75" />
                                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-150" />
                                    <span className="text-xs text-gray-400 ml-2">Analyzing market data...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSubmit} className="relative">
                        <input
                            className="w-full bg-black border border-gray-700 rounded-lg pl-4 pr-12 py-4 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all placeholder-gray-600"
                            value={input}
                            onChange={handleInputChange}
                            placeholder={missions.find(m => m.id === mission)?.prompt}
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="absolute right-2 top-2 bottom-2 px-4 bg-purple-600 hover:bg-purple-500 rounded-md transition-colors disabled:opacity-50"
                        >
                            Example →
                        </button>
                    </form>
                </div>

                {/* Prediction Markets Section */}
                <PredictionMarkets />
            </main>
        </div>
    );
}
