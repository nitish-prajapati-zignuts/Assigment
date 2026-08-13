"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { CommandPalette } from "@/components/dashboard/CommandPalette";
import { ShortcutsDialog } from "@/components/dashboard/ShortcutsDialog";

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
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pt-16 md:pt-16 lg:pt-8">{children}</main>
      <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />
      <ShortcutsDialog isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
    </div>
  );
}
