import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { key, ip } = await req.json();

        // Default to the known Roku IP if not provided
        // In a real app, we'd scan or ask user to input IP
        const rokuIp = ip || "192.168.4.34";

        if (!key) {
            return NextResponse.json({ error: "Key is required" }, { status: 400 });
        }

        console.log(`[Remote] Sending ${key} to ${rokuIp}...`);

        // Roku ECP: POST http://<ip>:8060/keypress/<key>
        try {
            const response = await fetch(`http://${rokuIp}:8060/keypress/${key}`, {
                method: 'POST',
            });

            if (response.ok) {
                return NextResponse.json({ success: true });
            } else {
                return NextResponse.json({ error: "Roku rejected command" }, { status: 500 });
            }
        } catch (fetchError) {
            console.error("Failed to connect to Roku", fetchError);
            return NextResponse.json({ error: "Failed to connect to Roku device. Ensure it is on the same network." }, { status: 504 });
        }

    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
