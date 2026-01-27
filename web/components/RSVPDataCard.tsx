'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RSVPViewport } from './agent/RSVPViewport';
import { Maximize2, Minimize2, Play, Pause, Activity, Globe, Zap } from 'lucide-react';

interface RSVPDataCardProps {
    title: string;
    data: any; // Generic data object
    type: 'whale' | 'news' | 'market';
}

export default function RSVPDataCard({ title, data, type }: RSVPDataCardProps) {
    const [expanded, setExpanded] = useState(false);

    // Safety check for data
    if (!data) return <div className="bg-zinc-950 h-full w-full flex items-center justify-center text-zinc-800 text-xs">NO DATA</div>;

    // Extract text based on data type
    const rsvpText = type === 'whale'
        ? `WHALE MOVE DETECTED. ${data.narrative ? data.narrative.toUpperCase() : 'UNKNOWN ACTIVITY'}. VALUE: $${data.transaction ? (data.transaction.amountUsd / 1000000).toFixed(1) : '0.0'}MILLION. CONFIDENCE: HIGH.`
        : type === 'news'
            ? data.summary ? data.summary.toUpperCase() : "NO SUMMARY AVAILABLE"
            : "MARKET DATA UNAVAILABLE";

    return (
        <motion.div
            layout
            className={`h-full w-full relative bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden flex flex-col group`}
            transition={{ duration: 0.3 }}
        >
            {/* Header */}
            <div className="w-full p-2 flex justify-between items-center bg-zinc-900/50 border-b border-zinc-800 z-20 h-10 shrink-0">
                <div className="flex items-center gap-2">
                    {type === 'whale' && <Activity size={12} className="text-indigo-500" />}
                    {type === 'news' && <Globe size={12} className="text-emerald-500" />}
                    {type === 'market' && <Zap size={12} className="text-amber-500" />}
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest truncate max-w-[150px]">{title}</span>
                </div>
            </div>

            {/* Content Container */}
            <div className="flex-1 w-full flex flex-col relative">
                {/* Visual Layer (Background) */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    {/* Abstract grid or gradient */}
                    <div className={`w-full h-full bg-gradient-to-br ${type === 'whale' ? 'from-indigo-900 to-black' :
                            type === 'news' ? 'from-emerald-900 to-black' : 'from-amber-900 to-black'
                        }`} />
                </div>

                {/* RSVP Area (Main Focus) */}
                <div className="flex-1 relative flex flex-col items-center justify-center p-4">
                    {/* Custom wrapper for RSVP to fit card */}
                    <div className="w-full h-24 transform scale-90 origin-center">
                        <RSVPViewport
                            text={rsvpText}
                            wpm={250}
                            autoPlay={true}
                        />
                    </div>
                </div>

                {/* Footer Info */}
                <div className="h-8 border-t border-zinc-800 bg-black/50 flex items-center justify-between px-3">
                    <span className="text-[9px] text-zinc-600 font-mono">LIVE STREAM</span>
                    <div className="flex gap-1">
                        <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                        <div className="w-1 h-1 rounded-full bg-zinc-800" />
                        <div className="w-1 h-1 rounded-full bg-zinc-800" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
