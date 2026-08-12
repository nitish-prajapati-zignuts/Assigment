"use client";

import React from "react";
import { Bell } from "lucide-react";
import { AppSettings } from "./AiTabContent";

interface NotificationsTabContentProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

export function NotificationsTabContent({ settings, setSettings }: NotificationsTabContentProps) {
  return (
    <div className="bg-white dark:bg-zinc-900/80 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
        <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400">
          <Bell className="w-5 h-5" />
        </span>
        Alerts & Webhooks Configuration
      </h3>

      <div className="space-y-4">
        <label className="flex items-center justify-between p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer">
          <div>
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 block">
              Email Notifications for Action Items
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Receive instant email notifications when new tasks are assigned to you.
            </span>
          </div>
          <input
            type="checkbox"
            checked={settings.emailNotifications}
            onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
            className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
          />
        </label>

        <label className="flex items-center justify-between p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer">
          <div>
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 block">
              Weekly Executive Digest
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Receive a weekly summary email of meeting velocity and open task statuses.
            </span>
          </div>
          <input
            type="checkbox"
            checked={settings.weeklyDigest}
            onChange={(e) => setSettings({ ...settings, weeklyDigest: e.target.checked })}
            className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
          />
        </label>

        <div className="pt-2 space-y-2">
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Slack / MS Teams Webhook URL:
          </label>
          <input
            type="url"
            value={settings.slackWebhookUrl}
            onChange={(e) => setSettings({ ...settings, slackWebhookUrl: e.target.value })}
            placeholder="https://hooks.slack.com/services/..."
            className="w-full text-xs sm:text-sm p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
          />
          <p className="text-[11px] text-zinc-400">
            Auto-post meeting summaries directly to your team workspace channel.
          </p>
        </div>
      </div>
    </div>
  );
}
