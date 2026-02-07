'use client';
import { Shield, TrendingUp, Activity, AlertTriangle } from 'lucide-react';

interface RiskMetric {
    label: string;
    value: string;
    trend: 'positive' | 'negative' | 'neutral';
    description: string;
}

export default function RiskGauge() {
    // Mock Data for HNWI
    const metrics: RiskMetric[] = [
        {
            label: 'NET WORTH DELTA',
            value: '-2.4%',
            trend: 'negative',
            description: 'Daily PnL'
        },
        {
            label: 'BTC BETA',
            value: '0.85',
            trend: 'positive',
            description: 'Correlation to Bitcoin'
        },
        {
            label: 'SHARPE RATIO',
            value: '2.1',
            trend: 'positive',
            description: 'Risk-adjusted return (30d)'
        },
        {
            label: 'LIQUIDITY SCORE',
            value: 'A-',
            trend: 'neutral',
            description: 'Ability to exit < 1% slip'
        }
    ];

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-zinc-400 font-mono text-sm tracking-widest flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    RISK & EXPOSURE
                </h2>
                <div className="text-xs text-zinc-600 font-mono">LIVE</div>
            </div>

            <div className="grid grid-cols-2 gap-4 flex-grow">
                {metrics.map((m, i) => (
                    <div key={i} className="bg-zinc-950/50 p-4 rounded border border-zinc-800/50 flex flex-col justify-between">
                        <div className="text-xs text-zinc-500 font-mono mb-1">{m.label}</div>
                        <div className={`text-2xl font-bold font-mono ${m.trend === 'positive' ? 'text-emerald-400' :
                                m.trend === 'negative' ? 'text-rose-400' : 'text-zinc-300'
                            }`}>
                            {m.value}
                        </div>
                        <div className="text-[10px] text-zinc-600 mt-2">{m.description}</div>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-800">
                <div className="flex items-center gap-3 text-amber-500 bg-amber-500/10 p-3 rounded text-xs font-mono">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>EXPOSURE ALERT: 65% of portfolio in centralized custody.</span>
                </div>
            </div>
        </div>
    );
}
