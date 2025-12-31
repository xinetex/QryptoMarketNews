
import { NextResponse } from "next/server";
import { initDatabase } from "@/lib/db";

export async function GET() {
    const success = await initDatabase();
    if (success) {
        return NextResponse.json({ success: true, message: "Database initialized" });
    } else {
        return NextResponse.json({ success: false, error: "Initialization failed" }, { status: 500 });
    }
}
