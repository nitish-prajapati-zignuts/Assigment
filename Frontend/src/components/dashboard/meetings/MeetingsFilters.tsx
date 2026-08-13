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
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
      <div className="relative w-full sm:w-96">
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-zinc-400" />
        <Input
          placeholder="Search by title, participant, transcript..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-zinc-50/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 focus-visible:ring-zinc-400 text-sm"
        />
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
