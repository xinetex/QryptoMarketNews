import ShadowFeed from '@/components/ShadowFeed';
import { Crown } from 'lucide-react';

export default function ShadowPage() {
    return (
        <div className="min-h-screen bg-black text-zinc-100 flex flex-col items-center pt-24 pb-12 px-4">
            {/* Simple Header */}
            <div className="mb-12 text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-widest mb-4">
                    <Crown size={12} />
                    Restricted Access
                </div>
                <h1 className="text-5xl font-black tracking-tighter text-white">
                    PROJECT SHADOW
                </h1>
                <p className="text-zinc-500 max-w-lg mx-auto">
                    Where the Smart Money moves before the Crowd reacts.
                </p>
            </div>

            <div className="w-full max-w-2xl">
                <ShadowFeed />
            </div>
        </div>
    );
}
