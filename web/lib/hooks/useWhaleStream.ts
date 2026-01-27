import { useState, useEffect } from 'react';
import { WhaleAlert } from '../whale-engine/types';

export function useWhaleStream(pollInterval = 30000) {
    const [alerts, setAlerts] = useState<WhaleAlert[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function fetchAlerts() {
            try {
                const res = await fetch('/api/whale-alerts');
                const data = await res.json();
                if (mounted && data.alerts) {
                    setAlerts(data.alerts);
                }
            } catch (e) {
                console.error("Whale stream failed", e);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        fetchAlerts();

        const interval = setInterval(fetchAlerts, pollInterval);
        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, [pollInterval]);

    return { alerts, loading };
}
