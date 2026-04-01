import { NextResponse } from 'next/server';
import { callLLM } from '@/lib/openrouter';

export async function POST(req: Request) {
    try {
        const { type, content, title } = await req.json();

        if (type === 'originality') {
            const raw = await callLLM(
                [{
                    role: 'user',
                    content: `Analyse this content for originality. Rate it 0-100.
Respond ONLY in valid JSON with NO other text:
{ "score": number, "rating": "Excellent" | "Good" | "Fair" | "Poor", "issues": string[], "suggestions": string[] }

Content:
${(content as string).slice(0, 3000)}`
                }],
                'You are an expert content analyst. Always return only valid JSON with no surrounding text.'
            );
            const match = raw.match(/\{[\s\S]*\}/);
            if (!match) throw new Error('Could not parse originality response');
            return NextResponse.json(JSON.parse(match[0]));
        }

        if (type === 'seo') {
            const raw = await callLLM(
                [{
                    role: 'user',
                    content: `Analyse this content for SEO. Respond ONLY in valid JSON with NO other text:
{
  "score": number,
  "titleScore": number,
  "readabilityScore": number,
  "keywordDensity": number,
  "suggestedKeywords": string[],
  "primaryKeyword": string,
  "metaDescription": string,
  "issues": [{ "type": "error" | "warning" | "info", "message": string }],
  "suggestions": string[]
}

Title: ${title}
Content (first 2000 chars): ${(content as string).slice(0, 2000)}`
                }],
                'You are an expert SEO analyst. Always return only valid JSON with no surrounding text.'
            );
            const match = raw.match(/\{[\s\S]*\}/);
            if (!match) throw new Error('Could not parse SEO response');
            return NextResponse.json(JSON.parse(match[0]));
        }

        if (type === 'improve') {
            const { instruction } = await req.json().catch(() => ({ instruction: 'Improve this content for originality and uniqueness.' }));
            const improved = await callLLM(
                [{ role: 'user', content: `${instruction || 'Rewrite this content to be more unique, original, and engaging. Avoid clichés.'}\n\nContent:\n${content}` }],
                'You are an expert content editor. Rewrite content to be highly original and engaging.'
            );
            return NextResponse.json({ improvedContent: improved });
        }

        if (type === 'seofix') {
            const improved = await callLLM(
                [{ role: 'user', content: `Rewrite this blog post to be highly SEO-optimized. Keep the core content but improve keyword usage, headings, readability, and structure. Return the full rewritten content in markdown.\n\nTitle: ${title}\nContent:\n${content}` }],
                'You are an expert SEO content writer. Rewrite content to rank on top of Google while keeping it informative and engaging.'
            );
            return NextResponse.json({ improvedContent: improved });
        }

        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Analysis failed';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
