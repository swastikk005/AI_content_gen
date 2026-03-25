'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Sparkles, AlertCircle, Loader2, WifiOff, RefreshCw } from 'lucide-react';

import TypeSelector from '@/components/generator/TypeSelector';
import AgentStatus from '@/components/generator/AgentStatus';
import ContentEditor from '@/components/generator/ContentEditor';
import ExportPanel from '@/components/generator/ExportPanel';
import { ContentType, AgentStep, GenerationResult } from '@/types';

function GeneratorContent() {
    const searchParams = useSearchParams();

    // Input State
    const [topic, setTopic] = useState('');
    const [type, setType] = useState<ContentType>('blog');
    const [tone, setTone] = useState('Professional');
    const [length, setLength] = useState('medium');

    // Generation State
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<GenerationResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isOffline, setIsOffline] = useState(false);
    const [isDemoMode, setIsDemoMode] = useState(false);

    const [steps, setSteps] = useState<AgentStep[]>([
        { id: 'research', label: 'Researching topic...', status: 'pending' },
        { id: 'outline', label: 'Creating outline...', status: 'pending' },
        { id: 'generate', label: 'Writing content...', status: 'pending' }
    ]);

    // Network Detection
    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Handle shared content from URL
    useEffect(() => {
        const encodedContent = searchParams.get('content');
        if (encodedContent) {
            try {
                const decoded = decodeURIComponent(atob(encodedContent));
                setResult({
                    title: "Shared Content",
                    content: decoded,
                    outline: [],
                    wordCount: decoded.split(/\s+/).length
                });
            } catch (e) {
                console.error("Failed to decode shared content");
            }
        }
    }, [searchParams]);

    const handleGenerate = async () => {
        if (!topic || isGenerating) return;
        if (isOffline) {
            setError("You are currently offline. Please check your connection.");
            return;
        }

        setIsGenerating(true);
        setError(null);
        setResult(null);
        setIsDemoMode(false);

        setSteps([
            { id: 'research', label: 'Researching topic...', status: 'pending' },
            { id: 'outline', label: 'Creating outline...', status: 'pending' },
            { id: 'generate', label: 'Writing content...', status: 'pending' }
        ]);

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, type, tone, length })
            });

            if (!response.ok) throw new Error('Failed to start generation');

            const reader = response.body?.getReader();
            const textDecoder = new TextDecoder();

            if (!reader) throw new Error('No reader available');

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = textDecoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.trim().startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.trim().substring(6));

                            if (data.error) {
                                // If the error is API key related, we can flag demo mode
                                if (data.error.includes("OPENROUTER_API_KEY")) {
                                    setIsDemoMode(true);
                                }
                                throw new Error(data.error);
                            }

                            if (data.done) {
                                setResult(data.result);
                                setIsGenerating(false);
                            } else if (data.step) {
                                setSteps(prev => prev.map(s => {
                                    if (data.step === 1 && s.id === 'research') return { ...s, status: data.status, output: data.output };
                                    if (data.step === 2 && s.id === 'outline') return { ...s, status: data.status, output: data.output };
                                    if (data.step === 3 && s.id === 'generate') return { ...s, status: data.status, output: data.output };
                                    return s;
                                }));
                            }
                        } catch (e) {
                            // Ignore partial JSON chunks
                        }
                    }
                }
            }
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
            setIsGenerating(false);
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 h-[calc(100vh-65px)]">
            {/* Left Panel: Input */}
            <div className="lg:col-span-4 p-8 border-r border-white/5 flex flex-col overflow-y-auto custom-scrollbar">
                <div className="reveal active">
                    <h2 className="text-2xl font-black mb-1">Create Content</h2>
                    <p className="text-zinc-500 text-sm mb-8">Configure your AI content agent</p>

                    <TypeSelector selected={type} onChange={setType} />

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Topic / Keyword</label>
                            <textarea
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="What do you want to write about?"
                                className="w-full h-32 p-4 rounded-2xl bg-white/[0.03] border border-white/10 focus:outline-none focus:border-primary transition-all resize-none text-sm leading-relaxed text-white"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Content Tone</label>
                                <select
                                    value={tone}
                                    onChange={(e) => setTone(e.target.value)}
                                    className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/10 focus:outline-none focus:border-primary transition-all text-sm appearance-none text-white cursor-pointer"
                                >
                                    <option>Professional</option>
                                    <option>Casual</option>
                                    <option>Educational</option>
                                    <option>Humorous</option>
                                    <option>Persuasive</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Target Length</label>
                                <select
                                    value={length}
                                    onChange={(e) => setLength(e.target.value)}
                                    className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/10 focus:outline-none focus:border-primary transition-all text-sm appearance-none text-white cursor-pointer"
                                >
                                    <option value="short">Short (~800w)</option>
                                    <option value="medium">Medium (~1500w)</option>
                                    <option value="long">Long (~2500w)</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !topic || isOffline}
                            className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-[0_0_20px_rgba(124,58,237,0.2)] hover:shadow-[0_0_30px_rgba(124,58,237,0.4)]"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Agent is working...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={20} className="group-hover:animate-pulse" />
                                    Generate Content
                                </>
                            )}
                        </button>

                        {isDemoMode && (
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/10 border border-secondary/20 text-secondary text-xs">
                                <AlertCircle size={16} />
                                Running in Demo Mode: Using sample data for preview.
                            </div>
                        )}

                        {error && (
                            <div className="flex flex-col gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
                                <div className="flex items-center gap-3">
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                                <button
                                    onClick={handleGenerate}
                                    className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg flex items-center justify-center gap-2 transition-colors font-bold"
                                >
                                    <RefreshCw size={14} /> Retry
                                </button>
                            </div>
                        )}

                        {isOffline && (
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs">
                                <WifiOff size={16} />
                                You are offline. Connectivity is required for live generation.
                            </div>
                        )}
                    </div>

                    <AgentStatus steps={steps} />
                </div>
            </div>

            {/* Right Panel: Editor */}
            <div className="lg:col-span-8 p-8 flex flex-col h-full bg-[#111118]/30">
                <div className="flex-1 overflow-hidden reveal active">
                    <ContentEditor
                        title={result?.title || ""}
                        content={result?.content || ""}
                        wordCount={result?.wordCount || 0}
                        onTitleChange={(t) => setResult(prev => prev ? { ...prev, title: t } : null)}
                        isLoading={isGenerating}
                    />
                </div>

                {result && (
                    <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <ExportPanel
                            title={result.title}
                            content={result.content}
                            onRegenerate={handleGenerate}
                            disabled={isGenerating}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default function GeneratorPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-primary/30">
            <Suspense fallback={
                <div className="w-full h-[calc(100vh-65px)] flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            }>
                <GeneratorContent />
            </Suspense>
        </div>
    );
}
