import { NextResponse } from 'next/server';

const AD_NETWORK_URL = process.env.NEXT_PUBLIC_AD_NETWORK_URL || 'https://ad-network-jfl2iuksu-drgnflai-jetty.vercel.app';
const API_KEY = process.env.NEXT_PUBLIC_AD_NETWORK_KEY || 'dev-secret-key';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const externalResponse = await fetch(`${AD_NETWORK_URL}/api/decision`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY
            },
            body: JSON.stringify(body)
        });

        if (!externalResponse.ok) {
            return NextResponse.json(
                { error: `Ad Network Error: ${externalResponse.status}` },
                { status: externalResponse.status }
            );
        }

        const data = await externalResponse.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Ad Proxy Error:", error);
        return NextResponse.json(
            { error: "Internal Proxy Error" },
            { status: 500 }
        );
    }
}
