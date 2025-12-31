"use client";

import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Html, Stars } from "@react-three/drei";
import * as THREE from "three";
import * as d3 from "d3";
import { formatPrice, formatPercent } from "@/lib/coingecko";
import { useRouter } from "next/navigation";

interface ScatterDataPoint {
    id: string;
    symbol: string;
    name: string;
    price: number;
    change24h: number;
    marketCap: number;
    volume24h: number; // Simulated if missing
    zoneColor: string;
}

interface CryptoScatter3DProps {
    data: ScatterDataPoint[];
}

function ScatterPoint({ point, position, onClick }: { point: ScatterDataPoint, position: [number, number, number], onClick: (id: string) => void }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    useFrame((state) => {
        if (meshRef.current) {
            // Slight bobbing
            meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.2;

            // Rotate on hover
            if (hovered) {
                meshRef.current.rotation.y += 0.05;
                meshRef.current.scale.setScalar(1.5);
            } else {
                meshRef.current.rotation.y += 0.01;
                meshRef.current.scale.setScalar(1);
            }
        }
    });

    return (
        <group position={position}>
            <mesh
                ref={meshRef}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
                onClick={() => onClick(point.id)}
            >
                <sphereGeometry args={[0.5, 32, 32]} />
                <meshStandardMaterial
                    color={point.zoneColor}
                    emissive={point.zoneColor}
                    emissiveIntensity={hovered ? 0.8 : 0.2}
                    roughness={0.2}
                    metalness={0.8}
                />
            </mesh>

            {hovered && (
                <Html distanceFactor={15}>
                    <div className="p-3 bg-black/80 rounded-lg backdrop-blur-md border border-white/20 text-white min-w-[150px] pointer-events-none transform -translate-y-12">
                        <div className="font-bold text-lg">{point.name}</div>
                        <div className="text-xs font-mono text-white/60 mb-2">{point.symbol}</div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                            <span className="text-white/50">Price:</span>
                            <span className="text-right font-mono text-neon-blue">${formatPrice(point.price)}</span>

                            <span className="text-white/50">24h:</span>
                            <span className={`text-right font-mono ${point.change24h >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                                {formatPercent(point.change24h)}
                            </span>

                            <span className="text-white/50">MCap:</span>
                            <span className="text-right font-mono text-purple-400">${(point.marketCap / 1e9).toFixed(1)}B</span>
                        </div>
                        <div className="mt-2 text-[10px] text-center text-white/30 uppercase tracking-widest">
                            Click for Universe View
                        </div>
                    </div>
                </Html>
            )}
        </group>
    );
}

function AxisLines() {
    return (
        <group>
            {/* X Axis - Market Cap */}
            <mesh position={[0, -5, -5]}>
                <boxGeometry args={[30, 0.1, 0.1]} />
                <meshBasicMaterial color="#ffffff" opacity={0.3} transparent />
            </mesh>
            <Text position={[16, -5, -5]} fontSize={0.8} color="white">Market Cap →</Text>

            {/* Y Axis - 24h Change */}
            <mesh position={[-15, 0, -5]}>
                <boxGeometry args={[0.1, 20, 0.1]} />
                <meshBasicMaterial color="#ffffff" opacity={0.3} transparent />
            </mesh>
            <Text position={[-15, 11, -5]} fontSize={0.8} color="white">24h Change ↑</Text>

            {/* Z Axis - Volume (Simulated depth) */}
            <mesh position={[-15, -5, 0]}>
                <boxGeometry args={[0.1, 0.1, 30]} />
                <meshBasicMaterial color="#ffffff" opacity={0.3} transparent />
            </mesh>
            <Text position={[-15, -5, 16]} fontSize={0.8} color="white">Volume ↙</Text>
        </group>
    );
}

export default function CryptoScatter3D({ data }: CryptoScatter3DProps) {
    const router = useRouter();

    // D3 Scales for positioning
    const { xScale, yScale, zScale } = useMemo(() => {
        const xMin = d3.min(data, d => d.marketCap) || 0;
        const xMax = d3.max(data, d => d.marketCap) || 1;

        const yMin = -20; // Clamp min change
        const yMax = 20;  // Clamp max change

        const zMin = d3.min(data, d => d.volume24h || d.marketCap * 0.05) || 0;
        const zMax = d3.max(data, d => d.volume24h || d.marketCap * 0.2) || 1;

        return {
            xScale: d3.scaleLog().domain([xMin, xMax]).range([-14, 14]),
            yScale: d3.scaleLinear().domain([yMin, yMax]).range([-8, 8]),
            zScale: d3.scaleLog().domain([zMin, zMax]).range([-14, 14]),
        };
    }, [data]);

    return (
        <div className="w-full h-[600px] rounded-3xl overflow-hidden bg-black/50 border border-white/10 relative">
            <Canvas camera={{ position: [0, 0, 35], fov: 50 }}>
                <color attach="background" args={["#050510"]} />

                {/* Lights */}
                <ambientLight intensity={0.4} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <pointLight position={[-10, -10, -10]} color="blue" intensity={1} />

                <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade />

                <group rotation={[0, Math.PI / 8, 0]}>
                    <AxisLines />

                    {data.map((point) => {
                        // Safe access with fallbacks
                        const x = xScale(point.marketCap) || 0;
                        const y = yScale(Math.max(-20, Math.min(20, point.change24h))) || 0;
                        const z = zScale(point.volume24h || point.marketCap * 0.1) || 0;

                        return (
                            <ScatterPoint
                                key={point.id}
                                point={point}
                                position={[x, y, z]}
                                onClick={(id) => router.push(`/coin/${id}/universe`)}
                            />
                        );
                    })}
                </group>

                <OrbitControls
                    enablePan={true}
                    minDistance={10}
                    maxDistance={60}
                />
            </Canvas>

            {/* HUD Overlay */}
            <div className="absolute top-4 right-4 pointer-events-none">
                <div className="bg-black/40 backdrop-blur-md border border-white/10 p-3 rounded-lg text-xs text-white/50">
                    <div>Drag to rotate</div>
                    <div>Scroll to zoom</div>
                    <div>Click coin for Universe View</div>
                </div>
            </div>
        </div>
    );
}
