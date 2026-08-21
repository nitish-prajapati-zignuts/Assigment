"use client";

import { Star } from "lucide-react";
import { FadeUp, SectionBadge } from "./shared";

const testimonials = [
  {
    quote:
      "Syncra completely transformed how our engineering team handles standup notes. We went from 30-minute recap sessions to instant AI summaries.",
    author: "Sarah Chen",
    role: "VP Engineering, TechFlow",
    avatar: "SC",
  },
  {
    quote:
      "The action item tracker is a game-changer. Tasks are auto-extracted with owners and deadlines — nothing falls through the cracks anymore.",
    author: "Marcus Rivera",
    role: "Product Director, Nexus Labs",
    avatar: "MR",
  },
  {
    quote:
      "Being able to ask the AI chatbot about decisions from months-old meetings has saved us from countless 'didn't we already discuss this?' moments.",
    author: "Priya Sharma",
    role: "CEO, Brightpath Analytics",
    avatar: "PS",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="relative py-24 md:py-32 px-6 bg-zinc-50/50 dark:bg-zinc-900/20 z-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <FadeUp>
            <SectionBadge>
              <Star className="h-3 w-3" />
              Testimonials
            </SectionBadge>
          </FadeUp>
          <FadeUp delay={0.1}>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-5 mb-4">
              Loved by Teams
              <br />
              <span className="bg-gradient-to-r from-amber-500 to-pink-500 bg-clip-text text-transparent">
                Everywhere
              </span>
            </h2>
          </FadeUp>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <FadeUp key={t.author} delay={i * 0.1}>
              <div className="p-6 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-sm h-full flex flex-col">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star key={si} className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 flex-1 mb-5">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-[10px] font-bold text-white">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{t.author}</div>
                    <div className="text-[10px] text-zinc-400">{t.role}</div>
                  </div>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
