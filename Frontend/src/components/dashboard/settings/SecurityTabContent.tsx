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
      className="space-y-6"
    >
      {/* System Security Card */}
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-4">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400">
            <Shield className="w-5 h-5" />
          </span>
          Account Security & Authentication Status
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Your account is secured with JWT tokens and role-based access control. All active sessions are monitored below
          in real time.
        </p>
      </div>

      {/* Active Sessions & Device Logins */}
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400">
              <Laptop className="w-5 h-5" />
            </span>
            Active Devices & Login Sessions
          </h3>
          <span className="text-xs bg-emerald-50 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-300 px-3 py-1 rounded-full font-semibold border border-emerald-200/50 dark:border-emerald-800/50">
            {sessions.length} Active Session{sessions.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="space-y-3">
          {sessions.length > 0 ? (
            sessions.map((sess, idx) => (
              <motion.div
                key={sess.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                whileHover={{ scale: 1.01 }}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  sess.isCurrent
                    ? "bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200/80 dark:border-indigo-800/80 shadow-xs"
                    : "bg-zinc-50/50 dark:bg-zinc-800/30 border-zinc-200/60 dark:border-zinc-800"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 mt-0.5 shadow-xs">
                    {sess.device === "Mobile" ? (
                      <Smartphone className="w-5 h-5 text-indigo-500" />
                    ) : (
                      <Laptop className="w-5 h-5 text-indigo-500" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {sess.os} • {sess.browser}
                      </span>
                      {sess.isCurrent && (
                        <span className="text-[10px] bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-2.5 py-0.5 rounded-full font-bold shadow-xs">
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
              </motion.div>
            ))
          ) : (
            <div className="p-6 text-center text-xs text-zinc-400 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              No logged session records found.
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
