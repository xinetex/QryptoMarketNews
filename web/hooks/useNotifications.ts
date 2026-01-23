import { useState, useEffect, useCallback } from 'react';

export interface Notification {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    timestamp: number;
    read: boolean;
    link?: string;
}

const STORAGE_KEY = 'flex_notifications_v1';

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setNotifications(parsed);
                setUnreadCount(parsed.filter((n: Notification) => !n.read).length);
            } catch (e) {
                console.error('Failed to load notifications', e);
            }
        }
    }, []);

    const save = (newNotifs: Notification[]) => {
        setNotifications(newNotifs);
        setUnreadCount(newNotifs.filter(n => !n.read).length);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newNotifs));
    };

    const addNotification = useCallback((n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
        const newNotif: Notification = {
            ...n,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: Date.now(),
            read: false
        };

        setNotifications(prev => {
            const next = [newNotif, ...prev].slice(0, 50); // Keep last 50
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            return next;
        });
        setUnreadCount(prev => prev + 1);
    }, []);

    const markRead = useCallback((id: string) => {
        setNotifications(prev => {
            const next = prev.map(n => n.id === id ? { ...n, read: true } : n);
            save(next);
            return next;
        });
    }, []);

    const markAllRead = useCallback(() => {
        setNotifications(prev => {
            const next = prev.map(n => ({ ...n, read: true }));
            save(next);
            return next;
        });
    }, []);

    const clearAll = useCallback(() => {
        save([]);
    }, []);

    return {
        notifications,
        unreadCount,
        addNotification,
        markRead,
        markAllRead,
        clearAll
    };
}
