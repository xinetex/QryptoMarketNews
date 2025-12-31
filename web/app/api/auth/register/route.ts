
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        if (!sql) {
            return NextResponse.json({ error: "Database not configured" }, { status: 500 });
        }

        const { email, password, name } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password required" }, { status: 400 });
        }

        // Check if user exists
        const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
        if (existing.length > 0) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Super Admin Check
        const isSuperAdmin = email === "richard@drgnflai.org";
        const role = isSuperAdmin ? "admin" : "user";
        const isPremium = isSuperAdmin; // Admins get free premium

        // Create user
        await sql`
            INSERT INTO users (email, password, name, role, is_premium)
            VALUES (${email}, ${hashedPassword}, ${name || 'Trader'}, ${role}, ${isPremium})
        `;

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Registration Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
