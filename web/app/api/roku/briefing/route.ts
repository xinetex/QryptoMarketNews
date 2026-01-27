
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    // In a real app, this would fetch from RSS feeds (Bankless, Daily Gwei, etc)
    // For now, we mock the daily briefing data.

    const items = [
        {
            id: "ep-1",
            title: "Market Rally: ETH Breaks $3k Resistance",
            podcast: "Bankless",
            description: "David and Ryan discuss the recent Ethereum price action, the impact of the ETF approval, and why L2s are booming.",
            image: "https://images.unsplash.com/photo-1621504450162-e152914d31bf?q=80&w=800&auto=format&fit=crop",
            url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // Public domain placeholder
            duration: "45 min",
            color: "#000000"
        },
        {
            id: "ep-2",
            title: "Solana Firedancer Upgrade Explained",
            podcast: "Lightspeed",
            description: "What does the new validator client mean for network throughput? We dive deep into the technicals.",
            image: "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?q=80&w=800&auto=format&fit=crop",
            url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
            duration: "32 min",
            color: "#9945FF"
        },
        {
            id: "ep-3",
            title: "The State of Airdrops 2026",
            podcast: "The Daily Gwei",
            description: "Anthony Sassano on which protocols are likely to drop tokens next and how to position yourself.",
            image: "https://images.unsplash.com/photo-1620321023374-d1a68fddadb3?q=80&w=800&auto=format&fit=crop",
            url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
            duration: "28 min",
            color: "#ff0000"
        },
        {
            id: "ep-4",
            title: "Regulatory Storm Clouds?",
            podcast: "Unchained",
            description: "Laura Shin interviews SEC Commissioner Peirce on the upcoming crypto framework bill.",
            image: "https://images.unsplash.com/photo-1526304640152-d4619684e484?q=80&w=800&auto=format&fit=crop",
            url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
            duration: "55 min",
            color: "#0055ff"
        },
        {
            id: "ep-5",
            title: "NFTs Are Back (Kind of)",
            podcast: "Proof",
            description: "Kevin Rose talks about the resurgence of PFP collections and the new utility metadata standard.",
            image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=800&auto=format&fit=crop",
            url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
            duration: "41 min",
            color: "#ff00ff"
        }
    ];

    return NextResponse.json({
        date: new Date().toISOString(),
        summary: "Markets are trending upward led by ETH beta. Regulation remains a key narrative to watch. New airdrop farming strategies are emerging on Solana.",
        items
    });
}
