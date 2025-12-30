"use client";

interface SparklineProps {
    data: number[];
    width?: number;
    height?: number;
    color?: string;
    className?: string;
}

export default function Sparkline({
    data,
    width = 80,
    height = 24,
    color = "#10b981",
    className = ""
}: SparklineProps) {
    if (!data || data.length === 0) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    // Generate SVG path
    const points = data.map((value, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((value - min) / range) * height;
        return `${x},${y}`;
    });

    const pathD = `M ${points.join(" L ")}`;

    // Determine color based on trend (first vs last)
    const trendColor = data[data.length - 1] >= data[0] ? "#10b981" : "#ef4444";
    const strokeColor = color === "auto" ? trendColor : color;

    return (
        <svg
            width={width}
            height={height}
            className={className}
            viewBox={`0 0 ${width} ${height}`}
        >
            {/* Gradient fill under the line */}
            <defs>
                <linearGradient id={`sparkline-gradient-${data.length}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
                </linearGradient>
            </defs>

            {/* Area fill */}
            <path
                d={`${pathD} L ${width},${height} L 0,${height} Z`}
                fill={`url(#sparkline-gradient-${data.length})`}
            />

            {/* Line */}
            <path
                d={pathD}
                fill="none"
                stroke={strokeColor}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* End dot */}
            <circle
                cx={width}
                cy={height - ((data[data.length - 1] - min) / range) * height}
                r="2"
                fill={strokeColor}
            />
        </svg>
    );
}
