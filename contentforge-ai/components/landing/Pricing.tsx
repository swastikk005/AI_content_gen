const plans = [
    {
        name: "Free",
        price: "$0",
        description: "Perfect for trying out ContentForge",
        features: ["5 generations / day", "Blog + YouTube formats", "Basic TXT export"],
        button: "Get Started",
        popular: false
    },
    {
        name: "Pro",
        price: "$19",
        description: "For serious content creators",
        features: ["Unlimited generations", "All content formats", "Priority AI processing", "Markdown export"],
        button: "Go Pro",
        popular: true
    },
    {
        name: "Team",
        price: "$49",
        description: "For agencies and teams",
        features: ["Everything in Pro", "5 user seats", "API access", "Custom tone profiles"],
        button: "Contact Sales",
        popular: false
    }
];

export default function Pricing() {
    return (
        <section id="pricing" className="py-24 px-4 max-w-7xl mx-auto">
            <div className="text-center mb-16 reveal">
                <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold mb-6">
                    ✨ Currently in beta — all features free during beta
                </div>
                <h2 className="text-3xl md:text-5xl font-bold mb-4">Simple, transparent pricing</h2>
                <p className="text-zinc-400">Choose the plan that fits your content needs.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan, index) => (
                    <div
                        key={index}
                        className={`flex flex-col p-8 rounded-3xl glass-card reveal ${plan.popular ? 'border-primary/50 ring-1 ring-primary/20' : ''}`}
                        style={{ transitionDelay: `${index * 100}ms` }}
                    >
                        {plan.popular && (
                            <div className="text-primary text-xs font-bold uppercase tracking-widest mb-4">Most Popular</div>
                        )}
                        <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                        <div className="flex items-baseline gap-1 mb-4">
                            <span className="text-4xl font-bold">{plan.price}</span>
                            <span className="text-zinc-400">/mo</span>
                        </div>
                        <p className="text-zinc-400 text-sm mb-8">{plan.description}</p>

                        <ul className="flex-1 space-y-4 mb-8">
                            {plan.features.map((feature, fIndex) => (
                                <li key={fIndex} className="flex items-center gap-3 text-sm text-zinc-300">
                                    <span className="text-secondary">✓</span>
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <button className={`w-full py-3 rounded-xl font-bold transition-all ${plan.popular ? 'bg-primary text-white hover:bg-primary/90' : 'bg-white/5 text-white hover:bg-white/10'}`}>
                            {plan.button}
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
}

