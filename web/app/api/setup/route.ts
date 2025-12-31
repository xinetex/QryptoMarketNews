import { NextResponse } from "next/server";
import { initDatabase } from "@/lib/db";

export async function GET() {
    try {
        const success = await initDatabase();
        if (success) {
            return NextResponse.json({ message: "Database initialized successfully" });
        } else {
            return NextResponse.json({ error: "Failed to initialize database" }, { status: 500 });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
