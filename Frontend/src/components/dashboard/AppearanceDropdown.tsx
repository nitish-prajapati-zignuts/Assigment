"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Laptop, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu";

export function AppearanceDropdown() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getThemeIcon = () => {
    if (!mounted) return <Sun className="h-4 w-4 text-zinc-500" />;
    if (theme === "dark") return <Moon className="h-4 w-4 text-zinc-200" />;
    if (theme === "system") return <Laptop className="h-4 w-4 text-zinc-500" />;
    return <Sun className="h-4 w-4 text-zinc-500" />;
  };

  const themeOptions = [
    { id: "light", label: "Light", icon: Sun },
    { id: "dark", label: "Dark", icon: Moon },
    { id: "system", label: "System", icon: Laptop },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer outline-none">
        <div className="flex items-center justify-center p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800">
          {getThemeIcon()}
        </div>
        <span className="hidden sm:inline font-medium text-xs">Appearance</span>
        <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-56 p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-lg rounded-xl space-y-3 z-50 outline-none"
      >
        <div className="pb-2 border-b border-zinc-100 dark:border-zinc-900">
          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Appearance</h4>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Select display mode</p>
        </div>

        <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
          {themeOptions.map((opt) => {
            const Icon = opt.icon;
            const isActive = mounted && theme === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setTheme(opt.id)}
                className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
