'use client';

import ReactMarkdown from 'react-markdown';

interface ContentEditorProps {
    title: string;
    content: string;
    wordCount: number;
    onTitleChange: (newTitle: string) => void;
    isLoading: boolean;
}

export default function ContentEditor({ title, content, wordCount, onTitleChange, isLoading }: ContentEditorProps) {
    if (!content && !isLoading) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-12">
                <div className="w-24 h-24 rounded-3xl bg-white/[0.02] border border-white/10 flex items-center justify-center mb-6 animate-pulse">
                    <span className="text-4xl">✍️</span>
                </div>
                <h3 className="text-xl font-bold mb-2 text-white/80">Your content will appear here</h3>
                <p className="text-zinc-500 max-w-xs text-sm">Enter a topic on the left to start the AI generation process.</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="mb-8">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    placeholder="Untitled Content"
                    className="w-full bg-transparent text-3xl font-black text-white focus:outline-none placeholder:text-zinc-800"
                />
                <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    {wordCount.toLocaleString()} Words Generated
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar prose prose-invert prose-purple max-w-none">
                {isLoading ? (
                    <div className="space-y-4">
                        <div className="h-4 bg-white/5 rounded w-3/4 animate-pulse" />
                        <div className="h-4 bg-white/5 rounded w-1/2 animate-pulse" />
                        <div className="h-4 bg-white/5 rounded w-full animate-pulse" />
                        <div className="h-4 bg-white/5 rounded w-2/3 animate-pulse" />
                        <div className="h-4 bg-white/5 rounded w-5/6 animate-pulse" />
                    </div>
                ) : (
                    <ReactMarkdown>{content}</ReactMarkdown>
                )}
            </div>
        </div>
    );
}
