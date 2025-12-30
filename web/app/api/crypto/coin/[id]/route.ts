import { NextRequest, NextResponse } from "next/server";

const COINGECKO_API_BASE = "https://api.coingecko.com/api/v3";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const coinId = params.id;

        if (!coinId) {
            return NextResponse.json(
                { error: "Coin ID is required" },
                { status: 400 }
            );
        }

        // Fetch coin from CoinGecko markets endpoint with sparkline
        const response = await fetch(
            `${COINGECKO_API_BASE}/coins/markets?vs_currency=usd&ids=${coinId}&sparkline=true`,
            {
                next: { revalidate: 60 },
                headers: {
                    'Accept': 'application/json',
                }
            }
        );

        if (!response.ok) {
            throw new Error(`CoinGecko API error: ${response.status}`);
        }

        const data = await response.json();

        if (!data || data.length === 0) {
            return NextResponse.json(
                { error: "Coin not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ data: data[0] });
    } catch (error) {
        console.error("Failed to fetch coin:", error);
        return NextResponse.json(
            { error: "Failed to fetch coin data" },
            { status: 500 }
        );
    }
}
