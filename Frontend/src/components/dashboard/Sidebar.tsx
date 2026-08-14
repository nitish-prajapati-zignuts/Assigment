"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Calendar,
  LayoutDashboard,
  LogOut,
  Video,
  CheckSquare,
  Loader2,
  Menu,
  X,
  Settings,
  Sparkles,
  Keyboard,
  Archive,
  Bell,
  AlertTriangle,
  Lock,
  CheckCircle2,
  Trash2,
  Check,
  RefreshCw,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import api from "@/lib/axios";
import { NotificationItem } from "./NotificationDropdown";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Meetings", href: "/dashboard/meetings", icon: Calendar },
  { label: "Action Tracker", href: "/dashboard/action-items", icon: CheckSquare },
  { label: "Archive", href: "/dashboard/archive", icon: Archive },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);

  // Notification States
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

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
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Error loading user profile:", e);
    }
  }, []);

  // Poll notifications
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  // Close mobile sidebar whenever route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout request error:", err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsLoggingOut(false);
      toast.info("Logged out successfully");
      router.push("/login");
    }
  };

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

  // Group notifications date-wise
  const groupNotificationsByDate = (items: NotificationItem[]) => {
    const groups: { [key: string]: NotificationItem[] } = {};
    items.forEach((item) => {
      const date = new Date(item.createdAt);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      let key = "Older";
      if (date.toDateString() === today.toDateString()) {
        key = "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        key = "Yesterday";
      } else {
        key = date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  };

  const groupedNotifications = groupNotificationsByDate(notifications);

  const userName = user?.name || "Nitish Prajapati";
  const userEmail = user?.email || "nitish@zignuts.com";
  const userInitials =
    userName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "NP";

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-6">
      <div>
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 3 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20"
            >
              <Video className="h-5 w-5" />
            </motion.div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-bold text-lg leading-none tracking-tight text-zinc-900 dark:text-zinc-50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  MeetNotes
                </h2>
              </div>
              <span className="text-[11px] font-medium text-zinc-500">AI Assistant</span>
            </div>
          </Link>
          <div className="flex items-center gap-1.5">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.dispatchEvent(new CustomEvent("open-shortcuts-dialog"))}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Keyboard Shortcuts (?)"
            >
              <Keyboard className="h-4 w-4" />
            </motion.button>
            {/* Mobile close button */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link key={item.label} href={item.href} className="relative block">
                <motion.div
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${isActive
                    ? "text-zinc-900 dark:text-zinc-50 font-semibold"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                    }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeSidebarPill"
                      className="absolute inset-0 rounded-xl bg-zinc-100 dark:bg-zinc-800/90 border border-zinc-200/80 dark:border-zinc-700/50 shadow-sm"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <Icon
                    className={`relative z-10 h-4.5 w-4.5 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-500"}`}
                  />
                  <span className="relative z-10">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}

          {/* Notifications Nav Item */}
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="w-full relative block text-left"
          >
            <motion.div
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
              className="relative flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Bell className="relative z-10 h-4.5 w-4.5 text-zinc-500" />
                <span className="relative z-10">Notifications</span>
              </div>
              {unreadCount > 0 && (
                <span className="relative z-15 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-xs animate-pulse">
                  {unreadCount}
                </span>
              )}
            </motion.div>
          </button>
        </nav>
      </div>

      <div className="pt-4 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 ring-2 ring-indigo-500/20">
            <AvatarImage src="" />
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="text-xs overflow-hidden">
            <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[110px]">{userName}</p>
            <p className="text-zinc-500 truncate max-w-[110px]" title={userEmail}>
              {userEmail}
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="text-zinc-500 hover:text-red-600 dark:hover:text-red-400 p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50 cursor-pointer"
          title="Logout"
        >
          {isLoggingOut ? (
            <Loader2 className="h-4.5 w-4.5 animate-spin text-zinc-500" />
          ) : (
            <LogOut className="h-4.5 w-4.5" />
          )}
        </motion.button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-bold text-base text-zinc-900 dark:text-zinc-100">MeetNotes</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Bell Trigger in Mobile Header Bar */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsNotificationsOpen(true)}
            className="relative p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Notifications Center"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-xs animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.dispatchEvent(new CustomEvent("open-shortcuts-dialog"))}
            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Keyboard Shortcuts (?)"
          >
            <Keyboard className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 bg-zinc-950/60 backdrop-blur-xs"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Drawer Sidebar */}
      <aside
        className={`lg:hidden fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 transform transition-transform duration-300 ease-out ${isMobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-zinc-200/80 bg-white dark:border-zinc-800/80 dark:bg-zinc-950 flex-col shrink-0 min-h-screen">
        {sidebarContent}
      </aside>

      {/* Slide-over Notifications Drawer Panel */}
      <AnimatePresence>
        {isNotificationsOpen && (
          <>
            {/* Dark Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-zinc-950/45 backdrop-blur-xs"
              onClick={() => setIsNotificationsOpen(false)}
            />
            {/* Notification Center panel body */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-55 w-full max-w-md bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800/80 shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-50">Notification Feed</h3>
                    {unreadCount > 0 ? (
                      <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                        {unreadCount} unread activity log{unreadCount !== 1 ? "s" : ""}
                      </p>
                    ) : (
                      <p className="text-[11px] text-zinc-400 mt-0.5">All activity caught up</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setIsNotificationsOpen(false)}
                  className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-850 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Feed Actions */}
              {notifications.length > 0 && (
                <div className="px-6 py-3 border-b border-zinc-100 dark:border-zinc-900/60 bg-zinc-50/50 dark:bg-zinc-900/20 flex items-center justify-between text-xs font-semibold">
                  <button
                    onClick={handleMarkAllRead}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" /> Read All
                  </button>
                  <button
                    onClick={handleClearAll}
                    className="text-zinc-500 hover:text-red-500 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear All
                  </button>
                </div>
              )}

              {/* List Scroll Feed */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {isLoading && notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-zinc-400 gap-2">
                    <RefreshCw className="h-6 w-6 animate-spin text-indigo-500" />
                    <span className="text-xs font-semibold">Loading notification feed...</span>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center text-zinc-400 space-y-2">
                    <CheckCircle2 className="h-10 w-10 text-zinc-300 dark:text-zinc-700" />
                    <div>
                      <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">All caught up!</p>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">No alerts or notifications recorded.</p>
                    </div>
                  </div>
                ) : (
                  Object.entries(groupedNotifications).map(([dateKey, items]) => (
                    <div key={dateKey} className="space-y-3">
                      <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 pl-1">
                        {dateKey}
                      </h4>
                      <div className="space-y-2.5">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className={`p-4 rounded-2xl border transition-all ${item.isRead
                                ? "bg-zinc-50/40 dark:bg-zinc-900/30 border-zinc-200/50 dark:border-zinc-800/50 opacity-80"
                                : "bg-indigo-50/15 dark:bg-indigo-950/15 border-indigo-200/60 dark:border-indigo-900/50 ring-2 ring-indigo-500/5 shadow-2xs"
                              }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700/60 shadow-2xs mt-0.5">
                                {getNotificationIcon(item.type)}
                              </div>
                              <div className="flex-1 space-y-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200 truncate">{item.title}</span>
                                  <span className="text-[9px] text-zinc-400 dark:text-zinc-500 shrink-0 font-medium">
                                    {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                </div>
                                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                                  {item.message}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
