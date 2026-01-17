"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, RefreshCw } from "lucide-react";

interface AppSettings {
    appName: string;
    tagline: string;
    refreshInterval: number;
    features: {
        newsEnabled: boolean;
        tickerEnabled: boolean;
        liveStreamEnabled: boolean;
        marketPulseEnabled: boolean;
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

export default function SettingsPage() {
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/admin/settings')
            .then(r => r.json())
            .then(data => {
                if (data.success) setSettings(data.data);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        if (!settings) return;

        setSaving(true);
        setMessage(null);

        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });

            const data = await res.json();
            if (data.success) {
                setMessage('Settings saved successfully!');
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage('Failed to save settings');
            }
        } catch {
            setMessage('Error saving settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
                <RefreshCw className="animate-spin" size={24} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/admin" className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">General Settings</h1>
                        <p className="text-zinc-400 text-sm">Configure app name, branding, and features</p>
                    </div>
                </div>

                {/* Form */}
                <div className="space-y-6">
                    {/* Branding */}
                    <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <h2 className="font-semibold mb-4">Branding</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">App Name</label>
                                <input
                                    type="text"
                                    value={settings?.appName || ''}
                                    onChange={e => setSettings(s => s ? { ...s, appName: e.target.value } : s)}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Tagline</label>
                                <input
                                    type="text"
                                    value={settings?.tagline || ''}
                                    onChange={e => setSettings(s => s ? { ...s, tagline: e.target.value } : s)}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Refresh Interval */}
                    <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <h2 className="font-semibold mb-4">Data Refresh</h2>
                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Refresh Interval (seconds)</label>
                            <input
                                type="number"
                                value={settings?.refreshInterval || 30}
                                onChange={e => setSettings(s => s ? { ...s, refreshInterval: parseInt(e.target.value) } : s)}
                                min={10}
                                max={300}
                                className="w-32 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                    </section>

                    {/* Features */}
                    {/* Features */}
                    <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <h2 className="font-semibold mb-4">Features</h2>
                        <div className="space-y-3">
                            {[
                                { key: 'newsEnabled', label: 'News Slider' },
                                { key: 'tickerEnabled', label: 'Market Ticker' },
                                { key: 'liveStreamEnabled', label: 'Live Stream' },
                                { key: 'marketPulseEnabled', label: 'Market Pulse Indicator' },
                            ].map(feature => (
                                <label key={feature.key} className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings?.features?.[feature.key as keyof typeof settings.features] || false}
                                        onChange={e => setSettings(s => s ? {
                                            ...s,
                                            features: { ...s.features, [feature.key]: e.target.checked }
                                        } : s)}
                                        className="w-5 h-5 rounded bg-zinc-800 border-zinc-700 text-indigo-500 focus:ring-indigo-500"
                                    />
                                    <span>{feature.label}</span>
                                </label>
                            ))}
                        </div>
                    </section>

                    {/* YouTube Radio */}
                    <div className="glass-card p-6 border-l-4 border-l-red-500">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span>📺</span> YouTube Live Radio
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="yt-enabled"
                                    checked={settings?.youtube?.enabled ?? true}
                                    onChange={(e) => setSettings(s => s ? {
                                        ...s,
                                        youtube: { ...s.youtube!, enabled: e.target.checked }
                                    } : s)}
                                    className="w-4 h-4 rounded border-white/20 bg-black/50 text-indigo-500 focus:ring-indigo-500"
                                />
                                <label htmlFor="yt-enabled" className="text-sm font-medium">Enable Radio Card</label>
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-1">Video ID (e.g. 9ASXINLKuNE)</label>
                                <input
                                    type="text"
                                    value={settings?.youtube?.videoId ?? "9ASXINLKuNE"}
                                    onChange={(e) => setSettings(s => s ? {
                                        ...s,
                                        youtube: { ...s.youtube!, videoId: e.target.value }
                                    } : s)}
                                    className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 font-mono text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-1">Card Title</label>
                                <input
                                    type="text"
                                    value={settings?.youtube?.title ?? "Prophet Radio"}
                                    onChange={(e) => setSettings(s => s ? {
                                        ...s,
                                        youtube: { ...s.youtube!, title: e.target.value }
                                    } : s)}
                                    className="w-full bg-black/50 border border-white/10 rounded px-3 py-2"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sponsorship Config */}
                    <div className="glass-card p-6 border-l-4 border-l-yellow-500">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span>🤝</span> Sponsorship
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="sponsor-enabled"
                                    checked={settings?.sponsor?.enabled ?? true}
                                    onChange={(e) => setSettings(s => s ? {
                                        ...s,
                                        sponsor: { ...s.sponsor!, enabled: e.target.checked }
                                    } : s)}
                                    className="w-4 h-4 rounded border-white/20 bg-black/50 text-indigo-500 focus:ring-indigo-500"
                                />
                                <label htmlFor="sponsor-enabled" className="text-sm font-medium">Enable Sponsor Banner</label>
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-1">Image URL (e.g. /guardians.png)</label>
                                <input
                                    type="text"
                                    value={settings?.sponsor?.imageUrl ?? "/guardians_of_the_puff.png"}
                                    onChange={(e) => setSettings(s => s ? {
                                        ...s,
                                        sponsor: { ...s.sponsor!, imageUrl: e.target.value }
                                    } : s)}
                                    className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 font-mono text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-1">Link URL</label>
                                <input
                                    type="text"
                                    value={settings?.sponsor?.linkUrl ?? "https://queef.io"}
                                    onChange={(e) => setSettings(s => s ? {
                                        ...s,
                                        sponsor: { ...s.sponsor!, linkUrl: e.target.value }
                                    } : s)}
                                    className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 font-mono text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Theme Colors */}
                    <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <h2 className="font-semibold mb-4">Theme Colors</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Primary Color</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={settings?.theme?.primaryColor || '#6366f1'}
                                        onChange={e => setSettings(s => s ? {
                                            ...s,
                                            theme: { ...s.theme, primaryColor: e.target.value }
                                        } : s)}
                                        className="w-10 h-10 rounded border-0 cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={settings?.theme?.primaryColor || '#6366f1'}
                                        onChange={e => setSettings(s => s ? {
                                            ...s,
                                            theme: { ...s.theme, primaryColor: e.target.value }
                                        } : s)}
                                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 font-mono"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Accent Color</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={settings?.theme?.accentColor || '#00f3ff'}
                                        onChange={e => setSettings(s => s ? {
                                            ...s,
                                            theme: { ...s.theme, accentColor: e.target.value }
                                        } : s)}
                                        className="w-10 h-10 rounded border-0 cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={settings?.theme?.accentColor || '#00f3ff'}
                                        onChange={e => setSettings(s => s ? {
                                            ...s,
                                            theme: { ...s.theme, accentColor: e.target.value }
                                        } : s)}
                                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 font-mono"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Save Button */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg font-medium flex items-center gap-2 transition-colors"
                        >
                            <Save size={18} />
                            {saving ? 'Saving...' : 'Save Settings'}
                        </button>
                        {message && (
                            <span className={`text-sm ${message.includes('success') ? 'text-emerald-400' : 'text-red-400'}`}>
                                {message}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
