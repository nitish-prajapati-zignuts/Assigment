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
      className="max-w-4xl mx-auto space-y-8 p-4 sm:p-6"
    >
      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
        <span className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400">
          <Bell className="w-5 h-5" />
        </span>
        Alerts & Webhooks Configuration
      </h3>

      <div className="space-y-4">
        <motion.label
          whileHover={{ scale: 1.005 }}
          className="flex items-center justify-between p-4.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-800/20 hover:border-indigo-500/40 transition-all cursor-pointer"
        >
          <div>
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 block">
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
            className="w-4.5 h-4.5 accent-indigo-600 rounded-md cursor-pointer"
          />
        </motion.label>

        <motion.label
          whileHover={{ scale: 1.005 }}
          className="flex items-center justify-between p-4.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-800/20 hover:border-indigo-500/40 transition-all cursor-pointer"
        >
          <div>
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 block">Weekly Executive Digest</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 block">
              Receive a weekly summary email of meeting velocity and open task statuses.
            </span>
          </div>
          <input
            type="checkbox"
            checked={settings.weeklyDigest}
            onChange={(e) => setSettings({ ...settings, weeklyDigest: e.target.checked })}
            className="w-4.5 h-4.5 accent-indigo-600 rounded-md cursor-pointer"
          />
        </motion.label>

        <div className="pt-2 space-y-2">
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
            Slack / MS Teams Webhook URL:
          </label>
          <input
            type="url"
            value={settings.slackWebhookUrl}
            onChange={(e) => setSettings({ ...settings, slackWebhookUrl: e.target.value })}
            placeholder="https://hooks.slack.com/services/..."
            className="w-full text-xs sm:text-sm p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all font-mono text-[12px]"
          />
          <p className="text-[11px] text-zinc-400">
            Auto-post meeting summaries directly to your team workspace channel.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
