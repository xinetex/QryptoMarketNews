'use client';

import RiskGauge from './RiskGauge';
import AlphaStream from './AlphaStream';
import ExecutiveBrief from './ExecutiveBrief';

export default function CommandCenter() {
    return (
        <div className="bg-black min-h-screen text-zinc-100 p-8 font-sans">
            <header className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white mb-1">COMMAND CENTER</h1>
                    <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">
                        Portfolio Intelligence Unit • Level 4 Access
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded px-4 py-2 text-right">
                        <div className="text-[10px] text-zinc-500 font-mono uppercase">Net Liquid</div>
                        <div className="text-lg font-bold font-mono">$14,230,591</div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
                {/* Column 1: Risk & Exposure */}
                <div className="col-span-1 h-full">
                    <RiskGauge />
                </div>

                {/* Column 2: The Alpha Stream */}
                <div className="col-span-1 h-full">
                    <AlphaStream />
                </div>

                {/* Column 3: Executive Synthesis */}
                <div className="col-span-1 h-full">
                    <ExecutiveBrief />
                </div>
            </div>
        </div>
    );
}
