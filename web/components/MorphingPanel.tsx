'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, Minimize2 } from 'lucide-react';
import { useState } from 'react';

interface MorphingPanelProps {
    children: React.ReactNode;
    title: string;
    defaultColSpan?: number;
    defaultRowSpan?: number;
    className?: string;
    onExpand?: (isExpanded: boolean) => void;
}

export default function MorphingPanel({
    children,
    title,
    defaultColSpan = 1,
    defaultRowSpan = 1,
    className = "",
    onExpand
}: MorphingPanelProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => {
        const newState = !isExpanded;
        setIsExpanded(newState);
        if (onExpand) onExpand(newState);
    };

    return (
        <motion.div
            layout
            className={`relative bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden backdrop-blur-sm group ${className} ${isExpanded ? 'z-50' : 'z-10'
                }`}
            style={{
                gridColumn: isExpanded ? 'span 2' : `span ${defaultColSpan}`,
                gridRow: isExpanded ? 'span 2' : `span ${defaultRowSpan}`,
            }}
            transition={{
                layout: { duration: 0.4, type: "spring", stiffness: 100, damping: 15 }
            }}
        >
            {/* Header controls overlay */}
            <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={toggleExpand}
                    className="p-2 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                >
                    {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
            </div>

            <div className="h-full w-full">
                {children}
            </div>
        </motion.div>
    );
}
