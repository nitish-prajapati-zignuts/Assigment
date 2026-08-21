"use client";

import { Mic, Brain, CheckSquare, BarChart3, Bot, Share2, Zap } from "lucide-react";
import { FadeUp, SectionBadge } from "./shared";

const features = [
  {
    icon: Mic,
    title: "AI Transcription",
    desc: "Upload or paste meeting transcripts and let AI parse every word with precision.",
    color: "text-violet-500",
    bg: "bg-violet-50 dark:bg-violet-950/30",
  },
  {
    icon: Brain,
    title: "Smart Summaries",
    desc: "Generate role-tailored summaries — Executive, Developer, Sales and more templates.",
    color: "text-indigo-500",
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
  },
  {
    icon: CheckSquare,
    title: "Action Item Tracker",
    desc: "Auto-extract tasks with owners, priorities, deadlines and track them on Kanban boards.",
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    icon: BarChart3,
    title: "Visual Analytics",
    desc: "Sentiment analysis, speaker participation, meeting velocity charts and KPI dashboards.",
    color: "text-pink-500",
    bg: "bg-pink-50 dark:bg-pink-950/30",
  },
  {
    icon: Bot,
    title: "RAG Knowledge Chat",
    desc: "Ask questions about past meetings — our AI retrieves context from your entire transcript history.",
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
  },
  {
    icon: Share2,
    title: "Secure Sharing",
    desc: "Password-protected, expiring share links with AES-256-GCM encryption. No login required for viewers.",
    color: "text-cyan-500",
    bg: "bg-cyan-50 dark:bg-cyan-950/30",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-24 md:py-32 px-6 z-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <FadeUp>
            <SectionBadge>
              <Zap className="h-3 w-3" />
              Features
            </SectionBadge>
          </FadeUp>
          <FadeUp delay={0.1}>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-5 mb-4">
              Everything You Need to
              <br />
              <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
                Master Your Meetings
              </span>
            </h2>
          </FadeUp>
          <FadeUp delay={0.15}>
            <p className="max-w-xl mx-auto text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              From AI-powered transcription to secure sharing, Syncra gives your team superpowers for every meeting.
            </p>
          </FadeUp>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <FadeUp key={f.title} delay={i * 0.08}>
              <div className="group relative p-6 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-zinc-900/5 dark:hover:shadow-black/20">
                <div className={`w-11 h-11 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                  <f.icon className={`h-5 w-5 ${f.color}`} />
                </div>
                <h3 className="text-sm font-bold mb-2 text-zinc-900 dark:text-zinc-100">{f.title}</h3>
                <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">{f.desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
