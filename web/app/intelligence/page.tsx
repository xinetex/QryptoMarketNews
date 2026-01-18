'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import PredictionMarkets from '@/components/PredictionMarkets';
import MissionControl from '@/components/MissionControl';
import ContextLanes from '@/components/ContextLanes';
import { AnimatePresence, motion } from 'framer-motion';

const missions = [
    { id: 'sentiment', label: '📊 Market Sentiment', icon: '🐦', prompt: 'Analyze current sentiment on X (Twitter) for...' },
    { id: 'gem-hunter', label: '💎 Gem Hunter', icon: '🚀', prompt: 'Find early-stage projects with 100x potential in the sector...' },
    { id: 'project-eval', label: '🧐 Project Due Diligence', icon: '📝', prompt: 'Evaluate this project like a VC analyst: ' },
    { id: 'whale-watch', label: '🐋 Whale Watch', icon: '🌊', prompt: 'Track whale movements and smart money flow for...' }
];

export default function IntelligencePage() {
    const [mission, setMission] = useState('sentiment');
    const [input, setInput] = useState('');
    const [isChatExpanded, setIsChatExpanded] = useState(false);

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

        setIsChatExpanded(true); // Ensure chat opens when submitting

        // append or sendMessage depending on version, append is safer for array updates
        if (append) {
            await append({ role: 'user', content: input });
        }
        setInput('');
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 font-sans relative">

            {/* Main Content Area */}
            <main className="max-w-6xl mx-auto pb-44 space-y-8">
                <header className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 pb-2">
                                Prophet Intelligence
                            </h1>
                            <p className="text-gray-400 text-sm font-medium tracking-wide">AI-Powered Market Analysis Agent</p>
                        </div>

                        {/* Mission Control (Lane Manager) */}
                        <div className="flex-1 md:max-w-xl">
                            <MissionControl
                                missions={missions}
                                currentMission={mission}
                                onMissionChange={setMission}
                            />
                        </div>
                    </div>

                    {/* Dynamic Context Lanes */}
                    <div className="border-b border-gray-800/50 pb-2">
                        <ContextLanes currentMission={mission} />
                    </div>
                </header>

                {/* Prediction Markets (Now Front & Center) */}
                <PredictionMarkets />
            </main>

            {/* Fixed Omnibar / Chat Interface */}
            <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-12 bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-none">
                <div className="max-w-3xl mx-auto pointer-events-auto">

                    {/* Chat History Drawer */}
                    <AnimatePresence>
                        {(isChatExpanded || messages.length > 0) && (
                            <motion.div
                                initial={{ opacity: 0, y: 20, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: 'auto' }}
                                exit={{ opacity: 0, y: 20, height: 0 }}
                                className="bg-gray-900/90 backdrop-blur-md border border-gray-800 rounded-t-2xl overflow-hidden mb-2 shadow-2xl flex flex-col"
                                style={{ maxHeight: '60vh' }}
                            >
                                {/* Drawer Handle / Close */}
                                <div
                                    className="h-6 w-full flex items-center justify-center cursor-pointer hover:bg-gray-800/50"
                                    onClick={() => setIsChatExpanded(!isChatExpanded)}
                                >
                                    <div className="w-12 h-1 bg-gray-700 rounded-full" />
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {messages.length === 0 && (
                                        <div className="text-center text-gray-500 py-10">
                                            <p>Ready to analyze via {missions.find(m => m.id === mission)?.label}</p>
                                        </div>
                                    )}

                                    {messages.map((m: any) => (
                                        <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${m.role === 'user'
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-gray-800 text-gray-200 border border-gray-700'
                                                }`}>
                                                <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                                                    {m.content}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex justify-start">
                                            <div className="bg-gray-800 rounded-2xl px-4 py-3 flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" />
                                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce delay-75" />
                                                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce delay-150" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Input Omnibar */}
                    <form onSubmit={handleSubmit} className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity" />
                        <input
                            className="w-full bg-gray-900/90 border border-gray-700/50 backdrop-blur-xl rounded-full pl-6 pr-14 py-4 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 focus:outline-none transition-all placeholder-gray-500 shadow-xl"
                            value={input}
                            onChange={handleInputChange}
                            onFocus={() => setIsChatExpanded(true)}
                            placeholder={missions.find(m => m.id === mission)?.prompt}
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="absolute right-2 top-2 bottom-2 aspect-square bg-purple-600 hover:bg-purple-500 rounded-full flex items-center justify-center transition-all disabled:opacity-50 disabled:hover:bg-purple-600"
                        >
                            {isLoading ? (
                                <span className="animate-spin text-lg">⟳</span>
                            ) : (
                                <span>↑</span>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
