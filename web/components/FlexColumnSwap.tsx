'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles,
    ChevronRight,
    TrendingUp,
    Target,
    ArrowLeft
} from 'lucide-react';
import Image from 'next/image';
import FlexFeaturesCard from './FlexFeaturesCard';
import HotMarketsSlider from './HotMarketsSlider';

export default function FlexColumnSwap() {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="flex flex-col gap-6 h-full">
            <AnimatePresence mode="wait">
                {!isExpanded ? (
                    <motion.div
                        key="standard"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col gap-6 h-full"
                    >
                        {/* Flex Trigger Card */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setIsExpanded(true)}
                            className="cursor-pointer group relative bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-2xl p-5 overflow-hidden h-44 flex flex-col justify-between shrink-0"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                            {/* Header */}
                            <div className="relative z-10 flex justify-between items-start">
                                <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center overflow-hidden shadow-lg">
                                    <Image
                                        src="/flex-64x64.png"
                                        alt="Flex"
                                        width={24}
                                        height={24}
                                        className="opacity-90"
                                    />
                                </div>
                                <div className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                                    <Sparkles size={10} />
                                    Flex AI
                                </div>
                            </div>

                            {/* Content */}
                            <div className="relative z-10">
                                <h3 className="text-lg font-bold text-white leading-tight mb-1 group-hover:text-indigo-300 transition-colors">
                                    Market Intelligence
                                </h3>
                                <p className="text-xs text-zinc-500 line-clamp-2 mb-3">
                                    Click to swap this column for AI Tools.
                                </p>

                                <div className="flex items-center gap-3 text-[10px] text-zinc-400 font-medium">
                                    <span className="flex items-center gap-1"><TrendingUp size={10} className="text-emerald-400" /> 247 Live</span>
                                    <span className="flex items-center gap-1"><Target size={10} className="text-indigo-400" /> Agent Ready</span>
                                </div>
                            </div>

                            {/* Action Icon */}
                            <div className="absolute bottom-4 right-4 text-zinc-600 group-hover:text-white transition-colors">
                                <ChevronRight size={18} />
                            </div>
                        </motion.div>

                        {/* Hot Markets Card (Default Content) */}
                        <div className="relative h-52 rounded-xl bg-[#12121A] border border-orange-500/20 p-5 overflow-hidden shrink-0">
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-900/10 opacity-50" />
                            <div className="relative z-10 w-full h-full">
                                <HotMarketsSlider autoPlay={true} interval={7000} />
                            </div>
                        </div>

                        {/* Marketing / Placeholder for more content */}
                        <div className="rounded-xl bg-zinc-900/50 border border-white/5 p-4 flex-1 min-h-[100px] flex items-center justify-center text-center">
                            <div className="text-zinc-500 text-xs">
                                <p>More live signals coming soon.</p>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="expanded"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col h-full bg-zinc-950/50 rounded-2xl border border-white/10 overflow-hidden"
                    >
                        {/* Back Header */}
                        <div className="p-3 border-b border-white/10 flex items-center gap-2 bg-black/20">
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition"
                            >
                                <ArrowLeft size={16} />
                            </button>
                            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Back to Dashboard</span>
                        </div>

                        {/* Full Flex Feature Card (Scrollable Area) */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <FlexFeaturesCard showHeader={true} defaultTab="discovery" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
