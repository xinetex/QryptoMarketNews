'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';
import { animate } from 'animejs';
import { Play, Pause, ChevronRight, ChevronLeft, Scan, Lock } from 'lucide-react';

interface RSVPDeckProps {
    items: ReactNode[];
    autoPlay?: boolean;
    speed?: number; // ms per card
}

export default function RSVPDeck({ items, autoPlay = false, speed = 4000 }: RSVPDeckProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const containerRef = useRef<HTMLDivElement>(null);
    const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

    // Animation Engine
    useEffect(() => {
        if (!containerRef.current) return;

        // Animate all items
        items.forEach((_, i) => {
            const el = itemsRef.current[i];
            if (!el) return;

            const offset = i - activeIndex; // e.g., 0 (Active), 1 (Next), -1 (Prev)

            let z = 0;
            let scale = 1;
            let opacity = 1;
            let blur = 0;
            let y = 0;
            let zIndex = 0;

            if (offset === 0) {
                // ACTIVE
                z = 0;
                scale = 1;
                opacity = 1;
                blur = 0;
                zIndex = 50; // Top
            } else if (offset > 0) {
                // FUTURE (Deep in stack)
                z = -150 * offset;
                scale = 1 - (offset * 0.1);
                opacity = 1 - (offset * 0.2);
                y = -20 * offset;
                blur = offset * 2;
                zIndex = 40 - offset; // Stacks behind
            } else {
                // PAST (Behind camera or flown by)
                z = 200; // Fly "past"
                scale = 1.5;
                opacity = 0;
                zIndex = 0;
            }

            // Apply Z-Index immediately for hit-testing
            el.style.zIndex = zIndex.toString();

            animate(el, {
                translateZ: z,
                translateY: y,
                scale: scale,
                opacity: Math.max(0, opacity),
                filter: `blur(${blur}px)`,
                easing: 'spring(1, 80, 10, 0)',
                duration: 800
            });
        });

    }, [activeIndex, items]);

    // Auto-Play Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying) {
            interval = setInterval(() => {
                setActiveIndex(prev => (prev + 1) % items.length);
            }, speed);
        }
        return () => clearInterval(interval);
    }, [isPlaying, speed, items.length]);

    // Navigation Controls (Auto-Lock on manual interaction)
    const handleNext = () => {
        setIsPlaying(false);
        setActiveIndex((prev) => (prev + 1) % items.length);
    };

    const handlePrev = () => {
        setIsPlaying(false);
        setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
    };

    const togglePlay = () => setIsPlaying(!isPlaying);

    return (
        <div className="flex flex-col h-full bg-black/40 rounded-xl overflow-hidden relative">
            {/* 3D Viewport */}
            <div
                ref={containerRef}
                className="flex-1 relative perspective-1000 overflow-hidden"
                style={{ perspective: '1000px' }}
            >
                {items.map((item, i) => (
                    <div
                        key={i}
                        ref={el => { itemsRef.current[i] = el; }}
                        onClick={() => {
                            setActiveIndex(i);
                            setIsPlaying(false);
                        }}
                        className="absolute inset-0 flex items-center justify-center p-4 origin-center will-change-transform cursor-pointer"
                        style={{ backfaceVisibility: 'hidden' }}
                    >
                        <div className="w-full h-full bg-zinc-900/90 border border-white/10 rounded-xl shadow-2xl overflow-hidden backdrop-blur-md">
                            {item}
                        </div>
                    </div>
                ))}
            </div>

            {/* Deck Controls (Navigational Instrument Style) */}
            <div className="h-10 bg-zinc-950 border-t border-white/5 flex items-center justify-between px-3 z-20">
                <button
                    onClick={togglePlay}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider transition-colors ${isPlaying ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}
                >
                    {isPlaying ? <Scan size={10} /> : <Lock size={10} />}
                    {isPlaying ? 'SCANNING' : 'LOCKED'}
                </button>

                <div className="flex items-center">
                    <button onClick={handlePrev} className="p-1.5 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors">
                        <ChevronLeft size={14} />
                    </button>

                    <div className="px-2 text-[9px] font-mono text-zinc-600">
                        {activeIndex + 1} / {items.length}
                    </div>

                    <button onClick={handleNext} className="p-1.5 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors">
                        <ChevronRight size={14} />
                    </button>
                </div>
            </div>

            {/* Soft Overlay (Depth Cue) - Top only, removed bottom to clear buttons */}
            <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-black/50 to-transparent pointer-events-none z-10" />
        </div>
    );
}
