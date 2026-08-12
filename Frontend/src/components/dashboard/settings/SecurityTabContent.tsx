"use client";

import React from "react";
import { Shield, Key, Globe, Check, Laptop, Smartphone, Clock } from "lucide-react";

export interface UserSession {
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

interface SecurityTabContentProps {
  sessions: UserSession[];
}

export function SecurityTabContent({ sessions }: SecurityTabContentProps) {
  return (
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
  );
}
