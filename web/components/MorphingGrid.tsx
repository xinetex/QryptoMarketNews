'use client';

import { LayoutGroup } from 'framer-motion';
import MorphingPanel from './MorphingPanel';
import RiskGauge from './RiskGauge';
import AlphaStream from './AlphaStream';
import ExecutiveBrief from './ExecutiveBrief';

// A mock component for the 4th quadrant to show grid flow
function MarketPulseMock() {
    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 h-full flex flex-col justify-center items-center">
            <h3 className="text-zinc-500 font-mono text-sm uppercase">Market Pulse</h3>
            <div className="text-4xl font-bold text-white mt-2">STABLE</div>
            <div className="text-emerald-500 text-xs mt-1">Volatility Low</div>
        </div>
    )
}

export default function MorphingGrid() {
    return (
        <LayoutGroup>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 lg:grid-rows-2 gap-4 p-4 h-[calc(100vh-100px)] w-full max-w-7xl mx-auto">

                {/* Panel 1: Risk Gauge */}
                <MorphingPanel title="Risk & Exposure" defaultColSpan={1} defaultRowSpan={1}>
                    <RiskGauge />
                </MorphingPanel>

                {/* Panel 2: Alpha Stream */}
                <MorphingPanel title="Alpha Stream" defaultColSpan={1} defaultRowSpan={1}>
                    <AlphaStream />
                </MorphingPanel>

                {/* Panel 3: Executive Brief */}
                <MorphingPanel title="Executive Brief" defaultColSpan={1} defaultRowSpan={1}>
                    <ExecutiveBrief />
                </MorphingPanel>

                {/* Panel 4: Market Pulse (Placeholder for now) */}
                <MorphingPanel title="Market Pulse" defaultColSpan={1} defaultRowSpan={1}>
                    <MarketPulseMock />
                </MorphingPanel>

            </div>
        </LayoutGroup>
    );
}
