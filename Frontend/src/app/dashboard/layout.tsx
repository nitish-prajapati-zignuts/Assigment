"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { CommandPalette } from "@/components/dashboard/CommandPalette";
import { ShortcutsDialog } from "@/components/dashboard/ShortcutsDialog";
import { AppearanceDropdown } from "@/components/dashboard/AppearanceDropdown";
import { Search, Command } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Global Keyboard Event Listeners for ? and Action Hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore hotkeys if user is typing inside input/textarea/editable element
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }

      // ? or Shift+/ opens Shortcuts dialog
      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      }

      // Cmd+Shift Navigation Hotkeys
      if (e.metaKey || e.ctrlKey) {
        if (e.shiftKey) {
          switch (e.key.toLowerCase()) {
            case "d":
              e.preventDefault();
              router.push("/dashboard");
              break;
            case "m":
              e.preventDefault();
              router.push("/dashboard/meetings");
              break;
            case "a":
              e.preventDefault();
              router.push("/dashboard/action-items");
              break;
            case "s":
              e.preventDefault();
              router.push("/dashboard/settings");
              break;
          }
        }
      }
    };

    const handleOpenPalette = () => setIsCommandPaletteOpen(true);
    const handleOpenShortcuts = () => setIsShortcutsOpen(true);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-command-palette", handleOpenPalette);
    window.addEventListener("open-shortcuts-dialog", handleOpenShortcuts);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-command-palette", handleOpenPalette);
      window.removeEventListener("open-shortcuts-dialog", handleOpenShortcuts);
    };
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      setIsAuthenticated(false);
    } else {
      setIsAuthenticated(true);
    }

    // Prevent user from going back to login/public pages using browser back button
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [router]);

  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400">
        <div className="flex items-center gap-2 font-medium">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent dark:border-white dark:border-t-transparent" />
          <span>Authenticating...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Desktop Header bar at the top of every dashboard page */}
        <header className="hidden lg:flex items-center justify-between px-8 py-3.5 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md sticky top-0 z-20 border-b border-zinc-200/40 dark:border-zinc-800/40">
          <div className="flex-1" />
          <div className="flex-1 flex justify-center max-w-xl">
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex w-full max-w-md items-center justify-between rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 px-4 py-2 shadow-2xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-indigo-500" />
                <span>Search app...</span>
              </div>
              <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded font-mono text-[10px]">
                <Command className="h-3 w-3" /> K
              </kbd>
            </button>
          </div>
          <div className="flex-1 flex items-center justify-end">
            <AppearanceDropdown />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-8 pt-12 lg:pt-4 min-w-0">{children}</main>
      </div>
      <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />
      <ShortcutsDialog isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
    </div>
  );
}
