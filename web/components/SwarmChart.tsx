"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { SwarmSignal } from '@/lib/polymarket-analyzer';

interface SwarmChartProps {
    data: SwarmSignal | null;
    marketTitle?: string;
}

interface Particle extends d3.SimulationNodeDatum {
    id: string;
    r: number;
    color: string;
    value: number;
    side: 'BUY' | 'SELL';
    life: number; // 0-1, fades out
}

export function SwarmChart({ data, marketTitle }: SwarmChartProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [particles, setParticles] = useState<Particle[]>([]);

    // Simulation Ref to keep it persistent
    const simulationRef = useRef<d3.Simulation<Particle, undefined> | null>(null);

    // Initialize Simulation
    useEffect(() => {
        if (!svgRef.current) return;

        const width = 600;
        const height = 400;

        const simulation = d3.forceSimulation<Particle, undefined>()
            .force("charge", d3.forceManyBody().strength(-5)) // Repel slightly
            .force("center", d3.forceCenter(width / 2, height / 2)) // Gravitate to center
            .force("collide", d3.forceCollide().radius(d => (d as Particle).r + 1).iterations(2))
            .force("x", d3.forceX(width / 2).strength(0.05))
            .force("y", d3.forceY(height / 2).strength(0.05));

        simulationRef.current = simulation;

        return () => {
            simulation.stop();
        };
    }, []);

    // Update Particles when Data changes
    useEffect(() => {
        if (!data || !simulationRef.current) return;
        if (!data.detected) return;

        // Generate particles based on swarm size and volume
        // We simulate a burst of particles entering
        const newParticles: Particle[] = [];
        const count = Math.max(5, data.swarmSize * 2); // Visual multiplier

        for (let i = 0; i < count; i++) {
            const side = data.side === 'BUY' ? 'BUY' : data.side === 'SELL' ? 'SELL' : (Math.random() > 0.5 ? 'BUY' : 'SELL');
            const color = side === 'BUY' ? '#10B981' : '#EF4444'; // Emerald-500 vs Red-500

            newParticles.push({
                id: `p-${Date.now()}-${i}`,
                x: Math.random() * 600, // Spawn random
                y: Math.random() * 400,
                r: Math.random() * 4 + 2,
                color,
                value: 10,
                side,
                life: 1.0
            });
        }

        // Add to simulation
        const sim = simulationRef.current;
        const currentNodes = sim.nodes();
        const updatedNodes = [...currentNodes, ...newParticles].slice(-100); // Keep max 100

        sim.nodes(updatedNodes);
        sim.alpha(1).restart(); // Re-heat simulation

        // D3 Timer to update React State for rendering? 
        // Or render D3 directly? React + D3 is best when D3 does calculation, React does rendering.

        const ticker = d3.timer(() => {
            setParticles([...updatedNodes]);
        });

        return () => {
            ticker.stop();
        };

    }, [data]);

    return (
        <div className="w-full bg-slate-900/50 rounded-xl border border-slate-700 p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-slate-200 font-semibold">{marketTitle || "Swarm Intelligence"}</h3>
                    <p className="text-xs text-slate-400">
                        {data?.detected
                            ? `ALERT: ${data.intensity.toUpperCase()} INTENSITY SWARM`
                            : "Monitoring for bot activity..."}
                    </p>
                </div>
                {data?.detected && (
                    <div className={`px-2 py-1 rounded text-xs font-bold ${data.side === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                        {data.confidence}% {data.side}
                    </div>
                )}
            </div>

            <div className="relative w-full h-[300px] bg-slate-950 rounded-lg overflow-hidden shadow-inner">
                <svg
                    ref={svgRef}
                    viewBox="0 0 600 400"
                    className="w-full h-full"
                >
                    {/* Central Attractor */}
                    <circle cx="300" cy="200" r="10" fill="#3B82F6" className="animate-pulse opacity-50" />
                    <circle cx="300" cy="200" r="4" fill="#60A5FA" />

                    {/* Nodes */}
                    {particles.map(p => (
                        <circle
                            key={p.id}
                            cx={p.x}
                            cy={p.y}
                            r={p.r}
                            fill={p.color}
                            opacity={0.8}
                            className="transition-all duration-75"
                        />
                    ))}
                </svg>

                {!data?.detected && (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-600 font-mono text-sm pointer-events-none">
                        WAITING FOR SIGNAL...
                    </div>
                )}
            </div>
        </div>
    );
}
