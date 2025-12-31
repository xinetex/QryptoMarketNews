"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, GripVertical, Eye, EyeOff } from "lucide-react";

interface ZoneConfig {
    id: string;
    name: string;
    enabled: boolean;
    order: number;
    icon: string;
    color: string;
    coinLimit: number;
    coingeckoCategory: string;
}

export default function ZonesPage() {
    const [zones, setZones] = useState<ZoneConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/admin/zones')
            .then(r => r.json())
            .then(data => {
                if (data.success) setZones(data.data);
            })
            .finally(() => setLoading(false));
    }, []);

    const toggleZone = (id: string) => {
        setZones(zones.map(z =>
            z.id === id ? { ...z, enabled: !z.enabled } : z
        ));
    };

    const updateZone = (id: string, field: string, value: string | number) => {
        setZones(zones.map(z =>
            z.id === id ? { ...z, [field]: value } : z
        ));
    };

    const moveZone = (index: number, direction: 'up' | 'down') => {
        const newZones = [...zones];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newZones.length) return;

        [newZones[index], newZones[targetIndex]] = [newZones[targetIndex], newZones[index]];
        newZones.forEach((z, i) => z.order = i);
        setZones(newZones);
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        try {
            const res = await fetch('/api/admin/zones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(zones),
            });

            const data = await res.json();
            if (data.success) {
                setMessage('Zones saved successfully!');
                setTimeout(() => setMessage(null), 3000);
            }
        } catch {
            setMessage('Error saving zones');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/admin" className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Zone Management</h1>
                        <p className="text-zinc-400 text-sm">Configure crypto category zones</p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-zinc-500">Loading zones...</div>
                ) : (
                    <div className="space-y-3">
                        {zones.sort((a, b) => a.order - b.order).map((zone, index) => (
                            <div
                                key={zone.id}
                                className={`bg-zinc-900 border rounded-xl p-4 transition-opacity ${zone.enabled ? 'border-zinc-800' : 'border-zinc-800/50 opacity-60'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    {/* Drag Handle & Reorder */}
                                    <div className="flex flex-col gap-1">
                                        <button
                                            onClick={() => moveZone(index, 'up')}
                                            disabled={index === 0}
                                            className="text-zinc-600 hover:text-zinc-400 disabled:opacity-30"
                                        >
                                            ▲
                                        </button>
                                        <GripVertical size={16} className="text-zinc-600" />
                                        <button
                                            onClick={() => moveZone(index, 'down')}
                                            disabled={index === zones.length - 1}
                                            className="text-zinc-600 hover:text-zinc-400 disabled:opacity-30"
                                        >
                                            ▼
                                        </button>
                                    </div>

                                    {/* Icon */}
                                    <div
                                        className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                                        style={{ backgroundColor: zone.color + '30' }}
                                    >
                                        {zone.icon}
                                    </div>

                                    {/* Zone Info */}
                                    <div className="flex-1 grid grid-cols-4 gap-4">
                                        <div>
                                            <label className="text-xs text-zinc-500">Name</label>
                                            <input
                                                type="text"
                                                value={zone.name}
                                                onChange={e => updateZone(zone.id, 'name', e.target.value)}
                                                className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-zinc-500">Icon</label>
                                            <input
                                                type="text"
                                                value={zone.icon}
                                                onChange={e => updateZone(zone.id, 'icon', e.target.value)}
                                                className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-center"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-zinc-500">Color</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={zone.color}
                                                    onChange={e => updateZone(zone.id, 'color', e.target.value)}
                                                    className="w-8 h-8 rounded cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={zone.color}
                                                    onChange={e => updateZone(zone.id, 'color', e.target.value)}
                                                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm font-mono"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-zinc-500">Coin Limit</label>
                                            <input
                                                type="number"
                                                value={zone.coinLimit}
                                                onChange={e => updateZone(zone.id, 'coinLimit', parseInt(e.target.value))}
                                                min={1}
                                                max={50}
                                                className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Toggle */}
                                    <button
                                        onClick={() => toggleZone(zone.id)}
                                        className={`p-2 rounded-lg transition-colors ${zone.enabled
                                                ? 'bg-emerald-500/20 text-emerald-400'
                                                : 'bg-zinc-800 text-zinc-500'
                                            }`}
                                    >
                                        {zone.enabled ? <Eye size={20} /> : <EyeOff size={20} />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Save Button */}
                <div className="mt-6 flex items-center gap-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg font-medium flex items-center gap-2"
                    >
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save Zones'}
                    </button>
                    {message && (
                        <span className={`text-sm ${message.includes('success') ? 'text-emerald-400' : 'text-red-400'}`}>
                            {message}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
