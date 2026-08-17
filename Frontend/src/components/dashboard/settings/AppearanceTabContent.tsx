"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Laptop, Eye } from "lucide-react";
import { useTheme } from "next-themes";

export function AppearanceTabContent() {
  const { theme, setTheme } = useTheme();

  const themes = [
    {
      id: "light",
      name: "Light Mode",
      description: "Clean white background with sharp black text and dark borders.",
      icon: Sun,
      bgColor: "bg-white border-zinc-200 text-zinc-900",
      accentBg: "bg-zinc-900",
    },
    {
      id: "dark",
      name: "Dark Mode",
      description: "Minimalist pure dark theme with subtle light borders.",
      icon: Moon,
      bgColor: "bg-zinc-950 border-zinc-800 text-zinc-50",
      accentBg: "bg-zinc-100",
    },
    {
      id: "system",
      name: "System Preference",
      description: "Automatically sync with your operating system settings.",
      icon: Laptop,
      bgColor: "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50",
      accentBg: "bg-zinc-800 dark:bg-zinc-200",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-4xl mx-auto space-y-6 p-4 sm:p-6"
    >
      {/* Header Info */}
      <div className="bg-white dark:bg-zinc-950 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 space-y-2">
        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
            <Eye className="w-4 h-4" />
          </span>
          Display Theme Mode
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Select your display preference. The application uses a minimalist monochrome (Black & White) palette in both
          light and dark modes.
        </p>
      </div>

      {/* Theme Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {themes.map((t) => {
          const Icon = t.icon;
          const isActive = theme === t.id;

          return (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`flex flex-col text-left p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                isActive
                  ? "border-zinc-900 dark:border-zinc-100 ring-1 ring-zinc-900 dark:ring-zinc-100 bg-white dark:bg-zinc-900 shadow-sm"
                  : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
              }`}
            >
              {isActive && (
                <div className="absolute top-4 right-4 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black text-[10px] font-bold">
                  ✓
                </div>
              )}

              <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 w-fit mb-3">
                <Icon className="w-4 h-4" />
              </div>

              <div className="space-y-1">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{t.name}</h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">{t.description}</p>
              </div>

              {/* Visual preview block */}
              <div
                className={`mt-4 w-full h-12 rounded-lg border border-inherit p-2 ${t.bgColor} opacity-90 overflow-hidden flex flex-col gap-1`}
              >
                <div className={`h-2 w-12 rounded-xs ${t.accentBg}`} />
                <div className="flex gap-1">
                  <div className={`h-2 w-full rounded-xs ${t.accentBg} opacity-30`} />
                  <div className={`h-2 w-full rounded-xs ${t.accentBg} opacity-30`} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
