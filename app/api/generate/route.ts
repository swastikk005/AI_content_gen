import { NextRequest, NextResponse } from 'next/server';
import { callLLM } from '@/lib/openrouter';
import { fetchResearch } from '@/lib/research';

export async function POST(req: NextRequest) {
    try {
        const { topic, type, tone, length } = await req.json();

        if (!topic) {
            return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
        }

        // Step 1: Research
        const research = await fetchResearch(topic);

        // Step 2: Outline
        let outline: string[] = ['Introduction', 'Main Content', 'Conclusion'];
        try {
            const outlineRaw = await callLLM(
                [{ role: 'user', content: `Create a detailed outline for a ${type} about '${topic}'. Return ONLY a JSON array of section titles like: ["Introduction", "Section 1", "Conclusion"]. Nothing else — just the JSON array.` }],
                'You are a professional content strategist. Return only valid JSON arrays, nothing else.'
            );
            const match = outlineRaw.match(/\[[\s\S]*\]/);
            if (match) outline = JSON.parse(match[0]);
        } catch {
            // use fallback outline
        }

        // Step 3: Generate
        const lengthMap: Record<string, number> = { short: 800, medium: 1500, long: 2500 };
        const words = lengthMap[length] || 1500;

        let contentPrompt = '';
        if (type === 'blog') {
            contentPrompt = `Write a complete SEO-optimised blog post about: ${topic}
Tone: ${tone}. Target: ${words} words.
Outline: ${outline.join(', ')}
Research: ${research}
Use markdown: # title, ## sections, **bold** key points.
Add meta description after ---META--- at the end.`;
        } else {
            contentPrompt = `Write a complete YouTube script about: ${topic}
Tone: ${tone}. Target: ${words} words (~130wpm spoken).
Outline: ${outline.join(', ')}
Research: ${research}
Format:
[HOOK] First 30 seconds
[INTRO] Channel intro
[MAIN CONTENT] Sections with [TIMESTAMP] markers
[CTA] Subscribe/like/comment
[OUTRO] Final thoughts`;
        }

        const content = await callLLM(
            [{ role: 'user', content: contentPrompt }],
            `You are an expert ${type === 'blog' ? 'blog writer and SEO specialist' : 'YouTube script writer and content creator'}. Write high-quality, engaging, complete content.`
        );

        // Extract title from first # line
        const firstLine = content.split('\n').find((line: string) => line.trim().startsWith('#'));
        const title = firstLine ? firstLine.replace(/^#+\s*/, '').trim() : topic;
        const wordCount = content.split(/\s+/).filter(Boolean).length;

        return NextResponse.json({ title, content, outline, wordCount, research });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Generation failed';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
