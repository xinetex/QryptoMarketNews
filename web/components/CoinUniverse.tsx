"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Stars, Float, Html } from "@react-three/drei";
import * as THREE from "three";
import { formatPrice, formatChange, formatMarketCap } from "@/lib/coingecko";

// --- Types ---

interface CoinUniverseProps {
    coin: {
        id: string;
        symbol: string;
        name: string;
        price: number;
        change24h: number;
        marketCap: number;
        volume24h: number;
        image: string;
    };
    relatedCoins: {
        id: string;
        symbol: string;
        change: number;
        marketCap: number;
    }[];
}

// --- 3D Components ---

function CentralStar({ coin }: { coin: CoinUniverseProps['coin'] }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const glowColor = coin.change24h >= 0 ? "#10b981" : "#ef4444"; // Green or Red glow
    const textureLoader = new THREE.TextureLoader();
    const texture = useMemo(() => textureLoader.load(coin.image), [coin.image]);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.002;
            // Pulsing effect based on price change intensity
            const scale = 1 + Math.sin(state.clock.elapsedTime) * 0.05;
            meshRef.current.scale.set(scale, scale, scale);
        }
    });

    return (
        <group>
            {/* Core (The Coin Image mapped to sphere) */}
            <mesh ref={meshRef}>
                <sphereGeometry args={[2.5, 64, 64]} />
                <meshStandardMaterial
                    map={texture}
                    emissive={glowColor}
                    emissiveIntensity={0.2}
                    roughness={0.2}
                    metalness={0.8}
                />
            </mesh>

            {/* Inner Glow Field */}
            <mesh>
                <sphereGeometry args={[2.8, 32, 32]} />
                <meshBasicMaterial
                    color={glowColor}
                    transparent
                    opacity={0.15}
                    side={THREE.BackSide}
                />
            </mesh>

            {/* Label */}
            <Html position={[0, -3.5, 0]} center>
                <div className="text-center pointer-events-none">
                    <div className="text-4xl font-bold text-white drop-shadow-glow">
                        {coin.name}
                    </div>
                    <div className={`text-2xl font-mono ${coin.change24h >= 0 ? 'text-neon-green' : 'text-neon-red'}`}>
                        ${formatPrice(coin.price)}
                    </div>
                    <div className="text-sm text-white/60">
                        {formatChange(coin.change24h)} (24h)
                    </div>
                </div>
            </Html>
        </group>
    );
}

function MetricPlanet({
    label,
    value,
    color,
    orbitRadius,
    orbitSpeed,
    size = 0.8
}: {
    label: string,
    value: string,
    color: string,
    orbitRadius: number,
    orbitSpeed: number,
    size?: number
}) {
    const ref = useRef<THREE.Group>(null);

    useFrame(({ clock }) => {
        if (ref.current) {
            const t = clock.getElapsedTime() * orbitSpeed;
            ref.current.position.x = Math.cos(t) * orbitRadius;
            ref.current.position.z = Math.sin(t) * orbitRadius;
            ref.current.rotation.y += 0.01;
        }
    });

    return (
        <group ref={ref}>
            <mesh>
                <sphereGeometry args={[size, 32, 32]} />
                <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
            </mesh>
            {/* Orbit Trail Ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[orbitRadius - 0.05, orbitRadius + 0.05, 64]} />
                <meshBasicMaterial color={color} transparent opacity={0.1} side={THREE.DoubleSide} />
            </mesh>

            <Html position={[0, size + 0.5, 0]} center>
                <div className="px-3 py-1 bg-black/60 rounded-lg backdrop-blur-sm border border-white/10 text-center w-max">
                    <div className="text-xs text-white/50 uppercase tracking-widest">{label}</div>
                    <div className="text-white font-mono font-bold">{value}</div>
                </div>
            </Html>
        </group>
    );
}

function AsteroidBelt({ coins, radius, count = 20 }: { coins: CoinUniverseProps['relatedCoins'], radius: number, count?: number }) {
    const asteroids = useMemo(() => {
        return new Array(count).fill(0).map((_, i) => {
            const angle = (i / count) * Math.PI * 2;
            const coin = coins[i % coins.length];
            return {
                position: [
                    Math.cos(angle) * radius + (Math.random() - 0.5) * 2,
                    (Math.random() - 0.5) * 1,
                    Math.sin(angle) * radius + (Math.random() - 0.5) * 2
                ] as [number, number, number],
                size: Math.random() * 0.2 + 0.1,
                coin
            };
        });
    }, [coins, radius, count]);

    const groupRef = useRef<THREE.Group>(null);

    useFrame(() => {
        if (groupRef.current) {
            groupRef.current.rotation.y += 0.0005;
        }
    });

    return (
        <group ref={groupRef}>
            {asteroids.map((asteroid, i) => (
                <Float key={i} speed={2} rotationIntensity={1} floatIntensity={1}>
                    <mesh position={asteroid.position}>
                        <dodecahedronGeometry args={[asteroid.size, 0]} />
                        <meshStandardMaterial
                            color={asteroid.coin.change >= 0 ? "#34d399" : "#f87171"}
                            roughness={0.8}
                        />
                        {/* Only show label for larger asteroids occasionally */}
                        {i % 3 === 0 && (
                            <Html position={[0, 0.5, 0]} distanceFactor={15}>
                                <div className="text-xs text-white/40 font-mono">{asteroid.coin.symbol}</div>
                            </Html>
                        )}
                    </mesh>
                </Float>
            ))}
        </group>
    );
}

// --- Main Scene ---

export default function CoinUniverse({ coin, relatedCoins }: CoinUniverseProps) {
    return (
        <div className="w-full h-screen bg-black relative">
            <Canvas camera={{ position: [0, 8, 16], fov: 45 }}>
                <color attach="background" args={["#050510"]} />

                {/* Environment */}
                <ambientLight intensity={0.2} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
                <pointLight position={[-10, -5, -10]} intensity={0.5} color="#4c1d95" />
                <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />

                {/* Central System */}
                <group>
                    <CentralStar coin={coin} />

                    {/* Data Planets */}
                    <MetricPlanet
                        label="Market Cap"
                        value={formatMarketCap(coin.marketCap)}
                        color="#3b82f6"
                        orbitRadius={6}
                        orbitSpeed={0.2}
                        size={1}
                    />

                    <MetricPlanet
                        label="24h Volume"
                        value={formatMarketCap(coin.volume24h)}
                        color="#a855f7"
                        orbitRadius={9}
                        orbitSpeed={0.15}
                        size={0.7}
                    />

                    {/* Related Coins Belt */}
                    <AsteroidBelt coins={relatedCoins} radius={14} count={30} />
                </group>

                {/* Controls */}
                <OrbitControls
                    enablePan={false}
                    minDistance={8}
                    maxDistance={30}
                    autoRotate={true}
                    autoRotateSpeed={0.5}
                />
            </Canvas>

            {/* Overlay UI */}
            <div className="absolute top-0 left-0 p-8 pointer-events-none">
                <div className="flex items-center gap-4">
                    <button className="pointer-events-auto px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 backdrop-blur-md text-sm text-white transition">
                        ← Back to Galaxy
                    </button>
                    <div className="h-px w-10 bg-white/20"></div>
                    <div className="text-white/50 font-mono text-sm">SYSTEM VIEW: {coin.symbol}</div>
                </div>

                {/* Ad Space */}
                <div className="absolute top-0 right-0 p-8 pointer-events-auto">
                    <div className="relative group cursor-pointer transform hover:scale-105 transition-all duration-300">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-pulse-slow"></div>
                        <img
                            src="/ads/guardians_ad.png"
                            alt="Sponsored: Guardians of the Puff"
                            className="relative w-80 h-auto rounded-lg shadow-2xl border border-white/10"
                        />
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 rounded text-[10px] text-white/70 uppercase tracking-widest border border-white/10">
                            Sponsored
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
