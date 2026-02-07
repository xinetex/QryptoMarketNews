'use client';

import { LayoutGroup } from 'framer-motion';
import MorphingPanel from './MorphingPanel';
import RiskGauge from './RiskGauge';
import AlphaStream from './AlphaStream';
import DislocationFeed from './DislocationFeed';
import DerivativesPanel from './DerivativesPanel';
import WhaleFeed from './WhaleFeed';

export default function IntelligenceMorphGrid() {
    return (
        <LayoutGroup>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mb-12">

                {/* -- Row 1: High Priority Command Center Widgets -- */}

                {/* Risk Gauge (Expandable) */}
                <MorphingPanel
                    title="Risk & Exposure"
                    defaultColSpan={1}
                    defaultRowSpan={1}
                    className="min-h-[300px]"
                >
                    <RiskGauge />
                </MorphingPanel>

                {/* Alpha Stream (Expandable) */}
                <MorphingPanel
                    title="Alpha Stream"
                    defaultColSpan={1}
                    defaultRowSpan={1}
                    className="min-h-[300px]"
                >
                    <AlphaStream />
                </MorphingPanel>

                {/* Derivatives Panel (Existing, moved to Grid) */}
                {/* Note: Can wrap existing panels in MorphingPanel for uniformity */}
                <MorphingPanel
                    title="Derivatives Heatmap"
                    defaultColSpan={1}
                    defaultRowSpan={1}
                    className="min-h-[300px]"
                >
                    <div className="h-full p-4 overflow-hidden">
                        <DerivativesPanel />
                    </div>
                </MorphingPanel>


                {/* -- Row 2: Deep Market Analysis -- */}

                {/* Dislocation Feed (Standard: 2 cols) */}
                <MorphingPanel
                    title="Market Dislocations"
                    defaultColSpan={2}
                    defaultRowSpan={1}
                    className="min-h-[400px]"
                >
                    <div className="h-full p-4">
                        <DislocationFeed maxItems={5} autoRefresh={true} refreshInterval={60000} />
                    </div>
                </MorphingPanel>

                {/* Placeholder / Executive Brief / News */}
                <MorphingPanel
                    title="Whale Radar"
                    defaultColSpan={1}
                    defaultRowSpan={1}
                    className="min-h-[400px]"
                >
                    <div className="h-full p-4">
                        <WhaleFeed />
                    </div>
                </MorphingPanel>

            </div>
        </LayoutGroup>
    );
}
