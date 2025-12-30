"use client";

import Image from "next/image";
import { formatTVL } from "@/lib/defillama";

interface TopProtocol {
    name: string;
    tvl: number;
    logo: string;
    chain: string;
}

interface TopProtocolsListProps {
    protocols: TopProtocol[];
    loading?: boolean;
}

export default function TopProtocolsList({ protocols, loading }: TopProtocolsListProps) {
    if (loading) {
        return (
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 bg-white/5 rounded animate-pulse" />
                ))}
            </div>
        );
    }

    if (protocols.length === 0) {
        return (
            <div className="text-white/50 text-center py-4">
                No protocol data available
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {protocols.map((protocol, index) => (
                <div
                    key={protocol.name}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                    {/* Rank */}
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/60">
                        {index + 1}
                    </div>

                    {/* Logo */}
                    <div className="w-8 h-8 relative rounded-full overflow-hidden bg-white/10">
                        {protocol.logo ? (
                            <Image
                                src={protocol.logo}
                                alt={protocol.name}
                                fill
                                className="object-cover"
                                sizes="32px"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white/50">
                                {protocol.name.charAt(0)}
                            </div>
                        )}
                    </div>

                    {/* Name & Chain */}
                    <div className="flex-1 min-w-0">
                        <div className="text-white font-medium truncate">{protocol.name}</div>
                        <div className="text-white/50 text-xs">{protocol.chain}</div>
                    </div>

                    {/* TVL */}
                    <div className="text-white font-mono text-sm">
                        {formatTVL(protocol.tvl)}
                    </div>
                </div>
            ))}
        </div>
    );
}
