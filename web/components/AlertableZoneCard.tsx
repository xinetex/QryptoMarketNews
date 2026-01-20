'use client';

import { useState, useRef, useEffect } from 'react';
import { animate } from 'animejs';
import Link from 'next/link';
import { LucideIcon, Zap, TrendingUp, Activity, Brain, Crosshair } from 'lucide-react';
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
    title: string;
    message: string;
    severity: 'info' | 'warning' | 'critical' | 'knowledge';
    token?: string;
}

interface AlertableZoneCardProps {
    zone: ZoneData;
    icon: LucideIcon;
    gradientClass: string;
    insights?: string[];
    tokens?: string[];
}

export default function AlertableZoneCard({ zone, icon: IconComponent, gradientClass, insights, tokens }: AlertableZoneCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const alertRef = useRef<HTMLDivElement>(null);
    const [alert, setAlert] = useState<AlertEvent | null>(null);

    // Expose a method to trigger alert (simulation for now)
    useEffect(() => {
        const randomTrigger = Math.random() > 0.96;

        const triggerAlert = () => {
            let evt: AlertEvent;
            const useToken = tokens && tokens.length > 0 && Math.random() > 0.3;

            // Priority: Show Insight (40%) vs Token Event (60%)
            if (!useToken && insights && insights.length > 0 && Math.random() > 0.5) {
                const randomInsight = insights[Math.floor(Math.random() * insights.length)];
                evt = { type: 'INSIGHT', title: 'MARKET INTEL', message: randomInsight, severity: 'knowledge' };
            } else {
                // Specific Token Events
                const token = useToken ? tokens![Math.floor(Math.random() * tokens!.length)] : zone.name.toUpperCase();
                const events: AlertEvent[] = [
                    { type: 'WHALE', title: 'WHALE ENTRY', message: `${token} Accumulation Detected`, severity: 'info', token },
                    { type: 'VOLUME', title: 'VOLUME SPIKE', message: `${token} +450% Vol Surge`, severity: 'warning', token },
                    { type: 'BREAKOUT', title: 'PRICE ACTION', message: `${token} Breaking Resistance`, severity: 'critical', token }
                ];
                evt = events[Math.floor(Math.random() * events.length)];
            }
            setAlert(evt);
        };

        const timer = setInterval(() => {
            if (!alert && Math.random() > 0.85) {
                triggerAlert();
            }
        }, 8000 + Math.random() * 5000);

        return () => clearInterval(timer);
    }, [alert, insights, tokens, zone.name]);

    // Handle Animation when Alert State Changes
    useEffect(() => {
        if (alert && alertRef.current) {
            // Zoom In
            animate(alertRef.current, {
                scale: [0.8, 1],
                opacity: [0, 1],
                duration: 400,
                easing: 'easeOutBack'
            });

            // Auto-Revert
            const timer = setTimeout(() => {
                if (alertRef.current) {
                    animate(alertRef.current, {
                        scale: 1.1,
                        opacity: 0,
                        duration: 300,
                        easing: 'easeInQuad',
                        complete: () => setAlert(null)
                    });
                } else {
                    setAlert(null);
                }
            }, 6000);

            return () => clearTimeout(timer);
        }
    }, [alert]);

    return (
        <div className="relative w-full h-40 group">
            {/* FRONT FACE (Normal Market Data) */}
            <Link
                href={`/zone/${zone.id}`}
                className={`relative block w-full h-full rounded-xl bg-[#12121A] border border-white/5 p-5 overflow-hidden transition-all duration-300 ${alert ? 'opacity-20 blur-sm scale-95' : 'hover:scale-[1.02] hover:border-indigo-500/50'}`}
            >
                <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-50 group-hover:opacity-80 transition-opacity duration-500`} />

                <div className="flex justify-between items-start z-10 relative">
                    <div className={`${zone.color} bg-zinc-900/80 p-2 rounded-lg border border-white/5 shadow-lg`}>
                        <IconComponent size={20} strokeWidth={1.5} />
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-zinc-500 font-medium mb-0.5">24h</div>
                        <div className={`text-sm font-bold tracking-tight ${zone.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                            {zone.change}
                        </div>
                    </div>
                </div>

                <div className="z-10 relative mt-4">
                    <h3 className="text-zinc-100 text-lg font-medium tracking-tight mb-0.5 group-hover:text-white transition-colors">
                        {zone.name}
                    </h3>

                    {tokens && tokens.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {tokens.slice(0, 4).map((t, i) => (
                                <span key={i} className="text-[9px] font-mono font-bold text-zinc-400 bg-zinc-900/60 px-1.5 py-px rounded border border-white/5 group-hover:border-indigo-500/30 group-hover:text-indigo-300 transition-colors">
                                    {t}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-[10px] text-zinc-500 group-hover:text-zinc-400 transition-colors">
                            Explore {zone.name.toLowerCase()} Prophets
                        </p>
                    )}
                </div>

                <div className="absolute bottom-0 left-0 h-1 bg-indigo-500 transition-all duration-300 w-0 group-hover:w-1/3" />
            </Link>

            {/* ZOOM OVERLAY (Alert Event) */}
            {alert && (
                <div
                    ref={alertRef}
                    className="absolute inset-0 z-20 rounded-xl p-5 flex flex-col justify-center items-center text-center overflow-hidden border border-white/20 shadow-2xl backdrop-blur-md"
                    style={{
                        opacity: 0, // Handled by anime.js
                        transform: 'scale(0.8)', // Handled by anime.js
                        backgroundColor: alert.severity === 'critical' ? 'rgba(69, 10, 10, 0.95)' :
                            alert.severity === 'warning' ? 'rgba(66, 32, 6, 0.95)' :
                                alert.severity === 'knowledge' ? 'rgba(30, 27, 75, 0.95)' : 'rgba(2, 44, 34, 0.95)'
                    }}
                >
                    {/* Scanning Line Effect */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-white/10 to-transparent animate-[scan_2s_linear_infinite]" />

                    <div className="relative z-30 flex flex-col items-center">
                        <div className={`p-3 rounded-full mb-2 ${alert.severity === 'critical' ? 'bg-red-500/20 text-red-500' :
                            alert.severity === 'warning' ? 'bg-orange-500/20 text-orange-400' :
                                alert.severity === 'knowledge' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'
                            }`}>
                            {alert.type === 'WHALE' && <Crosshair size={24} />}
                            {alert.type === 'VOLUME' && <TrendingUp size={24} />}
                            {alert.type === 'BREAKOUT' && <Zap size={24} />}
                            {alert.type === 'INSIGHT' && <Brain size={24} />}
                        </div>

                        <div className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-1 animate-pulse">
                            {alert.title}
                        </div>
                        <div className={`text-xs font-mono font-bold leading-tight px-1 ${alert.severity === 'critical' ? 'text-red-200' :
                            alert.severity === 'warning' ? 'text-orange-200' :
                                alert.severity === 'knowledge' ? 'text-indigo-200' : 'text-emerald-200'
                            }`}>
                            {alert.message}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
