// lib/history.ts — localStorage content history

export interface HistoryItem {
    id: string;
    topic: string;
    type: 'blog' | 'youtube';
    title: string;
    content: string;
    wordCount: number;
    tone: string;
    createdAt: number;
}

const KEY = 'contentforge_history';
const MAX_ITEMS = 50;

export function saveGeneration(item: Omit<HistoryItem, 'id' | 'createdAt'>): void {
    if (typeof window === 'undefined') return;
    const history = getHistory();
    const newItem: HistoryItem = { ...item, id: Date.now().toString(), createdAt: Date.now() };
    const updated = [newItem, ...history].slice(0, MAX_ITEMS);
    localStorage.setItem(KEY, JSON.stringify(updated));
}

export function getHistory(): HistoryItem[] {
    if (typeof window === 'undefined') return [];
    try {
        return JSON.parse(localStorage.getItem(KEY) || '[]');
    } catch {
        return [];
    }
}

export function deleteItem(id: string): void {
    if (typeof window === 'undefined') return;
    const updated = getHistory().filter(h => h.id !== id);
    localStorage.setItem(KEY, JSON.stringify(updated));
}

export function clearHistory(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(KEY);
}

export function relativeTime(ts: number): string {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (mins < 2) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
}
