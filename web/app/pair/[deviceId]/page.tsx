import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Pair Your Device | Prophet TV',
    description: 'Connect your phone to Prophet TV for second screen control',
};

interface PairPageProps {
    params: Promise<{ deviceId: string }>;
    searchParams: Promise<{ token?: string }>;
}

export default async function PairPage({ params, searchParams }: PairPageProps) {
    const { deviceId } = await params;
    const { token } = await searchParams;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        📺 Prophet TV
                    </h1>
                    <p className="text-gray-400">Second Screen Control</p>
                </div>

                {/* Pairing Card */}
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 space-y-6">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-full mb-4">
                            <span className="text-3xl">🔗</span>
                        </div>
                        <h2 className="text-xl font-semibold text-white mb-2">
                            Device Pairing
                        </h2>
                        <p className="text-gray-400 text-sm">
                            Connect your phone to control Prophet TV
                        </p>
                    </div>

                    {/* Device Info */}
                    <div className="bg-black/30 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Device ID</span>
                            <span className="text-white font-mono">{deviceId?.slice(0, 12)}...</span>
                        </div>
                        {token && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Token</span>
                                <span className="text-purple-400 font-mono">{token}</span>
                            </div>
                        )}
                    </div>

                    {/* Features */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-gray-400">What you can do:</h3>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span>
                                Control TV navigation from your phone
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span>
                                Set price alerts and notifications
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span>
                                Manage your watchlist
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span>
                                Voice search via mobile
                            </li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
                            Confirm Pairing
                        </button>
                        <Link
                            href="/"
                            className="block text-center text-gray-400 hover:text-white text-sm transition-colors"
                        >
                            Cancel
                        </Link>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-4">
                    <button className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 text-center transition-colors">
                        <span className="text-2xl block mb-1">📊</span>
                        <span className="text-sm text-gray-400">Open Zone</span>
                    </button>
                    <button className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 text-center transition-colors">
                        <span className="text-2xl block mb-1">🎙️</span>
                        <span className="text-sm text-gray-400">Voice Search</span>
                    </button>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-gray-600">
                    Your phone and TV must be on the same network
                </p>
            </div>
        </div>
    );
}
