"use client";

import React from "react";
import { motion } from "framer-motion";
import { Bell } from "lucide-react";
import { AppSettings } from "./AiTabContent";

interface NotificationsTabContentProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

export function NotificationsTabContent({ settings, setSettings }: NotificationsTabContentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-4xl mx-auto space-y-6 p-4 sm:p-6"
    >
      <div className="bg-white dark:bg-zinc-950 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-6">
        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
          <span className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
            <Bell className="w-5 h-5" />
          </span>
          Alerts & Webhooks Configuration
        </h3>

        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all cursor-pointer">
            <div>
              <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 block">
                Email Notifications for Action Items
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 block">
                Receive instant email notifications when new tasks are assigned to you.
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
              className="w-4 h-4 accent-zinc-900 dark:accent-zinc-100 rounded-md cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all cursor-pointer">
            <div>
              <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 block">
                Weekly Executive Digest
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 block">
                Receive a weekly summary email of meeting velocity and open task statuses.
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.weeklyDigest}
              onChange={(e) => setSettings({ ...settings, weeklyDigest: e.target.checked })}
              className="w-4 h-4 accent-zinc-900 dark:accent-zinc-100 rounded-md cursor-pointer"
            />
          </label>

          <div className="pt-2 space-y-2">
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Slack / MS Teams Webhook URL:
            </label>
            <input
              type="url"
              value={settings.slackWebhookUrl}
              onChange={(e) => setSettings({ ...settings, slackWebhookUrl: e.target.value })}
              placeholder="https://hooks.slack.com/services/..."
              className="w-full text-xs sm:text-sm p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-700 transition-all font-mono text-[12px]"
            />
            <p className="text-[11px] text-zinc-400">
              Auto-post meeting summaries directly to your team workspace channel.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
