"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { WordDisplay } from './WordDisplay';
import { calculateDelay } from '@/lib/rsvp/timing';
import { tokenize } from '@/lib/rsvp/tokenizer';
import { Play, Pause, RefreshCw, X } from 'lucide-react';

interface RSVPViewportProps {
    text: string;
    wpm?: number;
    onComplete?: () => void;
    autoPlay?: boolean;
}

export function RSVPViewport({
    text,
    wpm = 400,
    onComplete,
    autoPlay = true,
}: RSVPViewportProps) {
    const [words, setWords] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const [flashColor, setFlashColor] = useState<string | null>(null);

    const timeoutRef = useRef<NodeJS.Timeout>(null);

    // Initialize text
    useEffect(() => {
        const tokens = tokenize(text);
        setWords(tokens);
        setCurrentIndex(0);
        setIsPlaying(autoPlay && tokens.length > 0);
        return () => stop();
    }, [text, autoPlay]);

    const stop = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsPlaying(false);
    };

    const play = () => setIsPlaying(true);
    const pause = () => setIsPlaying(false);
    const reset = () => {
        setCurrentIndex(0);
        setIsPlaying(true);
        setFlashColor(null);
    };

    // Animation Loop
    useEffect(() => {
        if (!isPlaying || currentIndex >= words.length) {
            if (currentIndex >= words.length && isPlaying) {
                stop();
                onComplete?.();
            }
            return;
        }

        const currentWord = words[currentIndex];

        // Subliminal Flash Logic
        const lower = currentWord.toLowerCase().replace(/[^a-z]/g, '');
        if (['bull', 'bullish', 'moon', 'pump', 'green', 'up', 'accumulate'].includes(lower)) {
            setFlashColor('bg-emerald-500/30');
            setTimeout(() => setFlashColor(null), 150);
        } else if (['bear', 'bearish', 'crash', 'dump', 'red', 'down', 'sell', 'risk'].includes(lower)) {
            setFlashColor('bg-red-500/30');
            setTimeout(() => setFlashColor(null), 150);
        } else if (['gold', 'bitcoin', 'solana', 'money'].includes(lower)) {
            setFlashColor('bg-yellow-500/20');
            setTimeout(() => setFlashColor(null), 150);
        }

        const delay = calculateDelay(currentWord, wpm);

        timeoutRef.current = setTimeout(() => {
            setCurrentIndex(prev => prev + 1);
        }, delay);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [isPlaying, currentIndex, words, wpm, onComplete]);

    const currentWord = words[currentIndex] || "";
    const progress = words.length > 0 ? (currentIndex / words.length) * 100 : 0;

    return (
        <div className="relative w-full max-w-2xl mx-auto rounded-xl overflow-hidden bg-black/80 border border-zinc-800 shadow-2xl backdrop-blur-xl">
            {/* Subliminal Flash Overlay */}
            {flashColor && (
                <div className={`absolute inset-0 ${flashColor} pointer-events-none z-10 transition-colors duration-75`} />
            )}

            {/* Focal Lines (Guides) */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

            <div className="absolute top-8 left-1/2 -translate-x-1/2 w-px h-6 bg-red-500/20" />
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-px h-6 bg-red-500/20" />

            {/* Viewport Area */}
            <div className="h-64 flex flex-col items-center justify-center relative z-20">
                <WordDisplay word={currentWord} fontSize="xl" />
            </div>

            {/* Controls & Progress */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-4 flex items-center justify-between gap-4 z-30">
                <div className="flex items-center gap-2">
                    <button
                        onClick={isPlaying ? pause : play}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button
                        onClick={reset}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-indigo-500 transition-all duration-100 ease-linear"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="text-xs font-mono text-zinc-500">
                    {wpm} WPM
                </div>
            </div>
        </div>
    );
}
