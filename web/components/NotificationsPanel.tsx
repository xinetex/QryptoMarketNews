'use client';

import { useNotifications, type Notification } from '../hooks/useNotifications';
import { Bell, Check, Trash2, ExternalLink, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationsPanel() {
    const { notifications, unreadCount, markRead, markAllRead, clearAll } = useNotifications();

    if (notifications.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-600">
                <Bell size={24} className="mb-2 opacity-20" />
                <p className="text-xs">No signals received.</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-zinc-950/50">
            {/* Header / Actions */}
            <div className="p-3 border-b border-white/5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Alerts</span>
                    {unreadCount > 0 && (
                        <span className="bg-indigo-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-mono">
                            {unreadCount}
                        </span>
                    )}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={markAllRead}
                        className="p-1.5 hover:bg-white/5 rounded text-zinc-500 hover:text-indigo-400 transition-colors"
                        title="Mark all read"
                    >
                        <Check size={12} />
                    </button>
                    <button
                        onClick={clearAll}
                        className="p-1.5 hover:bg-white/5 rounded text-zinc-500 hover:text-red-400 transition-colors"
                        title="Clear all"
                    >
                        <Trash2 size={12} />
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                <AnimatePresence initial={false}>
                    {notifications.map((n) => (
                        <motion.div
                            key={n.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, height: 0 }}
                            className={`relative p-3 rounded-lg border transition-all cursor-pointer group ${n.read
                                ? 'bg-transparent border-transparent opacity-60 hover:opacity-100'
                                : 'bg-white/5 border-white/10 hover:border-indigo-500/30'
                                }`}
                            onClick={() => markRead(n.id)}
                        >
                            {!n.read && (
                                <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                            )}

                            <div className="flex gap-3">
                                <div className={`mt-0.5 shrink-0 ${getIconColor(n.type)}`}>
                                    {getIcon(n.type)}
                                </div>
                                <div className="space-y-1 flex-1">
                                    <h4 className={`text-xs font-bold leading-tight ${n.read ? 'text-zinc-400' : 'text-zinc-200'}`}>
                                        {n.title}
                                    </h4>
                                    <p className="text-[10px] text-zinc-500 leading-relaxed line-clamp-2">
                                        {n.message}
                                    </p>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-[9px] text-zinc-600 font-mono">
                                            {formatTime(n.timestamp)}
                                        </span>
                                        {n.link && (
                                            <a
                                                href={n.link}
                                                target="_blank"
                                                rel="noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="flex items-center gap-1 text-[9px] text-indigo-400 hover:text-indigo-300 transition-colors"
                                            >
                                                View <ExternalLink size={8} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}

function getIcon(type: Notification['type']) {
    switch (type) {
        case 'success': return <CheckCircle size={14} />;
        case 'warning': return <AlertTriangle size={14} />;
        case 'info': return <Info size={14} />;
        case 'error': return <AlertTriangle size={14} />; // Reuse for now
    }
}

function getIconColor(type: Notification['type']) {
    switch (type) {
        case 'success': return 'text-emerald-400';
        case 'warning': return 'text-amber-400';
        case 'info': return 'text-indigo-400';
        case 'error': return 'text-red-400';
    }
}

function formatTime(ms: number) {
    const minDiff = Math.floor((Date.now() - ms) / 60000);
    if (minDiff < 1) return 'Just now';
    if (minDiff < 60) return `${minDiff}m ago`;
    const hDiff = Math.floor(minDiff / 60);
    if (hDiff < 24) return `${hDiff}h ago`;
    return new Date(ms).toLocaleDateString();
}
