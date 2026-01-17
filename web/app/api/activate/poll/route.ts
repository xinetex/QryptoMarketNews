import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(request: Request) {
    try {
        const { device_code } = await request.json();
        if (!device_code) return NextResponse.json({ error: "Missing code" }, { status: 400 });

        if (!sql) throw new Error("Database not connected");

        const result = await sql`
      SELECT status, user_id, expires_at FROM device_activations
      WHERE code = ${device_code}
    `;

        if (result.length === 0) {
            return NextResponse.json({ error: "Invalid code" }, { status: 404 });
        }

        const row = result[0];

        // Check expiry
        if (new Date(row.expires_at) < new Date()) {
            return NextResponse.json({ error: "Code expired" }, { status: 410 });
        }

        if (row.status === 'active' || row.status === 'paired') {
            return NextResponse.json({
                status: 'success',
                token: 'dummy-jwt-token',
                user_id: row.user_id
            });
        }

        return NextResponse.json({ status: 'pending' });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
