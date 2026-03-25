'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Menu, X } from 'lucide-react';

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Features', href: '#features-section' },
        { name: 'How It Works', href: '#how-it-works-section' },
        { name: 'Pricing', href: '#pricing-section' },
    ];

    const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault();
        const element = document.querySelector(href);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
        setIsMobileMenuOpen(false);
    };

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isScrolled
                    ? 'bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/10 py-3'
                    : 'bg-transparent py-6'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-[0_0_15px_rgba(124,58,237,0.4)] group-hover:scale-110 transition-transform">
                        <Sparkles size={20} fill="currentColor" />
                    </div>
                    <span className="text-xl font-black tracking-tight text-white">
                        Content<span className="text-primary italic">Forge</span>
                    </span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            onClick={(e) => handleScrollTo(e, link.href)}
                            className="text-sm font-bold text-zinc-400 hover:text-white transition-colors"
                        >
                            {link.name}
                        </a>
                    ))}
                    <Link
                        href="/generate"
                        className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-full shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all transform hover:scale-105 active:scale-95"
                    >
                        Start Free →
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-white p-2"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-[#0a0a0f]/95 backdrop-blur-2xl border-b border-white/10 p-6 flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            onClick={(e) => handleScrollTo(e, link.href)}
                            className="text-lg font-bold text-zinc-400 hover:text-white transition-colors"
                        >
                            {link.name}
                        </a>
                    ))}
                    <Link
                        href="/generate"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="w-full py-4 bg-primary text-white text-center font-bold rounded-2xl"
                    >
                        Start Free →
                    </Link>
                </div>
            )}
        </nav>
    );
}
