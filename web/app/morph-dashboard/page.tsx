import MorphingGrid from '@/components/MorphingGrid';

export default function Page() {
    return (
        <div className="min-h-screen bg-black text-white pt-20">
            <div className="px-8 mb-4">
                <h1 className="text-2xl font-bold tracking-tight text-white mb-1">MORPHING DASHBOARD</h1>
                <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">
                    Prototype v0.1 • Dynamic Layout Engine
                </p>
            </div>
            <MorphingGrid />
        </div>
    );
}
