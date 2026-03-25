'use client';

import { useEffect } from 'react';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import Pricing from '@/components/landing/Pricing';
import Waitlist from '@/components/landing/Waitlist';
import Footer from '@/components/landing/Footer';

export default function LandingPage() {
  useEffect(() => {
    // Reveal on Scroll Logic
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    };

    const handleIntersect = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          // Once revealed, we don't need to observe it anymore
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    const elements = document.querySelectorAll('.reveal');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen">
      <Hero />
      <div id="features-section">
        <Features />
      </div>
      <div id="how-it-works-section">
        <HowItWorks />
      </div>
      <div id="pricing-section">
        <Pricing />
      </div>
      <div id="waitlist-section">
        <Waitlist />
      </div>
      <Footer />
    </main>
  );
}
