"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FadeUp } from "./shared";

export function CTA() {
  return (
    <section className="relative py-24 md:py-32 px-6 z-10">
      <div className="max-w-4xl mx-auto">
        <FadeUp>
          <div className="relative rounded-3xl overflow-hidden">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />

            {/* Floating shapes */}
            <div className="absolute top-6 left-8 w-20 h-20 border border-white/10 rounded-2xl rotate-12" />
            <div className="absolute bottom-8 right-12 w-16 h-16 border border-white/10 rounded-full" />
            <div className="absolute top-1/2 right-1/4 w-10 h-10 bg-white/5 rounded-lg rotate-45" />

            <div className="relative text-center p-12 md:p-16">
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
                Ready to Transform
                <br />
                Your Meetings?
              </h2>
              <p className="max-w-lg mx-auto text-sm text-indigo-100/80 leading-relaxed mb-8">
                Join teams who have eliminated meeting chaos with AI-powered summaries, action tracking, and searchable
                meeting intelligence.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-sm font-bold text-indigo-700 bg-white hover:bg-indigo-50 shadow-xl shadow-black/10 transition-all hover:-translate-y-0.5"
                >
                  Get Started Free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl text-sm font-bold text-white/90 hover:text-white border border-white/20 hover:border-white/40 transition-all"
                >
                  Sign In Instead
                </Link>
              </div>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
