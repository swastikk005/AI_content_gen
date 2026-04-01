'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ContentEditorProps {
    content: string;
    wordCount: number;
    onContentChange: (newContent: string) => void;
    isLoading: boolean;
}

export default function ContentEditor({
    content,
    wordCount,
    onContentChange,
    isLoading
}: ContentEditorProps) {

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

    const lines = content.split('\n');
    const extractedTitle = lines[0].replace(/^#+\s/, '');
    const remainingContent = lines.slice(1).join('\n');

    const handleTitleChange = (newTitle: string) => {
        const updatedContent = [`# ${newTitle}`, ...lines.slice(1)].join('\n');
        onContentChange(updatedContent);
    };

    return (
        <div className="h-full flex flex-col">
            <div className="mb-8 p-1">
                <input
                    type="text"
                    value={extractedTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Untitled Content"
                    className="w-full bg-transparent text-3xl font-black text-white focus:outline-none placeholder:text-zinc-800"
                />
                <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    {wordCount.toLocaleString()} Words Generated
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                {isLoading ? (
                    <div className="space-y-4">
                        <div className="h-4 bg-white/5 rounded w-3/4 animate-pulse" />
                        <div className="h-4 bg-white/5 rounded w-1/2 animate-pulse" />
                        <div className="h-4 bg-white/5 rounded w-full animate-pulse" />
                        <div className="h-4 bg-white/5 rounded w-2/3 animate-pulse" />
                        <div className="h-4 bg-white/5 rounded w-5/6 animate-pulse" />
                    </div>
                ) : (
                    <div className="prose prose-invert prose-purple max-w-none">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                h1: ({ children }) => <h1 className="text-2xl font-black text-white mb-4 mt-8">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-xl font-bold text-white mb-3 mt-6">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-lg font-bold text-white mb-2 mt-4">{children}</h3>,
                                p: ({ children }) => <p className="text-zinc-400 leading-relaxed mb-4">{children}</p>,
                                strong: ({ children }) => <strong className="text-white font-bold">{children}</strong>,
                                em: ({ children }) => <em className="italic text-zinc-300">{children}</em>,
                                ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-1 text-zinc-400">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-1 text-zinc-400">{children}</ol>,
                                li: ({ children }) => <li className="mb-1">{children}</li>,
                                blockquote: ({ children }) => <blockquote className="border-l-4 border-primary/50 pl-4 py-1 my-4 italic text-zinc-500 bg-white/5 rounded-r-lg">{children}</blockquote>,
                                code: ({ children }) => <code className="bg-white/10 px-1.5 py-0.5 rounded text-primary-light font-mono text-sm">{children}</code>,
                                pre: ({ children }) => <pre className="bg-[#0a0a0f] p-4 rounded-xl border border-white/10 overflow-x-auto mb-4">{children}</pre>,
                                hr: () => <hr className="border-white/10 my-8" />,
                            }}
                        >
                            {remainingContent}
                        </ReactMarkdown>
                    </div>
                )}
            </div>
        </div>
    );
}
