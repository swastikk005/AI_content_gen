'use client';

import { useState, useEffect } from 'react';
import {
    Share2,
    Globe,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Settings,
    ExternalLink,
    ChevronDown,
    ChevronUp,
    Layout,
    LogOut
} from 'lucide-react';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt();

interface PublishPanelProps {
    title: string;
    content: string;
}

interface PublishHistory {
    platform: 'WordPress' | 'Medium';
    title: string;
    link: string;
    timestamp: number;
}

export default function PublishPanel({ title, content }: PublishPanelProps) {
    const [wpConfig, setWpConfig] = useState({ url: '', user: '', pass: '' });
    const [mediumToken, setMediumToken] = useState('');
    const [isWpOpen, setIsWpOpen] = useState(false);
    const [isMediumOpen, setIsMediumOpen] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [history, setHistory] = useState<PublishHistory[]>([]);
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

    useEffect(() => {
        // Load credentials
        const savedWp = localStorage.getItem('cf_wp_config');
        const savedMed = localStorage.getItem('cf_medium_token');
        const savedHist = localStorage.getItem('cf_publish_history');

        if (savedWp) setWpConfig(JSON.parse(atob(savedWp)));
        if (savedMed) setMediumToken(atob(savedMed));
        if (savedHist) setHistory(JSON.parse(savedHist));
    }, []);

    const saveWpConfig = (e: React.FormEvent) => {
        e.preventDefault();
        localStorage.setItem('cf_wp_config', btoa(JSON.stringify(wpConfig)));
        alert("WordPress credentials saved locally.");
    };

    const saveMediumToken = (e: React.FormEvent) => {
        e.preventDefault();
        localStorage.setItem('cf_medium_token', btoa(mediumToken));
        alert("Medium token saved locally.");
    };

    const disconnectWp = () => {
        localStorage.removeItem('cf_wp_config');
        setWpConfig({ url: '', user: '', pass: '' });
    };

    const disconnectMedium = () => {
        localStorage.removeItem('cf_medium_token');
        setMediumToken('');
    };

    const addToHistory = (platform: 'WordPress' | 'Medium', title: string, link: string) => {
        const newItem: PublishHistory = { platform, title, link, timestamp: Date.now() };
        const newHistory = [newItem, ...history].slice(0, 5);
        setHistory(newHistory);
        localStorage.setItem('cf_publish_history', JSON.stringify(newHistory));
    };

    const publishToWordPress = async () => {
        if (!wpConfig.url || !wpConfig.user || !wpConfig.pass) {
            setStatus({ type: 'error', msg: "Please configure WordPress settings first." });
            return;
        }
        setIsPublishing(true);
        setStatus(null);
        try {
            const auth = btoa(`${wpConfig.user}:${wpConfig.pass}`);
            const response = await fetch(`${wpConfig.url}/wp-json/wp/v2/posts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title,
                    content: md.render(content),
                    status: 'draft',
                    excerpt: content.substring(0, 150) + '...'
                })
            });

            if (!response.ok) throw new Error("WordPress publish failed. Check your URL and Application Password.");
            const data = await response.json();
            setStatus({ type: 'success', msg: `Published as draft! ID: ${data.id}` });
            addToHistory('WordPress', title, data.link);
        } catch (err: any) {
            setStatus({ type: 'error', msg: err.message });
        } finally {
            setIsPublishing(false);
        }
    };

    const publishToMedium = async () => {
        if (!mediumToken) {
            setStatus({ type: 'error', msg: "Please provide a Medium integration token." });
            return;
        }
        setIsPublishing(true);
        setStatus(null);
        try {
            // 1. Get User ID
            const meRes = await fetch('https://api.medium.com/v1/me', {
                headers: { 'Authorization': `Bearer ${mediumToken}` }
            });
            if (!meRes.ok) throw new Error("Invalid Medium token.");
            const { data: user } = await meRes.json();

            // 2. Publish
            const pubRes = await fetch(`https://api.medium.com/v1/users/${user.id}/posts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${mediumToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title,
                    contentFormat: 'markdown',
                    content,
                    publishStatus: 'draft'
                })
            });

            if (!pubRes.ok) throw new Error("Medium publish failed.");
            const { data: post } = await pubRes.json();
            setStatus({ type: 'success', msg: "Published as draft to Medium!" });
            addToHistory('Medium', title, post.url);
        } catch (err: any) {
            setStatus({ type: 'error', msg: err.message });
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                    <Share2 size={16} className="text-primary" /> Multi-Platform Publishing
                </h3>
                {status && (
                    <div className={`flex items-center gap-2 text-[10px] font-bold px-3 py-1 rounded-full ${status.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {status.type === 'success' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                        {status.msg}
                    </div>
                )}
            </div>

            <div className="space-y-3">
                {/* WordPress */}
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
                    <button
                        onClick={() => setIsWpOpen(!isWpOpen)}
                        className="w-full flex items-center justify-between p-4 hover:bg-white/[0.03] transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#21759b]/20 text-[#21759b] flex items-center justify-center">
                                <Layout size={18} />
                            </div>
                            <span className="text-sm font-bold text-white">WordPress</span>
                            {wpConfig.url && <div className="w-2 h-2 rounded-full bg-green-500" title="Configured" />}
                        </div>
                        {isWpOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>

                    {isWpOpen && (
                        <div className="p-4 pt-0 border-t border-white/5 bg-white/[0.01]">
                            <form onSubmit={saveWpConfig} className="space-y-4 pt-4">
                                <input
                                    type="url" placeholder="Site URL (e.g. https://myblog.com)"
                                    value={wpConfig.url} onChange={e => setWpConfig({ ...wpConfig, url: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs focus:border-primary focus:outline-none"
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="text" placeholder="Username"
                                        value={wpConfig.user} onChange={e => setWpConfig({ ...wpConfig, user: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs focus:border-primary focus:outline-none"
                                    />
                                    <input
                                        type="password" placeholder="App Password"
                                        value={wpConfig.pass} onChange={e => setWpConfig({ ...wpConfig, pass: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs focus:border-primary focus:outline-none"
                                    />
                                </div>
                                <div className="flex gap-2 text-[10px] text-zinc-500 items-start p-2 bg-primary/5 rounded-lg border border-primary/10">
                                    <AlertCircle size={12} className="mt-0.5" />
                                    Generate Application Passwords in WordPress Settings → Users.
                                </div>
                                <div className="flex gap-2">
                                    <button type="submit" className="flex-1 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-lg">Save Settings</button>
                                    {wpConfig.url && <button type="button" onClick={disconnectWp} className="p-2 border border-white/10 rounded-lg text-red-500 hover:bg-red-500/10"><LogOut size={14} /></button>}
                                </div>
                            </form>
                            <button
                                onClick={publishToWordPress}
                                disabled={isPublishing || !wpConfig.url}
                                className="w-full mt-4 py-3 bg-[#21759b] hover:bg-[#21759b]/90 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                            >
                                {isPublishing ? <Loader2 size={18} className="animate-spin" /> : <Globe size={18} />}
                                Publish to WordPress (Draft)
                            </button>
                        </div>
                    )}
                </div>

                {/* Medium */}
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
                    <button
                        onClick={() => setIsMediumOpen(!isMediumOpen)}
                        className="w-full flex items-center justify-between p-4 hover:bg-white/[0.03] transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center">
                                <Share2 size={18} />
                            </div>
                            <span className="text-sm font-bold text-white">Medium</span>
                            {mediumToken && <div className="w-2 h-2 rounded-full bg-green-500" title="Configured" />}
                        </div>
                        {isMediumOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>

                    {isMediumOpen && (
                        <div className="p-4 pt-0 border-t border-white/5 bg-white/[0.01]">
                            <form onSubmit={saveMediumToken} className="space-y-4 pt-4">
                                <input
                                    type="password" placeholder="Integration Token"
                                    value={mediumToken} onChange={e => setMediumToken(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs focus:border-primary focus:outline-none"
                                />
                                <div className="flex gap-2">
                                    <button type="submit" className="flex-1 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-lg">Save Token</button>
                                    {mediumToken && <button type="button" onClick={disconnectMedium} className="p-2 border border-white/10 rounded-lg text-red-500 hover:bg-red-500/10"><LogOut size={14} /></button>}
                                </div>
                            </form>
                            <button
                                onClick={publishToMedium}
                                disabled={isPublishing || !mediumToken}
                                className="w-full mt-4 py-3 bg-white text-black hover:bg-zinc-200 font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                            >
                                {isPublishing ? <Loader2 size={18} className="animate-spin" /> : <Share2 size={18} />}
                                Publish to Medium (Draft)
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {history.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Publish History</h4>
                    <div className="space-y-2">
                        {history.map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-white/[0.01] border border-white/5 rounded-xl text-xs">
                                <div className="flex items-center gap-3">
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.platform === 'WordPress' ? 'bg-[#21759b]/20 text-[#21759b]' : 'bg-white/10 text-white'}`}>
                                        {item.platform}
                                    </span>
                                    <span className="text-zinc-400 truncate max-w-[150px]">{item.title}</span>
                                </div>
                                <a href={item.link} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                                    View <ExternalLink size={12} />
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
