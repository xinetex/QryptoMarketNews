'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useMotionValue } from 'framer-motion';
import RSVPDataCard from './RSVPDataCard';

interface QuantumSliderProps {
    items: any[]; // Data items
    speed?: number; // Pixels per second
    direction?: 'left' | 'right';
}

export default function QuantumSlider({ items, speed = 50, direction = 'left' }: QuantumSliderProps) {
    // We duplicate items to create an infinite loop effect
    const duplicatedItems = [...items, ...items, ...items];

    return (
        <div className="w-full overflow-hidden relative group h-48">
            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black to-transparent z-10" />
            <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black to-transparent z-10" />

            <motion.div
                className="flex gap-4 absolute left-0 h-full py-2"
                animate={{
                    x: direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%']
                }}
                transition={{
                    ease: "linear",
                    duration: 20, // Adjust based on content width calculate logic ideally
                    repeat: Infinity
                }}
                // Pause on hover
                whileHover={{ animationPlayState: 'paused' } as any}
            >
                {duplicatedItems.map((item, idx) => (
                    <div key={idx} className="w-64 h-full shrink-0">
                        <RSVPDataCard
                            title={item.title || "DATA BLOCK"}
                            data={item}
                            type={item.type || 'market'}
                        />
                    </div>
                ))}
            </motion.div>
        </div>
    );
}
