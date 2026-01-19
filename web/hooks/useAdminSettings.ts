"use client";

import { useState, useEffect } from "react";
import type { AppSettings, ZoneConfig } from "@/lib/config/store";

interface UseAdminSettingsReturn {
    settings: AppSettings | null;
    zones: ZoneConfig[];
    loading: boolean;
    error: string | null;
    refresh: () => void;
}

// Default settings for fallback
const DEFAULT_SETTINGS: AppSettings = {
    appName: "QChannel",
    tagline: "Crypto Market Intelligence",
    refreshInterval: 60,
    features: {
        newsEnabled: true,
        tickerEnabled: true,
        liveStreamEnabled: false,
        marketPulseEnabled: true,
    },
    theme: {
        primaryColor: "#6366f1",
        accentColor: "#00f3ff",
    },
    stream: {
        hlsUrl: "",
        isLive: false,
        title: "QChannel Live",
    },
    youtube: {
        enabled: true,
        videoId: "9ASXINLKuNE",
        title: "QCrypto Radio",
    },
    sponsor: {
        enabled: true,
        imageUrl: "https://domeapi.io/assets/dome-icon-336KHiVB.png",
        linkUrl: "https://domeapi.io",
    },
};

const DEFAULT_ZONES: ZoneConfig[] = [
    { id: "defi", name: "DeFi", enabled: true, order: 0, icon: "💰", color: "#10b981", coinLimit: 10, coingeckoCategory: "decentralized-finance-defi" },
    { id: "nft", name: "NFTs", enabled: true, order: 1, icon: "🎨", color: "#8b5cf6", coinLimit: 10, coingeckoCategory: "non-fungible-tokens-nft" },
    { id: "gaming", name: "Gaming", enabled: true, order: 2, icon: "🎮", color: "#f59e0b", coinLimit: 10, coingeckoCategory: "gaming" },
    { id: "layer2", name: "Layer 2", enabled: true, order: 3, icon: "⚡", color: "#3b82f6", coinLimit: 10, coingeckoCategory: "layer-2" },
    { id: "memes", name: "Memes", enabled: true, order: 4, icon: "🐕", color: "#ef4444", coinLimit: 10, coingeckoCategory: "meme-token" },
    { id: "ai", name: "AI Agents", enabled: true, order: 5, icon: "🤖", color: "#06b6d4", coinLimit: 10, coingeckoCategory: "artificial-intelligence" },
    { id: "rwa", name: "RWA", enabled: true, order: 6, icon: "🏠", color: "#84cc16", coinLimit: 10, coingeckoCategory: "real-world-assets-rwa" },
    { id: "solana", name: "Solana", enabled: true, order: 7, icon: "☀️", color: "#9333ea", coinLimit: 10, coingeckoCategory: "solana-ecosystem" },
    { id: "predictions", name: "Predictions", enabled: true, order: 8, icon: "🎰", color: "#d946ef", coinLimit: 5, coingeckoCategory: "prediction-markets" },
];

/**
 * Hook to fetch admin settings and zones from the API
 * Returns settings, zones, loading state, and refresh function
 */
export function useAdminSettings(): UseAdminSettingsReturn {
    const [settings, setSettings] = useState<AppSettings | null>(DEFAULT_SETTINGS);
    const [zones, setZones] = useState<ZoneConfig[]>(DEFAULT_ZONES);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch settings and zones in parallel
            const [settingsRes, zonesRes] = await Promise.all([
                fetch("/api/admin/settings"),
                fetch("/api/admin/zones"),
            ]);

            if (settingsRes.ok) {
                const settingsJson = await settingsRes.json();
                const settingsData = settingsJson.data || settingsJson;
                setSettings(settingsData);
            } else {
                setSettings(DEFAULT_SETTINGS);
            }

            if (zonesRes.ok) {
                const zonesJson = await zonesRes.json();
                // API returns { success: true, data: [...] } or just [...]
                const zonesData = zonesJson.data || zonesJson;

                // Ensure it's an array before setting
                if (Array.isArray(zonesData)) {
                    setZones(zonesData);
                } else {
                    console.error("Invalid zones data format:", zonesData);
                    setZones(DEFAULT_ZONES);
                }
            } else {
                setZones(DEFAULT_ZONES);
            }
        } catch (err) {
            console.error("Failed to fetch admin settings:", err);
            setError(err instanceof Error ? err.message : "Unknown error");
            setSettings(DEFAULT_SETTINGS);
            setZones(DEFAULT_ZONES);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return {
        settings,
        zones,
        loading,
        error,
        refresh: fetchData,
    };
}

/**
 * Hook for stream configuration specifically
 */
export function useStreamConfig() {
    const [streamConfig, setStreamConfig] = useState<{
        hlsUrl: string;
        isLive: boolean;
        title: string;
    } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/stream")
            .then((res) => res.json())
            .then((data) => setStreamConfig(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return { streamConfig, loading };
}
