'use client';

import { useState, useCallback } from 'react';
import { ImageIcon, Download, RotateCw, Loader2, AlertCircle } from 'lucide-react';

interface ThumbnailGeneratorProps {
    title: string;
}

const MAX_RETRIES = 3;

function buildPollinationsUrl(title: string) {
    const prompt = `Professional blog header image: ${title}. Modern design, vibrant colors, no text overlay, photographic quality, wide format`;
    const seed = Math.floor(Math.random() * 999999);
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1280&height=720&nologo=true&safe=true&seed=${seed}`;
}

export default function ThumbnailGenerator({ title }: ThumbnailGeneratorProps) {
    const [imgSrc, setImgSrc] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [attempt, setAttempt] = useState(0);

    const generate = useCallback((retryCount = 0) => {
        setLoading(true);
        setError(false);
        setImgSrc('');
        setAttempt(retryCount);

        // Use client-side fetch to validate the image before displaying
        const url = buildPollinationsUrl(title);
        fetch(url)
            .then(res => {
                const ct = res.headers.get('content-type') ?? '';
                if (!res.ok || !ct.startsWith('image/')) throw new Error('Not an image');
                return res.blob();
            })
            .then(blob => {
                setImgSrc(URL.createObjectURL(blob));
                setLoading(false);
            })
            .catch(() => {
                if (retryCount < MAX_RETRIES - 1) {
                    // Auto-retry with a new seed
                    setTimeout(() => generate(retryCount + 1), 1500);
                } else {
                    setLoading(false);
                    setError(true);
                }
            });
    }, [title]);

    const download = () => {
        if (!imgSrc) return;
        const a = document.createElement('a');
        a.href = imgSrc;
        a.download = `${title.replace(/\s+/g, '-').toLowerCase()}-thumbnail.jpg`;
        a.click();
    };

    // ── Idle ──
    if (!loading && !imgSrc && !error) {
        return (
            <div className="mt-6 border-t border-white/5 pt-6">
                <button
                    onClick={() => generate(0)}
                    className="w-full py-4 bg-white/[0.03] hover:bg-white/[0.06] border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all group"
                >
                    <div className="w-12 h-12 rounded-full bg-purple-600/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                        <ImageIcon size={24} />
                    </div>
                    <p className="text-sm font-bold text-white">Generate Blog Thumbnail</p>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Free AI-Powered Visual</p>
                </button>
            </div>
        );
    }

    return (
        <div className="mt-6 border-t border-white/5 pt-6 space-y-3">

            {/* Loading */}
            {loading && (
                <div className="aspect-video w-full rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col items-center justify-center gap-4">
                    <Loader2 size={36} className="text-purple-500 animate-spin" />
                    <div className="text-center">
                        <p className="text-sm font-bold text-white">Generating thumbnail...</p>
                        <p className="text-[10px] text-zinc-500 mt-1">
                            {attempt > 0 ? `Retrying... (attempt ${attempt + 1}/${MAX_RETRIES})` : 'This takes ~15–30 seconds'}
                        </p>
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="aspect-video w-full rounded-2xl bg-red-500/5 border border-red-500/20 flex flex-col items-center justify-center gap-3">
                    <AlertCircle size={32} className="text-red-400" />
                    <p className="text-xs text-red-400 font-bold">Failed after {MAX_RETRIES} attempts. Try again.</p>
                    <button onClick={() => generate(0)} className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-lg transition-all flex items-center gap-2">
                        <RotateCw size={12} /> Retry
                    </button>
                </div>
            )}

            {/* Success */}
            {imgSrc && !loading && (
                <>
                    <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imgSrc} alt={`Thumbnail for ${title}`} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-1">1280 × 720px</p>
                    <div className="flex gap-2">
                        <button onClick={download} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 text-xs font-bold rounded-xl transition-all">
                            <Download size={14} /> Download Thumbnail
                        </button>
                        <button onClick={() => generate(0)} className="flex items-center justify-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-xs font-bold rounded-xl border border-white/5 transition-all">
                            <RotateCw size={14} />
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
