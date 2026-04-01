import { ContentType } from '@/types';

interface TypeSelectorProps {
    selected: ContentType;
    onChange: (type: ContentType) => void;
}

export default function TypeSelector({ selected, onChange }: TypeSelectorProps) {
    return (
        <div className="flex p-1 bg-white/5 rounded-full border border-white/10 w-fit mb-8">
            <button
                onClick={() => onChange('blog')}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${selected === 'blog'
                        ? 'bg-primary text-white shadow-[0_0_15px_rgba(124,58,237,0.4)]'
                        : 'text-zinc-400 hover:text-white'
                    }`}
            >
                Blog Post
            </button>
            <button
                onClick={() => onChange('youtube')}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${selected === 'youtube'
                        ? 'bg-primary text-white shadow-[0_0_15px_rgba(124,58,237,0.4)]'
                        : 'text-zinc-400 hover:text-white'
                    }`}
            >
                YouTube Script
            </button>
        </div>
    );
}
