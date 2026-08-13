"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Keyboard, Command, Search, Plus, Calendar, LayoutDashboard, CheckSquare, Settings, X } from "lucide-react";

interface ShortcutsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutsDialog({ isOpen, onClose }: ShortcutsDialogProps) {
  const shortcutGroups = [
    {
      category: "Global & Search",
      items: [
        { keys: ["?"], label: "Toggle Keyboard Shortcuts Dialog", icon: Keyboard },
        { keys: ["Cmd", "K"], label: "Open Command Palette / Global Search", icon: Search },
        { keys: ["Esc"], label: "Close Active Modal / Dialog", icon: X },
      ],
    },
    {
      category: "Quick Navigation",
      items: [
        { keys: ["Cmd", "Shift", "D"], label: "Go to Dashboard Overview", icon: LayoutDashboard },
        { keys: ["Cmd", "Shift", "M"], label: "Go to Meetings Catalog", icon: Calendar },
        { keys: ["Cmd", "Shift", "A"], label: "Go to Action Tracker", icon: CheckSquare },
        { keys: ["Cmd", "Shift", "S"], label: "Go to Settings", icon: Settings },
      ],
    },
    {
      category: "Creation Actions",
      items: [
        { keys: ["Cmd", "Alt", "N"], label: "Create New Meeting Note", icon: Plus },
        { keys: ["Cmd", "Alt", "T"], label: "Add New Action Deliverable", icon: Plus },
      ],
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Dialog Card Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl rounded-3xl overflow-hidden z-10 p-6 space-y-5"
          >
            {/* Dialog Header */}
            <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Keyboard className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Keyboard Shortcuts</h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Boost your productivity with global hotkey shortcuts.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Shortcut Groups */}
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {shortcutGroups.map((group) => (
                <div key={group.category} className="space-y-2">
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    {group.category}
                  </h3>
                  <div className="space-y-1.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.label}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50/70 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-800/60 text-xs text-zinc-800 dark:text-zinc-200 font-medium"
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="h-4 w-4 text-zinc-400" />
                            <span>{item.label}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {item.keys.map((k, i) => (
                              <kbd
                                key={i}
                                className="px-2 py-0.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md font-mono text-[11px] font-bold shadow-2xs text-zinc-700 dark:text-zinc-300"
                              >
                                {k === "Cmd" ? (
                                  <span className="flex items-center gap-0.5">
                                    <Command className="h-3 w-3" /> ⌘
                                  </span>
                                ) : (
                                  k
                                )}
                              </kbd>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Dialog Footer */}
            <div className="pt-3 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
              <span>
                Press <kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded font-mono text-[10px]">?</kbd>{" "}
                anytime to open
              </span>
              <span className="font-semibold text-indigo-500">MeetNotes Productivity</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
