"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Settings, Layers, Radio, Tv,
    ChevronRight, Activity, RefreshCw
} from "lucide-react";

interface DashboardStats {
    zonesCount: number;
    enabledZones: number;
    streamStatus: string;
    lastUpdated: string;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStats() {
            try {
                const [settingsRes, zonesRes] = await Promise.all([
                    fetch('/api/admin/settings'),
                    fetch('/api/admin/zones'),
                ]);

                const settings = await settingsRes.json();
                const zones = await zonesRes.json();

                setStats({
                    zonesCount: zones.data?.length || 0,
                    enabledZones: zones.data?.filter((z: { enabled: boolean }) => z.enabled).length || 0,
                    streamStatus: settings.data?.stream?.isLive ? 'Live' : 'Offline',
                    lastUpdated: new Date().toLocaleTimeString(),
                });
            } catch (error) {
                console.error('Failed to load stats:', error);
            } finally {
                setLoading(false);
            }
        }

        loadStats();
    }, []);

    const menuItems = [
        {
            title: "General Settings",
            description: "App name, branding, refresh intervals",
            href: "/admin/settings",
            icon: Settings,
            color: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
        },
        {
            title: "Zone Management",
            description: "Configure Prophet zones and categories",
            href: "/admin/zones",
            icon: Layers,
            color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
        },
        {
            title: "Live Stream",
            description: "OBS/RTMP stream configuration",
            href: "/admin/stream",
            icon: Radio,
            color: "bg-red-500/20 text-red-400 border-red-500/30"
        },
        {
            title: "Roku Builder",
            description: "Configure and deploy Roku channel",
            href: "/admin/roku",
            icon: Tv,
            color: "bg-purple-500/20 text-purple-400 border-purple-500/30"
        },
    ];

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-8">
            {/* Header */}
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            Prophet TV Admin
                        </h1>
                        <p className="text-zinc-400 mt-1">Manage your Prophet channel</p>
                    </div>
                    <Link
                        href="/"
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
                    >
                        View Channel →
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                        <div className="text-zinc-500 text-xs mb-1">Active Zones</div>
                        <div className="text-2xl font-bold">
                            {loading ? '...' : `${stats?.enabledZones}/${stats?.zonesCount}`}
                        </div>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                        <div className="text-zinc-500 text-xs mb-1">Stream Status</div>
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${stats?.streamStatus === 'Live' ? 'bg-red-500 animate-pulse' : 'bg-zinc-600'}`} />
                            <span className="text-2xl font-bold">{loading ? '...' : stats?.streamStatus}</span>
                        </div>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                        <div className="text-zinc-500 text-xs mb-1">Database</div>
                        <div className="text-2xl font-bold text-emerald-400">
                            <Activity size={20} className="inline mr-2" />
                            Connected
                        </div>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                        <div className="text-zinc-500 text-xs mb-1">Last Updated</div>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            <RefreshCw size={16} />
                            {loading ? '...' : stats?.lastUpdated}
                        </div>
                    </div>
                </div>

                {/* Menu Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="group bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-6 transition-all hover:bg-zinc-800/50"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-lg border ${item.color}`}>
                                        <item.icon size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg group-hover:text-white transition-colors">
                                            {item.title}
                                        </h3>
                                        <p className="text-zinc-500 text-sm">{item.description}</p>
                                    </div>
                                </div>
                                <ChevronRight size={20} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <h2 className="font-semibold mb-4">Quick Actions</h2>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => fetch('/api/roku/feed').then(r => r.json()).then(d => console.log('Roku Feed:', d))}
                            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
                        >
                            Test Roku Feed
                        </button>
                        <Link
                            href="/api/roku/feed"
                            target="_blank"
                            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
                        >
                            View Roku Feed JSON →
                        </Link>
                        <Link
                            href="/api/admin/settings"
                            target="_blank"
                            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
                        >
                            View Settings JSON →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
