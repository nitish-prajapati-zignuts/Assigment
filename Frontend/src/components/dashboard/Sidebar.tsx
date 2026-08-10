"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Calendar,
  LayoutDashboard,
  LogOut,
  Video,
  CheckSquare,
  Loader2,
  Menu,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/mode-toggle";
import api from "@/lib/axios";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Meetings", href: "/dashboard/meetings", icon: Calendar },
  { label: "Action Tracker", href: "/dashboard/action-items", icon: CheckSquare },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);

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
      router.push("/login");
    }
  };

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
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white dark:bg-indigo-500 dark:text-white shadow-sm">
              <Video className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-none text-zinc-900 dark:text-zinc-50">MeetNotes</h2>
              <span className="text-xs text-zinc-500">AI Assistant</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
            {/* Mobile close button */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1 rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" />
            <AvatarFallback className="bg-zinc-200 text-xs dark:bg-zinc-800 font-semibold text-zinc-900 dark:text-zinc-100">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="text-xs overflow-hidden">
            <p className="font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-[110px]">
              {userName}
            </p>
            <p className="text-zinc-500 truncate max-w-[110px]" title={userEmail}>
              {userEmail}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="text-zinc-500 hover:text-red-600 dark:hover:text-red-400 p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
          title="Logout"
        >
          {isLoggingOut ? (
            <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header Bar with Hamburger Button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
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
        <ModeToggle />
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-zinc-900/50 backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <aside
        className={`lg:hidden fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 transform transition-transform duration-300 ease-in-out ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop Sidebar (Always Open / Fixed width on lg screens) */}
      <aside className="hidden lg:flex w-64 border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 flex-col shrink-0 min-h-screen">
        {sidebarContent}
      </aside>
    </>
  );
}
