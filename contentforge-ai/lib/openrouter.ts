/**
 * OpenRouter Client Utility
 */

export async function callLLM(
    messages: { role: 'user' | 'system' | 'assistant'; content: string }[],
    systemPrompt?: string
) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const baseUrl = "https://openrouter.ai/api/v1/chat/completions";

    if (!apiKey) {
        throw new Error("OPENROUTER_API_KEY is not defined in environment variables.");
    }

    const fullMessages = systemPrompt
        ? [{ role: 'system', content: systemPrompt }, ...messages]
        : messages;

    try {
        const response = await fetch(baseUrl, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "HTTP-Referer": "https://contentforge-ai.vercel.app", // Optional
                "X-Title": "ContentForge AI", // Optional
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "openrouter/auto", // Auto-picks best free/cheap model
                messages: fullMessages,
                temperature: 0.7,
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "OpenRouter API call failed");
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error("LLM Call Error:", error);
        throw error;
    }
}
