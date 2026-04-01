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
    // Demo Mode check
    if (!process.env.OPENROUTER_API_KEY) {
        return type === 'blog'
            ? ["Introduction", "The Evolution of " + topic, "Core Benefits", "Practical Applications", "Conclusion"]
            : ["Hook: The Secret of " + topic, "Intro: Why you need to know this", "Deep Dive: Step by Step", "CTA: Join the Forge", "Outro"];
    }

    const prompt = `Based on this research: ${research}
Create a detailed outline for a ${type === 'blog' ? 'blog post' : 'YouTube script'} about: ${topic}
Return ONLY a JSON array of section titles, nothing else. Example: ["Introduction", "Section 1", "Section 2", "Conclusion"]`;

    try {
        const response = await callLLM([{ role: 'user', content: prompt }], 'You are a content strategist. Return only valid JSON arrays.');
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
    // Demo Mode check
    if (!process.env.OPENROUTER_API_KEY) {
        return {
            title: "DEMO: " + topic,
            content: `# Exploring ${topic}\n\n**Note: You are viewing sample content generated in Demo Mode.**\n\nThis is a demonstration of ContentForge AI's capabilities. In a production environment with an API key, the agent would use real-time research from DuckDuckGo and advanced LLM processing via OpenRouter to generate unique, high-quality content.\n\n## Section 1: Introduction\n${topic} is a transformative subject that requires deep analysis. Our research indicates that 85% of professionals value this topic for its long-term impact.\n\n## Section 2: Key Insights\n- Insight A: Scalability and performance.\n- Insight B: User-centric design principles.\n- Insight C: Future-proofing your workflow.\n\n## Conclusion\nTo master ${topic}, one must stay updated with the latest trends and tools. ContentForge AI helps you do exactly that.\n\n---META---\nSample meta description for ${topic}`,
            outline,
            wordCount: 156
        };
    }

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
