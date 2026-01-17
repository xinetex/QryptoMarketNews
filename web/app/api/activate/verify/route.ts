import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(request: Request) {
    try {
        const { code, user_id } = await request.json();
        if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });

        const normalizedCode = code.toUpperCase().trim();

        if (!sql) throw new Error("Database not connected");

        // Check if code exists and is valid
        const result = await sql`
        SELECT code, expires_at FROM device_activations 
        WHERE code = ${normalizedCode}
    `;

        if (result.length === 0) {
            return NextResponse.json({ error: "Invalid code" }, { status: 404 });
        }

        if (new Date(result[0].expires_at) < new Date()) {
            return NextResponse.json({ error: "Code expired" }, { status: 410 });
        }

        // Update status to paired
        // user_id is optional (if user is logged in)
        const userIdVal = user_id || null;

        await sql`
        UPDATE device_activations
        SET status = 'paired',
            user_id = ${userIdVal}
        WHERE code = ${normalizedCode}
    `;

        return NextResponse.json({ success: true, redirect: "/remote" });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
