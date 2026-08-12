"use client";

import React from "react";
import { Sliders, RotateCcw, Save, Loader2, CheckCircle2 } from "lucide-react";

interface SettingsHeaderProps {
  handleReset: () => void;
  handleSave: () => void;
  isSaving: boolean;
  savedSuccess: boolean;
}

export function SettingsHeader({
  handleReset,
  handleSave,
  isSaving,
  savedSuccess,
}: SettingsHeaderProps) {
  return (
    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-8 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 text-center md:text-left">
      <div className="space-y-1.5">
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center justify-center md:justify-start gap-3">
          <span className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20">
            <Sliders className="w-7 h-7" />
          </span>
          Application Settings
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-xl">
          Configure custom AI system instructions, summary template defaults, and notification preferences saved in PostgreSQL.
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 shrink-0">
        <button
          onClick={handleReset}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 rounded-2xl transition-all shadow-xs disabled:opacity-50 whitespace-nowrap cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 shrink-0" />
          <span>Reset Defaults</span>
        </button>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-2xl shadow-md hover:shadow-indigo-500/25 transition-all disabled:opacity-50 whitespace-nowrap cursor-pointer"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 shrink-0 animate-spin text-white" />
              <span>Saving...</span>
            </>
          ) : savedSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-300" />
              <span>Saved to Database!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 shrink-0" />
              <span>Save Settings</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
