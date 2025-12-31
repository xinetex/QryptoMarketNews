"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Stars, Billboard } from "@react-three/drei";
import * as THREE from "three";

interface CoinPlanetProps {
    position: [number, number, number];
    size: number;
    color: string;
    name: string;
    change: number;
}

function CoinPlanet({ position, size, color, name, change }: CoinPlanetProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const glowColor = change >= 0 ? "#10b981" : "#ef4444";

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.005;
            // Gentle bob animation
            meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
        }
    });

    return (
        <group position={position}>
            {/* Planet core */}
            <mesh ref={meshRef}>
                <sphereGeometry args={[size, 32, 32]} />
                <meshStandardMaterial
                    color={color}
                    emissive={glowColor}
                    emissiveIntensity={0.3}
                    roughness={0.4}
                    metalness={0.6}
                />
            </mesh>

            {/* Glow ring for change indicator */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[size * 1.3, 0.02, 8, 32]} />
                <meshBasicMaterial color={glowColor} transparent opacity={0.6} />
            </mesh>

            {/* Name label */}
            <Billboard
                position={[0, -size - 0.3, 0]}
                follow={true}
                lockX={false}
                lockY={false}
                lockZ={false}
            >
                <Text
                    fontSize={0.15}
                    color="white"
                    anchorX="center"
                    anchorY="top"
                >
                    {name}
                </Text>
            </Billboard>
        </group>
    );
}

interface ZoneSphereProps {
    position: [number, number, number];
    color: string;
    name: string;
    coins: { name: string; marketCap: number; change: number }[];
}

function ZoneSphere({ position, color, name, coins }: ZoneSphereProps) {
    const groupRef = useRef<THREE.Group>(null);

    useFrame(() => {
        if (groupRef.current) {
            groupRef.current.rotation.y += 0.002;
        }
    });

    // Position coins in orbit around the zone
    const coinPositions = useMemo(() => {
        return coins.slice(0, 5).map((coin, i) => {
            const angle = (i / 5) * Math.PI * 2;
            const radius = 2;
            return {
                ...coin,
                x: Math.cos(angle) * radius,
                z: Math.sin(angle) * radius,
                size: Math.min(0.5, Math.max(0.15, coin.marketCap / 100000000000)), // Scale by market cap
            };
        });
    }, [coins]);

    return (
        <group ref={groupRef} position={position}>
            {/* Zone core */}
            <mesh>
                <sphereGeometry args={[0.8, 32, 32]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={0.5}
                    transparent
                    opacity={0.8}
                />
            </mesh>

            {/* Zone label */}
            <Billboard
                position={[0, 1.5, 0]}
                follow={true}
            >
                <Text
                    fontSize={0.3}
                    color="white"
                    anchorX="center"
                    fontWeight="bold"
                    outlineWidth={0.02}
                    outlineColor="black"
                >
                    {name}
                </Text>
            </Billboard>

            {/* Orbiting coins */}
            {coinPositions.map((coin, i) => (
                <CoinPlanet
                    key={i}
                    position={[coin.x, 0, coin.z]}
                    size={coin.size}
                    color={color}
                    name={coin.name}
                    change={coin.change}
                />
            ))}
        </group>
    );
}

interface CryptoGalaxyProps {
    zones: {
        id: string;
        name: string;
        color: string;
        coins: { name: string; marketCap: number; change: number }[];
    }[];
}

export default function CryptoGalaxy({ zones }: CryptoGalaxyProps) {
    // Position zones in a galaxy spiral
    const zonePositions = useMemo(() => {
        return zones.map((zone, i) => {
            const spiralAngle = (i / zones.length) * Math.PI * 2;
            const spiralRadius = 6 + i * 0.5;
            return {
                ...zone,
                x: Math.cos(spiralAngle) * spiralRadius,
                z: Math.sin(spiralAngle) * spiralRadius,
                y: (Math.random() - 0.5) * 2, // Slight vertical variation
            };
        });
    }, [zones]);

    return (
        <div className="w-full h-[600px] rounded-3xl overflow-hidden bg-black/50">
            <Canvas camera={{ position: [0, 10, 20], fov: 60 }}>
                {/* Lighting */}
                <ambientLight intensity={0.3} />
                <pointLight position={[0, 0, 0]} intensity={2} color="#00f3ff" />
                <pointLight position={[10, 10, 10]} intensity={1} color="#bc13fe" />

                {/* Background stars */}
                <Stars
                    radius={100}
                    depth={50}
                    count={5000}
                    factor={4}
                    saturation={0.5}
                    fade
                    speed={1}
                />

                {/* Central crypto "sun" */}
                <mesh position={[0, 0, 0]}>
                    <sphereGeometry args={[1.5, 32, 32]} />
                    <meshBasicMaterial color="#fcd34d" />
                </mesh>
                <mesh position={[0, 0, 0]}>
                    <sphereGeometry args={[2, 32, 32]} />
                    <meshBasicMaterial color="#fcd34d" transparent opacity={0.2} />
                </mesh>

                {/* Zone systems */}
                {zonePositions.map((zone) => (
                    <ZoneSphere
                        key={zone.id}
                        position={[zone.x, zone.y, zone.z]}
                        color={zone.color}
                        name={zone.name}
                        coins={zone.coins}
                    />
                ))}

                {/* Camera controls */}
                <OrbitControls
                    enableZoom={true}
                    enablePan={false}
                    autoRotate={false}
                    minDistance={10}
                    maxDistance={50}
                />
            </Canvas>

            {/* Legend overlay */}
            <div className="absolute bottom-4 left-4 p-4 bg-black/60 rounded-xl backdrop-blur-sm">
                <div className="text-white/80 text-sm font-bold mb-2">CRYPTO GALAXY</div>
                <div className="text-white/50 text-xs">
                    🟢 Green glow = 24h gain<br />
                    🔴 Red glow = 24h loss<br />
                    Planet size = Market Cap
                </div>
            </div>
        </div>
    );
}
