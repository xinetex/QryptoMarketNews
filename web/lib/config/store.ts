// QChannel App Settings Configuration
// Uses Neon PostgreSQL when DATABASE_URL is set, falls back to JSON file storage

import { promises as fs } from 'fs';
import path from 'path';
import { sql, initDatabase } from '@/lib/db';

export interface AppSettings {
    appName: string;
    tagline: string;
    refreshInterval: number;
    features: {
        newsEnabled: boolean;
        tickerEnabled: boolean;
        liveStreamEnabled: boolean;
        marketPulseEnabled: boolean;
    };
    stream: {
        hlsUrl: string;
        isLive: boolean;
        title: string;
    };
    theme: {
        primaryColor: string;
        accentColor: string;
    };
    youtube: {
        enabled: boolean;
        videoId: string;
        title: string;
    };
    sponsor: {
        enabled: boolean;
        imageUrl: string;
        linkUrl: string;
    };
}

export interface ZoneConfig {
    id: string;
    name: string;
    enabled: boolean;
    order: number;
    icon: string;
    color: string;
    coinLimit: number;
    coingeckoCategory: string;
}

const CONFIG_DIR = process.env.CONFIG_DIR || path.join(process.cwd(), 'config');
const SETTINGS_FILE = path.join(CONFIG_DIR, 'settings.json');
const ZONES_FILE = path.join(CONFIG_DIR, 'zones.json');

// Default settings
const DEFAULT_SETTINGS: AppSettings = {
    appName: "QChannel",
    tagline: "Crypto Market Intelligence",
    refreshInterval: 30,
    features: {
        newsEnabled: true,
        tickerEnabled: true,
        liveStreamEnabled: false,
        marketPulseEnabled: true,
    },
    stream: {
        hlsUrl: "",
        isLive: false,
        title: "QChannel Live",
    },
    theme: {
        primaryColor: "#6366f1",
        accentColor: "#00f3ff",
    },
    youtube: {
        enabled: true,
        videoId: "9ASXINLKuNE", // Live Lo-Fi Radio
        title: "QCrypto Radio",
    },
    sponsor: {
        enabled: true,
        imageUrl: "/guardians_of_the_puff.png",
        linkUrl: "https://queef.io",
    },
};

// Default zones
const DEFAULT_ZONES: ZoneConfig[] = [
    { id: "defi", name: "DeFi", enabled: true, order: 0, icon: "💰", color: "#10b981", coinLimit: 10, coingeckoCategory: "decentralized-finance-defi" },
    { id: "nft", name: "NFTs", enabled: true, order: 1, icon: "🎨", color: "#8b5cf6", coinLimit: 10, coingeckoCategory: "non-fungible-tokens-nft" },
    { id: "gaming", name: "Gaming", enabled: true, order: 2, icon: "🎮", color: "#f59e0b", coinLimit: 10, coingeckoCategory: "gaming" },
    { id: "layer2", name: "Layer 2", enabled: true, order: 3, icon: "⚡", color: "#3b82f6", coinLimit: 10, coingeckoCategory: "layer-2" },
    { id: "memes", name: "Memes", enabled: true, order: 4, icon: "🐕", color: "#ef4444", coinLimit: 10, coingeckoCategory: "meme-token" },
    { id: "ai", name: "AI Agents", enabled: true, order: 5, icon: "🤖", color: "#06b6d4", coinLimit: 10, coingeckoCategory: "artificial-intelligence" },
    { id: "rwa", name: "RWA", enabled: true, order: 6, icon: "🏠", color: "#84cc16", coinLimit: 10, coingeckoCategory: "real-world-assets-rwa" },
    { id: "solana", name: "Solana", enabled: true, order: 7, icon: "☀️", color: "#9333ea", coinLimit: 10, coingeckoCategory: "solana-ecosystem" },
    { id: "predictions", name: "Predictions", enabled: true, order: 8, icon: "🎰", color: "#d946ef", coinLimit: 5, coingeckoCategory: "prediction-markets" }, // Added locally
];

// Check if we should use database
const isDatabaseAvailable = () => sql !== null;

// ========== File-based storage (fallback) ==========
async function ensureConfigDir() {
    try {
        await fs.mkdir(CONFIG_DIR, { recursive: true });
    } catch {
        // Directory exists
    }
}

async function getSettingsFromFile(): Promise<AppSettings> {
    await ensureConfigDir();
    try {
        const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
        return DEFAULT_SETTINGS;
    }
}

async function saveSettingsToFile(settings: AppSettings): Promise<void> {
    await ensureConfigDir();
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

async function getZonesFromFile(): Promise<ZoneConfig[]> {
    await ensureConfigDir();
    try {
        const data = await fs.readFile(ZONES_FILE, 'utf-8');
        return JSON.parse(data);
    } catch {
        return DEFAULT_ZONES;
    }
}

async function saveZonesToFile(zones: ZoneConfig[]): Promise<void> {
    await ensureConfigDir();
    await fs.writeFile(ZONES_FILE, JSON.stringify(zones, null, 2));
}

// ========== Database storage (Neon) ==========
async function getSettingsFromDB(): Promise<AppSettings> {
    if (!sql) return DEFAULT_SETTINGS;

    await initDatabase();

    try {
        const results = await sql`SELECT value FROM qchannel_settings WHERE key = 'app_settings'`;
        if (results.length > 0) {
            return { ...DEFAULT_SETTINGS, ...(results[0].value as AppSettings) };
        }
        return DEFAULT_SETTINGS;
    } catch (error) {
        console.error('Error getting settings from DB:', error);
        return DEFAULT_SETTINGS;
    }
}

async function saveSettingsToDB(settings: AppSettings): Promise<void> {
    if (!sql) return;

    await initDatabase();

    await sql`
        INSERT INTO qchannel_settings (key, value, updated_at)
        VALUES ('app_settings', ${JSON.stringify(settings)}::jsonb, NOW())
        ON CONFLICT (key) DO UPDATE SET value = ${JSON.stringify(settings)}::jsonb, updated_at = NOW()
    `;
}

async function getZonesFromDB(): Promise<ZoneConfig[]> {
    if (!sql) return DEFAULT_ZONES;

    await initDatabase();

    try {
        const results = await sql`
            SELECT id, name, enabled, sort_order as order, icon, color, coin_limit as "coinLimit", coingecko_category as "coingeckoCategory"
            FROM qchannel_zones
            ORDER BY sort_order
        `;

        if (results.length === 0) {
            // Seed default zones
            for (const zone of DEFAULT_ZONES) {
                await sql`
                    INSERT INTO qchannel_zones (id, name, enabled, sort_order, icon, color, coin_limit, coingecko_category)
                    VALUES (${zone.id}, ${zone.name}, ${zone.enabled}, ${zone.order}, ${zone.icon}, ${zone.color}, ${zone.coinLimit}, ${zone.coingeckoCategory})
                    ON CONFLICT (id) DO NOTHING
                `;
            }
            return DEFAULT_ZONES;
        }

        return results as unknown as ZoneConfig[];
    } catch (error) {
        console.error('Error getting zones from DB:', error);
        return DEFAULT_ZONES;
    }
}

async function saveZonesToDB(zones: ZoneConfig[]): Promise<void> {
    if (!sql) return;

    for (const zone of zones) {
        await sql`
            INSERT INTO qchannel_zones (id, name, enabled, sort_order, icon, color, coin_limit, coingecko_category, updated_at)
            VALUES (${zone.id}, ${zone.name}, ${zone.enabled}, ${zone.order}, ${zone.icon}, ${zone.color}, ${zone.coinLimit}, ${zone.coingeckoCategory}, NOW())
            ON CONFLICT (id) DO UPDATE SET
                name = ${zone.name},
                enabled = ${zone.enabled},
                sort_order = ${zone.order},
                icon = ${zone.icon},
                color = ${zone.color},
                coin_limit = ${zone.coinLimit},
                coingecko_category = ${zone.coingeckoCategory},
                updated_at = NOW()
        `;
    }
}

// ========== Public API (auto-selects storage backend) ==========
export async function getSettings(): Promise<AppSettings> {
    return isDatabaseAvailable() ? getSettingsFromDB() : getSettingsFromFile();
}

export async function saveSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    const current = await getSettings();
    const updated = { ...current, ...settings };

    if (isDatabaseAvailable()) {
        await saveSettingsToDB(updated);
    } else {
        await saveSettingsToFile(updated);
    }

    return updated;
}

export async function getZones(): Promise<ZoneConfig[]> {
    return isDatabaseAvailable() ? getZonesFromDB() : getZonesFromFile();
}

export async function saveZones(zones: ZoneConfig[]): Promise<ZoneConfig[]> {
    if (isDatabaseAvailable()) {
        await saveZonesToDB(zones);
    } else {
        await saveZonesToFile(zones);
    }
    return zones;
}

export async function updateZone(id: string, updates: Partial<ZoneConfig>): Promise<ZoneConfig | null> {
    const zones = await getZones();
    const index = zones.findIndex(z => z.id === id);
    if (index === -1) return null;

    zones[index] = { ...zones[index], ...updates };
    await saveZones(zones);
    return zones[index];
}
