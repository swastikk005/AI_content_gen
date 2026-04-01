'use client';

import { useState } from 'react';
import { ShieldCheck, AlertTriangle, Lightbulb, Loader2, RefreshCcw, CheckCircle2 } from 'lucide-react';

interface PlagiarismResult {
    score: number;
    rating: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    issues: string[];
    suggestions: string[];
}

interface PlagiarismCheckerProps {
    content: string;
    onUpdateContent: (newContent: string) => void;
}

export default function PlagiarismChecker({ content, onUpdateContent }: PlagiarismCheckerProps) {
    const [result, setResult] = useState<PlagiarismResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isImproving, setIsImproving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const checkOriginality = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, type: 'plagiarism' })
            });
            if (!response.ok) throw new Error("Failed to analyze content");
            const data = await response.json();
            setResult(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const improveOriginality = async () => {
        setIsImproving(true);
        try {
            // For simplicity, we'll use a direct prompt to the generate API or a new improve API
            // Let's assume we can use a simpler approach here or add another type to analyze
            const prompt = `Rewrite this content to be more original and unique while keeping the same meaning and structure. Avoid clichés.
      
      Content:
      ${content}`;

            // We could use /api/generate or add an 'improve' type to /api/analyze
            // Let's add 'improve' type to /api/analyze
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, type: 'improve' }) // Need to add this to the route
            });
            if (!response.ok) throw new Error("Failed to improve content");
            const { improvedContent } = await response.json();
            onUpdateContent(improvedContent);
            setResult(null); // Reset analysis after update
        } catch (err: any) {
            alert("Failed to improve content: " + err.message);
        } finally {
            setIsImproving(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-500 border-green-500/20 bg-green-500/5';
        if (score >= 60) return 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5';
        if (score >= 40) return 'text-orange-500 border-orange-500/20 bg-orange-500/5';
        return 'text-red-500 border-red-500/20 bg-red-500/5';
    };

    return (
        <div className="mt-4 border-t border-white/5 pt-4">
            {!result && !isLoading ? (
                <button
                    onClick={checkOriginality}
                    className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
                >
                    <ShieldCheck size={14} />
                    Check Originality Score
                </button>
            ) : isLoading ? (
                <div className="flex items-center gap-2 text-xs font-bold text-primary animate-pulse uppercase tracking-widest">
                    <Loader2 size={14} className="animate-spin" />
                    Analyzing Content...
                </div>
            ) : result ? (
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-black text-lg ${getScoreColor(result.score)} shadow-lg`}>
                                {result.score}
                            </div>
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Originality</div>
                                <div className="text-sm font-black text-white">{result.rating}</div>
                            </div>
                        </div>
                        <button
                            onClick={checkOriginality}
                            className="p-2 bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors"
                            title="Re-analyze"
                        >
                            <RefreshCcw size={14} />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {result.issues.length > 0 && (
                            <div className="space-y-1">
                                <div className="text-[10px] font-bold uppercase tracking-widest text-red-400/70 mb-1">Potential Issues</div>
                                {result.issues.map((issue, i) => (
                                    <div key={i} className="flex items-start gap-2 text-[11px] text-zinc-400 italic">
                                        <AlertTriangle size={12} className="text-orange-400 flex-shrink-0 mt-0.5" />
                                        {issue}
                                    </div>
                                ))}
                            </div>
                        )}

                        {result.suggestions.length > 0 && (
                            <div className="space-y-1">
                                <div className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mb-1">Suggestions</div>
                                {result.suggestions.map((sug, i) => (
                                    <div key={i} className="flex items-start gap-2 text-[11px] text-zinc-400">
                                        <Lightbulb size={12} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                                        {sug}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={improveOriginality}
                        disabled={isImproving}
                        className="w-full py-2 bg-primary/20 hover:bg-primary/30 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                        {isImproving ? <Loader2 size={12} className="animate-spin" /> : <RefreshCcw size={12} />}
                        {isImproving ? "Rewriting..." : "Improve Originality"}
                    </button>
                </div>
            ) : error ? (
                <div className="text-[10px] text-red-500 font-bold">{error}</div>
            ) : null}
        </div>
    );
}
