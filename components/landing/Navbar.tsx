'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Menu, X, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
    const { data: session } = useSession();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const navLinks = [
        { name: 'Features', href: '#features-section' },
        { name: 'How It Works', href: '#how-it-works-section' },
        { name: 'Pricing', href: '#pricing-section' },
    ];

    const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (window.location.pathname === '/') {
            e.preventDefault();
            document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
        }
        setMobileOpen(false);
    };

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isScrolled ? 'bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/10 py-3' : 'bg-transparent py-6'}`}>
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.4)] group-hover:scale-110 transition-transform">
                        <Sparkles size={20} fill="currentColor" />
                    </div>
                    <span className="text-xl font-black tracking-tight">Content<span className="text-purple-400 italic">Forge</span></span>
                </Link>

                {/* Desktop nav */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map(link => (
                        <a key={link.name} href={link.href} onClick={e => handleScrollTo(e, link.href)} className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">{link.name}</a>
                    ))}

                    {session ? (
                        <div className="relative">
                            <button
                                onClick={() => setProfileOpen(p => !p)}
                                className="flex items-center gap-2.5 p-1 pr-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={session.user?.image || ''} alt={session.user?.name || 'User'} className="w-8 h-8 rounded-full border border-white/20" />
                                <span className="text-sm font-bold text-zinc-300 hidden lg:inline">{session.user?.name?.split(' ')[0]}</span>
                                <ChevronDown size={14} className={`text-zinc-500 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {profileOpen && (
                                <div className="absolute top-full right-0 mt-2 w-48 bg-[#111118] border border-white/10 rounded-2xl p-2 shadow-2xl">
                                    <div className="px-3 py-2 mb-1 border-b border-white/5">
                                        <p className="text-xs font-bold text-white truncate">{session.user?.name}</p>
                                        <p className="text-[10px] text-zinc-600 truncate">{session.user?.email}</p>
                                    </div>
                                    <Link href="/generate" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                                        <LayoutDashboard size={13} /> My Generations
                                    </Link>
                                    <button onClick={() => signOut()} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-400/10 rounded-xl transition-all">
                                        <LogOut size={13} /> Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link href="/login" className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-full shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all hover:scale-105 active:scale-95">
                            Start Free →
                        </Link>
                    )}
                </div>

                {/* Mobile toggle */}
                <button className="md:hidden text-white p-2" onClick={() => setMobileOpen(p => !p)}>
                    {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-[#0a0a0f]/95 backdrop-blur-2xl border-b border-white/10 p-6 flex flex-col gap-5">
                    {navLinks.map(link => (
                        <a key={link.name} href={link.href} onClick={e => handleScrollTo(e, link.href)} className="text-lg font-bold text-zinc-400 hover:text-white transition-colors">{link.name}</a>
                    ))}
                    {session ? (
                        <div className="pt-4 border-t border-white/10 space-y-3">
                            <div className="flex items-center gap-3">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={session.user?.image || ''} alt="User" className="w-10 h-10 rounded-full" />
                                <div>
                                    <p className="text-sm font-bold text-white">{session.user?.name}</p>
                                    <p className="text-xs text-zinc-500">{session.user?.email}</p>
                                </div>
                            </div>
                            <Link href="/generate" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 py-3 px-4 bg-white/5 text-white font-bold rounded-xl">
                                <LayoutDashboard size={16} /> My Generations
                            </Link>
                            <button onClick={() => signOut()} className="w-full flex items-center gap-3 py-3 px-4 bg-red-400/10 text-red-400 font-bold rounded-xl">
                                <LogOut size={16} /> Sign Out
                            </button>
                        </div>
                    ) : (
                        <Link href="/login" onClick={() => setMobileOpen(false)} className="py-4 bg-purple-600 text-white text-center font-bold rounded-2xl">
                            Start Free →
                        </Link>
                    )}
                </div>
            )}
        </nav>
    );
}
