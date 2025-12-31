"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Download, ExternalLink, RefreshCw, Tv, Code } from "lucide-react";

export default function RokuBuilderPage() {
    const [feed, setFeed] = useState<Record<string, unknown> | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFeed();
    }, []);

    const loadFeed = () => {
        setLoading(true);
        fetch('/api/roku/feed')
            .then(r => r.json())
            .then(data => setFeed(data))
            .finally(() => setLoading(false));
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
                        <h1 className="text-2xl font-bold">Roku App Builder</h1>
                        <p className="text-zinc-400 text-sm">Configure and deploy your Roku channel</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Feed Preview */}
                    <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-semibold flex items-center gap-2">
                                <Code size={18} />
                                Roku Feed Preview
                            </h2>
                            <button
                                onClick={loadFeed}
                                className="p-2 hover:bg-zinc-800 rounded transition-colors"
                            >
                                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                            </button>
                        </div>

                        <div className="bg-zinc-950 rounded-lg p-4 max-h-96 overflow-auto">
                            <pre className="text-xs text-zinc-400 font-mono">
                                {JSON.stringify(feed, null, 2)}
                            </pre>
                        </div>

                        <div className="mt-4 flex gap-2">
                            <Link
                                href="/api/roku/feed"
                                target="_blank"
                                className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-center flex items-center justify-center gap-2"
                            >
                                <ExternalLink size={14} />
                                Open Feed URL
                            </Link>
                        </div>
                    </section>

                    {/* Deployment */}
                    <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <h2 className="font-semibold flex items-center gap-2 mb-4">
                            <Tv size={18} />
                            Deploy to Roku
                        </h2>

                        <div className="space-y-4">
                            <div className="bg-zinc-950 rounded-lg p-4 border border-zinc-800">
                                <h3 className="text-sm font-medium mb-2">Download Package</h3>
                                <p className="text-xs text-zinc-500 mb-3">
                                    Get the latest Roku channel package ready for sideloading
                                </p>
                                <a
                                    href="/qchannel-roku.zip"
                                    download
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm"
                                >
                                    <Download size={14} />
                                    Download qchannel-roku.zip
                                </a>
                            </div>

                            <div className="bg-zinc-950 rounded-lg p-4 border border-zinc-800">
                                <h3 className="text-sm font-medium mb-2">Sideload Instructions</h3>
                                <ol className="text-xs text-zinc-500 space-y-2">
                                    <li>1. Enable Developer Mode on your Roku</li>
                                    <li>2. Navigate to roku/roku-sideload.sh</li>
                                    <li>3. Run: <code className="bg-zinc-800 px-1 rounded">./roku-sideload.sh 192.168.x.x</code></li>
                                    <li>4. Enter your Roku developer credentials</li>
                                </ol>
                            </div>

                            <div className="bg-zinc-950 rounded-lg p-4 border border-zinc-800">
                                <h3 className="text-sm font-medium mb-2">Feed URL for Roku</h3>
                                <p className="text-xs text-zinc-500 mb-2">
                                    Configure your Roku app to fetch from:
                                </p>
                                <code className="block bg-zinc-800 px-3 py-2 rounded text-xs font-mono break-all">
                                    {typeof window !== 'undefined' ? window.location.origin : ''}/api/roku/feed
                                </code>
                            </div>
                        </div>
                    </section>

                    {/* Zone Summary */}
                    <section className="md:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <h2 className="font-semibold mb-4">Active Zones for Roku</h2>

                        {feed && (feed as { zones?: unknown[] }).zones && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {((feed as { zones: { id: string; title: string; icon: string; color: string }[] }).zones).map((zone) => (
                                    <div
                                        key={zone.id}
                                        className="bg-zinc-950 rounded-lg p-3 border border-zinc-800 flex items-center gap-3"
                                    >
                                        <span
                                            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                                            style={{ backgroundColor: zone.color + '30' }}
                                        >
                                            {zone.icon}
                                        </span>
                                        <span className="text-sm font-medium">{zone.title}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
