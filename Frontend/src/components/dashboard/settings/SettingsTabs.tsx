"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Bell, Shield, LockKeyholeIcon } from "lucide-react";

export type SettingsTabType = "ai" | "notifications" | "security" | "Change Password";

interface SettingsTabsProps {
  activeTab: SettingsTabType;
  setActiveTab: (tab: SettingsTabType) => void;
}

const tabs: { id: SettingsTabType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "ai", label: "AI Prompts & Rules", icon: Sparkles },
  { id: "notifications", label: "Alerts & Webhooks", icon: Bell },
  { id: "security", label: "Account & Security", icon: Shield },
  { id: "Change Password", label: "Change Password", icon: LockKeyholeIcon },
];

export function SettingsTabs({ activeTab, setActiveTab }: SettingsTabsProps) {
  return (
    <div className="flex justify-center">
      <div className="inline-flex p-1.5 rounded-2xl bg-zinc-100/90 dark:bg-zinc-800/90 backdrop-blur-md gap-1 relative">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer z-10 ${
                isActive
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeSettingsTabPill"
                  className="absolute inset-0 rounded-xl bg-white dark:bg-zinc-900 shadow-sm border border-zinc-200/60 dark:border-zinc-700/60"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className="w-4 h-4 relative z-10" />
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
