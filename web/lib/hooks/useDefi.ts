"use client";

import { useState, useEffect, useCallback } from "react";
import type { ZoneEnhancedData } from "@/lib/types/defi";

interface UseEnhancedZonesResult {
    zones: ZoneEnhancedData[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

interface UseL2ComparisonResult {
    l2Data: { name: string; tvl: number; formatted: string }[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

/**
 * Hook for fetching enhanced zone data with DeFiLlama TVL
 */
export function useEnhancedZones(refreshInterval = 300000): UseEnhancedZonesResult {
    const [zones, setZones] = useState<ZoneEnhancedData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchZones = useCallback(async () => {
        try {
            const response = await fetch("/api/defi/zones");
            if (!response.ok) throw new Error("Failed to fetch zones");
            const { data } = await response.json();
            setZones(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchZones();
        const interval = setInterval(fetchZones, refreshInterval);
        return () => clearInterval(interval);
    }, [fetchZones, refreshInterval]);

    return { zones, loading, error, refetch: fetchZones };
}

/**
 * Hook for fetching L2 comparison data
 */
export function useL2Comparison(refreshInterval = 300000): UseL2ComparisonResult {
    const [l2Data, setL2Data] = useState<{ name: string; tvl: number; formatted: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchL2 = useCallback(async () => {
        try {
            const response = await fetch("/api/defi/l2");
            if (!response.ok) throw new Error("Failed to fetch L2 data");
            const { data } = await response.json();
            setL2Data(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchL2();
        const interval = setInterval(fetchL2, refreshInterval);
        return () => clearInterval(interval);
    }, [fetchL2, refreshInterval]);

    return { l2Data, loading, error, refetch: fetchL2 };
}
