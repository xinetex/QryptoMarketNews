import { useState, useCallback } from 'react';
import { ScatterDataPoint } from '@/lib/types/galaxy';

export type ScenarioType = 'NORMAL' | 'BTC_CRASH' | 'ETH_SURGE' | 'LIQUIDATION_CASCADE' | 'STABLE_DEPEG';

export interface SimulationResult {
    id: string; // Coin ID
    originalPrice: number;
    simulatedPrice: number;
    pnlPercentage: number;
    riskScore: number; // 0-100
}

interface RiskEngineState {
    activeScenario: ScenarioType;
    severity: number; // 0.0 to 1.0 (e.g., 0.1 = 10% drop base)
    results: Record<string, SimulationResult>;
}

export function useRiskEngine(initialData: ScatterDataPoint[]) {
    const [state, setState] = useState<RiskEngineState>({
        activeScenario: 'NORMAL',
        severity: 0.1, // Default 10% severity
        results: {}
    });

    // Helper: Estimate Beta based on volatility/mcap (Heuristic)
    const calculateBeta = (coin: ScatterDataPoint) => {
        // High Mcap -> Low Beta (~1.0)
        // High Volatility -> High Beta (~1.5 - 3.0)
        let beta = 1.0;

        // Mcap Adjustment
        if (coin.marketCap > 10_000_000_000) beta = 0.9; // Mega cap
        else if (coin.marketCap < 100_000_000) beta = 1.8; // Micro cap
        else beta = 1.2;

        // Category Adjustment (Mock)
        if (coin.category === 'memes') beta *= 1.5;
        if (coin.category === 'stablecoins') beta = 0.01;
        if (coin.category === 'layer1' || coin.category === 'solana') beta *= 1.1;

        // Volatility Adjustment (using 24h change as proxy)
        const vol24h = Math.abs(coin.change24h);
        if (vol24h > 10) beta *= 1.2;
        if (vol24h > 20) beta *= 1.5;

        return beta;
    };

    const runSimulation = useCallback((scenario: ScenarioType, severity: number) => {
        const results: Record<string, SimulationResult> = {};

        initialData.forEach(coin => {
            const beta = calculateBeta(coin);
            let pnl = 0;

            switch (scenario) {
                case 'NORMAL':
                    pnl = 0;
                    break;
                case 'BTC_CRASH':
                    // BTC drops by severity (e.g., -10%). Alts drop by beta * severity.
                    // If BTC drops 10%, a beta 1.5 coin drops 15%.
                    pnl = -1 * severity * beta * 100;
                    break;
                case 'ETH_SURGE':
                    // ETH pumps. DeFi/L2s pump more (Beta > 1).
                    // BTC pumps slightly less.
                    // Memes might verify random.
                    pnl = severity * beta * 100;
                    if (coin.category === 'defi' || coin.category === 'layer2') pnl *= 1.2;
                    break;
                case 'LIQUIDATION_CASCADE':
                    // Exponential punishment for high beta/memes
                    // Severity 0.1 -> -10% base. 
                    // Beta 2 -> -20% * 1.5 multiplier = -30%
                    pnl = -1 * severity * beta * (beta > 1.2 ? 1.5 : 1.0) * 100;
                    break;
                case 'STABLE_DEPEG':
                    // Stablecoins drop significantly. Everything else panic dumps.
                    if (coin.category === 'stablecoins') pnl = -1 * severity * 100; // Direct depeg
                    else pnl = -1 * severity * 0.5 * 100; // Systematic panic (half severity)
                    break;
            }

            // Cap losses at -100% just in case
            pnl = Math.max(-99.9, pnl);

            // Risk Score (0-100) based on beta and current volatility
            // Higher score = Higher Safety (Aladdin style usually usually is Risk score, let's say 0 = Safe, 100 = Dangerous)
            // Let's invert: 100 = High Risk
            const riskScore = Math.min(100, Math.max(0, (beta * 20) + (Math.abs(coin.change24h) * 2)));

            results[coin.id] = {
                id: coin.id,
                originalPrice: coin.price,
                simulatedPrice: coin.price * (1 + pnl / 100),
                pnlPercentage: pnl,
                riskScore
            };
        });

        setState({ activeScenario: scenario, severity, results });
    }, [initialData]);

    return {
        ...state,
        runSimulation
    };
}
