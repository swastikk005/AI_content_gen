import { NextResponse } from 'next/server';
import { callLLM } from '@/lib/openrouter';

export async function POST(req: Request) {
    try {
        const { content, type, title, instruction } = await req.json();

        if (type === 'plagiarism') {
            const prompt = `Analyse this content for originality. Check if it sounds generic, templated, or potentially copied.
Rate originality from 0-100. Identify any phrases that sound too common or clichéd.
Respond ONLY in this JSON format:
{
  "score": number (0-100),
  "rating": "Excellent" | "Good" | "Fair" | "Poor",
  "issues": string[],
  "suggestions": string[]
}

Content to analyse:
${content}`;

            const response = await callLLM(
                [{ role: 'user', content: prompt }],
                'You are an expert content analyst. Return only valid JSON.'
            );
            const jsonMatch = response.match(/\{.*\}/s);
            if (jsonMatch) {
                return NextResponse.json(JSON.parse(jsonMatch[0]));
            }
            throw new Error("Invalid response from AI");
        }

        if (type === 'seo') {
            const prompt = `You are an SEO expert. Analyse content and provide actionable SEO recommendations.
Analyse this blog post for SEO:
Title: ${title}
Content: ${(content as string).substring(0, 2000)}

Respond ONLY in this JSON format:
{
  "score": number (0-100),
  "titleScore": number,
  "readabilityScore": number,
  "keywordDensity": number,
  "suggestedKeywords": string[],
  "primaryKeyword": string,
  "metaDescription": string,
  "issues": { "type": "error"|"warning"|"info", "message": string }[],
  "suggestions": string[]
}

Ensure the response is valid JSON.`;

            const response = await callLLM(
                [{ role: 'user', content: prompt }],
                'You are an expert SEO analyst. Return only valid JSON.'
            );
            const jsonMatch = response.match(/\{.*\}/s);
            if (jsonMatch) {
                return NextResponse.json(JSON.parse(jsonMatch[0]));
            }
            throw new Error("Invalid response from AI");
        }

        if (type === 'improve') {
            const prompt = `${instruction}\n\nContent:\n${content}`;
            const improvedContent = await callLLM(
                [{ role: 'user', content: prompt }],
                'You are an expert content writer and editor.'
            );
            return NextResponse.json({ improvedContent });
        }

        return NextResponse.json({ error: "Invalid analysis type" }, { status: 400 });

    } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to analyze content";
        console.error("Analysis Error:", error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
