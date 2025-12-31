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
        accentColor: "#00f3ff",
        backgroundColor: "#0b0d17",
    },
    stream: {
        hlsUrl: "",
        isLive: false,
        title: "QChannel Live",
    },
};

/**
 * Hook to fetch admin settings and zones from the API
 * Returns settings, zones, loading state, and refresh function
 */
export function useAdminSettings(): UseAdminSettingsReturn {
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [zones, setZones] = useState<ZoneConfig[]>([]);
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
                const settingsData = await settingsRes.json();
                setSettings(settingsData);
            } else {
                setSettings(DEFAULT_SETTINGS);
            }

            if (zonesRes.ok) {
                const zonesData = await zonesRes.json();
                setZones(zonesData);
            }
        } catch (err) {
            console.error("Failed to fetch admin settings:", err);
            setError(err instanceof Error ? err.message : "Unknown error");
            setSettings(DEFAULT_SETTINGS);
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
