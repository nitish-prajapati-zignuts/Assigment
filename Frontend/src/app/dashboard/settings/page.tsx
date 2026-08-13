"use client";

import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

import { SettingsHeader } from "@/components/dashboard/settings/SettingsHeader";
import { SettingsTabs, SettingsTabType } from "@/components/dashboard/settings/SettingsTabs";
import { AiTabContent, AppSettings } from "@/components/dashboard/settings/AiTabContent";
import { NotificationsTabContent } from "@/components/dashboard/settings/NotificationsTabContent";
import { SecurityTabContent, UserSession } from "@/components/dashboard/settings/SecurityTabContent";
import { ChangePassword } from "@/components/dashboard/settings/ChangePasswordTab";

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
  const [activeTab, setActiveTab] = useState<SettingsTabType>("ai");
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
        toast.success("Settings saved successfully!");
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (e) {
      console.error("Failed to save settings to API:", e);
      toast.error("Failed to save settings");
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
      toast.success("Settings reset to defaults");
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error("Failed to reset settings:", e);
      toast.error("Failed to reset settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-zinc-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <span className="text-sm font-medium">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center py-6 px-4">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <SettingsHeader
          handleReset={handleReset}
          handleSave={handleSave}
          isSaving={isSaving}
          savedSuccess={savedSuccess}
        />

        {/* Navigation Tabs (Without horizontal border-b line) */}
        <SettingsTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Content Components */}
        {activeTab === "ai" && <AiTabContent settings={settings} setSettings={setSettings} />}
        {activeTab === "notifications" && <NotificationsTabContent settings={settings} setSettings={setSettings} />}
        {activeTab === "security" && <SecurityTabContent sessions={sessions} />}
        {activeTab === "Change Password" && <ChangePassword />}
      </div>
    </div>
  );
}
