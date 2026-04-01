import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const { title } = await req.json();
    const prompt = `Professional blog header image: ${title}. Modern design, vibrant colors, no text overlay, photographic quality, wide format`;
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1280&height=720&nologo=true&nofeed=true&seed=${Math.floor(Math.random() * 9999)}`;

    try {
        const response = await fetch(url, {
            headers: { 'User-Agent': 'ContentForge/1.0' },
        });
        if (!response.ok) throw new Error('Pollinations failed');
        const buffer = await response.arrayBuffer();
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'image/jpeg',
                'Cache-Control': 'no-store',
            },
        });
    } catch (err) {
        console.error('Thumbnail error:', err);
        return NextResponse.json({ error: 'Failed to generate thumbnail' }, { status: 500 });
    }
}
