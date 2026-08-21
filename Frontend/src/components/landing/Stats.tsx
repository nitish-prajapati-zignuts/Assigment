"use client";

import { Clock, Zap, Search, Lock } from "lucide-react";
import { FadeUp } from "./shared";

const stats = [
  { value: "95%", label: "Time Saved on Notes", icon: Clock },
  { value: "10x", label: "Faster Action Tracking", icon: Zap },
  { value: "100%", label: "Meetings Searchable", icon: Search },
  { value: "256-bit", label: "AES-GCM Encryption", icon: Lock },
];

export function Stats() {
  return (
    <section className="relative py-20 md:py-24 px-6 z-10">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <FadeUp key={s.label} delay={i * 0.08}>
              <div className="text-center p-6 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/30 backdrop-blur-sm">
                <s.icon className="h-5 w-5 text-indigo-500 mx-auto mb-3" />
                <div className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent mb-1">
                  {s.value}
                </div>
                <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">{s.label}</div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
