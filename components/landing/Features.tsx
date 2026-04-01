const features = [
    {
        icon: "🔍",
        title: "AI Research Agent",
        description: "Automatically searches the web and gathers the latest information on your topic before writing"
    },
    {
        icon: "✍️",
        title: "Blog Post Generator",
        description: "Full SEO-optimised articles with intro, sections, conclusion and meta description"
    },
    {
        icon: "🎬",
        title: "YouTube Script Writer",
        description: "Hook, main content, CTAs and timestamps — ready to record"
    },
    {
        icon: "⚡",
        title: "Done in 60 Seconds",
        description: "From topic to finished content in under a minute. No prompting skills needed"
    },
    {
        icon: "🎯",
        title: "Tone & Style Control",
        description: "Professional, casual, humorous, educational — write in any voice"
    },
    {
        icon: "📤",
        title: "Export Anywhere",
        description: "Copy as markdown, download as .txt, or paste directly into your CMS"
    }
];

export default function Features() {
    return (
        <section id="features" className="py-24 px-4 max-w-7xl mx-auto">
            <div className="text-center mb-16 reveal">
                <h2 className="text-3xl md:text-5xl font-bold mb-4">Everything you need to <br /> scale content production</h2>
                <p className="text-zinc-400 max-w-2xl mx-auto">Stop staring at blank pages. ContentForge handles everything from research to final formatting.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                    <div
                        key={index}
                        className="glass-card p-8 rounded-2xl reveal"
                        style={{ transitionDelay: `${index * 100}ms` }}
                    >
                        <div className="text-4xl mb-6">{feature.icon}</div>
                        <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                        <p className="text-zinc-400 leading-relaxed">{feature.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

