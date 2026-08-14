"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Calendar,
  LayoutDashboard,
  CheckSquare,
  Settings,
  Plus,
  Sun,
  Moon,
  FileSpreadsheet,
  ArrowRight,
  X,
  Archive,
} from "lucide-react";
import api from "@/lib/axios";
import { exportMeetingsToCSV, exportActionItemsToCSV } from "@/lib/exportUtils";
import { toast } from "sonner";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = RouterHook();
  const { theme, setTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [meetings, setMeetings] = useState<any[]>([]);
  const [actionItems, setActionItems] = useState<any[]>([]);

  // Custom router hook wrapper
  function RouterHook() {
    return useRouter();
  }

  // Handle Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Trigger open via custom event if needed
          window.dispatchEvent(new CustomEvent("open-command-palette"));
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Fetch quick search suggestions when query is typed
  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      return;
    }

    const fetchData = async () => {
      try {
        const [mRes, aRes] = await Promise.all([
          api.get("/meetings", { params: { limit: 10 } }).catch(() => ({ data: [] })),
          api.get("/action-items", { params: { limit: 10 } }).catch(() => ({ data: [] })),
        ]);
        setMeetings(Array.isArray(mRes.data?.data) ? mRes.data.data : Array.isArray(mRes.data) ? mRes.data : []);
        setActionItems(Array.isArray(aRes.data?.data) ? aRes.data.data : Array.isArray(aRes.data) ? aRes.data : []);
      } catch (err) {
        console.error("Command palette fetch error:", err);
      }
    };

    fetchData();
  }, [isOpen]);

  const navigateTo = (path: string) => {
    router.push(path);
    onClose();
  };

  const navCommands = [
    { title: "Go to Dashboard Overview", icon: LayoutDashboard, action: () => navigateTo("/dashboard") },
    { title: "Go to Meetings Catalog", icon: Calendar, action: () => navigateTo("/dashboard/meetings") },
    { title: "Go to Action Tracker", icon: CheckSquare, action: () => navigateTo("/dashboard/action-items") },
    { title: "Go to Archive", icon: Archive, action: () => navigateTo("/dashboard/archive") },
    { title: "Go to Trash", icon: Archive, action: () => navigateTo("/dashboard/trash") },
    { title: "Go to Settings", icon: Settings, action: () => navigateTo("/dashboard/settings") },
  ];

  const actionCommands = [
    {
      title: "Create New Meeting Note",
      icon: Plus,
      action: () => navigateTo("/dashboard/meetings?action=new"),
    },
    {
      title: "Add New Action Item",
      icon: Plus,
      action: () => navigateTo("/dashboard/action-items?action=new"),
    },
    {
      title: `Switch Theme to ${theme === "dark" ? "Light" : "Dark"} Mode`,
      icon: theme === "dark" ? Sun : Moon,
      action: () => {
        setTheme(theme === "dark" ? "light" : "dark");
        toast.success(`Switched theme to ${theme === "dark" ? "Light" : "Dark"} Mode`);
        onClose();
      },
    },
    {
      title: "Export Action Tracker Items to CSV",
      icon: FileSpreadsheet,
      action: async () => {
        if (actionItems.length === 0) {
          toast.error("No action items available to export");
        } else {
          exportActionItemsToCSV(actionItems);
          toast.success("Action items exported to CSV");
        }
        onClose();
      },
    },
    {
      title: "Export Meetings List to CSV",
      icon: FileSpreadsheet,
      action: async () => {
        if (meetings.length === 0) {
          toast.error("No meetings available to export");
        } else {
          exportMeetingsToCSV(meetings);
          toast.success("Meetings catalog exported to CSV");
        }
        onClose();
      },
    },
  ];

  const filteredNav = navCommands.filter((c) => c.title.toLowerCase().includes(query.toLowerCase()));
  const filteredActions = actionCommands.filter((c) => c.title.toLowerCase().includes(query.toLowerCase()));
  const filteredMeetings = meetings.filter(
    (m) =>
      m.title.toLowerCase().includes(query.toLowerCase()) ||
      (m.participants && m.participants.some((p: string) => p.toLowerCase().includes(query.toLowerCase())))
  );
  const filteredActionItems = actionItems.filter(
    (a) =>
      (a.task && a.task.toLowerCase().includes(query.toLowerCase())) ||
      (a.owner && a.owner.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl rounded-2xl overflow-hidden z-10"
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-4 border-b border-zinc-200 dark:border-zinc-800">
              <Search className="h-5 w-5 text-zinc-400 shrink-0 mr-3" />
              <input
                type="text"
                autoFocus
                placeholder="Type a command, meeting title, task, or search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-14 bg-transparent text-sm sm:text-base text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
              />
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Results Container */}
            <div className="max-h-[60vh] overflow-y-auto p-2 sm:p-3 space-y-4">
              {/* Navigation Group */}
              {filteredNav.length > 0 && (
                <div>
                  <span className="px-2 text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                    Navigation
                  </span>
                  <div className="mt-1 space-y-1">
                    {filteredNav.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.title}
                          onClick={item.action}
                          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-zinc-800 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-300 text-xs sm:text-sm font-medium transition-all group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="h-4.5 w-4.5 text-zinc-400 group-hover:text-indigo-500 transition-colors" />
                            <span>{item.title}</span>
                          </div>
                          <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quick Actions Group */}
              {filteredActions.length > 0 && (
                <div>
                  <span className="px-2 text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                    Quick Actions
                  </span>
                  <div className="mt-1 space-y-1">
                    {filteredActions.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.title}
                          onClick={item.action}
                          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-zinc-800 dark:text-zinc-200 hover:text-indigo-600 dark:hover:text-indigo-300 text-xs sm:text-sm font-medium transition-all group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="h-4.5 w-4.5 text-zinc-400 group-hover:text-indigo-500 transition-colors" />
                            <span>{item.title}</span>
                          </div>
                          <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Meetings Search Results */}
              {query && filteredMeetings.length > 0 && (
                <div>
                  <span className="px-2 text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                    Meetings ({filteredMeetings.length})
                  </span>
                  <div className="mt-1 space-y-1">
                    {filteredMeetings.slice(0, 5).map((m) => (
                      <button
                        key={m.id}
                        onClick={() => navigateTo("/dashboard/meetings")}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm font-medium transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-3 truncate">
                          <Calendar className="h-4.5 w-4.5 text-indigo-500 shrink-0" />
                          <div className="flex flex-col text-left truncate">
                            <span className="truncate font-semibold">{m.title}</span>
                            <span className="text-[11px] text-zinc-400">
                              {m.date} &bull; {m.type}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Items Search Results */}
              {query && filteredActionItems.length > 0 && (
                <div>
                  <span className="px-2 text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                    Action Items ({filteredActionItems.length})
                  </span>
                  <div className="mt-1 space-y-1">
                    {filteredActionItems.slice(0, 5).map((a) => (
                      <button
                        key={a.id}
                        onClick={() => navigateTo("/dashboard/action-items")}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm font-medium transition-all group cursor-pointer"
                      >
                        <div className="flex items-center gap-3 truncate">
                          <CheckSquare className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                          <div className="flex flex-col text-left truncate">
                            <span className="truncate font-semibold">{a.task}</span>
                            <span className="text-[11px] text-zinc-400">Owner: {a.owner || "Unassigned"}</span>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {query &&
                filteredNav.length === 0 &&
                filteredActions.length === 0 &&
                filteredMeetings.length === 0 &&
                filteredActionItems.length === 0 && (
                  <div className="p-8 text-center text-zinc-400 text-xs sm:text-sm">
                    No results found for &quot;
                    <span className="font-semibold text-zinc-600 dark:text-zinc-300">{query}</span>&quot;
                  </div>
                )}
            </div>

            {/* Modal Footer Key Hints */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded font-mono text-[10px] shadow-2xs">
                    Cmd K
                  </kbd>{" "}
                  Toggle
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded font-mono text-[10px] shadow-2xs">
                    Esc
                  </kbd>{" "}
                  Close
                </span>
              </div>
              <span className="font-semibold text-indigo-500">Syncra Assistant</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
