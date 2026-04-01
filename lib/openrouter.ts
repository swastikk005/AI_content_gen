export async function callLLM(
    messages: { role: string; content: string }[],
    systemPrompt: string
): Promise<string> {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://contentforge.vercel.app',
            'X-Title': 'ContentForge AI'
        },
        body: JSON.stringify({
            model: 'openrouter/auto',
            messages: [{ role: 'system', content: systemPrompt }, ...messages],
            max_tokens: 4000
        })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'API error');
    return data.choices[0].message.content;
}
