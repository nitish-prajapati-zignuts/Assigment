"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Sun, Moon, Laptop, Palette, Check, ChevronDown, Sparkles } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";

const primaryPalettes = [
  { id: "violet", name: "Royal Violet", bgClass: "bg-indigo-600 dark:bg-indigo-500" },
  { id: "blue", name: "Ocean Blue", bgClass: "bg-blue-500" },
  { id: "emerald", name: "Emerald Forest", bgClass: "bg-emerald-500" },
  { id: "rose", name: "Crimson Rose", bgClass: "bg-rose-500" },
  { id: "amber", name: "Amber Sun", bgClass: "bg-amber-500" },
];

const subColorPalettes = [
  { id: "cyan", name: "Cyan", bgClass: "bg-cyan-500" },
  { id: "fuchsia", name: "Fuchsia", bgClass: "bg-fuchsia-500" },
  { id: "teal", name: "Teal", bgClass: "bg-teal-500" },
  { id: "lime", name: "Lime", bgClass: "bg-lime-500" },
  { id: "rose", name: "Rose", bgClass: "bg-rose-500" },
  { id: "amber", name: "Amber", bgClass: "bg-amber-500" },
];

export function AppearanceDropdown() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [colorTheme, setColorTheme] = useState("violet");
  const [subColorTheme, setSubColorTheme] = useState("cyan");

  useEffect(() => {
    setMounted(true);
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

  const handleSubColorChange = (subColorName: string) => {
    setSubColorTheme(subColorName);
    localStorage.setItem("color-sub-theme", subColorName);
    document.documentElement.setAttribute("data-color-subtheme", subColorName);
    window.dispatchEvent(new CustomEvent("color-subtheme-changed", { detail: subColorName }));
  };

  const getThemeIcon = () => {
    if (!mounted) return <Sun className="h-4 w-4 text-amber-500" />;
    if (theme === "dark") return <Moon className="h-4 w-4 text-indigo-400" />;
    if (theme === "system") return <Laptop className="h-4 w-4 text-blue-500" />;
    return <Sun className="h-4 w-4 text-amber-500" />;
  };

  const themeOptions = [
    { id: "light", label: "Light", icon: Sun, iconColor: "text-amber-500" },
    { id: "dark", label: "Dark", icon: Moon, iconColor: "text-indigo-400" },
    { id: "system", label: "System", icon: Laptop, iconColor: "text-blue-500" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 px-3 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 shadow-2xs hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer outline-none">
        <div className="flex items-center justify-center p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800">
          {getThemeIcon()}
        </div>
        <span className="hidden sm:inline font-medium text-xs">Appearance</span>
        <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-80 p-4 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl rounded-2xl space-y-4 z-50 outline-none"
      >
        {/* Dropdown Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Palette className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Appearance & Theme</h4>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Theme mode & dual palette</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold subbrand-badge flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> Palette
          </span>
        </div>

        {/* Theme Mode Selector */}
        <div className="space-y-2">
          <label className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Theme Mode
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-100/80 dark:bg-zinc-900/80 rounded-xl border border-zinc-200/50 dark:border-zinc-800/50">
            {themeOptions.map((opt) => {
              const Icon = opt.icon;
              const isActive = mounted && theme === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setTheme(opt.id)}
                  className={`relative flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${opt.iconColor}`} />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary Accent Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Primary Accent
            </label>
            <span className="text-[10px] font-semibold text-zinc-500 capitalize">{colorTheme}</span>
          </div>
          <div className="flex items-center justify-between gap-1.5 pt-0.5">
            {primaryPalettes.map((cp) => {
              const isSelected = colorTheme === cp.id;
              return (
                <button
                  key={cp.id}
                  onClick={() => handleColorThemeChange(cp.id)}
                  title={cp.name}
                  className={`relative group p-1 rounded-full transition-all cursor-pointer ${
                    isSelected ? "ring-2 ring-indigo-500 ring-offset-2 ring-offset-white dark:ring-offset-zinc-950 scale-110" : "hover:scale-105"
                  }`}
                >
                  <div
                    className={`h-6 w-6 rounded-full ${cp.bgClass} flex items-center justify-center text-white shadow-xs`}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* SubColor Palette Selector */}
        <div className="space-y-2 pt-1 border-t border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
              SubColor Accent
            </label>
            <span className="text-[10px] font-semibold text-zinc-500 capitalize">{subColorTheme}</span>
          </div>
          <div className="flex items-center justify-between gap-1.5 pt-0.5">
            {subColorPalettes.map((sub) => {
              const isSelected = subColorTheme === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => handleSubColorChange(sub.id)}
                  title={`SubColor: ${sub.name}`}
                  className={`relative group p-1 rounded-full transition-all cursor-pointer ${
                    isSelected ? "ring-2 ring-purple-500 ring-offset-2 ring-offset-white dark:ring-offset-zinc-950 scale-110" : "hover:scale-105"
                  }`}
                >
                  <div
                    className={`h-5.5 w-5.5 rounded-full ${sub.bgClass} flex items-center justify-center text-white shadow-xs opacity-90 hover:opacity-100`}
                  >
                    {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
