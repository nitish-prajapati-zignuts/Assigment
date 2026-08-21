"use client";

import Link from "next/link";
import { Sparkles, ArrowRight, Play, Calendar, CheckSquare, TrendingUp, Users } from "lucide-react";
import { FadeUp, ParticleField } from "./shared";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 px-6 z-10">
      <ParticleField />
      <div className="max-w-5xl mx-auto text-center">
        <FadeUp>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/40 border border-indigo-100 dark:border-indigo-900/40 mb-8">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              AI-Powered Meeting Intelligence
            </span>
          </div>
        </FadeUp>

        <FadeUp delay={0.1}>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.08] mb-6">
            Transform Meetings
            <br />
            <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 bg-clip-text text-transparent">
              Into Action
            </span>
          </h1>
        </FadeUp>

        <FadeUp delay={0.2}>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed mb-10 font-medium">
            Syncra AI captures every word, extracts key decisions, auto-generates action items, and gives you a
            searchable AI knowledge base of every meeting — so nothing ever falls through the cracks.
          </p>
        </FadeUp>

        <FadeUp delay={0.3}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 hover:from-indigo-600 hover:via-violet-600 hover:to-purple-700 shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all hover:-translate-y-0.5"
            >
              Start Free — No Card Required
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl text-sm font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100/70 dark:bg-zinc-900/50 hover:bg-zinc-200/70 dark:hover:bg-zinc-800/50 border border-zinc-200/50 dark:border-zinc-800/50 transition-all"
            >
              <Play className="h-4 w-4 text-indigo-500" />
              See How It Works
            </a>
          </div>
        </FadeUp>

        {/* Hero dashboard preview */}
        <FadeUp delay={0.5} className="mt-16 md:mt-20">
          <div className="relative max-w-4xl mx-auto">
            {/* Glow behind the card */}
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-purple-500/10 rounded-3xl blur-2xl" />

            <div className="relative rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-2xl shadow-zinc-900/5 dark:shadow-black/30 overflow-hidden">
              {/* Mock browser bar */}
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/50">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="max-w-xs mx-auto px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[10px] text-zinc-400 text-center font-mono">
                    app.syncra.ai/dashboard
                  </div>
                </div>
              </div>

              {/* Dashboard mock content */}
              <div className="p-6 md:p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                  {[
                    { label: "Total Meetings", val: "247", icon: Calendar, color: "text-indigo-500" },
                    { label: "Action Items", val: "1,284", icon: CheckSquare, color: "text-emerald-500" },
                    { label: "Completion Rate", val: "94%", icon: TrendingUp, color: "text-violet-500" },
                    { label: "Team Members", val: "32", icon: Users, color: "text-pink-500" },
                  ].map((m) => (
                    <div
                      key={m.label}
                      className="p-4 rounded-xl border border-zinc-200/40 dark:border-zinc-800/40 bg-zinc-50/50 dark:bg-zinc-900/30"
                    >
                      <m.icon className={`h-4 w-4 ${m.color} mb-2`} />
                      <div className="text-lg md:text-xl font-extrabold text-zinc-900 dark:text-zinc-100">{m.val}</div>
                      <div className="text-[10px] font-semibold text-zinc-400 mt-0.5">{m.label}</div>
                    </div>
                  ))}
                </div>

                {/* Chart mock */}
                <div className="rounded-xl border border-zinc-200/40 dark:border-zinc-800/40 bg-zinc-50/30 dark:bg-zinc-900/20 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Meeting Velocity</div>
                    <div className="flex gap-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-indigo-500" />
                        <span className="text-[10px] text-zinc-400">Meetings</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-violet-400" />
                        <span className="text-[10px] text-zinc-400">Summaries</span>
                      </div>
                    </div>
                  </div>
                  <svg viewBox="0 0 600 120" className="w-full" fill="none">
                    <defs>
                      <linearGradient id="hero-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0 100 C50 90, 100 60, 150 70 S250 30, 300 50 S400 20, 450 40 S550 10, 600 30 V120 H0Z"
                      fill="url(#hero-grad)"
                    />
                    <path
                      d="M0 100 C50 90, 100 60, 150 70 S250 30, 300 50 S400 20, 450 40 S550 10, 600 30"
                      stroke="#6366f1"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M0 105 C50 95, 120 80, 150 85 S250 50, 300 60 S400 45, 450 55 S550 35, 600 45"
                      stroke="#a78bfa"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray="4 4"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
