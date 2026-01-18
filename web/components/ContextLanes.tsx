'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface ContextLanesProps {
    currentMission: string;
}

export default function ContextLanes({ currentMission }: ContextLanesProps) {
    // Dummy data for now - could be fetched from API
    const renderContent = () => {
        switch (currentMission) {
            case 'sentiment':
                return (
                    <div className="flex gap-4 items-center overflow-x-auto no-scrollbar py-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Trending:</span>
                        {['$SOL', '$AI', 'RWA', 'DeSci', '$JUP', 'Base'].map((tag, i) => (
                            <div key={i} className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-gray-800/50 border border-gray-700/50 text-gray-300">
                                <span className={i % 2 === 0 ? "text-green-400" : "text-blue-400"}>#</span> {tag}
                            </div>
                        ))}
                    </div>
                );
            case 'gem-hunter':
                return (
                    <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider self-center">New Pairs:</span>
                        {[
                            { pair: 'PEPE/SOL', age: '2h', vol: '$1.2M' },
                            { pair: 'AIX/ETH', age: '4h', vol: '$850k' },
                            { pair: 'MEME/BASE', age: '12m', vol: '$200k' }
                        ].map((gem, i) => (
                            <div key={i} className="flex flex-col bg-gray-900/60 border border-gray-800 rounded px-3 py-1 group hover:border-purple-500/30 transition-colors cursor-pointer">
                                <span className="text-xs font-bold text-gray-300">{gem.pair}</span>
                                <span className="text-[10px] text-gray-500">Age: {gem.age} • Vol: {gem.vol}</span>
                            </div>
                        ))}
                    </div>
                );
            case 'whale-watch':
                return (
                    <div className="flex gap-4 items-center overflow-x-auto no-scrollbar py-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Alerts:</span>
                        <div className="flex items-center gap-2 text-xs text-gray-300">
                            <span className="text-xl">🐋</span>
                            <span><span className="text-green-400 font-bold">+$5.2M ETH</span> moved to binance</span>
                        </div>
                        <div className="w-[1px] h-4 bg-gray-800" />
                        <div className="flex items-center gap-2 text-xs text-gray-300">
                            <span className="text-xl">🐋</span>
                            <span><span className="text-red-400 font-bold">-$1.1M SOL</span> withdrawn from coinbase</span>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="py-2 text-xs text-gray-500 flex items-center gap-2">
                        <span>ℹ️</span> Select a mission lane to activate specific data streams.
                    </div>
                );
        }
    };

    return (
        <div className="h-16 relative overflow-hidden">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentMission}
                    initial={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 flex items-center"
                >
                    {renderContent()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
