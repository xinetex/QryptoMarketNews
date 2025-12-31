"use client";

import { useEffect, useRef } from "react";
import { animate } from "animejs";

interface SparklineProps {
    data: number[];
    width?: number;
    height?: number;
    color?: string;
    className?: string;
}

export default function Sparkline({
    data,
    width = 500,
    height = 200,
    color = "auto",
    className = ""
}: SparklineProps) {
    const pathRef = useRef<SVGPathElement>(null);
    const fillRef = useRef<SVGPathElement>(null);

    useEffect(() => {
        if (!pathRef.current || !data || data.length === 0) return;

        // Calculate stroke dash offset for animation
        const path = pathRef.current;
        const length = path.getTotalLength ? path.getTotalLength() : 1000;
        path.style.strokeDasharray = `${length}`;
        path.style.strokeDashoffset = `${length}`;

        // Animate stroke drawing
        animate(pathRef.current, {
            strokeDashoffset: [length, 0],
            easing: 'easeInOutSine',
            duration: 1500,
            delay: 300,
        });

        // Animate fill fade-in
        animate(fillRef.current, {
            opacity: [0, 1],
            easing: 'linear',
            duration: 1000,
            delay: 1000,
        });
    }, [data]);

    if (!data || data.length === 0) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    // Generate SVG path for line
    const points = data.map((value, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((value - min) / range) * (height * 0.8) - (height * 0.1); // Add padding
        return `${x},${y}`;
    });

    const pathD = `M ${points.join(" L ")}`;

    // Determine color based on trend
    const trendColor = data[data.length - 1] >= data[0] ? "#10b981" : "#ef4444";
    const strokeColor = color === "auto" ? trendColor : color;

    // Grid lines (3 lines: top, mid, bot)
    const gridY1 = height * 0.1;
    const gridY2 = height * 0.5;
    const gridY3 = height * 0.9;

    return (
        <svg
            width={width}
            height={height}
            className={`overflow-visible ${className}`}
            viewBox={`0 0 ${width} ${height}`}
        >
            <defs>
                <linearGradient id={`sparkline-gradient-${data.length}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={strokeColor} stopOpacity="0.4" />
                    <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
                </linearGradient>
            </defs>

            {/* Grid & Axes */}
            <g className="text-zinc-800" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" opacity="0.5">
                <line x1="0" y1={gridY1} x2={width} y2={gridY1} />
                <line x1="0" y1={gridY2} x2={width} y2={gridY2} />
                <line x1="0" y1={gridY3} x2={width} y2={gridY3} />
            </g>

            {/* Price Labels (Right aligned) */}
            <g className="text-[10px] text-zinc-500 font-mono" fill="currentColor">
                <text x={width + 10} y={gridY1 + 4}>{max.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })}</text>
                <text x={width + 10} y={gridY3 + 4}>{min.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })}</text>
            </g>

            {/* Area fill */}
            <path
                ref={fillRef}
                d={`${pathD} L ${width},${height} L 0,${height} Z`}
                fill={`url(#sparkline-gradient-${data.length})`}
                opacity="0"
            />

            {/* Line */}
            <path
                ref={pathRef}
                d={pathD}
                fill="none"
                stroke={strokeColor}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* End dot */}
            <circle
                cx={width}
                cy={height - ((data[data.length - 1] - min) / range) * (height * 0.8) - (height * 0.1)}
                r="3"
                fill={strokeColor}
                className="animate-pulse"
            />
        </svg>
    );
}
