"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface PriceHeatmapProps {
    data: number[];
    width?: number;
    height?: number;
}

export default function PriceHeatmap({ data, width = 500, height = 60 }: PriceHeatmapProps) {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || data.length === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        // Sample data into cells (e.g., 24 cells for hourly-ish view)
        const cellCount = Math.min(48, data.length);
        const step = Math.floor(data.length / cellCount);
        const sampledData = [];
        for (let i = 0; i < cellCount; i++) {
            const idx = i * step;
            sampledData.push(data[idx]);
        }

        const min = d3.min(sampledData) || 0;
        const max = d3.max(sampledData) || 1;

        // Color scale: red (low) -> yellow (mid) -> green (high)
        const colorScale = d3.scaleSequential()
            .domain([min, max])
            .interpolator(d3.interpolateRdYlGn);

        const cellWidth = width / cellCount;
        const cellHeight = height;

        // Draw heatmap cells
        svg.selectAll("rect")
            .data(sampledData)
            .enter()
            .append("rect")
            .attr("x", (_, i) => i * cellWidth)
            .attr("y", 0)
            .attr("width", cellWidth - 1)
            .attr("height", cellHeight)
            .attr("fill", d => colorScale(d))
            .attr("rx", 2)
            .attr("opacity", 0)
            .transition()
            .duration(500)
            .delay((_, i) => i * 20)
            .attr("opacity", 0.9);

        // Add subtle gradient overlay for depth
        const gradient = svg.append("defs")
            .append("linearGradient")
            .attr("id", "heatmapGradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "0%")
            .attr("y2", "100%");

        gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "white")
            .attr("stop-opacity", 0.1);

        gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "black")
            .attr("stop-opacity", 0.2);

        svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "url(#heatmapGradient)")
            .attr("pointer-events", "none");

    }, [data, width, height]);

    if (data.length === 0) {
        return (
            <div className="h-[60px] flex items-center justify-center text-zinc-600 text-xs">
                No heatmap data
            </div>
        );
    }

    return (
        <div className="relative">
            <svg
                ref={svgRef}
                width={width}
                height={height}
                className="rounded-lg overflow-hidden"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-mono">
                <span>7 days ago</span>
                <span>Now</span>
            </div>
        </div>
    );
}
