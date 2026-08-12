import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, ListTodo } from "lucide-react";

export function DashboardHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 dark:border-zinc-800 pb-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Dashboard Overview
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Real-time analytics, action tracker status, and recently created meetings.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
        <Link href="/dashboard/action-items" className="w-full sm:w-auto">
          <Button
            variant="outline"
            className="w-full sm:w-auto flex items-center justify-center gap-2 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
          >
            <ListTodo className="h-5 w-5 text-zinc-500" />
            Action Tracker
          </Button>
        </Link>
        <Link href="/dashboard/meetings" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto flex items-center justify-center gap-2 shadow-sm bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 font-medium">
            <Plus className="h-5 w-5" />
            Manage Meetings
          </Button>
        </Link>
      </div>
    </div>
  );
}
