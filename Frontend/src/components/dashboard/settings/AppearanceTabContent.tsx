"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Laptop, Palette, Check, Sparkles } from "lucide-react";
import { useTheme } from "next-themes";

export function AppearanceTabContent() {
  const { theme, setTheme } = useTheme();
  const [colorTheme, setColorTheme] = useState("violet");
  const [subColorTheme, setSubColorTheme] = useState("cyan");

  useEffect(() => {
    const savedColor = localStorage.getItem("color-theme") || "violet";
    const savedSubColor = localStorage.getItem("color-sub-theme") || "cyan";
    setColorTheme(savedColor);
    setSubColorTheme(savedSubColor);

    const handleColorThemeChanged = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) setColorTheme(customEvent.detail);
    };

    const handleColorSubthemeChanged = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) setSubColorTheme(customEvent.detail);
    };

    window.addEventListener("color-theme-changed", handleColorThemeChanged);
    window.addEventListener("color-subtheme-changed", handleColorSubthemeChanged);
    return () => {
      window.removeEventListener("color-theme-changed", handleColorThemeChanged);
      window.removeEventListener("color-subtheme-changed", handleColorSubthemeChanged);
    };
  }, []);

  const handleColorThemeChange = (colorName: string) => {
    setColorTheme(colorName);
    localStorage.setItem("color-theme", colorName);
    document.documentElement.setAttribute("data-color-theme", colorName);
    window.dispatchEvent(new CustomEvent("color-theme-changed", { detail: colorName }));
  };

  const handleSubColorThemeChange = (subColorName: string) => {
    setSubColorTheme(subColorName);
    localStorage.setItem("color-sub-theme", subColorName);
    document.documentElement.setAttribute("data-color-subtheme", subColorName);
    window.dispatchEvent(new CustomEvent("color-subtheme-changed", { detail: subColorName }));
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
      bgColor:
        "bg-gradient-to-br from-zinc-50 to-zinc-950 border-zinc-200 dark:border-zinc-900 text-zinc-900 dark:text-zinc-50",
      accentBg: "bg-white dark:bg-zinc-900",
    },
  ];

  const primaryPalettes = [
    { id: "violet", name: "Royal Violet", colorClass: "bg-indigo-600 dark:bg-indigo-500" },
    { id: "blue", name: "Ocean Blue", colorClass: "bg-blue-500" },
    { id: "emerald", name: "Emerald Forest", colorClass: "bg-emerald-500" },
    { id: "rose", name: "Crimson Rose", colorClass: "bg-rose-500" },
    { id: "amber", name: "Amber Sun", colorClass: "bg-amber-500" },
  ];

  const subPalettes = [
    { id: "cyan", name: "Vibrant Cyan", colorClass: "bg-cyan-500" },
    { id: "fuchsia", name: "Fuchsia Pink", colorClass: "bg-fuchsia-500" },
    { id: "teal", name: "Teal Sea", colorClass: "bg-teal-500" },
    { id: "lime", name: "Electric Lime", colorClass: "bg-lime-500" },
    { id: "rose", name: "Coral Rose", colorClass: "bg-rose-500" },
    { id: "amber", name: "Sun Gold", colorClass: "bg-amber-500" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-4xl mx-auto space-y-8 p-4 sm:p-6"
    >
      {/* Description & Dual-Theme Card */}
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-4 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400">
              <Palette className="w-5 h-5" />
            </span>
            Interface Customization
          </h3>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-dual text-white shadow-sm flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Dual Accent Mode
          </span>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Customize how Syncra looks on your screen. Select your display mode and customize both Primary & SubColor
          accents to personalize cards, buttons, badges, and gradient highlights across all pages.
        </p>

        {/* Dynamic Dual Accent Live Preview Banner */}
        <div className="p-4 rounded-2xl bg-gradient-dual text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-extrabold text-sm">
              S
            </div>
            <div>
              <p className="font-extrabold text-sm leading-tight">Live Dual-Accent Active</p>
              <p className="text-[11px] opacity-90 capitalize">
                Primary: {colorTheme} • SubColor: {subColorTheme}
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-white/25 backdrop-blur-md rounded-lg text-xs font-bold">Interactive Theme</span>
        </div>
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
              <div
                className={`mt-5 w-full h-16 rounded-xl border border-inherit p-2 ${t.bgColor} opacity-90 overflow-hidden flex flex-col gap-1.5`}
              >
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

      {/* Primary Brand Color Accent Picker */}
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-5">
        <div>
          <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Primary Brand Accent</h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Select your main brand accent color for primary buttons, active tabs, and key headers.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          {primaryPalettes.map((cp) => {
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
                <div
                  className={`w-8 h-8 rounded-full ${cp.colorClass} shadow-inner flex items-center justify-center text-white`}
                >
                  {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                </div>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{cp.name}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* SubColor Secondary Palette Picker */}
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-5">
        <div>
          <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            SubColor Accent Palette
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Choose a complementary secondary accent color to build multi-tone gradients, secondary badges, and glowing
            card highlights.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3.5">
          {subPalettes.map((sub) => {
            const isSelected = subColorTheme === sub.id;

            return (
              <motion.button
                key={sub.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSubColorThemeChange(sub.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                  isSelected
                    ? "border-purple-500 bg-purple-500/5 dark:bg-purple-500/10 ring-2 ring-purple-500/20"
                    : "border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-800/20 hover:bg-white dark:hover:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full ${sub.colorClass} shadow-inner flex items-center justify-center text-white`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">{sub.name}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
