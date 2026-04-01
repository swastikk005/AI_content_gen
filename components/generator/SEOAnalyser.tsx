'use client';

import { useState } from 'react';
import {
    Zap,
    CheckCircle2,
    AlertCircle,
    Info,
    Loader2,
    Copy,
    RefreshCcw,
    Check,
    BarChart3,
    Search
} from 'lucide-react';

interface SEOAnalyserProps {
    title: string;
    content: string;
    onUpdateContent: (content: string) => void;
}

interface SEOResults {
    score: number;
    titleScore: number;
    readabilityScore: number;
    keywordDensity: number;
    suggestedKeywords: string[];
    primaryKeyword: string;
    metaDescription: string;
    issues: { type: 'error' | 'warning' | 'info'; message: string }[];
    suggestions: string[];
}

export default function SEOAnalyser({ title, content, onUpdateContent }: SEOAnalyserProps) {
    const [results, setResults] = useState<SEOResults | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFixing, setIsFixing] = useState(false);
    const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

    const analyzeSEO = async () => {
        if (!content) return;
        setIsLoading(true);
        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content, type: 'seo' })
            });
            if (!response.ok) throw new Error("Failed to analyze SEO");
            const data = await response.json();
            setResults(data);
        } catch (err) {
            console.error(err);
            alert("SEO Analysis failed.");
        } finally {
            setIsLoading(false);
        }
    };

    const autoFixSEO = async () => {
        if (!results) return;
        setIsFixing(true);
        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content,
                    type: 'improve',
                    instruction: `Fix these SEO issues: ${results.issues.map(i => i.message).join(', ')}`
                })
            });
            if (!response.ok) throw new Error("Auto-fix failed");
            const { improvedContent } = await response.json();
            onUpdateContent(improvedContent);
            analyzeSEO(); // Re-analyze
        } catch (err) {
            alert("Failed to auto-fix SEO");
        } finally {
            setIsFixing(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-500 border-green-500/20 bg-green-500/5';
        if (score >= 60) return 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5';
        return 'text-red-500 border-red-500/20 bg-red-500/5';
    };

    if (!results && !isLoading) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center text-primary mb-6 border border-white/10">
                    <BarChart3 size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Ready for SEO Analysis?</h3>
                <p className="text-zinc-500 text-sm max-w-sm mb-8">
                    We'll scan your content for keyword density, readability, and title optimization to ensure your post ranks high.
                </p>
                <button
                    onClick={analyzeSEO}
                    className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2"
                >
                    <Search size={18} />
                    Start SEO Scan
                </button>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-12">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <div className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 animate-pulse">Running SEO Algorithms...</div>
            </div>
        );
    }

    if (!results) return null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className={`p-4 rounded-2xl border ${getScoreColor(results.score)} flex flex-col items-center justify-center gap-2`}>
                    <div className="text-3xl font-black">{results.score}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">SEO Score</div>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col items-center justify-center gap-2">
                    <div className="text-lg font-bold text-white">{results.titleScore}%</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Title</div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${results.titleScore}%` }}></div>
                    </div>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col items-center justify-center gap-2">
                    <div className="text-lg font-bold text-white">{results.readabilityScore}%</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Readability</div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-secondary" style={{ width: `${results.readabilityScore}%` }}></div>
                    </div>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col items-center justify-center gap-2">
                    <div className="text-lg font-bold text-white">{results.keywordDensity}%</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Density</div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500" style={{ width: `${results.keywordDensity}%` }}></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Keywords & Meta */}
                <div className="space-y-6">
                    <section>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-2">
                            <Zap size={12} className="text-primary" /> Primary Keyword
                        </h4>
                        <div
                            onClick={() => copyToClipboard(results.primaryKeyword)}
                            className="px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl flex items-center justify-between cursor-pointer hover:border-primary/50 transition-all text-sm font-bold text-white group"
                        >
                            {results.primaryKeyword}
                            <Copy size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </section>

                    <section>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Suggested Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                            {results.suggestedKeywords.map((kw, i) => (
                                <button
                                    key={i}
                                    onClick={() => copyToClipboard(kw)}
                                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-xs font-bold text-zinc-300 transition-all flex items-center gap-2 group"
                                >
                                    {kw}
                                    <Copy size={12} className="opacity-0 group-hover:opacity-100" />
                                </button>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3 flex items-center justify-between">
                            Ai-Generated Meta Description
                            <button
                                onClick={() => copyToClipboard(results.metaDescription)}
                                className="text-primary hover:text-white transition-colors"
                                title="Copy Meta Description"
                            >
                                <Copy size={14} />
                            </button>
                        </h4>
                        <div className="p-4 bg-white/[0.03] border border-white/10 rounded-xl text-xs leading-relaxed text-zinc-400 italic">
                            {results.metaDescription}
                        </div>
                    </section>
                </div>

                {/* Right: Issues & Suggestions */}
                <div className="space-y-6">
                    <section>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">SEO Issues</h4>
                        <div className="space-y-2">
                            {results.issues.map((issue, i) => (
                                <div key={i} className="flex gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                                    {issue.type === 'error' ? <AlertCircle size={16} className="text-red-500 flex-shrink-0" /> :
                                        issue.type === 'warning' ? <AlertCircle size={16} className="text-yellow-500 flex-shrink-0" /> :
                                            <Info size={16} className="text-blue-500 flex-shrink-0" />}
                                    <span className="text-[11px] text-zinc-400 leading-tight">{issue.message}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Action Checklist</h4>
                        <div className="space-y-2">
                            {results.suggestions.map((suggestion, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-3 cursor-pointer group"
                                    onClick={() => setCheckedItems(prev => ({ ...prev, [i]: !prev[i] }))}
                                >
                                    <div className={`w-5 h-5 rounded border ${checkedItems[i] ? 'bg-primary border-primary' : 'border-white/10 bg-white/5'} flex items-center justify-center transition-all`}>
                                        {checkedItems[i] && <Check size={12} className="text-white" />}
                                    </div>
                                    <span className={`text-xs ${checkedItems[i] ? 'text-zinc-600 line-through' : 'text-zinc-400'} transition-all`}>{suggestion}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <button
                        onClick={autoFixSEO}
                        disabled={isFixing}
                        className="w-full py-4 bg-primary/20 hover:bg-primary/30 text-primary font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all border border-primary/20 flex items-center justify-center gap-2"
                    >
                        {isFixing ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                        {isFixing ? "Fixing Issues..." : "Auto-Fix SEO Issues"}
                    </button>
                </div>
            </div>
        </div>
    );
}
