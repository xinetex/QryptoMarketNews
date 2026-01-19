"use client";

import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Html, Stars, Billboard, Line } from "@react-three/drei";
import * as THREE from "three";
import * as d3 from "d3";
import { formatPrice, formatChange } from "@/lib/coingecko";
import { useRouter } from "next/navigation";
import type { ExtendedCoinData } from "@/app/galaxy/page";

// Extend the base data with visual helpers
type ScatterDataPoint = ExtendedCoinData & {
    change24h: number;
    volume24h: number;
    zoneColor: string;
};


const getMetricValue = (point: ScatterDataPoint, metric: string): number => {
    switch (metric) {
        case "mcap": return point.marketCap;
        case "volume": return point.volume24h;
        case "change": return point.change24h;
        case "volatility": return point.volatility;
        case "fdv": return point.fdv;
        case "price": return point.price;
        default: return 0;
    }
};

function VolatilityRing({ volatility, size, color }: { volatility: number, size: number, color: string }) {
    const ringRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (ringRef.current) {
            ringRef.current.rotation.z += 0.01 + (volatility * 0.05); // Faster spin for higher volatility
            // Pulse opacity
            if (Array.isArray(ringRef.current.material)) return; // TS guard
            const material = ringRef.current.material as THREE.MeshBasicMaterial;
            material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.15;
        }
    });

    if (volatility < 0.03) return null; // Don't show ring for stable assets

    return (
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[size * 1.2, size * 1.3 + (volatility * 0.5), 32]} />
            <meshBasicMaterial color={color} transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
    );
}

function ScatterPoint({ point, position, radiusScale, opacityScale, onClick, showHalo, showTrail, isGhost = false, color }: {
    point: ScatterDataPoint,
    position: [number, number, number],
    radiusScale: d3.ScaleLinear<number, number>,
    opacityScale: d3.ScaleLogarithmic<number, number>,
    onClick: (id: string) => void,
    showHalo: boolean,
    showTrail: boolean,
    isGhost?: boolean,
    color: string
}) {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    // Visual calculations
    const size = radiusScale(point.marketCap);
    const keySize = isGhost ? size * 0.5 : size; // Ghosts are smaller
    const opacity = isGhost ? 0.2 : opacityScale(point.volume24h);
    const brightness = isGhost ? 0 : Math.min(1.5, opacity + 0.5);

    // Trail logic
    const trailPath = useMemo(() => {
        if (!showTrail || !point.history) return null;
        return point.history.map((h, i) => {
            const priceRatio = h.price / point.price;
            // Assume Y axis (Change) correlates with price difference roughly for the visual
            return new THREE.Vector3(
                position[0],
                position[1] + (1 - priceRatio) * 20, // Exaggerate movement for trail visual
                position[2]
            );
        });
    }, [point, position, showTrail]);

    useFrame((state) => {
        if (meshRef.current) {
            // Bobbing only for live points
            if (!isGhost) {
                meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.2;
            } else {
                meshRef.current.position.y = position[1]; // Static ghost
            }

            // Rotation
            if (hovered && !isGhost) {
                meshRef.current.rotation.y += 0.05;
                meshRef.current.scale.setScalar(1.2);
            } else {
                meshRef.current.rotation.y += 0.01;
                meshRef.current.scale.setScalar(1);
            }
        }
    });

    return (
        <group>
            {/* Trail Line */}
            {trailPath && (
                <Line
                    points={trailPath}
                    color={color}
                    opacity={0.3}
                    transparent
                    lineWidth={1}
                />
            )}

            <group position={position}>
                {/* Core Sphere */}
                <mesh
                    ref={meshRef}
                    onPointerOver={() => !isGhost && setHovered(true)}
                    onPointerOut={() => !isGhost && setHovered(false)}
                    onClick={() => !isGhost && onClick(point.id)}
                >
                    <sphereGeometry args={[keySize, 32, 32]} />
                    <meshStandardMaterial
                        color={isGhost ? "#ffffff" : color}
                        emissive={color}
                        emissiveIntensity={isGhost ? 0 : (hovered ? 1.0 : brightness * 0.4)}
                        roughness={isGhost ? 0.8 : 0.2}
                        metalness={isGhost ? 0.1 : 0.8}
                        transparent
                        opacity={isGhost ? 0.1 : Math.max(0.4, opacity)}
                    />
                </mesh>

                {/* Volatility Halo */}
                {!isGhost && showHalo && <VolatilityRing volatility={point.volatility} size={size} color={color} />}

                {/* Label */}
                {!isGhost && (hovered || size > 0.6) && (
                    <Billboard
                        position={[0, size + 0.5, 0]}
                        follow={true}
                    >
                        <Text
                            fontSize={hovered ? 0.5 : 0.3}
                            color="white"
                            outlineWidth={0.02}
                            outlineColor="black"
                            anchorY="bottom"
                        >
                            {point.symbol}
                        </Text>
                    </Billboard>
                )}

                {/* Tooltip */}
                {hovered && !isGhost && (
                    <Html distanceFactor={15} zIndexRange={[100, 0]}>
                        <div className="p-3 bg-black/90 rounded-lg backdrop-blur-md border border-white/20 text-white min-w-[180px] pointer-events-none transform -translate-y-12">
                            <div className="font-bold text-lg">{point.name}</div>
                            <div className="text-xs font-mono text-white/60 mb-2">{point.symbol}</div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                <span className="text-white/50">Price:</span>
                                <span className="text-right font-mono">${formatPrice(point.price)}</span>

                                <span className="text-white/50">24h:</span>
                                <span className="text-right font-mono">
                                    {formatChange(point.change24h)}
                                </span>

                                <span className="text-white/50">MCap:</span>
                                <span className="text-right font-mono">${(point.marketCap / 1e9).toFixed(1)}B</span>

                                <span className="text-white/50">Volume:</span>
                                <span className="text-right font-mono">${(point.volume24h / 1e6).toFixed(1)}M</span>

                                <span className="text-white/50">Volat:</span>
                                <span className="text-right font-mono">{(point.volatility * 100).toFixed(1)}%</span>
                            </div>
                        </div>
                    </Html>
                )}
            </group>
        </group>
    );
}

function AxisLines({ axes }: { axes: { x: string, y: string, z: string } }) {
    return (
        <group>
            {/* X Axis - Market Cap */}
            <mesh position={[0, -5, -5]}>
                <boxGeometry args={[30, 0.05, 0.05]} />
                <meshBasicMaterial color="#ffffff" opacity={0.2} transparent />
            </mesh>
            <Text position={[16, -5, -5]} fontSize={0.6} color="white" fillOpacity={0.5}>{axes.x.toUpperCase()} →</Text>

            {/* Y Axis - 24h Change */}
            <mesh position={[-15, 0, -5]}>
                <boxGeometry args={[0.05, 20, 0.05]} />
                <meshBasicMaterial color="#ffffff" opacity={0.2} transparent />
            </mesh>
            <Text position={[-15, 11, -5]} fontSize={0.6} color="white" fillOpacity={0.5}>{axes.y.toUpperCase()} ↑</Text>

            {/* Z Axis - Volume */}
            <mesh position={[-15, -5, 0]}>
                <boxGeometry args={[0.05, 0.05, 30]} />
                <meshBasicMaterial color="#ffffff" opacity={0.2} transparent />
            </mesh>
            <Text position={[-15, -5, 16]} fontSize={0.6} color="white" fillOpacity={0.5}>{axes.z.toUpperCase()} ↙</Text>
        </group>
    );
}

// Helper to simulate price impact based on scenario
function getScenarioImpact(point: any, scenario: string) {
    if (scenario === "normal") return { color: null, impact: 0 };

    let impact = 0; // 0 = no change, -1 = -100%, +1 = +100%

    if (scenario === "btc_crash") {
        // High correlation with BTC or High Volatility suffers more
        const volFactor = point.volatility || 0.5;
        impact = -0.2 - (volFactor * 0.3); // -20% base, up to -50% for high vol
        if (point.symbol === "USDT" || point.symbol === "USDC") impact = 0;
    } else if (scenario === "eth_surge") {
        // ETH beta
        const volFactor = point.volatility || 0.5;
        impact = 0.15 + (volFactor * 0.2); // +15% base
        if (point.symbol === "USDT" || point.symbol === "USDC") impact = 0;
    } else if (scenario === "liquidations") {
        // Exponential decay for high volatility
        const volFactor = point.volatility || 0;
        if (volFactor > 0.7) impact = -0.6; // Nuke high vol
        else impact = -0.1;
    }

    // Color interpolation: Red (-50%) <-> White (0%) <-> Green (+50%)
    // Simple Approximation
    const color = impact < -0.05 ? "#ff3333" : impact > 0.05 ? "#33ff33" : null;
    return { color, impact };
}

interface CryptoScatter3DProps {
    data: ScatterDataPoint[];
    timeOffset?: number;
    showTrails?: boolean;
    showGhost?: boolean;
    showHalos?: boolean;
    axes: { x: string, y: string, z: string };
    colorMode: "category" | "volatility";
    scenario: "normal" | "btc_crash" | "eth_surge" | "liquidations";
}

export default function CryptoScatter3D({
    data,
    timeOffset = 0,
    showTrails = false,
    showGhost = false,
    showHalos = true,
    axes,
    colorMode,
    scenario
}: CryptoScatter3DProps) {
    const router = useRouter();

    // D3 Scales for positioning & sizing
    const { xScale, yScale, zScale, radiusScale, opacityScale } = useMemo(() => {
        // Use getMetricValue to find min/max dynamically
        const xMin = d3.min(data, d => getMetricValue(d, axes.x)) || 0.1;
        const xMax = d3.max(data, d => getMetricValue(d, axes.x)) || 1;

        const yMin = d3.min(data, d => getMetricValue(d, axes.y)) || -20;
        const yMax = d3.max(data, d => getMetricValue(d, axes.y)) || 20;

        const zMin = d3.min(data, d => getMetricValue(d, axes.z)) || 0.1;
        const zMax = d3.max(data, d => getMetricValue(d, axes.z)) || 1;

        // Visual Scales (Size always driven by Mcap for consistency usually, but could be dynamic too. Let's keep size = Mcap for now)
        const mcapMin = d3.min(data, d => d.marketCap) || 1000;
        const mcapMax = d3.max(data, d => d.marketCap) || 100000;

        // Helper to check if log scale appropriate
        const useLogX = axes.x === 'mcap' || axes.x === 'volume' || axes.x === 'fdv' || axes.x === 'price';
        const useLogZ = axes.z === 'mcap' || axes.z === 'volume' || axes.z === 'fdv' || axes.z === 'price';

        return {
            xScale: useLogX ? d3.scaleLog().domain([Math.max(0.1, xMin), xMax]).range([-14, 14]) : d3.scaleLinear().domain([xMin, xMax]).range([-14, 14]),
            yScale: d3.scaleLinear().domain([yMin, yMax]).range([-8, 8]),
            zScale: useLogZ ? d3.scaleLog().domain([Math.max(0.1, zMin), zMax]).range([-14, 14]) : d3.scaleLinear().domain([zMin, zMax]).range([-14, 14]),
            radiusScale: d3.scaleLog().domain([Math.max(0.1, mcapMin), mcapMax]).range([0.2, 1.2]).clamp(true),
            opacityScale: d3.scaleLog().domain([d3.min(data, d => d.volume24h) || 1, d3.max(data, d => d.volume24h) || 100]).range([0.3, 1.0]).clamp(true),
        };
    }, [data, axes]);

    const getColor = (point: ScatterDataPoint) => {
        if (colorMode === 'volatility') {
            // Red = High Vol, Green = Low Vol? Or Heatmap?
            // Let's go Blue (Low) -> Red (High)
            return d3.interpolateTurbo(point.volatility * 5); // Scale up small vol number
        }
        return point.zoneColor;
    };

    return (
        <div className="w-full h-[600px] rounded-3xl overflow-hidden bg-black/50 border border-white/10 relative shadow-2xl">
            <Canvas camera={{ position: [0, 0, 35], fov: 50 }} dpr={[1, 2]}>
                {/* Lighting */}
                <color attach="background" args={["#030308"]} />
                <ambientLight intensity={0.2} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
                <pointLight position={[-10, -5, -10]} intensity={1} color="#4c1d95" /> {/* Purple rim light */}

                <Stars radius={100} depth={50} count={3000} factor={4} saturation={0.5} fade speed={0.5} />

                <group rotation={[0, Math.PI / 8, 0]}>
                    <AxisLines axes={axes} />

                    {data.map((point) => {
                        // Current Position
                        const x = xScale(getMetricValue(point, axes.x)) || 0;
                        const y = yScale(getMetricValue(point, axes.y)) || 0;
                        const z = zScale(getMetricValue(point, axes.z)) || 0;

                        // Time Travel Logic:
                        let activeY = y;
                        if (timeOffset > 0 && axes.y === 'change' && point.history && point.history.length > 0) {
                            // Find history point closest to t - timeOffset
                            // Simplified logic
                            const idx = Math.min(point.history.length - 1, timeOffset);
                            const h = point.history[idx];
                            const priceRatio = h.price / point.price;
                            activeY = y + (1 - priceRatio) * 20;
                        }

                        // Ghost Position (7d ago)
                        // Simplification: Ghost is static for dynamic axes, or we'd need to calculate historical values for all axes.
                        const ghostY = y;

                        // Scenario Simulation
                        const { color: scenarioColor, impact } = getScenarioImpact(point, scenario);
                        const effectiveColor = scenarioColor || (colorMode === "volatility" ? getColor(point) : point.zoneColor); // Re-using getColor for volatility mode

                        // If scenario is active, jitter position to show instability? 
                        // For now just color, maybe animate position later.

                        return (
                            <group key={point.id}>
                                {/* Live Point */}
                                <ScatterPoint
                                    point={point}
                                    position={[x, activeY, z]}
                                    radiusScale={radiusScale}
                                    opacityScale={opacityScale}
                                    color={effectiveColor}
                                    onClick={() => { }}
                                    showHalo={showHalos && point.volatility > 0.7}
                                    showTrail={showTrails}
                                />

                                {/* Ghost Point */}
                                {showGhost && (
                                    <ScatterPoint
                                        point={point}
                                        position={[x, ghostY, z]} // Simplification: Ghost is static
                                        radiusScale={radiusScale}
                                        opacityScale={opacityScale}
                                        onClick={() => { }}
                                        showHalo={false} showTrail={false} isGhost={true}
                                        color="#ffffff"
                                    />
                                )}
                            </group>
                        );
                    })}
                </group>

                <OrbitControls
                    enablePan={true}
                    minDistance={5}
                    maxDistance={60}
                    enableDamping
                    dampingFactor={0.05}
                />
            </Canvas>

            {/* Note: HUD is managed by parent GalaxyControls */}
        </div>
    );
}
