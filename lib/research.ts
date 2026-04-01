export async function fetchResearch(topic: string): Promise<string> {
    try {
        const res = await fetch(
            `https://api.duckduckgo.com/?q=${encodeURIComponent(topic)}&format=json&no_redirect=1&no_html=1&skip_disambig=1`
        );
        const data = await res.json();
        const abstract = data.AbstractText || '';
        const related = (data.RelatedTopics || [])
            .slice(0, 4)
            .map((t: { Text?: string }) => t.Text || '')
            .filter(Boolean)
            .join('. ');
        return (abstract + ' ' + related).trim() || 'No specific research found.';
    } catch {
        return 'Research unavailable. Using training knowledge.';
    }
}
