
import { NextResponse } from 'next/server';
import { moltbook } from '@/lib/moltbook';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const submolt = searchParams.get('submolt');

    if (!submolt) {
        return NextResponse.json({ error: "Missing 'submolt' parameter" }, { status: 400 });
    }

    try {
        const feed = await moltbook.getSubmoltFeed(submolt, 15);

        // Transform for Roku (XML-friendly or simplified JSON)
        // Roku SceneGraph parses JSON natively now, so we keep it as JSON 
        // but ensure fields are safe.
        const items = feed.posts.map((post: any) => ({
            id: post.id,
            title: post.title || "Untitled",
            content: post.content,
            author: post.author.display_name,
            timestamp: post.created_at,
            sentiment: post.sentiment || "neutral"
        }));

        return NextResponse.json({
            submolt: submolt,
            items: items
        });

    } catch (error) {
        console.error("MoltConnect Bridge Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch from Moltbook" },
            { status: 500 }
        );
    }
}
