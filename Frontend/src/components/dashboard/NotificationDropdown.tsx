"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Sparkles, AlertTriangle, Lock, CheckCircle2, Trash2, Check, RefreshCw } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "ai_summary" | "overdue_task" | "security_access" | "general";
  isRead: boolean;
  createdAt: string;
}

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/notifications");
      if (res.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("Marked all notifications as read");
    } catch (err) {
      console.error("Failed to mark notifications read:", err);
    }
  };

  const handleClearAll = async () => {
    try {
      await api.delete("/notifications");
      setNotifications([]);
      setUnreadCount(0);
      toast.info("Cleared all notifications");
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    }
  };

  const getNotificationIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "ai_summary":
        return <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />;
      case "overdue_task":
        return <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />;
      case "security_access":
        return <Lock className="h-4 w-4 text-purple-500 shrink-0" />;
      default:
        return <Bell className="h-4 w-4 text-indigo-500 shrink-0" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-2xs cursor-pointer"
        title="Notifications Center"
      >
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-xs animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </motion.button>

      {/* Dropdown Menu Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl rounded-2xl overflow-hidden z-50 p-3 space-y-2"
          >
            {/* Dropdown Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-zinc-200/80 dark:border-zinc-800/80 px-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-zinc-900 dark:text-zinc-50">
                  Notification Feed
                </span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 px-1.5 py-0.5"
                    title="Mark all as read"
                  >
                    <Check className="h-3 w-3" /> Read All
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="text-[10px] font-semibold text-zinc-400 hover:text-red-500 flex items-center gap-0.5 px-1.5 py-0.5 transition-colors"
                    title="Clear notifications"
                  >
                    <Trash2 className="h-3 w-3" /> Clear
                  </button>
                )}
              </div>
            </div>

            {/* Notification Items List */}
            <div className="max-h-80 overflow-y-auto space-y-1.5 pr-0.5">
              {isLoading && notifications.length === 0 ? (
                <div className="flex items-center justify-center p-6 text-xs text-zinc-400 gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-indigo-500" />
                  <span>Loading activity logs...</span>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 text-zinc-400 space-y-1">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-700" />
                  <p className="text-xs font-medium">All caught up!</p>
                  <p className="text-[11px] text-zinc-400">No new notifications or alerts.</p>
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`p-2.5 rounded-xl border text-xs transition-all ${
                      item.isRead
                        ? "bg-zinc-50/50 dark:bg-zinc-800/40 border-zinc-200/50 dark:border-zinc-800/50 opacity-75"
                        : "bg-indigo-50/40 dark:bg-indigo-950/30 border-indigo-200/80 dark:border-indigo-900/60 font-medium"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {getNotificationIcon(item.type)}
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                            {item.title}
                          </p>
                          <span className="text-[9px] text-zinc-400 shrink-0">
                            {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-snug">
                          {item.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
