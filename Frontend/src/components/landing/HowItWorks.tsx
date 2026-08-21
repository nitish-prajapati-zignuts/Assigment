"use client";

import { FileText, Sparkles, CheckSquare, Play } from "lucide-react";
import { FadeUp, SectionBadge } from "./shared";

const howItWorks = [
  {
    step: "01",
    icon: FileText,
    title: "Upload Your Transcript",
    desc: "Paste meeting text, upload DOCX/PDF files, or type directly into the rich text editor.",
  },
  {
    step: "02",
    icon: Sparkles,
    title: "AI Processes & Summarizes",
    desc: "Our AI engine extracts key decisions, action items, sentiment, and generates role-tailored summaries.",
  },
  {
    step: "03",
    icon: CheckSquare,
    title: "Track & Collaborate",
    desc: "Manage tasks on Kanban boards, share secure links, and ask the AI chatbot questions anytime.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 md:py-32 px-6 bg-zinc-50/50 dark:bg-zinc-900/20 z-10">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <FadeUp>
            <SectionBadge>
              <Play className="h-3 w-3" />
              How It Works
            </SectionBadge>
          </FadeUp>
          <FadeUp delay={0.1}>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-5 mb-4">
              Three Steps to
              <br />
              <span className="bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent">
                Meeting Clarity
              </span>
            </h2>
          </FadeUp>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
          {howItWorks.map((s, i) => (
            <FadeUp key={s.step} delay={i * 0.12}>
              <div className="relative text-center">
                {/* Connector line on desktop */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-indigo-200 to-transparent dark:from-indigo-800 dark:to-transparent" />
                )}

                <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 dark:from-indigo-500/5 dark:to-violet-500/5 border border-indigo-100 dark:border-indigo-900/30 mb-6">
                  <s.icon className="h-10 w-10 text-indigo-500" />
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white text-[10px] font-extrabold flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    {s.step}
                  </span>
                </div>
                <h3 className="text-base font-bold mb-2 text-zinc-900 dark:text-zinc-100">{s.title}</h3>
                <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">{s.desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
