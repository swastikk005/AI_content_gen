const steps = [
    {
        number: "01",
        title: "Enter your topic",
        description: "Type what you want to write about. Add tone and length preferences."
    },
    {
        number: "02",
        title: "Agent researches",
        description: "ContentForge searches the web, finds relevant info, and builds context."
    },
    {
        number: "03",
        title: "Content is generated",
        description: "Read, edit, and export your finished blog post or YouTube script."
    }
];

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24 px-4 bg-zinc-900/20">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16 reveal">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">How ContentForge Works</h2>
                    <p className="text-zinc-400">Our autonomous agent does the heavy lifting so you don't have to.</p>
                </div>

                <div className="relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-[45px] left-0 w-full h-[2px] bg-gradient-to-right from-primary/20 via-primary to-primary/20 z-0" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                        {steps.map((step, index) => (
                            <div key={index} className="flex flex-col items-center text-center reveal" style={{ transitionDelay: `${index * 200}ms` }}>
                                <div className="w-24 h-24 rounded-full bg-[#0a0a0f] border-2 border-primary flex items-center justify-center text-2xl font-black mb-6 shadow-[0_0_20px_rgba(124,58,237,0.3)]">
                                    {step.number}
                                </div>
                                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                                <p className="text-zinc-400 leading-relaxed">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

