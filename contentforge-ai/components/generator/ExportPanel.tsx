import { Copy, Download, RotateCcw, Share2, ClipboardCheck } from 'lucide-react';
import { useState } from 'react';

interface ExportPanelProps {
    title: string;
    content: string;
    onRegenerate: () => void;
    disabled: boolean;
}

export default function ExportPanel({ title, content, onRegenerate, disabled }: ExportPanelProps) {
    const [copied, setCopied] = useState(false);

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
        <div className="flex items-center gap-3 pt-6 border-t border-white/5">
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
    );
}
