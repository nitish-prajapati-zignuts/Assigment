"use client";

import React from "react";
import { Sliders, RotateCcw, Save, Loader2, CheckCircle2 } from "lucide-react";

interface SettingsHeaderProps {
  handleReset: () => void;
  handleSave: () => void;
  isSaving: boolean;
  savedSuccess: boolean;
}

export function SettingsHeader({ handleReset, handleSave, isSaving, savedSuccess }: SettingsHeaderProps) {
  return (
    <div className="bg-white dark:bg-zinc-950 p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 text-center md:text-left">
      <div className="space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center justify-center md:justify-start gap-3">
          <span className="p-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
            <Sliders className="w-6 h-6 sm:w-7 sm:h-7" />
          </span>
          Application Settings
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-xl">
          Configure custom AI system instructions, summary template defaults, and notification preferences.
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 shrink-0">
        <button
          onClick={handleReset}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl transition-all shadow-xs disabled:opacity-50 whitespace-nowrap cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 shrink-0" />
          <span>Reset Defaults</span>
        </button>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-zinc-950 border border-zinc-800 dark:bg-white dark:text-zinc-950 dark:border-zinc-200 hover:bg-zinc-800 dark:hover:bg-zinc-100 rounded-2xl shadow-xs transition-all disabled:opacity-50 whitespace-nowrap cursor-pointer"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
              <span>Saving...</span>
            </>
          ) : savedSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-500" />
              <span>Saved!</span>
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

