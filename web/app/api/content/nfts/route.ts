import { NextResponse } from 'next/server';

export const revalidate = 3600; // Cache for 1 hour

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || 'trending';

    // Mock Data with VERIFIED High-Quality Images (Unsplash)
    // In a real app, this would fetch from OpenSea/Reservoir API.

    // Images chosen for "NFT aesthetic"
    const collections = {
        trending: [
            {
                name: "Bored Ape Yacht Club",
                slug: "boredapeyachtclub",
                image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80",
                floor: 12.5,
                floorUSD: 38500,
                volume24h: 1234,
                owners: 5432,
                listed: 1.2,
                reason: "🔥 Volume Spike",
                items: [
                    { title: "BAYC #8817", image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=600&q=80", price: 68 },
                    { title: "BAYC #3749", image: "https://images.unsplash.com/photo-1535378437341-a62502c37582?w=600&q=80", price: 45 },
                    { title: "BAYC #1234", image: "https://images.unsplash.com/photo-1528026112993-a55e34747209?w=600&q=80", price: 43 },
                    { title: "BAYC #5822", image: "https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?w=600&q=80", price: 52 }
                ]
            },
            {
                name: "Pudgy Penguins",
                slug: "pudgypenguins",
                image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
                floor: 18.2,
                floorUSD: 56000,
                volume24h: 890,
                owners: 4500,
                listed: 0.5,
                reason: "🐧 All-time High",
                items: [
                    { title: "Pudgy #1", image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80", price: 20 },
                    { title: "Pudgy #2", image: "https://images.unsplash.com/photo-1549480017-d76466a4b7e8?w=600&q=80", price: 19 },
                    { title: "Pudgy #3", image: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600&q=80", price: 18 }
                ]
            },
            {
                name: "Azuki",
                slug: "azuki",
                image: "https://images.unsplash.com/photo-1550948329-84724a735c02?w=800&q=80", // Cyberpunk aesthetic
                floor: 5.2,
                floorUSD: 16000,
                volume24h: 400,
                owners: 4800,
                listed: 2.1,
                reason: "⛩️ Anime Meta",
                items: [
                    { title: "Azuki #1", image: "https://images.unsplash.com/photo-1550948329-84724a735c02?w=600&q=80", price: 6 },
                    { title: "Azuki #2", image: "https://images.unsplash.com/photo-1614850523060-8da1d56e37ad?w=600&q=80", price: 5.5 }
                ]
            }
        ],
        bluechip: [
            {
                name: "CryptoPunks",
                slug: "cryptopunks",
                image: "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?w=800&q=80",
                floor: 55.0,
                floorUSD: 168000,
                volume24h: 200,
                owners: 3000,
                listed: 4.5,
                reason: "💎 The OG",
                items: [
                    { title: "Punk #1", image: "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?w=600&q=80", price: 60 },
                    { title: "Punk #2", image: "https://images.unsplash.com/photo-1620321023374-d1a686dd9b8b?w=600&q=80", price: 58 }
                ]
            }
        ],
        aesthetic: [
            {
                name: "Fidenza",
                slug: "fidenza",
                image: "https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?w=800&q=80",
                floor: 82.0,
                floorUSD: 250000,
                volume24h: 12,
                owners: 900,
                listed: 1.2,
                reason: "🎨 Generative Masterpiece",
                items: [
                    { title: "Fidenza #123", image: "https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?w=600&q=80", price: 90 },
                    { title: "Fidenza #456", image: "https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=600&q=80", price: 85 }
                ]
            }
        ],
        generative: [
            {
                name: "Chromie Squiggle",
                slug: "chromie-squiggle",
                image: "https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=800&q=80",
                floor: 12.0,
                floorUSD: 36000,
                volume24h: 40,
                owners: 2000,
                listed: 3.0,
                reason: "🌈 Art Blocks 0",
                items: [
                    { title: "Squiggle #1", image: "https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=600&q=80", price: 15 },
                    { title: "Squiggle #2", image: "https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?w=600&q=80", price: 14 }
                ]
            }
        ]
    };

    return NextResponse.json({
        collections: collections[mode as keyof typeof collections] || collections.trending
    });
}
