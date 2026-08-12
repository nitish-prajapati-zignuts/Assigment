"use client";

import React from "react";
import { Sparkles, Bell, Shield } from "lucide-react";

export type SettingsTabType = "ai" | "notifications" | "security";

interface SettingsTabsProps {
  activeTab: SettingsTabType;
  setActiveTab: (tab: SettingsTabType) => void;
}

export function SettingsTabs({ activeTab, setActiveTab }: SettingsTabsProps) {
  return (
    <div className="flex justify-center">
      <div className="inline-flex p-1.5 rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/80 backdrop-blur-md gap-1">
        <button
          onClick={() => setActiveTab("ai")}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === "ai"
              ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Prompts & Rules</span>
        </button>

        <button
          onClick={() => setActiveTab("notifications")}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === "notifications"
              ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Alerts & Webhooks</span>
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === "security"
              ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Account & Security</span>
        </button>
      </div>
    </div>
  );
}
