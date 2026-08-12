"use client";

import React from "react";
import { Bot, FileText, MessageSquare } from "lucide-react";

export interface AppSettings {
  summaryLength: "Short" | "Medium" | "Long";
  template: "Standard" | "Executive" | "Developer" | "Technical" | "Sales";
  customPrompt: string;
  autoExtractActionItems: boolean;
  emailNotifications: boolean;
  weeklyDigest: boolean;
  slackWebhookUrl: string;
}

interface AiTabContentProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

export function AiTabContent({ settings, setSettings }: AiTabContentProps) {
  return (
    <div className="space-y-6">
      {/* Custom System Prompt Card */}
      <div className="bg-white dark:bg-zinc-900/80 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400">
                <Bot className="w-5 h-5" />
              </span>
              Custom AI System Prompt Rules
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Set explicit priority instructions for the AI when analyzing meeting transcripts and extracting action items.
            </p>
          </div>
          <span className="text-[11px] bg-indigo-50 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-300 px-3 py-1 rounded-full font-medium shadow-2xs">
            Active Rule
          </span>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Custom AI Focus Instructions:
          </label>
          <textarea
            rows={4}
            value={settings.customPrompt}
            onChange={(e) => setSettings({ ...settings, customPrompt: e.target.value })}
            placeholder="e.g. Focus heavily on technical decisions, code deliverables, architectural risks, and deadline dates..."
            className="w-full text-xs sm:text-sm p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
          />
          <p className="text-[11px] text-zinc-400">
            These instructions will be automatically stored in PostgreSQL and applied to all transcript processing requests.
          </p>
        </div>

        {/* Quick Prompt Presets */}
        <div className="pt-2">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 block mb-2.5">
            Click to Apply Preset Rule:
          </span>
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() =>
                setSettings({
                  ...settings,
                  customPrompt:
                    "Focus heavily on technical decisions, code deliverables, architectural risks, and deadline dates.",
                })
              }
              className="text-xs px-3.5 py-2 bg-zinc-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-zinc-800 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 text-zinc-700 dark:text-zinc-300 rounded-xl font-medium transition-all cursor-pointer"
            >
              💻 Developer Technical Focus
            </button>
            <button
              type="button"
              onClick={() =>
                setSettings({
                  ...settings,
                  customPrompt:
                    "Highlight high-level business strategy, revenue impact, key risks, and executive leadership action items.",
                })
              }
              className="text-xs px-3.5 py-2 bg-zinc-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-zinc-800 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 text-zinc-700 dark:text-zinc-300 rounded-xl font-medium transition-all cursor-pointer"
            >
              👔 Executive Strategy Focus
            </button>
            <button
              type="button"
              onClick={() =>
                setSettings({
                  ...settings,
                  customPrompt:
                    "Focus on client pain points, timeline expectations, budget parameters, and next sales steps.",
                })
              }
              className="text-xs px-3.5 py-2 bg-zinc-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-zinc-800 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 text-zinc-700 dark:text-zinc-300 rounded-xl font-medium transition-all cursor-pointer"
            >
              📈 Sales Discovery Focus
            </button>
          </div>
        </div>
      </div>

      {/* Default Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900/80 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-500" />
            Default Summary Length
          </h3>
          <div className="grid grid-cols-3 gap-2.5">
            {(["Short", "Medium", "Long"] as const).map((len) => (
              <button
                key={len}
                type="button"
                onClick={() => setSettings({ ...settings, summaryLength: len })}
                className={`py-2.5 px-3 text-xs font-semibold rounded-2xl border transition-all cursor-pointer ${
                  settings.summaryLength === len
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 shadow-xs"
                    : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                }`}
              >
                {len}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900/80 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-500" />
            Default Summary Template Style
          </h3>
          <select
            value={settings.template}
            onChange={(e) =>
              setSettings({ ...settings, template: e.target.value as AppSettings["template"] })
            }
            className="w-full text-xs sm:text-sm p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all cursor-pointer"
          >
            <option value="Standard">Standard Summary (Balanced)</option>
            <option value="Developer">Developer Focus (Code & Tech Blockers)</option>
            <option value="Executive">Executive Focus (Strategy & Financial Risks)</option>
            <option value="Technical">Technical Architecture Focus</option>
            <option value="Sales">Sales Discovery Focus</option>
          </select>
        </div>
      </div>
    </div>
  );
}
