'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Sparkles,
    ChevronRight,
    TrendingUp,
    Target
} from 'lucide-react';
import Image from 'next/image';
import FlexFeaturesCard from './FlexFeaturesCard';

export default function FlexInnovationWidget() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Trigger Card (Compact) */}
            <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsOpen(true)}
                className="cursor-pointer group relative bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-2xl p-5 overflow-hidden h-44 flex flex-col justify-between"
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
                        AI-powered discovery and agent analysis.
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

            {/* Slide-out Panel */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        />

                        {/* Panel */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-full md:w-[480px] bg-zinc-950 border-l border-white/10 shadow-2xl z-50 overflow-y-auto"
                        >
                            <div className="p-4 md:p-6 min-h-full">
                                {/* Close Button */}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="absolute top-4 right-4 p-2 rounded-full bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors z-[60]"
                                >
                                    <X size={20} />
                                </button>

                                {/* Content */}
                                <div className="mt-8">
                                    <FlexFeaturesCard showHeader={true} defaultTab="discovery" />
                                </div>

                                <div className="mt-8 border-t border-white/5 pt-6 text-center">
                                    <p className="text-xs text-zinc-500 mb-2">Powered by</p>
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
                                        <Image src="/flex-16x16.png" alt="Flex" width={12} height={12} />
                                        <span className="text-xs font-bold text-zinc-300">FLEX CAPITAL</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
