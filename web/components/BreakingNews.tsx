"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

interface BreakingNewsProps {
    message?: string;
    type?: "alert" | "info" | "positive";
    autoHide?: number; // seconds
}

export default function BreakingNews({
    message = "Breaking: Bitcoin surges past $100,000 for the first time!",
    type = "alert",
    autoHide
}: BreakingNewsProps) {
    const [visible, setVisible] = useState(true);
    const [isAnimating, setIsAnimating] = useState(true);

    useEffect(() => {
        // Entrance animation
        const animTimer = setTimeout(() => setIsAnimating(false), 500);

        // Auto-hide
        if (autoHide) {
            const hideTimer = setTimeout(() => setVisible(false), autoHide * 1000);
            return () => {
                clearTimeout(animTimer);
                clearTimeout(hideTimer);
            };
        }

        return () => clearTimeout(animTimer);
    }, [autoHide]);

    if (!visible) return null;

    const typeStyles = {
        alert: "bg-gradient-to-r from-red-600/90 to-red-500/90 border-red-400/50",
        info: "bg-gradient-to-r from-blue-600/90 to-indigo-500/90 border-blue-400/50",
        positive: "bg-gradient-to-r from-emerald-600/90 to-green-500/90 border-emerald-400/50",
    };

    return (
        <div
            className={`
                fixed top-0 left-0 right-0 z-50
                ${typeStyles[type]}
                border-b backdrop-blur-sm
                transform transition-transform duration-500
                ${isAnimating ? '-translate-y-full' : 'translate-y-0'}
            `}
        >
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Blinking "LIVE" badge */}
                    <div className="flex items-center gap-1.5 bg-white/20 px-2 py-0.5 rounded text-xs font-bold">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        BREAKING
                    </div>

                    {/* Alert Icon */}
                    <AlertTriangle size={18} className="animate-pulse" />

                    {/* Message */}
                    <span className="font-medium text-sm md:text-base">{message}</span>
                </div>

                {/* Close Button */}
                <button
                    onClick={() => setVisible(false)}
                    className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Animated bottom border */}
            <div className="h-0.5 bg-white/30 animate-pulse" />
        </div>
    );
}
