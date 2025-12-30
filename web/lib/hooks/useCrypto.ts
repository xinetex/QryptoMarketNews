// Custom hooks for crypto data

"use client";

import { useState, useEffect, useCallback } from "react";
import type { TickerData, ZoneData } from "@/lib/types/crypto";

interface UseCryptoPricesResult {
    prices: TickerData[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

interface UseCategoryDataResult {
    categories: ZoneData[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

/**
 * Hook to fetch and auto-refresh crypto prices
 */
export function useCryptoPrices(refreshInterval = 60000): UseCryptoPricesResult {
    const [prices, setPrices] = useState<TickerData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPrices = useCallback(async () => {
        try {
            const response = await fetch("/api/crypto/prices");
            if (!response.ok) throw new Error("Failed to fetch prices");
            const { data } = await response.json();
            setPrices(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPrices();
        const interval = setInterval(fetchPrices, refreshInterval);
        return () => clearInterval(interval);
    }, [fetchPrices, refreshInterval]);

    return { prices, loading, error, refetch: fetchPrices };
}

/**
 * Hook to fetch and auto-refresh category data
 */
export function useCategoryData(refreshInterval = 300000): UseCategoryDataResult {
    const [categories, setCategories] = useState<ZoneData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCategories = useCallback(async () => {
        try {
            const response = await fetch("/api/crypto/categories");
            if (!response.ok) throw new Error("Failed to fetch categories");
            const { data } = await response.json();
            setCategories(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
        const interval = setInterval(fetchCategories, refreshInterval);
        return () => clearInterval(interval);
    }, [fetchCategories, refreshInterval]);

    return { categories, loading, error, refetch: fetchCategories };
}
