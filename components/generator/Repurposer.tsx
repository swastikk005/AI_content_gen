'use client';

import { useState } from 'react';
import {
    X,
    Twitter,
    Linkedin,
    Mail,
    Instagram,
    Video,
    Zap,
    Loader2,
    Copy,
    CheckCircle2
} from 'lucide-react';

interface RepurposerProps {
    content: string;
    onClose: () => void;
}

interface RepurposeOption {
    id: string;
    title: string;
    icon: any;
    description: string;
    prompt: string;
}

const OPTIONS: RepurposeOption[] = [
    {
        id: 'twitter',
        title: 'Twitter/X Thread',
        icon: Twitter,
        description: 'Turn into a viral 10-tweet thread.',
        prompt: 'Turn this blog post into a Twitter thread. Max 10 tweets, each under 280 chars. Start with a hook tweet. End with a CTA tweet. Format: Tweet 1/10: [text] Tweet 2/10: [text] etc.'
    },
    {
        id: 'linkedin',
        title: 'LinkedIn Post',
        icon: Linkedin,
        description: 'Professional post with a hook and question.',
        prompt: 'Turn this into a LinkedIn post. Max 1300 chars. Use line breaks for readability. Start with a strong hook. End with a question to drive comments. Use 3-5 relevant hashtags at the end.'
    },
    {
        id: 'email',
        title: 'Email Newsletter',
        icon: Mail,
        description: 'Conversational body with subject & preview.',
        prompt: 'Turn this into an email newsletter. Subject line + preview text + body. Conversational tone. Clear CTA at end. Format: SUBJECT: [subject] PREVIEW: [preview] BODY: [body]'
    },
    {
        id: 'instagram',
        title: 'Instagram Caption',
        icon: Instagram,
        description: 'Punchy caption with relevant hashtags.',
        prompt: 'Turn the key insights into an Instagram caption. Max 2200 chars. Hook in first line. Use line breaks. 5-10 relevant hashtags at end.'
    },
    {
        id: 'short',
        title: 'Short Video Script',
        icon: Video,
        description: '60-second high-impact video script.',
        prompt: 'Turn the main point into a 60-second short video script. ~150 words. Hook (0-5s), Main point (5-50s), CTA (50-60s). Punchy, fast-paced, engaging.'
    }
];

export default function Repurposer({ content, onClose }: RepurposerProps) {
    const [results, setResults] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState<Record<string, boolean>>({});
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const generateRepurpose = async (option: RepurposeOption) => {
        setLoading(prev => ({ ...prev, [option.id]: true }));
        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content,
                    type: 'improve',
                    instruction: option.prompt
                })
            });
            if (!response.ok) throw new Error("Repurpose failed");
            const { improvedContent } = await response.json();
            setResults(prev => ({ ...prev, [option.id]: improvedContent }));
        } catch (err) {
            alert("Failed to repurpose: " + option.title);
        } finally {
            setLoading(prev => ({ ...prev, [option.id]: false }));
        }
    };

    const copyResult = (id: string) => {
        navigator.clipboard.writeText(results[id]);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-4xl max-h-[90vh] bg-[#0a0a0f] border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Zap className="text-primary" size={20} />
                        <h2 className="text-xl font-black text-white">Content Repurposer</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {OPTIONS.map((option) => (
                            <div key={option.id} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col gap-4 group">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white group-hover:bg-primary/20 group-hover:text-primary transition-all">
                                            <option.icon size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white">{option.title}</h3>
                                            <p className="text-[10px] text-zinc-500 mt-0.5">{option.description}</p>
                                        </div>
                                    </div>
                                    {!results[option.id] && !loading[option.id] && (
                                        <button
                                            onClick={() => generateRepurpose(option)}
                                            className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg transition-all"
                                        >
                                            Generate
                                        </button>
                                    )}
                                </div>

                                {loading[option.id] ? (
                                    <div className="h-32 flex items-center justify-center animate-pulse">
                                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                    </div>
                                ) : results[option.id] ? (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                        <div className="relative">
                                            <textarea
                                                readOnly
                                                value={results[option.id]}
                                                className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-zinc-400 custom-scrollbar resize-none focus:outline-none"
                                            />
                                            <button
                                                onClick={() => copyResult(option.id)}
                                                className="absolute top-2 right-2 p-2 bg-black/60 text-zinc-400 hover:text-primary rounded-lg transition-all"
                                            >
                                                {copiedId === option.id ? <CheckCircle2 size={14} className="text-green-500" /> : <Copy size={14} />}
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between text-[10px] font-bold text-zinc-600">
                                            <span>{results[option.id].length} Characters</span>
                                            <button onClick={() => generateRepurpose(option)} className="hover:text-primary transition-colors">Start Over</button>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 border-t border-white/5 bg-white/[0.01] flex items-center justify-between">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Generated via OpenRouter AI</p>
                    <button onClick={onClose} className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all">Close Repurposer</button>
                </div>
            </div>
        </div>
    );
}
