import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

function generateCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

export async function POST(request: Request) {
    try {
        const { roku_serial } = await request.json();
        // Allow empty serial for dev testing, but normally required
        const serial = roku_serial || "UNKNOWN_DEVICE";

        const code = generateCode();
        // 15 minutes expiry
        const expiry = new Date(Date.now() + 15 * 60 * 1000).toISOString();

        if (!sql) throw new Error("Database not connected");

        // Clear old codes for this device? Optional.

        // Insert new code
        await sql`
      INSERT INTO device_activations (code, roku_serial, expires_at)
      VALUES (${code}, ${serial}, ${expiry})
    `;

        return NextResponse.json({
            code: code,
            expires_in: 900 // seconds
        });

    } catch (e: any) {
        console.error("Activation Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
