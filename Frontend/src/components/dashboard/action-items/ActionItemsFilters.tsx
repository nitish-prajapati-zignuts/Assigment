import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, AlertTriangle } from "lucide-react";

interface ActionItemsFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedStatus: string;
  setSelectedStatus: (val: string) => void;
  selectedPriority: string;
  setSelectedPriority: (val: string) => void;
  selectedOwner: string;
  setSelectedOwner: (val: string) => void;
  showOverdueOnly: boolean;
  setShowOverdueOnly: (val: boolean) => void;
  uniqueOwners: string[];
}

export function ActionItemsFilters({
  searchQuery,
  setSearchQuery,
  selectedStatus,
  setSelectedStatus,
  selectedPriority,
  setSelectedPriority,
  selectedOwner,
  setSelectedOwner,
  showOverdueOnly,
  setShowOverdueOnly,
  uniqueOwners,
}: ActionItemsFiltersProps) {
  return (
    <div className="flex flex-col gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-zinc-400" />
          <Input
            placeholder="Search task, owner, meeting..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 focus-visible:ring-zinc-400 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant={showOverdueOnly ? "destructive" : "outline"}
            size="sm"
            onClick={() => setShowOverdueOnly(!showOverdueOnly)}
            className="flex items-center gap-1.5 text-xs h-9 border-zinc-200 dark:border-zinc-800"
          >
            <AlertTriangle className="h-4.5 w-4.5" />
            {showOverdueOnly ? "Showing Overdue Only" : "Filter Overdue"}
          </Button>
        </div>
      </div>

      {/* Filter Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Filter by Status
          </label>
          <Select value={selectedStatus} onValueChange={(v) => v && setSelectedStatus(v)}>
            <SelectTrigger className="h-9 text-xs bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Blocked">Blocked</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Filter by Priority
          </label>
          <Select value={selectedPriority} onValueChange={(v) => v && setSelectedPriority(v)}>
            <SelectTrigger className="h-9 text-xs bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
              <SelectItem value="All">All Priorities</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Filter by Owner
          </label>
          <Select value={selectedOwner} onValueChange={(v) => v && setSelectedOwner(v)}>
            <SelectTrigger className="h-9 text-xs bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100">
              <SelectValue placeholder="All Owners" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
              <SelectItem value="All">All Owners</SelectItem>
              {uniqueOwners.map((owner) => (
                <SelectItem key={owner} value={owner}>
                  {owner}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
