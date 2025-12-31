"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import { animate } from "animejs";
import { X } from "lucide-react";

interface SlidePanelProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    title?: string;
}

export default function SlidePanel({ isOpen, onClose, children, title }: SlidePanelProps) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isOpen && !isVisible) {
            // Opening animation
            setIsVisible(true);
            setIsAnimating(true);

            // Fade in overlay
            if (overlayRef.current) {
                animate(overlayRef.current, {
                    opacity: [0, 1],
                    duration: 400,
                    easing: "easeOutCubic",
                });
            }

            // Slide up panel
            if (panelRef.current) {
                animate(panelRef.current, {
                    translateY: ["100%", "0%"],
                    opacity: [0, 1],
                    duration: 500,
                    easing: "easeOutExpo",
                    complete: () => setIsAnimating(false),
                });
            }
        } else if (!isOpen && isVisible && !isAnimating) {
            // Closing animation
            setIsAnimating(true);

            // Slide down panel
            if (panelRef.current) {
                animate(panelRef.current, {
                    translateY: ["0%", "100%"],
                    opacity: [1, 0],
                    duration: 400,
                    easing: "easeInCubic",
                });
            }

            // Fade out overlay
            if (overlayRef.current) {
                animate(overlayRef.current, {
                    opacity: [1, 0],
                    duration: 400,
                    easing: "easeInCubic",
                    complete: () => {
                        setIsVisible(false);
                        setIsAnimating(false);
                    },
                });
            }
        }
    }, [isOpen, isVisible, isAnimating]);

    // Handle escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [isOpen, onClose]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop overlay with blur */}
            <div
                ref={overlayRef}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Sliding panel */}
            <div
                ref={panelRef}
                className="absolute bottom-0 left-0 right-0 max-h-[90vh] bg-zinc-950 border-t border-white/10 rounded-t-3xl overflow-hidden shadow-2xl"
            >
                {/* Handle bar */}
                <div className="flex justify-center py-3">
                    <div className="w-12 h-1.5 bg-white/20 rounded-full" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-6 pb-4 border-b border-white/5">
                    <h2 className="text-xl font-bold">{title || "Details"}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content with scroll */}
                <div className="overflow-y-auto max-h-[calc(90vh-100px)] p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}
