
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    // Mock Portfolio Data for "Prophet Points" Gamification
    // In production, this would fetch from the user's session or DB

    return NextResponse.json({
        totalBalance: "$12,450.00",
        originalBalance: 10000,
        pnlFormatted: "+$2,450.00",
        pnlPercent: "24.5%",
        isPositive: true,

        holdings: [
            { symbol: "BTC", name: "Bitcoin", amount: "0.45", value: "$42,500.00", pnl: "+12%", isPositive: true },
            { symbol: "ETH", name: "Ethereum", amount: "4.2", value: "$12,400.00", pnl: "+5%", isPositive: true },
            { symbol: "SOL", name: "Solana", amount: "150", value: "$21,000.00", pnl: "+45%", isPositive: true },
            { symbol: "DOGE", name: "Dogecoin", amount: "50,000", value: "$4,200.00", pnl: "-2%", isPositive: false },
            { symbol: "RWA", name: "Ondo Finance", amount: "10,000", value: "$2,500.00", pnl: "+8%", isPositive: true }
        ],

        leaderboard: [
            { rank: 1, name: "@ElonMusk", score: "$42B" },
            { rank: 2, name: "@Satoshi", score: "$1B" },
            { rank: 3, name: "@Vitalik", score: "$500M" },
            { rank: 4, name: "@Cobie", score: "$20M" },
            { rank: 5, name: "@You", score: "$12.4K" } // The User
        ]
    });
}
