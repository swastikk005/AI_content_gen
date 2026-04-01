'use client';

import { useState } from 'react';

export default function Waitlist() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        // Save to localStorage as requested
        const waitlist = JSON.parse(localStorage.getItem('contentforge_waitlist') || '[]');
        localStorage.setItem('contentforge_waitlist', JSON.stringify([...waitlist, { email, date: new Date().toISOString() }]));

        setSubmitted(true);
        setEmail('');
    };

    return (
        <section id="waitlist" className="py-24 px-4 bg-zinc-900/20">
            <div className="max-w-3xl mx-auto glass-card p-12 rounded-[2rem] text-center reveal">
                <h2 className="text-3xl md:text-5xl font-bold mb-6">Join 500+ creators <br /> on the waitlist</h2>
                <p className="text-zinc-400 mb-10 max-w-lg mx-auto leading-relaxed">
                    Be the first to know when we launch our Pro features and get an exclusive discount.
                </p>

                {submitted ? (
                    <div className="p-6 rounded-2xl bg-secondary/10 border border-secondary/20 text-secondary animate-in fade-in zoom-in duration-300">
                        <p className="font-bold text-lg mb-1">You're on the list!</p>
                        <p className="text-sm opacity-80">We'll email you when Pro launches.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                        <input
                            type="email"
                            placeholder="Enter your email address"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex-1 px-6 py-4 rounded-2xl bg-black/40 border border-white/10 focus:outline-none focus:border-primary transition-all text-white"
                        />
                        <button
                            type="submit"
                            className="px-8 py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl transition-all whitespace-nowrap"
                        >
                            Join Waitlist
                        </button>
                    </form>
                )}
            </div>
        </section>
    );
}

