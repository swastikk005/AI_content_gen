import Link from 'next/link';

export default function Hero() {
    return (
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 pt-20 overflow-hidden">
            {/* Mesh Background */}
            <div className="mesh-bg" />

            <div className="max-w-4xl mx-auto text-center z-10 reveal active">
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
                    Write Better Content, <br />
                    <span className="animate-gradient-text">10x Faster</span>
                </h1>

                <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                    ContentForge AI researches your topic, writes the content, and formats it perfectly — in under 60 seconds.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                    <Link
                        href="/generate"
                        className="px-8 py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-full transition-all hover:scale-105 active:scale-95"
                    >
                        Start Generating Free →
                    </Link>
                    <a
                        href="#how-it-works"
                        className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-full border border-white/10 transition-all"
                    >
                        See how it works ↓
                    </a>
                </div>

                <div className="text-sm text-zinc-500 font-medium">
                    No credit card required · Free forever plan · 500+ creators using ContentForge
                </div>
            </div>

            {/* Hero Visual Placeholder */}
            <div className="mt-20 w-full max-w-5xl mx-auto px-4 reveal active">
                <div className="aspect-video rounded-2xl bg-zinc-900/50 border border-white/5 p-2 glass-card">
                    <div className="w-full h-full rounded-xl bg-zinc-950 flex items-center justify-center overflow-hidden">
                        {/* This would be an area for a product UI showcase */}
                        <div className="text-primary/20 text-9xl font-black select-none">CONTENTFORGE</div>
                    </div>
                </div>
            </div>
        </section>
    );
}

