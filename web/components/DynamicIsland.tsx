'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications, type Notification } from '@/hooks/useNotifications';
import { Bell, X, ExternalLink, Activity, Trophy, Zap } from 'lucide-react';

export default function DynamicIsland() {
    const { notifications } = useNotifications();
    const [activeNotif, setActiveNotif] = useState<Notification | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    // RSVP State
    const [rsvpWord, setRsvpWord] = useState('');
    const [rsvpIndex, setRsvpIndex] = useState(0);
    const [isStreaming, setIsStreaming] = useState(false);

    // Watch for new notifications
    useEffect(() => {
        if (notifications.length > 0) {
            const latest = notifications[0];
            // If new (within last 2 seconds) and not currently showing
            const isNew = Date.now() - latest.timestamp < 2000;
            if (isNew && activeNotif?.id !== latest.id) {
                setActiveNotif(latest);
                setIsExpanded(true);
                startStreaming(latest.message);

                // Auto collapse after reading time (approx 200ms per word + 2s buffer)
                const duration = (latest.message.split(' ').length * 200) + 2000;
                const timer = setTimeout(() => {
                    setIsExpanded(false);
                    // Clear active after collapse anim
                    setTimeout(() => setActiveNotif(null), 500);
                }, duration);
                return () => clearTimeout(timer);
            }
        }
    }, [notifications, activeNotif]);

    const startStreaming = (text: string) => {
        setIsStreaming(true);
        const words = text.split(' ');
        setRsvpIndex(0);

        // Simple interval for RSVP
        let i = 0;
        const interval = setInterval(() => {
            if (i >= words.length) {
                clearInterval(interval);
                setIsStreaming(false);
                setRsvpWord(text); // Show full text at end
                return;
            }
            setRsvpWord(words[i]);
            setRsvpIndex(i);
            i++;
        }, 200); // 300 WPM
    };

    if (!activeNotif && !isExpanded) return null;

    return (
        <div className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
            <motion.div
                initial={{ width: 40, height: 40, opacity: 0, y: -20 }}
                animate={{
                    width: isExpanded ? 'auto' : 40,
                    height: isExpanded ? 'auto' : 40,
                    opacity: 1,
                    y: 0,
                    borderRadius: 24
                }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="bg-zinc-950 border border-white/10 shadow-2xl pointer-events-auto overflow-hidden backdrop-blur-md"
                style={{ minWidth: 40 }}
            >
                <div className="flex items-center px-2 py-2">
                    {/* Icon Area */}
                    <div className="w-6 h-6 flex items-center justify-center shrink-0">
                        {isExpanded ? (
                            <div className={getIconColor(activeNotif?.type || 'info')}>
                                {getIcon(activeNotif?.type || 'info')}
                            </div>
                        ) : (
                            <Bell size={16} className="text-zinc-500" />
                        )}
                    </div>

                    {/* Content Area */}
                    <AnimatePresence mode="wait">
                        {isExpanded && activeNotif && (
                            <motion.div
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                className="flex items-center gap-4 pl-3 pr-2 whitespace-nowrap overflow-hidden"
                            >
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                                        {activeNotif.title}
                                    </span>
                                    <div className="font-mono text-sm font-bold text-white min-w-[200px] h-[20px] flex items-center">
                                        {isStreaming ? (
                                            <span className="text-indigo-400">{rsvpWord}</span>
                                        ) : (
                                            <span className="line-clamp-1">{activeNotif.message}</span>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => setIsExpanded(false)}
                                    className="p-1 hover:bg-white/10 rounded-full text-zinc-500 hover:text-white transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}

function getIcon(type: string) {
    if (type === 'success') return <Trophy size={16} />;
    if (type === 'warning') return <Zap size={16} />;
    return <Activity size={16} />;
}

function getIconColor(type: string) {
    if (type === 'success') return 'text-emerald-400';
    if (type === 'warning') return 'text-amber-400';
    return 'text-indigo-400';
}
