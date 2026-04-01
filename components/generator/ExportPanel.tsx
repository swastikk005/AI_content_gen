'use client';

import { useState } from 'react';
import { Copy, Download, RotateCcw, Share2, ClipboardCheck, Zap } from 'lucide-react';
import ThumbnailGenerator from './ThumbnailGenerator';
import PlagiarismChecker from './PlagiarismChecker';
import Repurposer from './Repurposer';

interface ExportPanelProps {
    title: string;
    content: string;
    onRegenerate: () => void;
    onUpdateContent: (newContent: string) => void;
    disabled: boolean;
}

export default function ExportPanel({ title, content, onRegenerate, onUpdateContent, disabled }: ExportPanelProps) {
    const [copied, setCopied] = useState(false);
    const [isRepurposerOpen, setIsRepurposerOpen] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = (format: 'txt' | 'md') => {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/\s+/g, '-').toLowerCase()}.${format}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleShare = () => {
        const url = new URL(window.location.href);
        url.searchParams.set('content', btoa(encodeURIComponent(content)));
        navigator.clipboard.writeText(url.toString());
        alert('Shareable URL copied to clipboard!');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 pt-6 border-t border-white/5">
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleCopy}
                        disabled={disabled}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {copied ? <ClipboardCheck size={16} /> : <Copy size={16} />}
                        {copied ? 'Copied!' : 'Copy to Clipboard'}
                    </button>

                    <div className="flex gap-2">
                        <button
                            onClick={() => handleDownload('txt')}
                            disabled={disabled}
                            title="Download TXT"
                            className="p-2.5 bg-white/5 text-zinc-400 rounded-xl hover:bg-white/10 hover:text-white disabled:opacity-50 transition-all border border-white/5"
                        >
                            <Download size={18} />
                        </button>
                        <button
                            onClick={() => handleDownload('md')}
                            disabled={disabled}
                            title="Download Markdown"
                            className="p-2.5 bg-white/5 text-zinc-400 rounded-xl hover:bg-white/10 hover:text-white disabled:opacity-50 transition-all border border-white/5"
                        >
                            <span className="text-[10px] font-black">MD</span>
                        </button>
                        <button
                            onClick={handleShare}
                            disabled={disabled}
                            title="Share"
                            className="p-2.5 bg-white/5 text-zinc-400 rounded-xl hover:bg-white/10 hover:text-white disabled:opacity-50 transition-all border border-white/5"
                        >
                            <Share2 size={18} />
                        </button>
                        <button
                            onClick={onRegenerate}
                            disabled={disabled}
                            title="Regenerate"
                            className="p-2.5 bg-white/5 text-zinc-400 rounded-xl hover:bg-white/10 hover:text-white disabled:opacity-50 transition-all border border-white/5"
                        >
                            <RotateCcw size={18} />
                        </button>
                    </div>
                </div>

                <button
                    onClick={() => setIsRepurposerOpen(true)}
                    disabled={disabled}
                    className="w-full py-3 bg-secondary hover:bg-secondary/90 text-black text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Zap size={16} fill="currentColor" />
                    Repurpose Content for Social Media
                </button>
            </div>

            <ThumbnailGenerator title={title} />
            <PlagiarismChecker content={content} onUpdateContent={onUpdateContent} />

            {isRepurposerOpen && (
                <Repurposer content={content} onClose={() => setIsRepurposerOpen(false)} />
            )}
        </div>
    );
}
