import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="py-16 px-4 border-t border-white/5 bg-[#0a0a0f]">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex flex-col items-center md:items-start">
                    <div className="text-2xl font-black mb-2 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm">C</span>
                        ContentForge AI
                    </div>
                    <p className="text-zinc-500 text-sm">Scale your content production with autonomous AI agents.</p>
                </div>

                <div className="flex gap-8 text-sm font-medium text-zinc-400">
                    <a href="#features" className="hover:text-white transition-colors">Features</a>
                    <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
                    <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Twitter</a>
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
                </div>

                <div className="text-zinc-500 text-sm">
                    Built by <span className="text-zinc-300 font-medium">Swastik</span>
                </div>
            </div>

            <div className="mt-12 text-center text-zinc-600 text-xs">
                © {new Date().getFullYear()} ContentForge AI. All rights reserved.
            </div>
        </footer>
    );
}

