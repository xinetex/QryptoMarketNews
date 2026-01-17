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

        // Fetch FULL coin details (includes description, links, detailed market data)
        const response = await fetch(
            `${COINGECKO_API_BASE}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true`,
            {
                next: { revalidate: 300 }, // Cache deeper details for 5 minutes
                headers: {
                    'Accept': 'application/json',
                }
            }
        );

        if (!response.ok) {
            // Fallback to searching if ID not found directly (sometimes happens with variations)
            // But for now, just error out cleanly
            return NextResponse.json(
                { error: `CoinGecko API error: ${response.status}` },
                { status: response.status }
            );
        }

        const raw = await response.json();

        // Transform & Flatten data for Roku
        const data = {
            id: raw.id,
            symbol: raw.symbol,
            name: raw.name,
            image: raw.image?.large || raw.image?.small,
            description: raw.description?.en || "", // Extract English description

            // Market Data (Flattened)
            current_price: raw.market_data?.current_price?.usd,
            market_cap: raw.market_data?.market_cap?.usd,
            total_volume: raw.market_data?.total_volume?.usd,
            fully_diluted_valuation: raw.market_data?.fully_diluted_valuation?.usd,

            high_24h: raw.market_data?.high_24h?.usd,
            low_24h: raw.market_data?.low_24h?.usd,
            ath: raw.market_data?.ath?.usd,
            atl: raw.market_data?.atl?.usd,

            price_change_percentage_24h: raw.market_data?.price_change_percentage_24h,
            circulating_supply: raw.market_data?.circulating_supply,
            total_supply: raw.market_data?.total_supply,
            max_supply: raw.market_data?.max_supply,
            market_cap_rank: raw.market_cap_rank,

            // Sparkline
            sparkline_in_7d: {
                price: raw.market_data?.sparkline_7d?.price || []
            },

            // Links
            links: {
                homepage: raw.links?.homepage?.[0] || "",
                twitter_screen_name: raw.links?.twitter_screen_name || "",
                subreddit_url: raw.links?.subreddit_url || ""
            }
        };

        return NextResponse.json({ data });
    } catch (error) {
        console.error("Failed to fetch coin:", error);
        return NextResponse.json(
            { error: "Failed to fetch coin data" },
            { status: 500 }
        );
    }
}
