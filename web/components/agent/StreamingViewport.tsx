"use client";

import { useState, useEffect, useRef } from 'react';
import { RefreshCw, Play, Pause } from 'lucide-react';
import { calculateDelay } from '@/lib/rsvp/timing';

interface StreamingViewportProps {
    text: string;
    speed?: 'slow' | 'normal' | 'fast'; // Multiplier
    onComplete?: () => void;
}

export function StreamingViewport({
    text,
    speed = 'normal',
    onComplete,
}: StreamingViewportProps) {
    const [displayedWords, setDisplayedWords] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [allWords, setAllWords] = useState<string[]>([]);
    const [isPaused, setIsPaused] = useState(false);

    // Speed multipliers (delays in ms)
    const baseDelay = speed === 'slow' ? 120 : speed === 'fast' ? 30 : 60;

    useEffect(() => {
        // Reset valid text
        if (!text) return;
        setAllWords(text.split(' '));
        setDisplayedWords([]);
        setCurrentIndex(0);
    }, [text]);

    useEffect(() => {
        if (isPaused || currentIndex >= allWords.length) {
            if (currentIndex >= allWords.length && allWords.length > 0) {
                onComplete?.();
            }
            return;
        }

        const timeout = setTimeout(() => {
            setDisplayedWords(prev => [...prev, allWords[currentIndex]]);
            setCurrentIndex(prev => prev + 1);
        }, baseDelay);

        return () => clearTimeout(timeout);
    }, [currentIndex, allWords, isPaused, baseDelay, onComplete]);

    const progress = allWords.length > 0 ? (currentIndex / allWords.length) * 100 : 0;

    return (
        <div className="relative w-full max-w-2xl mx-auto rounded-xl overflow-hidden bg-black/80 border border-zinc-800 shadow-2xl backdrop-blur-xl p-8 min-h-[300px] flex flex-col">
            {/* Focal Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-indigo-500/50 blur-lg" />

            {/* Content Area */}
            <div className="flex-1 font-mono text-lg md:text-xl leading-relaxed text-zinc-300">
                {displayedWords.map((word, i) => (
                    <span
                        key={i}
                        className="inline-block mr-2 opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]"
                        style={{ animationDelay: '0ms' }} // Animation handled by React mounting
                    >
                        {word}
                    </span>
                ))}

                {/* Cursor */}
                {currentIndex < allWords.length && (
                    <span className="inline-block w-2.5 h-5 bg-indigo-500/80 animate-pulse align-middle ml-1" />
                )}
            </div>

            {/* Controls overlay (bottom right) */}
            <div className="mt-8 flex items-center justify-between text-[10px] text-zinc-600 font-mono uppercase tracking-widest border-t border-zinc-900 pt-4">

                <div className="flex items-center gap-4">
                    <span>Transmission: {currentIndex}/{allWords.length}</span>
                    <div className="w-24 h-1 bg-zinc-900 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500/50 transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={() => setIsPaused(!isPaused)} className="hover:text-indigo-400">
                        {isPaused ? "RESUME" : "PAUSE"}
                    </button>
                </div>
            </div>

            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); filter: blur(4px); }
                    to { opacity: 1; transform: translateY(0); filter: blur(0); }
                }
            `}</style>
        </div>
    );
}
