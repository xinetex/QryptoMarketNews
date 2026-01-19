"use client";

import { useMemo } from 'react';
import { calculateORP } from '@/lib/rsvp/orp';

interface WordDisplayProps {
    word: string;
    fontSize?: 'sm' | 'md' | 'lg' | 'xl';
}

const fontSizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-5xl',
    xl: 'text-6xl',
};

export function WordDisplay({
    word,
    fontSize = 'lg',
}: WordDisplayProps) {
    const orp = useMemo(() => calculateORP(word), [word]);

    if (!word) {
        return (
            <div className={`rsvp-word ${fontSizeClasses[fontSize]} text-zinc-600`}>
                —
            </div>
        );
    }

    // Offset calculation to align the focus character perfectly in the center
    // 50% is the center of the container. 
    // orp.offsetPercent tells us where the focus char is relative to the word start.
    // We want the focus char at 50% viewport.
    // So we translate the word by (50 - offsetPercent)%

    return (
        <div
            className={`font-mono font-bold ${fontSizeClasses[fontSize]} whitespace-nowrap select-none transition-transform duration-75`}
            style={{
                transform: `translateX(${50 - orp.offsetPercent}%)`,
            }}
        >
            <span className="text-zinc-100 dark:text-zinc-100">
                {orp.leftPart}
            </span>
            <span className="text-red-500">
                {orp.focusChar}
            </span>
            <span className="text-zinc-100 dark:text-zinc-100">
                {orp.rightPart}
            </span>
        </div>
    );
}
