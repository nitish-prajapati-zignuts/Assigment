"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Laptop, Palette, Check } from "lucide-react";
import { useTheme } from "next-themes";

export function AppearanceTabContent() {
  const { theme, setTheme } = useTheme();
  const [colorTheme, setColorTheme] = useState("violet");

  useEffect(() => {
    const savedColor = localStorage.getItem("color-theme") || "violet";
    setColorTheme(savedColor);
  }, []);

  const handleColorThemeChange = (colorName: string) => {
    setColorTheme(colorName);
    localStorage.setItem("color-theme", colorName);
    document.documentElement.setAttribute("data-color-theme", colorName);
  };

  const themes = [
    {
      id: "light",
      name: "Light Mode",
      description: "Clean, crisp, and easy to read in well-lit environments.",
      icon: Sun,
      bgColor: "bg-zinc-50 border-zinc-200 text-zinc-900",
      accentBg: "bg-white",
    },
    {
      id: "dark",
      name: "Dark Mode",
      description: "Sleek and immersive, reducing eye strain in low-light environments.",
      icon: Moon,
      bgColor: "bg-zinc-950 border-zinc-900 text-zinc-50",
      accentBg: "bg-zinc-900",
    },
    {
      id: "system",
      name: "System Settings",
      description: "Automatically sync with your operating system's theme preference.",
      icon: Laptop,
      bgColor: "bg-gradient-to-br from-zinc-50 to-zinc-950 border-zinc-200 dark:border-zinc-900 text-zinc-900 dark:text-zinc-50",
      accentBg: "bg-white dark:bg-zinc-900",
    },
  ];

  const colorPalettes = [
    { id: "violet", name: "Royal Violet", colorClass: "bg-indigo-600 dark:bg-indigo-500", textClass: "text-indigo-600" },
    { id: "blue", name: "Ocean Blue", colorClass: "bg-blue-500", textClass: "text-blue-500" },
    { id: "emerald", name: "Emerald Forest", colorClass: "bg-emerald-500", textClass: "text-emerald-500" },
    { id: "rose", name: "Crimson Rose", colorClass: "bg-rose-500", textClass: "text-rose-500" },
    { id: "amber", name: "Amber Sun", colorClass: "bg-amber-500", textClass: "text-amber-500" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      {/* Description Card */}
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-4">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400">
            <Palette className="w-5 h-5" />
          </span>
          Interface Customization
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Customize how Syncra looks on your screen. Choose your default display mode or sync it with your system settings.
        </p>
      </div>

      {/* Theme Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {themes.map((t) => {
          const Icon = t.icon;
          const isActive = theme === t.id;

          return (
            <motion.button
              key={t.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setTheme(t.id)}
              className={`flex flex-col text-left p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden ${
                isActive
                  ? "border-primary ring-2 ring-primary/20 bg-white dark:bg-zinc-900 shadow-md"
                  : "border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 hover:bg-white dark:hover:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-2xs"
              }`}
            >
              {isActive && (
                <div className="absolute top-4 right-4 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                  ✓
                </div>
              )}

              <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 w-fit mb-4">
                <Icon className="w-5 h-5" />
              </div>

              <div className="space-y-1 z-10">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{t.name}</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{t.description}</p>
              </div>

              {/* Theme Mockup Visual */}
              <div className={`mt-5 w-full h-16 rounded-xl border border-inherit p-2 ${t.bgColor} opacity-90 overflow-hidden flex flex-col gap-1.5`}>
                <div className={`h-3 w-16 rounded-sm ${t.accentBg} opacity-80`} />
                <div className="flex gap-1.5">
                  <div className={`h-2.5 w-full rounded-sm ${t.accentBg} opacity-50`} />
                  <div className={`h-2.5 w-full rounded-sm ${t.accentBg} opacity-50`} />
                </div>
                <div className={`h-2 w-10 rounded-sm ${t.accentBg} opacity-30`} />
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Brand Color Palette Picker */}
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-5">
        <div>
          <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Brand Color Accent</h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Select a custom brand accent color to style buttons, badges, links, and highlights throughout Syncra.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          {colorPalettes.map((cp) => {
            const isSelected = colorTheme === cp.id;

            return (
              <motion.button
                key={cp.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleColorThemeChange(cp.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center gap-2.5 ${
                  isSelected
                    ? "border-primary bg-primary/5 dark:bg-primary/10 ring-2 ring-primary/20"
                    : "border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-800/20 hover:bg-white dark:hover:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                <div className={`w-8 h-8 rounded-full ${cp.colorClass} shadow-inner flex items-center justify-center text-white`}>
                  {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{cp.name}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
