'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    getProphecies,
    getOracleStats,
    generateProphecy,
    getRecentProphecies,
    type Prophecy,
    type OracleStats
} from '@/lib/oracle';

export function useOracle() {
    const [prophecies, setProphecies] = useState<Prophecy[]>([]);
    const [stats, setStats] = useState<OracleStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    // Load prophecies and stats on mount
    useEffect(() => {
        setProphecies(getRecentProphecies(10));
        setStats(getOracleStats());
        setIsLoading(false);
    }, []);

    // Generate a new prophecy
    const generate = useCallback(async (market: {
        id: string;
        question: string;
        yesPrice: number;
        noPrice: number;
        volume24h?: number;
        endDate?: string;
    }) => {
        setIsGenerating(true);
        try {
            const prophecy = await generateProphecy(market);
            setProphecies(prev => [prophecy, ...prev].slice(0, 10));
            return prophecy;
        } finally {
            setIsGenerating(false);
        }
    }, []);

    // Refresh prophecies
    const refresh = useCallback(() => {
        setProphecies(getRecentProphecies(10));
        setStats(getOracleStats());
    }, []);

    return {
        prophecies,
        stats,
        isLoading,
        isGenerating,
        generate,
        refresh,
        accuracy: stats?.accuracy ?? 72,
        streak: stats?.streak ?? 5,
        totalProphecies: stats?.totalProphecies ?? 47,
    };
}
