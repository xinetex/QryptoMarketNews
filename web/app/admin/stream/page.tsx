"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Radio, Copy, Check } from "lucide-react";

interface StreamConfig {
    hlsUrl: string;
    isLive: boolean;
    title: string;
}

export default function StreamPage() {
    const [stream, setStream] = useState<StreamConfig>({ hlsUrl: '', isLive: false, title: 'Prophet TV Live' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetch('/api/admin/stream')
            .then(r => r.json())
            .then(data => {
                if (data.success) setStream(data.data);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        try {
            const res = await fetch('/api/admin/stream', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(stream),
            });

            const data = await res.json();
            if (data.success) {
                setMessage('Stream config saved!');
                setTimeout(() => setMessage(null), 3000);
            }
        } catch {
            setMessage('Error saving config');
        } finally {
            setSaving(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/admin" className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Live Stream Configuration</h1>
                        <p className="text-zinc-400 text-sm">Configure OBS/RTMP streaming</p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-zinc-500">Loading...</div>
                ) : (
                    <div className="space-y-6">
                        {/* Status & Toggle */}
                        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-lg ${stream.isLive ? 'bg-red-500/20' : 'bg-zinc-800'}`}>
                                        <Radio size={24} className={stream.isLive ? 'text-red-500 animate-pulse' : 'text-zinc-500'} />
                                    </div>
                                    <div>
                                        <h2 className="font-semibold">Stream Status</h2>
                                        <p className="text-zinc-400 text-sm">
                                            {stream.isLive ? 'Currently live on air' : 'Stream is offline'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setStream(s => ({ ...s, isLive: !s.isLive }))}
                                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${stream.isLive
                                        ? 'bg-red-600 hover:bg-red-500'
                                        : 'bg-emerald-600 hover:bg-emerald-500'
                                        }`}
                                >
                                    {stream.isLive ? 'Go Offline' : 'Go Live'}
                                </button>
                            </div>
                        </section>

                        {/* Stream Settings */}
                        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
                            <h2 className="font-semibold">Stream Settings</h2>

                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Stream Title</label>
                                <input
                                    type="text"
                                    value={stream.title}
                                    onChange={e => setStream(s => ({ ...s, title: e.target.value }))}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">HLS Stream URL</label>
                                <input
                                    type="text"
                                    value={stream.hlsUrl}
                                    onChange={e => setStream(s => ({ ...s, hlsUrl: e.target.value }))}
                                    placeholder="https://your-server.com/live/stream.m3u8"
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 font-mono text-sm"
                                />
                                <p className="text-xs text-zinc-500 mt-1">
                                    This is the HLS manifest URL your Roku and Web apps will play
                                </p>
                            </div>
                        </section>

                        {/* OBS Setup Guide */}
                        <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                            <h2 className="font-semibold mb-4">OBS Setup Guide</h2>

                            <div className="space-y-4 text-sm">
                                <div className="bg-zinc-950 rounded-lg p-4 border border-zinc-800">
                                    <p className="text-zinc-400 mb-2">1. Set up a streaming server (options):</p>
                                    <ul className="list-disc list-inside text-zinc-500 space-y-1 ml-2">
                                        <li>Mux (mux.com) - Easy cloud streaming</li>
                                        <li>Livepeer (livepeer.org) - Decentralized</li>
                                        <li>Cloudflare Stream - Low latency</li>
                                        <li>nginx-rtmp - Self-hosted</li>
                                    </ul>
                                </div>

                                <div className="bg-zinc-950 rounded-lg p-4 border border-zinc-800">
                                    <p className="text-zinc-400 mb-2">2. In OBS, go to Settings → Stream:</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <code className="flex-1 bg-zinc-800 px-3 py-2 rounded font-mono text-xs">
                                            rtmp://your-server.com/live
                                        </code>
                                        <button
                                            onClick={() => copyToClipboard('rtmp://your-server.com/live')}
                                            className="p-2 hover:bg-zinc-700 rounded transition-colors"
                                        >
                                            {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-zinc-950 rounded-lg p-4 border border-zinc-800">
                                    <p className="text-zinc-400 mb-2">3. Get your HLS playback URL from the streaming service</p>
                                    <p className="text-zinc-500 text-xs">
                                        Usually looks like: https://stream.mux.com/xxxxx.m3u8
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Save Button */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg font-medium flex items-center gap-2"
                            >
                                <Save size={18} />
                                {saving ? 'Saving...' : 'Save Stream Config'}
                            </button>
                            {message && (
                                <span className="text-sm text-emerald-400">{message}</span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
