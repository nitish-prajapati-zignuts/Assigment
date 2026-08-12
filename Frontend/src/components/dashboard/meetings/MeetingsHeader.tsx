import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface MeetingsHeaderProps {
  onCreateClick: () => void;
}

export function MeetingsHeader({ onCreateClick }: MeetingsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 dark:border-zinc-800 pb-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Meeting Management
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Create, search, view, edit, and organize all your team meetings.
        </p>
      </div>
      <Button
        onClick={onCreateClick}
        className="flex items-center gap-2 shadow-sm bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 font-medium"
      >
        <Plus className="h-5 w-5" />
        Create Meeting
      </Button>
    </div>
  );
}
