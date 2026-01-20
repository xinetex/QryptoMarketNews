'use client';

import { useState, useRef, useEffect } from 'react';
import { animate } from 'animejs';
import Link from 'next/link';
import { LucideIcon, Zap, AlertTriangle, TrendingUp, Activity, Brain, Globe } from 'lucide-react';
import { formatChange } from '@/lib/coingecko';

interface ZoneData {
    id: string;
    name: string;
    icon: string;
    color: string;
    change: string;
    isPositive: boolean;
}

interface AlertEvent {
    type: 'WHALE' | 'VOLUME' | 'BREAKOUT' | 'INSIGHT';
    message: string;
    severity: 'info' | 'warning' | 'critical' | 'knowledge';
}

interface AlertableZoneCardProps {
    zone: ZoneData;
    icon: LucideIcon;
    gradientClass: string;
    insights?: string[];
}

export default function AlertableZoneCard({ zone, icon: IconComponent, gradientClass, insights }: AlertableZoneCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [alert, setAlert] = useState<AlertEvent | null>(null);
    const [isFlipped, setIsFlipped] = useState(false);

    // Expose a method to trigger alert (simulation for now)
    useEffect(() => {
        // Randomly trigger an alert for "Life" simulation
        // In production, this would subscribe to a real event bus
        const randomTrigger = Math.random() > 0.96; // Low chance per tick

        const triggerAlert = () => {
            let evt: AlertEvent;

            // Priority: Show Insight if available (60% chance)
            if (insights && insights.length > 0 && Math.random() > 0.4) {
                const randomInsight = insights[Math.floor(Math.random() * insights.length)];
                evt = { type: 'INSIGHT', message: randomInsight, severity: 'knowledge' };
            } else {
                // Generative Market Events
                const events: AlertEvent[] = [
                    { type: 'WHALE', message: 'Whale Accumulation', severity: 'info' },
                    { type: 'VOLUME', message: '+400% Vol Spike', severity: 'warning' },
                    { type: 'BREAKOUT', message: 'Price Breakout', severity: 'critical' }
                ];
                evt = events[Math.floor(Math.random() * events.length)];
            }

            setAlert(evt);
            setIsFlipped(true);

            if (!cardRef.current) return;

            // Flip Animation
            animate(cardRef.current, {
                rotateY: 180,
                duration: 800,
                easing: 'easeInOutCubic'
            });

            // Auto-Revert after 6s (slightly longer for reading)
            setTimeout(() => {
                if (!cardRef.current) return;
                animate(cardRef.current, {
                    rotateY: 0,
                    duration: 800,
                    easing: 'easeInOutCubic',
                    complete: () => {
                        setIsFlipped(false);
                        setAlert(null);
                    }
                });
            }, 6000);
        };

        const timer = setInterval(() => {
            if (!isFlipped && Math.random() > 0.85) { // 15% chance every 10s check
                triggerAlert();
            }
        }, 8000 + Math.random() * 5000); // Staggered checks

        return () => clearInterval(timer);
    }, [isFlipped, insights]);

    return (
        <div className="perspective-1000 w-full h-40">
            <div
                ref={cardRef}
                className="relative w-full h-full transform-style-3d simple-shadow transition-transform"
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* FRONT FACE (Normal Market Data) */}
                <Link
                    href={`/zone/${zone.id}`}
                    className="absolute inset-0 backface-hidden rounded-xl bg-[#12121A] border border-white/5 p-5 flex flex-col justify-between overflow-hidden group hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all"
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-50 group-hover:opacity-80 transition-opacity duration-500`} />

                    <div className="flex justify-between items-start z-10">
                        <div className={`${zone.color} bg-zinc-900/80 p-2 rounded-lg border border-white/5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                            <IconComponent size={20} strokeWidth={1.5} />
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] text-zinc-500 font-medium mb-0.5">24h</div>
                            <div className={`text-sm font-bold tracking-tight ${zone.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                                {zone.change}
                            </div>
                        </div>
                    </div>

                    <div className="z-10">
                        <h3 className="text-zinc-100 text-lg font-medium tracking-tight mb-0.5 group-hover:text-white transition-colors">
                            {zone.name}
                        </h3>
                        <p className="text-[10px] text-zinc-500 group-hover:text-zinc-400 transition-colors">
                            Explore {zone.name.toLowerCase()} Prophets
                        </p>
                    </div>

                    <div className="absolute bottom-0 left-0 h-1 bg-indigo-500 transition-all duration-300 w-0 group-hover:w-1/3" />
                </Link>

                {/* BACK FACE (Alert Event) */}
                <div
                    className="absolute inset-0 backface-hidden rounded-xl p-5 flex flex-col justify-center items-center text-center overflow-hidden border border-white/10"
                    style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        backgroundColor: alert?.severity === 'critical' ? '#450a0a' :
                            alert?.severity === 'warning' ? '#422006' :
                                alert?.severity === 'knowledge' ? '#1e1b4b' : '#022c22'
                    }}
                >
                    {/* Alert Background */}
                    <div className={`absolute inset-0 opacity-20 animate-pulse ${alert?.severity === 'critical' ? 'bg-red-500' :
                            alert?.severity === 'warning' ? 'bg-orange-500' :
                                alert?.severity === 'knowledge' ? 'bg-indigo-500' : 'bg-emerald-500'
                        }`} />

                    <div className="relative z-10 flex flex-col items-center">
                        <div className={`p-3 rounded-full mb-3 ${alert?.severity === 'critical' ? 'bg-red-500/20 text-red-500' :
                                alert?.severity === 'warning' ? 'bg-orange-500/20 text-orange-400' :
                                    alert?.severity === 'knowledge' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'
                            }`}>
                            {alert?.type === 'WHALE' && <Activity size={24} />}
                            {alert?.type === 'VOLUME' && <TrendingUp size={24} />}
                            {alert?.type === 'BREAKOUT' && <Zap size={24} />}
                            {alert?.type === 'INSIGHT' && <Brain size={24} />}
                        </div>

                        <div className="text-xs font-bold text-white uppercase tracking-widest mb-1">
                            {alert?.type === 'INSIGHT' ? 'MARKET INTEL' : `${alert?.type} DETECTED`}
                        </div>
                        <div className={`text-[10px] font-mono leading-tight px-1 ${alert?.severity === 'critical' ? 'text-red-300' :
                                alert?.severity === 'warning' ? 'text-orange-300' :
                                    alert?.severity === 'knowledge' ? 'text-indigo-200' : 'text-emerald-300'
                            }`}>
                            {alert?.message}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
