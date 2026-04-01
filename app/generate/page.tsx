'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Sparkles, Loader2, Copy, Download, Share2, RefreshCw, CheckCircle2, Circle, ChevronDown, ChevronUp, ShieldCheck, Zap, Clock, Trash2, Search, X, Eye, EyeOff, ExternalLink, Globe } from 'lucide-react';
import { saveGeneration, getHistory, deleteItem, clearHistory, relativeTime, type HistoryItem } from '@/lib/history';
import ThumbnailGenerator from '@/components/generator/ThumbnailGenerator';

type ContentType = 'blog' | 'youtube';
type TabType = 'editor' | 'seo' | 'publish';

interface AgentStep { id: string; label: string; emoji: string; status: 'pending' | 'active' | 'done'; }
interface GenerationResult { title: string; content: string; outline: string[]; wordCount: number; research: string; }
interface OriginalityResult { score: number; rating: string; issues: string[]; suggestions: string[]; }
interface SeoIssue { type: string; message: string; }
interface SeoResult { score: number; titleScore: number; readabilityScore: number; keywordDensity: number; suggestedKeywords: string[]; primaryKeyword: string; metaDescription: string; issues: SeoIssue[]; suggestions: string[]; }

const STEPS: AgentStep[] = [
  { id: 'research', label: 'Researching topic', emoji: '🔍', status: 'pending' },
  { id: 'outline', label: 'Creating outline', emoji: '📋', status: 'pending' },
  { id: 'generate', label: 'Writing content', emoji: '✍️', status: 'pending' },
];

const REPURPOSE_TYPES = [
  { id: 'twitter', icon: '🐦', label: 'Twitter/X Thread' },
  { id: 'linkedin', icon: '💼', label: 'LinkedIn Post' },
  { id: 'email', icon: '📧', label: 'Email Newsletter' },
  { id: 'instagram', icon: '📱', label: 'Instagram Caption' },
  { id: 'shortscript', icon: '🎬', label: '60-Second Script' },
];

function scoreColor(s: number) { return s >= 80 ? 'text-green-400' : s >= 60 ? 'text-yellow-400' : s >= 40 ? 'text-orange-400' : 'text-red-400'; }
function scoreBg(s: number) { return s >= 80 ? 'bg-green-500' : s >= 60 ? 'bg-yellow-500' : s >= 40 ? 'bg-orange-500' : 'bg-red-500'; }

export default function GeneratorPage() {
  // ── Auth (hooks ALWAYS first) ──
  const { data: session, status } = useSession();
  const router = useRouter();
  useEffect(() => { if (status === 'unauthenticated') router.push('/login'); }, [status, router]);

  // ── Input state ──
  const [topic, setTopic] = useState('');
  const [type, setType] = useState<ContentType>('blog');
  const [tone, setTone] = useState('Professional');
  const [length, setLength] = useState('medium');

  // ── Generation state ──
  const [isGenerating, setIsGenerating] = useState(false);
  const [steps, setSteps] = useState<AgentStep[]>(STEPS);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('editor');
  const [copied, setCopied] = useState(false);

  // ── Originality ──
  const [originResult, setOriginResult] = useState<OriginalityResult | null>(null);
  const [originLoading, setOriginLoading] = useState(false);
  const [originImproving, setOriginImproving] = useState(false);

  // ── SEO ──
  const [seoResult, setSeoResult] = useState<SeoResult | null>(null);
  const [seoLoading, setSeoLoading] = useState(false);
  const [seoFixing, setSeoFixing] = useState(false);

  // ── Repurpose ──
  const [repurposeOpen, setRepurposeOpen] = useState(false);
  const [repurposeResults, setRepurposeResults] = useState<Record<string, string>>({});
  const [repurposeLoading, setRepurposeLoading] = useState<Record<string, boolean>>({});
  const [repurseCopied, setRepurseCopied] = useState<Record<string, boolean>>({});

  // ── History ──
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historySearch, setHistorySearch] = useState('');

  // ── Publish ──
  const [wpUrl, setWpUrl] = useState('');
  const [wpUser, setWpUser] = useState('');
  const [wpPass, setWpPass] = useState('');
  const [showWpPass, setShowWpPass] = useState(false);
  const [medToken, setMedToken] = useState('');
  const [showMedToken, setShowMedToken] = useState(false);
  const [publishStatus, setPublishStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [publishing, setPublishing] = useState(false);

  // ── Load localStorage ──
  useEffect(() => {
    setHistory(getHistory());
    try {
      const wc = localStorage.getItem('cf_wp');
      if (wc) { const p = JSON.parse(atob(wc)); setWpUrl(p.url); setWpUser(p.user); setWpPass(p.pass); }
      const mt = localStorage.getItem('cf_med');
      if (mt) setMedToken(atob(mt));
    } catch { /* ignore */ }
  }, []);

  // ── Auth early returns (AFTER all hooks) ──
  if (status === 'loading') {
    return (
      <div className="h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-purple-500" size={40} />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400 animate-pulse">Initialising ContentForge...</p>
        </div>
      </div>
    );
  }
  if (!session) return null;

  // ── Helpers ──
  const setStep = (id: string, s: AgentStep['status']) =>
    setSteps(prev => prev.map(x => x.id === id ? { ...x, status: s } : x));

  // ── Generate ──
  const handleGenerate = async () => {
    if (!topic.trim() || isGenerating) return;
    setIsGenerating(true); setError(null); setResult(null);
    setOriginResult(null); setSeoResult(null); setSteps(STEPS);

    setTimeout(() => setStep('research', 'active'), 100);
    setTimeout(() => { setStep('research', 'done'); setStep('outline', 'active'); }, 2000);
    setTimeout(() => { setStep('outline', 'done'); setStep('generate', 'active'); }, 4000);

    try {
      const res = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ topic, type, tone, length }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setStep('generate', 'done');
      setResult(data);
      setActiveTab('editor');
      saveGeneration({ topic, type, tone, title: data.title, content: data.content, wordCount: data.wordCount });
      setHistory(getHistory());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setSteps(STEPS);
    } finally { setIsGenerating(false); }
  };

  // ── Originality ──
  const handleOriginality = async () => {
    if (!result) return;
    setOriginLoading(true);
    try {
      const res = await fetch('/api/analyse', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'originality', content: result.content }) });
      setOriginResult(await res.json());
    } catch { setOriginResult({ score: 75, rating: 'Good', issues: ['Could not parse analysis'], suggestions: [] }); }
    finally { setOriginLoading(false); }
  };

  const handleImproveOriginality = async () => {
    if (!result) return;
    setOriginImproving(true);
    try {
      const res = await fetch('/api/analyse', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'improve', content: result.content }) });
      const data = await res.json();
      if (data.improvedContent) setResult(prev => prev ? { ...prev, content: data.improvedContent } : null);
    } catch { /* ignore */ } finally { setOriginImproving(false); }
  };

  // ── SEO ──
  const handleSEO = async () => {
    if (!result) return;
    setSeoLoading(true);
    try {
      const res = await fetch('/api/analyse', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'seo', title: result.title, content: result.content }) });
      setSeoResult(await res.json());
    } catch { /* ignore */ } finally { setSeoLoading(false); }
  };

  const handleSeoFix = async () => {
    if (!result) return;
    setSeoFixing(true);
    try {
      const res = await fetch('/api/analyse', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'seofix', title: result.title, content: result.content }) });
      const data = await res.json();
      if (data.improvedContent) { setResult(prev => prev ? { ...prev, content: data.improvedContent } : null); setActiveTab('editor'); }
    } catch { /* ignore */ } finally { setSeoFixing(false); }
  };

  // ── Repurpose ──
  const handleRepurpose = async (repType: string) => {
    if (!result) return;
    setRepurposeLoading(p => ({ ...p, [repType]: true }));
    try {
      const res = await fetch('/api/repurpose', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: repType, content: result.content, title: result.title }) });
      const data = await res.json();
      setRepurposeResults(p => ({ ...p, [repType]: data.result || data.error || 'Failed' }));
    } catch { setRepurposeResults(p => ({ ...p, [repType]: 'Failed to generate.' })); }
    finally { setRepurposeLoading(p => ({ ...p, [repType]: false })); }
  };

  const copyRepurpose = (id: string) => {
    navigator.clipboard.writeText(repurposeResults[id]);
    setRepurseCopied(p => ({ ...p, [id]: true }));
    setTimeout(() => setRepurseCopied(p => ({ ...p, [id]: false })), 2000);
  };

  // ── History ──
  const handleDeleteHistory = (id: string, e: React.MouseEvent) => { e.stopPropagation(); deleteItem(id); setHistory(getHistory()); };
  const handleClearHistory = () => { if (confirm('Clear all history?')) { clearHistory(); setHistory([]); } };
  const handleLoadHistory = (item: HistoryItem) => {
    setTopic(item.topic); setType(item.type); setTone(item.tone);
    setResult({ title: item.title, content: item.content, wordCount: item.wordCount, outline: [], research: '' });
    setHistoryOpen(false); setActiveTab('editor');
  };
  const filteredHistory = history.filter(h => h.title.toLowerCase().includes(historySearch.toLowerCase()) || h.topic.toLowerCase().includes(historySearch.toLowerCase()));

  // ── Publish ──
  const saveWpCreds = () => { localStorage.setItem('cf_wp', btoa(JSON.stringify({ url: wpUrl, user: wpUser, pass: wpPass }))); alert('Saved!'); };
  const saveMedCreds = () => { localStorage.setItem('cf_med', btoa(medToken)); alert('Saved!'); };

  const publishWordPress = async () => {
    if (!result || !wpUrl || !wpUser || !wpPass) { setPublishStatus({ ok: false, msg: 'Configure credentials first.' }); return; }
    setPublishing(true); setPublishStatus(null);
    try {
      const res = await fetch(`${wpUrl}/wp-json/wp/v2/posts`, { method: 'POST', headers: { 'Authorization': `Basic ${btoa(`${wpUser}:${wpPass}`)}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ title: result.title, content: result.content, status: 'draft' }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      setPublishStatus({ ok: true, msg: `Draft created! ${data.link || ''}` });
    } catch (e) { setPublishStatus({ ok: false, msg: e instanceof Error ? e.message : 'Failed' }); }
    finally { setPublishing(false); }
  };

  const publishMedium = async () => {
    if (!result || !medToken) { setPublishStatus({ ok: false, msg: 'Configure token first.' }); return; }
    setPublishing(true); setPublishStatus(null);
    try {
      const meRes = await fetch('https://api.medium.com/v1/me', { headers: { 'Authorization': `Bearer ${medToken}` } });
      if (!meRes.ok) throw new Error('Invalid token');
      const { data: user } = await meRes.json();
      const postRes = await fetch(`https://api.medium.com/v1/users/${user.id}/posts`, { method: 'POST', headers: { 'Authorization': `Bearer ${medToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ title: result.title, contentFormat: 'markdown', content: result.content, publishStatus: 'draft' }) });
      const { data: post } = await postRes.json();
      setPublishStatus({ ok: true, msg: `Draft on Medium! ${post?.url || ''}` });
    } catch (e) { setPublishStatus({ ok: false, msg: e instanceof Error ? e.message : 'Failed' }); }
    finally { setPublishing(false); }
  };

  // ── Copy/Download/Share ──
  const handleCopy = () => { if (!result) return; navigator.clipboard.writeText(result.content); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const handleDownload = (fmt: 'md' | 'txt') => {
    if (!result) return;
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([result.content], { type: 'text/plain' }));
    a.download = `${result.title.replace(/\s+/g, '-').toLowerCase()}.${fmt}`; a.click();
  };
  const handleShare = () => { if (!result) return; navigator.clipboard.writeText(window.location.href); alert('Link copied!'); };

  const displayTitle = result ? (result.content.split('\n').find(l => l.startsWith('#')) || '').replace(/^#+\s*/, '') || result.title : '';
  const bodyContent = result ? result.content.split('\n').filter(l => !l.startsWith('# ')).join('\n').replace(/---META---[\s\S]*$/, '').trim() : '';

  return (
    <div className="flex h-screen bg-[#0a0a0f] text-white overflow-hidden pt-16">

      {/* ── HISTORY SIDEBAR ── */}
      {historyOpen && (
        <aside className="w-72 min-w-72 bg-[#0a0a0f] border-r border-white/[0.07] flex flex-col overflow-hidden z-10">
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-zinc-400">History</span>
            <button onClick={() => setHistoryOpen(false)} className="text-zinc-600 hover:text-white transition-colors"><X size={16} /></button>
          </div>
          <div className="p-3 border-b border-white/5">
            <div className="relative">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
              <input value={historySearch} onChange={e => setHistorySearch(e.target.value)} placeholder="Search..." className="w-full pl-8 pr-3 py-2 bg-white/[0.03] border border-white/10 rounded-lg text-xs text-white placeholder:text-zinc-700 focus:outline-none focus:border-purple-500" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredHistory.length === 0 ? (
              <div className="text-center py-12 text-zinc-700 text-xs">No generations yet</div>
            ) : filteredHistory.map(item => (
              <div key={item.id} onClick={() => handleLoadHistory(item)} className="group p-3 rounded-xl hover:bg-white/[0.04] cursor-pointer border border-transparent hover:border-white/5 transition-all relative">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${item.type === 'blog' ? 'bg-purple-500/20 text-purple-400' : 'bg-cyan-500/20 text-cyan-400'}`}>{item.type}</span>
                  <span className="text-[10px] text-zinc-600 ml-auto">{relativeTime(item.createdAt)}</span>
                </div>
                <p className="text-xs text-white font-bold truncate">{item.title}</p>
                <p className="text-[10px] text-zinc-600 truncate mt-0.5">{item.topic}</p>
                <p className="text-[10px] text-zinc-700 mt-1">{item.wordCount.toLocaleString()} words</p>
                <button onClick={e => handleDeleteHistory(item.id, e)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-400 rounded text-zinc-600 transition-all"><Trash2 size={12} /></button>
              </div>
            ))}
          </div>
          {history.length > 0 && (
            <div className="p-3 border-t border-white/5">
              <button onClick={handleClearHistory} className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-red-400/50 hover:text-red-400 transition-colors flex items-center justify-center gap-2"><Trash2 size={10} /> Clear All</button>
            </div>
          )}
        </aside>
      )}

      {/* ── LEFT PANEL ── */}
      <aside className="w-[380px] min-w-[380px] border-r border-white/5 flex flex-col overflow-y-auto bg-[#0a0a0f]">
        <div className="p-6 pb-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center"><Sparkles size={16} fill="currentColor" /></div>
            <span className="font-black tracking-tight">ContentForge <span className="text-purple-400 italic">AI</span></span>
          </div>
          <button onClick={() => setHistoryOpen(p => !p)} title="History" className={`p-2 rounded-lg transition-all ${historyOpen ? 'bg-purple-600/20 text-purple-400' : 'text-zinc-600 hover:text-white hover:bg-white/5'}`}><Clock size={16} /></button>
        </div>

        <div className="flex-1 p-6 space-y-5">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">Type</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-white/[0.03] rounded-xl border border-white/5">
              {(['blog', 'youtube'] as ContentType[]).map(t => (
                <button key={t} onClick={() => setType(t)} className={`py-2 text-xs font-black rounded-lg transition-all ${type === t ? 'bg-purple-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}>
                  {t === 'blog' ? '📝 Blog Post' : '🎬 YouTube Script'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">Topic</label>
            <textarea value={topic} onChange={e => setTopic(e.target.value)} placeholder="What do you want to write about?" rows={4} className="w-full p-4 rounded-2xl bg-white/[0.03] border border-white/10 focus:outline-none focus:border-purple-500 transition-all text-sm text-white placeholder:text-zinc-700 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">Tone</label>
              <select value={tone} onChange={e => setTone(e.target.value)} className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/10 focus:outline-none focus:border-purple-500 text-sm text-white cursor-pointer appearance-none">
                {['Professional', 'Casual', 'Educational', 'Humorous', 'Persuasive'].map(t => <option key={t} className="bg-[#111118]">{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">Length</label>
              <select value={length} onChange={e => setLength(e.target.value)} className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/10 focus:outline-none focus:border-purple-500 text-sm text-white cursor-pointer appearance-none">
                <option value="short" className="bg-[#111118]">Short (~800w)</option>
                <option value="medium" className="bg-[#111118]">Medium (~1500w)</option>
                <option value="long" className="bg-[#111118]">Long (~2500w)</option>
              </select>
            </div>
          </div>

          <button onClick={handleGenerate} disabled={isGenerating || !topic.trim()} className="w-full py-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-900/30 hover:scale-[1.02] active:scale-[0.98] text-sm">
            {isGenerating ? <><Loader2 size={18} className="animate-spin" /> Generating...</> : <><span>✦</span> Generate Content</>}
          </button>

          {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">⚠️ {error} <button onClick={handleGenerate} className="ml-2 underline font-bold">Retry</button></div>}

          {isGenerating && (
            <div className="space-y-3 pt-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Agent Progress</p>
              {steps.map(s => (
                <div key={s.id} className="flex items-center gap-3 text-sm">
                  {s.status === 'done' ? <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" /> : s.status === 'active' ? <div className="w-4 h-4 rounded-full bg-purple-500 flex-shrink-0 animate-pulse" /> : <Circle size={16} className="text-zinc-700 flex-shrink-0" />}
                  <span className={s.status === 'active' ? 'text-white font-bold' : s.status === 'done' ? 'text-green-400' : 'text-zinc-600'}>{s.emoji} {s.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* ── RIGHT PANEL ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center gap-6 px-8 border-b border-white/5 bg-[#0a0a0f] flex-shrink-0">
          {(['editor', 'seo', 'publish'] as TabType[]).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`py-5 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === tab ? 'border-purple-500 text-white' : 'border-transparent text-zinc-600 hover:text-zinc-400'}`}>
              {tab === 'editor' ? 'Content Editor' : tab === 'seo' ? 'SEO Analysis' : 'Publish'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">

          {/* ── EDITOR TAB ── */}
          {activeTab === 'editor' && (
            result ? (
              <div className="max-w-3xl mx-auto px-8 py-10">
                <h1 className="text-3xl font-black text-white leading-tight mb-2">{displayTitle}</h1>
                <div className="flex items-center gap-2 mb-8">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">{result.wordCount.toLocaleString()} Words Generated</span>
                </div>

                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                    h1: ({ children }) => <h1 className="text-3xl font-bold text-white mb-4 mt-8">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-xl font-bold text-white mt-8 mb-3">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-lg font-bold text-white mt-6 mb-2">{children}</h3>,
                    p: ({ children }) => <p className="text-gray-300 leading-relaxed mb-4">{children}</p>,
                    strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                    em: ({ children }) => <em className="italic text-zinc-300">{children}</em>,
                    ul: ({ children }) => <ul className="text-gray-300 mb-4 list-disc list-inside space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="text-gray-300 mb-4 list-decimal list-inside space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                    blockquote: ({ children }) => <blockquote className="border-l-4 border-purple-500/50 pl-4 py-1 my-4 text-zinc-400 italic bg-white/5 rounded-r-lg">{children}</blockquote>,
                    code: ({ children }) => <code className="bg-gray-800 text-purple-300 px-1.5 py-0.5 rounded font-mono text-sm">{children}</code>,
                    pre: ({ children }) => <pre className="bg-[#0a0a0f] p-4 rounded-xl border border-white/10 overflow-x-auto mb-4">{children}</pre>,
                    hr: () => <hr className="border-white/10 my-8" />,
                  }}>{bodyContent}</ReactMarkdown>
                </div>

                {/* Export Bar */}
                <div className="mt-10 pt-6 border-t border-white/5 flex flex-wrap gap-2">
                  <button onClick={handleCopy} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-all">
                    {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}{copied ? 'Copied!' : 'Copy to Clipboard'}
                  </button>
                  <button onClick={() => handleDownload('md')} className="px-3 py-2.5 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl border border-white/5 text-[10px] font-black transition-all">MD</button>
                  <button onClick={() => handleDownload('txt')} className="p-2.5 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl border border-white/5 transition-all"><Download size={16} /></button>
                  <button onClick={handleShare} className="p-2.5 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl border border-white/5 transition-all"><Share2 size={16} /></button>
                  <button onClick={handleGenerate} disabled={isGenerating} className="p-2.5 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl border border-white/5 transition-all"><RefreshCw size={16} /></button>
                </div>

                {/* Repurpose */}
                <div className="mt-4">
                  <button onClick={() => setRepurposeOpen(p => !p)} className="w-full py-3 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all border border-cyan-500/20">
                    <Zap size={14} fill="currentColor" /> Repurpose for Social Media {repurposeOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {repurposeOpen && (
                    <div className="mt-3 grid grid-cols-1 gap-3">
                      {REPURPOSE_TYPES.map(rt => (
                        <div key={rt.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3"><span className="text-xl">{rt.icon}</span><span className="text-sm font-bold text-white">{rt.label}</span></div>
                            {!repurposeResults[rt.id] && (
                              <button onClick={() => handleRepurpose(rt.id)} disabled={repurposeLoading[rt.id]} className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all">
                                {repurposeLoading[rt.id] ? <Loader2 size={12} className="animate-spin" /> : 'Generate'}
                              </button>
                            )}
                          </div>
                          {repurposeResults[rt.id] && (
                            <div className="relative">
                              <textarea readOnly value={repurposeResults[rt.id]} className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-zinc-400 resize-none focus:outline-none" />
                              <div className="flex items-center justify-between mt-2 text-[10px] text-zinc-600 font-bold">
                                <span>{repurposeResults[rt.id].length} chars</span>
                                <div className="flex gap-2">
                                  <button onClick={() => copyRepurpose(rt.id)} className="hover:text-purple-400 transition-colors">{repurseCopied[rt.id] ? '✓ Copied' : 'Copy'}</button>
                                  <button onClick={() => handleRepurpose(rt.id)} className="hover:text-purple-400 transition-colors">Regenerate</button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── THUMBNAIL (standalone component) ── */}
                <ThumbnailGenerator title={result.title} />

                {/* Originality */}
                <div className="mt-4 p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-900/30 flex items-center justify-center"><ShieldCheck size={16} className="text-green-400" /></div>
                      <div><p className="text-xs font-bold text-white">Originality Checker</p><p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">AI-based analysis</p></div>
                    </div>
                    <button onClick={handleOriginality} disabled={originLoading} className="px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all">
                      {originLoading ? <Loader2 size={12} className="animate-spin" /> : originResult ? 'Re-check' : 'Check'}
                    </button>
                  </div>
                  {originResult && (
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-full border-4 ${scoreBg(originResult.score)}/30 border-current ${scoreColor(originResult.score)} flex items-center justify-center`}>
                          <span className={`text-2xl font-black ${scoreColor(originResult.score)}`}>{originResult.score}</span>
                        </div>
                        <div><p className={`text-lg font-black ${scoreColor(originResult.score)}`}>{originResult.rating}</p><p className="text-xs text-zinc-500">Originality Score</p></div>
                      </div>
                      {originResult.issues.length > 0 && <div className="space-y-1">{originResult.issues.map((issue, i) => <div key={i} className="flex gap-2 text-xs text-zinc-400"><span>⚠️</span>{issue}</div>)}</div>}
                      {originResult.suggestions.length > 0 && <div className="space-y-1">{originResult.suggestions.map((s, i) => <div key={i} className="flex gap-2 text-xs text-zinc-400"><span>💡</span>{s}</div>)}</div>}
                      <button onClick={handleImproveOriginality} disabled={originImproving} className="w-full py-2.5 bg-green-600/20 hover:bg-green-600/30 text-green-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2">
                        {originImproving ? <><Loader2 size={12} className="animate-spin" /> Improving...</> : '✨ Improve Content'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12">
                <div className="w-20 h-20 rounded-3xl bg-white/[0.02] border border-white/10 flex items-center justify-center mb-6"><span className="text-3xl text-purple-400 font-black">✦</span></div>
                <h3 className="text-xl font-black text-white mb-3">Your content will appear here</h3>
                <p className="text-zinc-600 text-sm max-w-xs">Enter a topic and click <span className="text-zinc-400 font-bold">Generate Content</span> to begin</p>
              </div>
            )
          )}

          {/* ── SEO TAB ── */}
          {activeTab === 'seo' && (
            <div className="max-w-3xl mx-auto px-8 py-10">
              {result ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-white">SEO Analysis</h2>
                    <button onClick={handleSEO} disabled={seoLoading} className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2">
                      {seoLoading ? <><Loader2 size={14} className="animate-spin" /> Analysing...</> : '🔍 Run SEO Analysis'}
                    </button>
                  </div>
                  {seoResult ? (
                    <>
                      <div className="flex items-center gap-6 p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                        <div className={`w-20 h-20 rounded-full border-4 ${scoreBg(seoResult.score)}/20 flex items-center justify-center`}>
                          <span className={`text-3xl font-black ${scoreColor(seoResult.score)}`}>{seoResult.score}</span>
                        </div>
                        <div className="flex-1 space-y-3">
                          {([['Title', seoResult.titleScore], ['Readability', seoResult.readabilityScore], ['Keyword Density', Math.min(100, seoResult.keywordDensity * 20)]] as [string, number][]).map(([label, val]) => (
                            <div key={label}>
                              <div className="flex justify-between text-[10px] font-bold text-zinc-500 mb-1"><span className="uppercase tracking-widest">{label}</span><span className={scoreColor(val)}>{label === 'Keyword Density' ? `${seoResult.keywordDensity}%` : val}</span></div>
                              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden"><div className={`h-full ${scoreBg(val)} transition-all duration-700`} style={{ width: `${val}%` }} /></div>
                            </div>
                          ))}
                        </div>
                      </div>
                      {seoResult.primaryKeyword && <div><p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Primary Keyword</p><button onClick={() => navigator.clipboard.writeText(seoResult.primaryKeyword)} className="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg text-xs font-bold hover:bg-purple-500/30 transition-all">{seoResult.primaryKeyword}</button></div>}
                      {seoResult.suggestedKeywords.length > 0 && <div><p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Suggested Keywords</p><div className="flex flex-wrap gap-2">{seoResult.suggestedKeywords.map(kw => <button key={kw} onClick={() => navigator.clipboard.writeText(kw)} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-lg text-xs transition-all border border-white/5">{kw}</button>)}</div></div>}
                      {seoResult.metaDescription && <div><p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Meta Description</p><div className="flex gap-2 p-3 bg-white/[0.02] border border-white/5 rounded-xl"><p className="flex-1 text-xs text-zinc-400">{seoResult.metaDescription}</p><button onClick={() => navigator.clipboard.writeText(seoResult.metaDescription)} className="p-1.5 hover:text-purple-400 text-zinc-600 flex-shrink-0"><Copy size={12} /></button></div></div>}
                      {seoResult.issues.length > 0 && <div className="space-y-2">{seoResult.issues.map((issue, i) => <div key={i} className={`flex items-start gap-2 p-3 rounded-xl text-xs ${issue.type === 'error' ? 'bg-red-500/10 border border-red-500/20 text-red-400' : issue.type === 'warning' ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400' : 'bg-blue-500/10 border border-blue-500/20 text-blue-400'}`}><span>{issue.type === 'error' ? '🔴' : issue.type === 'warning' ? '🟡' : '🔵'}</span>{issue.message}</div>)}</div>}
                      <button onClick={handleSeoFix} disabled={seoFixing} className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2">
                        {seoFixing ? <><Loader2 size={14} className="animate-spin" /> Auto-Fixing...</> : '⚡ Auto-Fix SEO'}
                      </button>
                    </>
                  ) : <div className="text-center py-16 text-zinc-600 text-sm">Click "Run SEO Analysis" to get detailed SEO insights.</div>}
                </div>
              ) : <div className="h-64 flex items-center justify-center text-zinc-600 text-sm">Generate content first.</div>}
            </div>
          )}

          {/* ── PUBLISH TAB ── */}
          {activeTab === 'publish' && (
            <div className="max-w-3xl mx-auto px-8 py-10 space-y-6">
              <h2 className="text-xl font-black text-white">Publish</h2>
              {publishStatus && <div className={`p-4 rounded-xl text-xs font-bold border flex items-center gap-2 ${publishStatus.ok ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>{publishStatus.ok ? '✅' : '⚠️'} {publishStatus.msg} {publishStatus.ok && publishStatus.msg.includes('http') && <a href={publishStatus.msg.split(' ').pop()} target="_blank" rel="noreferrer" className="ml-auto"><ExternalLink size={12} /></a>}</div>}
              <div className="p-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-bold">⚠️ Both platforms publish as DRAFT — review before making public.</div>

              {/* WordPress */}
              <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                <div className="flex items-center gap-3 mb-4"><div className="w-8 h-8 rounded-lg bg-blue-900/30 flex items-center justify-center"><Globe size={16} className="text-blue-400" /></div><span className="font-bold text-white">WordPress</span></div>
                <input value={wpUrl} onChange={e => setWpUrl(e.target.value)} placeholder="Site URL (https://myblog.com)" className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-zinc-700 focus:outline-none focus:border-purple-500" />
                <input value={wpUser} onChange={e => setWpUser(e.target.value)} placeholder="Username" className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-zinc-700 focus:outline-none focus:border-purple-500" />
                <div className="relative"><input type={showWpPass ? 'text' : 'password'} value={wpPass} onChange={e => setWpPass(e.target.value)} placeholder="Application Password" className="w-full p-3 pr-10 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-zinc-700 focus:outline-none focus:border-purple-500" /><button onClick={() => setShowWpPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400">{showWpPass ? <EyeOff size={14} /> : <Eye size={14} />}</button></div>
                <div className="flex gap-2">
                  <button onClick={saveWpCreds} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl transition-all">Save</button>
                  <button onClick={publishWordPress} disabled={publishing || !result} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2">{publishing ? <Loader2 size={14} className="animate-spin" /> : null} Publish Draft</button>
                </div>
              </div>

              {/* Medium */}
              <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-4">
                <div className="flex items-center gap-3 mb-4"><div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"><span className="text-white font-black text-xs">M</span></div><span className="font-bold text-white">Medium</span></div>
                <div className="relative"><input type={showMedToken ? 'text' : 'password'} value={medToken} onChange={e => setMedToken(e.target.value)} placeholder="Integration Token (Medium → Settings → Security)" className="w-full p-3 pr-10 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-zinc-700 focus:outline-none focus:border-purple-500" /><button onClick={() => setShowMedToken(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400">{showMedToken ? <EyeOff size={14} /> : <Eye size={14} />}</button></div>
                <div className="flex gap-2">
                  <button onClick={saveMedCreds} className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl transition-all">Save</button>
                  <button onClick={publishMedium} disabled={publishing || !result} className="flex-1 py-2.5 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2">{publishing ? <Loader2 size={14} className="animate-spin" /> : null} Publish Draft</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
