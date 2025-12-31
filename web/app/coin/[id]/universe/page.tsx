"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAdminSettings } from "@/hooks/useAdminSettings";

// Dynamic import for 3D component (No SSR)
const CoinUniverse = dynamic(() => import("@/components/CoinUniverse"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-screen bg-black flex items-center justify-center">
            <div className="text-center">
                <div className="text-4xl mb-4 animate-spin">🌌</div>
                <div className="text-white/60 font-mono">Entering System...</div>
            </div>
        </div>
    ),
});

export default function CoinUniversePage() {
    const params = useParams();
    const router = useRouter();
    const { zones } = useAdminSettings();
    const id = params?.id as string;

    const [coinData, setCoinData] = useState<any>(null);
    const [relatedCoins, setRelatedCoins] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        async function fetchSystemData() {
            try {
                // 1. Fetch specific coin data
                const coinRes = await fetch(`/api/crypto/coin/${id}`);
                const coin = await coinRes.json();

                // 2. Fetch related coins (from same category/zone if possible)
                // We'll guess the category or default to 'defi'/general
                // For now, let's fetch 'defi' or 'solana' zone to get some neighbors
                const zoneId = zones.find(z => z.name.toLowerCase().includes(coin.name.toLowerCase()))?.id || "defi";
                const neighborsRes = await fetch(`/api/crypto/zone/${zoneId}`);
                const neighborsData = await neighborsRes.json();

                // Transform data for 3D view
                const mainCoin = {
                    id: coin.id,
                    symbol: coin.symbol.toUpperCase(),
                    name: coin.name,
                    price: coin.market_data.current_price.usd,
                    change24h: coin.market_data.price_change_percentage_24h,
                    marketCap: coin.market_data.market_cap.usd,
                    volume24h: coin.market_data.total_volume.usd,
                    image: coin.image.large,
                };

                const related = (neighborsData.data || [])
                    .filter((c: any) => c.id !== coin.id)
                    .slice(0, 10)
                    .map((c: any) => ({
                        id: c.id,
                        symbol: c.symbol.toUpperCase(),
                        change: c.price_change_percentage_24h,
                        marketCap: c.market_cap,
                    }));

                setCoinData(mainCoin);
                setRelatedCoins(related);
            } catch (error) {
                console.error("Failed to fetch universe data:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchSystemData();
    }, [id, zones]);

    if (loading || !coinData) {
        return (
            <div className="w-full h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl mb-4 animate-pulse">🔭</div>
                    <div className="text-white/60 font-mono">Locating {id}...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-screen overflow-hidden">
            {/* Back Button Overlay */}
            <div className="absolute top-8 left-8 z-50">
                <Link
                    href="/galaxy"
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full border border-white/10 transition-colors text-white text-sm font-medium"
                >
                    <ArrowLeft size={16} />
                    Back to Galaxy
                </Link>
            </div>

            <CoinUniverse coin={coinData} relatedCoins={relatedCoins} />
        </div>
    );
}
