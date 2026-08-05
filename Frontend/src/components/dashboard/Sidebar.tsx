"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Video,
  CheckSquare,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/mode-toggle";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Meetings", href: "/dashboard/meetings", icon: Calendar },
  { label: "Action Tracker", href: "/dashboard/action-items", icon: CheckSquare },
  { label: "Team", href: "#", icon: Users },
  { label: "Settings", href: "#", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-zinc-200 bg-white flex flex-col justify-between dark:border-zinc-800 dark:bg-zinc-950">
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900">
              <Video className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-none">MeetNotes</h2>
              <span className="text-xs text-zinc-500">AI Assistant</span>
            </div>
          </div>
          <ModeToggle />
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

      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" />
            <AvatarFallback className="bg-zinc-200 text-xs dark:bg-zinc-800">
              NP
            </AvatarFallback>
          </Avatar>
          <div className="text-xs">
            <p className="font-medium text-zinc-900 dark:text-zinc-100">
              Nitish Prajapati
            </p>
            <p className="text-zinc-500 truncate max-w-[110px]">
              nitish@zignuts.com
            </p>
          </div>
        </div>
        <Link
          href="/login"
          className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 p-1"
          title="Logout"
        >
          <LogOut className="h-4 w-4" />
        </Link>
      </div>
    </aside>
  );
}
