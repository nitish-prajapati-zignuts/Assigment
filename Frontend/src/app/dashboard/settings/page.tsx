"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Sliders,
  Bell,
  Shield,
  Save,
  CheckCircle2,
  RotateCcw,
  Bot,
  MessageSquare,
  FileText,
  Loader2,
  Laptop,
  Smartphone,
  Globe,
  Key,
  Clock,
  Check,
} from "lucide-react";
import api from "@/lib/axios";

interface AppSettings {
  summaryLength: "Short" | "Medium" | "Long";
  template: "Standard" | "Executive" | "Developer" | "Technical" | "Sales";
  customPrompt: string;
  autoExtractActionItems: boolean;
  emailNotifications: boolean;
  weeklyDigest: boolean;
  slackWebhookUrl: string;
}

interface UserSession {
  id: string;
  ipAddress: string;
  device: string;
  browser: string;
  os: string;
  location: string;
  isCurrent: boolean;
  lastActive: string;
  createdAt: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  summaryLength: "Medium",
  template: "Standard",
  customPrompt: "Focus heavily on technical decisions, code deliverables, and explicit action item due dates.",
  autoExtractActionItems: true,
  emailNotifications: true,
  weeklyDigest: false,
  slackWebhookUrl: "",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [activeTab, setActiveTab] = useState<"ai" | "notifications" | "security">("ai");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await api.get("/settings/sessions");
      if (Array.isArray(res.data)) {
        setSessions(res.data);
      }
    } catch (e) {
      console.error("Error fetching login sessions:", e);
    }
  };

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/settings");
      if (response.data) {
        setSettings({
          summaryLength: response.data.summaryLength || "Medium",
          template: response.data.template || "Standard",
          customPrompt: response.data.customPrompt || DEFAULT_SETTINGS.customPrompt,
          autoExtractActionItems: response.data.autoExtractActionItems ?? true,
          emailNotifications: response.data.emailNotifications ?? true,
          weeklyDigest: response.data.weeklyDigest ?? false,
          slackWebhookUrl: response.data.slackWebhookUrl || "",
        });
      }
    } catch (e) {
      console.error("Error loading user settings from API, fallback to defaults:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await api.put("/settings", settings);
      if (response.data) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (e) {
      console.error("Failed to save settings to API:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    setSettings(DEFAULT_SETTINGS);
    try {
      setIsSaving(true);
      await api.put("/settings", DEFAULT_SETTINGS);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error("Failed to reset settings:", e);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-zinc-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <span className="text-sm font-medium">Loading settings from database...</span>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center py-6 px-4">
      <div className="w-full max-w-4xl space-y-8">
        {/* Centered Glassmorphism Header */}
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
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 rounded-2xl transition-all shadow-xs disabled:opacity-50 whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4 shrink-0" />
              <span>Reset Defaults</span>
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-2xl shadow-md hover:shadow-indigo-500/25 transition-all disabled:opacity-50 whitespace-nowrap"
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

        {/* Centered Navigation Tabs */}
        <div className="flex justify-center border-b border-zinc-200 dark:border-zinc-800 pb-1">
          <div className="inline-flex p-1.5 rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/80 backdrop-blur-md gap-1">
            <button
              onClick={() => setActiveTab("ai")}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl transition-all ${
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
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl transition-all ${
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
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl transition-all ${
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

        {/* TAB CONTENT: AI Customization */}
        {activeTab === "ai" && (
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
                    className="text-xs px-3.5 py-2 bg-zinc-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-zinc-800 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 text-zinc-700 dark:text-zinc-300 rounded-xl font-medium transition-all"
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
                    className="text-xs px-3.5 py-2 bg-zinc-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-zinc-800 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 text-zinc-700 dark:text-zinc-300 rounded-xl font-medium transition-all"
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
                    className="text-xs px-3.5 py-2 bg-zinc-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-zinc-800 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 text-zinc-700 dark:text-zinc-300 rounded-xl font-medium transition-all"
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
                      className={`py-2.5 px-3 text-xs font-semibold rounded-2xl border transition-all ${
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
                  className="w-full text-xs sm:text-sm p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
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
        )}

        {/* TAB CONTENT: Notifications */}
        {activeTab === "notifications" && (
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
        )}

        {/* TAB CONTENT: Security & Sessions */}
        {activeTab === "security" && (
          <div className="space-y-6">
            {/* System Security Card */}
            <div className="bg-white dark:bg-zinc-900/80 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400">
                  <Shield className="w-5 h-5" />
                </span>
                Account Security & Authentication Status
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 space-y-1">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 font-medium">
                    <Key className="w-3.5 h-3.5 text-indigo-500" />
                    Auth Protocol
                  </span>
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 block">
                    JWT Session Token
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 space-y-1">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 font-medium">
                    <Globe className="w-3.5 h-3.5 text-indigo-500" />
                    DB Engine
                  </span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 block">
                    PostgreSQL (Drizzle)
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 space-y-1">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 font-medium">
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    Security State
                  </span>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 block">
                    Protected & Encrypted
                  </span>
                </div>
              </div>
            </div>

            {/* Active Sessions & Device Logins */}
            <div className="bg-white dark:bg-zinc-900/80 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400">
                    <Laptop className="w-5 h-5" />
                  </span>
                  Active Devices & Login Sessions
                </h3>
                <span className="text-xs bg-emerald-50 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-300 px-3 py-1 rounded-full font-medium">
                  {sessions.length} Active Session{sessions.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="space-y-3">
                {sessions.length > 0 ? (
                  sessions.map((sess) => (
                    <div
                      key={sess.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        sess.isCurrent
                          ? "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/80"
                          : "bg-zinc-50/50 dark:bg-zinc-800/30 border-zinc-200 dark:border-zinc-800"
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 mt-0.5">
                          {sess.device === "Mobile" ? (
                            <Smartphone className="w-5 h-5 text-indigo-500" />
                          ) : (
                            <Laptop className="w-5 h-5 text-indigo-500" />
                          )}
                        </div>

                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                              {sess.os} • {sess.browser}
                            </span>
                            {sess.isCurrent && (
                              <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-semibold">
                                Current Device
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                            <span className="flex items-center gap-1 font-mono text-[11px]">
                              <Globe className="w-3 h-3 text-zinc-400" />
                              IP: {sess.ipAddress}
                            </span>
                            <span>•</span>
                            <span>{sess.location}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-zinc-400 flex items-center gap-1.5 self-start sm:self-center">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        <span>
                          {sess.lastActive
                            ? new Date(sess.lastActive).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Active Now"}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-zinc-400 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    No logged session records found.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
