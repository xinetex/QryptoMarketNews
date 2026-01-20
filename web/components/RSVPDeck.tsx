'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';
import anime from 'animejs/lib/anime.es.js';
import { Play, Pause, FastForward, Rewind } from 'lucide-react';

interface RSVPDeckProps {
    items: ReactNode[];
    autoPlay?: boolean;
    speed?: number; // ms per card
}

export default function RSVPDeck({ items, autoPlay = false, speed = 3000 }: RSVPDeckProps) {
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

            anime({
                targets: el,
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

    // Auto-Play Logic (The RSVP Heart)
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying) {
            interval = setInterval(() => {
                setActiveIndex(prev => (prev + 1) % items.length);
            }, speed);
        }
        return () => clearInterval(interval);
    }, [isPlaying, speed, items.length]);

    const handleNext = () => setActiveIndex((prev) => (prev + 1) % items.length);
    const handlePrev = () => setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
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
                        onClick={() => setActiveIndex(i)} // Click deep item to zoom to it
                        className="absolute inset-0 flex items-center justify-center p-4 origin-center will-change-transform cursor-pointer"
                        style={{ backfaceVisibility: 'hidden' }}
                    >
                        <div className="w-full h-full bg-zinc-900/90 border border-white/10 rounded-xl shadow-2xl overflow-hidden backdrop-blur-md">
                            {item}
                        </div>
                    </div>
                ))}
            </div>

            {/* Deck Controls */}
            <div className="h-12 bg-zinc-950 border-t border-white/5 flex items-center justify-between px-4 z-20">
                <div className="flex items-center gap-1 text-[9px] font-mono text-zinc-500 uppercase">
                    <span className={isPlaying ? 'text-emerald-400 animate-pulse' : 'text-zinc-600'}>
                        {isPlaying ? 'AUTO-PILOT' : 'MANUAL'}
                    </span>
                    <span className="text-zinc-700">|</span>
                    <span>{activeIndex + 1}/{items.length}</span>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={handlePrev} className="p-1.5 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors">
                        <Rewind size={14} />
                    </button>
                    <button onClick={togglePlay} className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-full text-indigo-400 transition-colors">
                        {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                    </button>
                    <button onClick={handleNext} className="p-1.5 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors">
                        <FastForward size={14} />
                    </button>
                </div>
            </div>

            {/* Overlay Gradient (Depth Cue) */}
            <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-black/50 to-transparent pointer-events-none z-10" />
            <div className="absolute bottom-12 left-0 w-full h-24 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-10" />
        </div>
    );
}
