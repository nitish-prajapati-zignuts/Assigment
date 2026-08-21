"use client";

import { useState, useEffect } from "react";
import {
  Navbar,
  Hero,
  TrustedBy,
  Features,
  HowItWorks,
  Stats,
  Testimonials,
  FAQ,
  CTA,
  Footer,
} from "@/components/landing";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-x-hidden">
      {/* Global ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] bg-gradient-to-br from-indigo-400/8 via-violet-400/6 to-transparent rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-gradient-to-tl from-purple-400/6 via-pink-400/4 to-transparent rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-cyan-400/4 via-indigo-400/3 to-transparent rounded-full blur-[100px]" />
      </div>

      {/* Navigation */}
      <Navbar scrolled={scrolled} />

      {/* Hero Section */}
      <Hero />

      {/* Trusted By logo ticker */}
      <TrustedBy />

      {/* Features Grid */}
      <Features />

      {/* How It Works Section */}
      <HowItWorks />

      {/* Stats Counter Section */}
      <Stats />

      {/* Testimonials Review Section */}
      <Testimonials />

      {/* Frequently Asked Questions */}
      <FAQ />

      {/* Final Call to Action */}
      <CTA />

      {/* Footer component */}
      <Footer />
    </div>
  );
}
