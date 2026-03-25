import { callLLM } from './openrouter';
import { GenerationResult, ContentType } from '../types';

/**
 * Step 1: Research via DuckDuckGo
 */
export async function fetchResearch(topic: string): Promise<string> {
    try {
        const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(topic)}&format=json&no_redirect=1&no_html=1&skip_disambig=1`;
        const response = await fetch(url);
        const data = await response.json();

        const abstract = data.AbstractText || "";
        const related = (data.RelatedTopics || [])
            .slice(0, 5)
            .map((t: any) => t.text)
            .filter(Boolean)
            .join(". ");

        const summary = `${abstract} ${related}`.trim();
        return summary || "No specific research found. Using training knowledge.";
    } catch (error) {
        console.error("Research Error:", error);
        return "Research failed. Using training knowledge.";
    }
}

/**
 * Step 2: Generate Outline
 */
export async function generateOutline(topic: string, type: ContentType, research: string): Promise<string[]> {
    const prompt = `Based on this research: ${research}
Create a detailed outline for a ${type === 'blog' ? 'blog post' : 'YouTube script'} about: ${topic}
Return ONLY a JSON array of section titles, nothing else. Example: ["Introduction", "Section 1", "Section 2", "Conclusion"]`;

    try {
        const response = await callLLM([{ role: 'user', content: prompt }]);
        // Attempt to extract JSON array
        const jsonMatch = response.match(/\[.*\]/s);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error("Invalid JSON in outline response");
    } catch (error) {
        console.error("Outline Generation error:", error);
        return ["Introduction", "Main Content", "Key Points", "Conclusion"];
    }
}

/**
 * Step 3: Generate Final Content
 */
export async function generateContent(
    topic: string,
    type: ContentType,
    tone: string,
    length: string,
    outline: string[],
    research: string
): Promise<GenerationResult> {
    const lengthMap: Record<string, number> = { short: 800, medium: 1500, long: 2500 };
    const lengthWords = lengthMap[length] || 1500;

    const systemPrompt = "You are an expert content writer. Write engaging, well-structured content.";

    let userPrompt = "";
    if (type === 'blog') {
        userPrompt = `Write a complete, SEO-optimised blog post about: ${topic}
Tone: ${tone}
Target length: ${lengthWords} words
Use this outline: ${outline.join(', ')}
Research to incorporate: ${research}
Format with markdown: use # for title, ## for sections, **bold** for key points.
Include a meta description at the end after '---META---'`;
    } else {
        userPrompt = `Write a complete YouTube script about: ${topic}
Tone: ${tone}
Target length: ${lengthWords} words (spoken, ~130 words per minute)
Use this outline: ${outline.join(', ')}
Research to incorporate: ${research}
Format:
[HOOK] - First 30 seconds, grab attention
[INTRO] - Who you are, what video covers
[MAIN CONTENT] - Each section with [TIMESTAMP] markers
[CTA] - Subscribe, like, comment prompts
[OUTRO] - Final thoughts`;
    }

    const response = await callLLM([{ role: 'user', content: userPrompt }], systemPrompt);

    let title = topic;
    let content = response;

    if (type === 'blog') {
        const titleMatch = response.match(/^# (.*)/);
        if (titleMatch) title = titleMatch[1];
        content = response.split('---META---')[0].trim();
    }

    const wordCount = response.split(/\s+/).length;

    return {
        title,
        content,
        outline,
        wordCount
    };
}
