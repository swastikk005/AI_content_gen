'use client';

import { useState, useEffect } from 'react';
import {
    Search,
    Trash2,
    X,
    FileText,
    Video,
    Clock,
    History as HistoryIcon
} from 'lucide-react';
import { HistoryItem } from '@/types';
import { getHistory, deleteItem, clearHistory } from '@/lib/history';

interface HistoryPanelProps {
    onLoad: (item: HistoryItem) => void;
    onClose: () => void;
}

export default function HistoryPanel({ onLoad, onClose }: HistoryPanelProps) {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        setHistory(getHistory());
    }, []);

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        deleteItem(id);
        setHistory(getHistory());
    };

    const handleClear = () => {
        if (confirm("Are you sure you want to clear all history?")) {
            clearHistory();
            setHistory([]);
        }
    };

    const filteredHistory = history.filter(item =>
        item.title?.toLowerCase().includes(search.toLowerCase()) ||
        item.topic?.toLowerCase().includes(search.toLowerCase())
    );

    const formatTime = (ts: number) => {
        const diff = Date.now() - ts;
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(mins / 60);
        const days = Math.floor(hours / 24);

        if (mins < 60) return `${mins}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    return (
        <div className="flex flex-col h-full bg-[#0a0a0f] border-r border-white/10 w-80 animate-in slide-in-from-left duration-300 z-50">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <HistoryIcon className="text-primary" size={18} />
                    <h2 className="text-sm font-black uppercase tracking-widest text-white">History</h2>
                </div>
                <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                    <X size={20} />
                </button>
            </div>

            <div className="p-4 border-b border-white/5">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search generations..."
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-primary transition-all text-white"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                {filteredHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-50">
                        <Clock size={32} className="mb-4 text-zinc-700" />
                        <p className="text-xs font-bold text-zinc-500">No generations yet. Create your first piece of content!</p>
                    </div>
                ) : (
                    filteredHistory.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => onLoad(item)}
                            className="group relative p-4 rounded-xl hover:bg-white/[0.03] border border-transparent hover:border-white/5 cursor-pointer transition-all"
                        >
                            <div className="flex items-start justify-between mb-1">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${item.type === 'blog' ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'
                                    }`}>
                                    {item.type}
                                </span>
                                <span className="text-[10px] text-zinc-600 font-bold">{formatTime(item.createdAt)}</span>
                            </div>
                            <h3 className="text-xs font-bold text-white line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                                {item.title || "Untitled Content"}
                            </h3>
                            <div className="flex items-center justify-between text-[10px] text-zinc-500 font-bold">
                                <div className="flex items-center gap-1">
                                    <FileText size={10} />
                                    {item.wordCount} words
                                </div>
                                <button
                                    onClick={(e) => handleDelete(item.id, e)}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 hover:text-red-500 rounded transition-all"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {history.length > 0 && (
                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={handleClear}
                        className="w-full py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-red-500 transition-colors flex items-center justify-center gap-2"
                    >
                        <Trash2 size={12} />
                        Clear All History
                    </button>
                </div>
            )}
        </div>
    );
}
