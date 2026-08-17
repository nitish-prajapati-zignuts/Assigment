import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

interface MeetingsFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
}

export function MeetingsFilters({ searchQuery, setSearchQuery, selectedType, setSelectedType }: MeetingsFiltersProps) {
  const [isFocused, setIsFocused] = useState(false);
  const showPlaceholder = !searchQuery && !isFocused;

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
      <div className="relative w-full sm:w-[480px]">
        <Search
          className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 transition-opacity duration-200 ${showPlaceholder ? "opacity-0" : "opacity-100"}`}
        />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 focus-visible:ring-zinc-400 text-sm w-full h-11 transition-all duration-200 ${showPlaceholder ? "text-center" : "text-left pl-9"}`}
        />
        {showPlaceholder && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 pointer-events-none text-zinc-400 text-sm">
            <Search className="h-4 w-4" />
            <span>Search by title, participant, transcript...</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hidden sm:block">
          <Filter className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
        </div>
        <Select
          value={selectedType}
          onValueChange={(val) => {
            if (val) setSelectedType(val);
          }}
        >
          <SelectTrigger className="w-full sm:w-52 bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 text-sm text-zinc-900 dark:text-zinc-100">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
            <SelectItem value="All">All Types</SelectItem>
            <SelectItem value="Client Meeting">Client Meeting</SelectItem>
            <SelectItem value="Sales Meeting">Sales Meeting</SelectItem>
            <SelectItem value="Project Meeting">Project Meeting</SelectItem>
            <SelectItem value="Internal Meeting">Internal Meeting</SelectItem>
            <SelectItem value="Requirement Discussion">Requirement Discussion</SelectItem>
            <SelectItem value="Retrospective">Retrospective</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
