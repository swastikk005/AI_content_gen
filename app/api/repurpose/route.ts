import { NextResponse } from 'next/server';
import { callLLM } from '@/lib/openrouter';

const PROMPTS: Record<string, string> = {
    twitter: `Turn the following content into a Twitter/X thread. Maximum 10 tweets, each under 280 characters. Number them like "Tweet 1/10: [text]". First tweet must hook the reader. Last tweet is a CTA. Return only the tweets, nothing else.`,
    linkedin: `Turn the following content into a LinkedIn post. Maximum 1300 characters. Start with a strong hook on the first line. End with a thought-provoking question to drive comments. Add 3-5 relevant hashtags at the end. Return only the post text.`,
    email: `Turn the following content into an email newsletter. Use this exact format and nothing else:
SUBJECT: [compelling subject line]
PREVIEW: [40-character preview text]
BODY: [full newsletter body with a clear CTA at the end]`,
    instagram: `Turn the following content into an Instagram caption. Start with a punchy hook on line 1. Max 2200 characters. Use line breaks for readability. Add 5-10 relevant hashtags at the end. Return only the caption.`,
    shortscript: `Turn the following content into a 60-second short video script (~150 words). Use this exact format:
[HOOK] (0-5s): [hook text]
[MAIN] (5-50s): [main points]
[CTA] (50-60s): [call to action]
Return only the script.`,
};

export async function POST(req: Request) {
    try {
        const { type, content, title } = await req.json();
        const prompt = PROMPTS[type];
        if (!prompt) return NextResponse.json({ error: 'Invalid repurpose type' }, { status: 400 });

        const result = await callLLM(
            [{ role: 'user', content: `${prompt}\n\n---\nTitle: ${title}\nContent:\n${(content as string).slice(0, 4000)}` }],
            'You are a social media content expert. Follow the exact format instructions given. Return only the requested content, no preamble.'
        );

        return NextResponse.json({ result });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Repurpose failed';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
