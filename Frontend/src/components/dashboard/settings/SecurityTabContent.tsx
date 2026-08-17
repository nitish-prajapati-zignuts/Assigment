"use client";

import React from "react";
import { motion } from "framer-motion";
import { Shield, Globe, Laptop, Smartphone, Clock } from "lucide-react";

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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-4xl mx-auto space-y-6 p-4 sm:p-6"
    >
      {/* System Security Card */}
      <div className="bg-white dark:bg-zinc-950 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-3">
        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
          <span className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
            <Shield className="w-5 h-5" />
          </span>
          Account Security & Authentication Status
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Your account is secured with JWT tokens and role-based access control. All active sessions are monitored below in real time.
        </p>
      </div>

      {/* Active Sessions & Device Logins */}
      <div className="bg-white dark:bg-zinc-950 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
            <span className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
              <Laptop className="w-5 h-5" />
            </span>
            Active Devices & Login Sessions
          </h3>
          <span className="text-xs bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 px-3 py-1 rounded-full font-semibold border border-zinc-200 dark:border-zinc-800">
            {sessions.length} Active Session{sessions.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="space-y-3">
          {sessions.length > 0 ? (
            sessions.map((sess, idx) => (
              <div
                key={sess.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  sess.isCurrent
                    ? "bg-zinc-50 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 shadow-xs"
                    : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 mt-0.5">
                    {sess.device === "Mobile" ? (
                      <Smartphone className="w-5 h-5" />
                    ) : (
                      <Laptop className="w-5 h-5" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {sess.os} • {sess.browser}
                      </span>
                      {sess.isCurrent && (
                        <span className="text-[10px] bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black px-2.5 py-0.5 rounded-full font-bold shadow-xs">
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

                <div className="text-xs text-zinc-400 flex items-center gap-1.5 self-start sm:self-center font-medium">
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
            <div className="p-6 text-center text-xs text-zinc-400 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              No logged session records found.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

