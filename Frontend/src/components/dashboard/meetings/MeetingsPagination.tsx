import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MeetingsPaginationProps {
  currentPage: number;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  isFilterActive: boolean;
  displayCount: number;
  searchQuery: string;
  selectedType: string;
}

export function MeetingsPagination({
  currentPage,
  setCurrentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  isFilterActive,
  displayCount,
  searchQuery,
  selectedType,
}: MeetingsPaginationProps) {
  if (isFilterActive && displayCount > 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 px-5 py-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm text-xs">
        <div className="text-zinc-500 dark:text-zinc-400">
          Found <span className="font-semibold text-zinc-900 dark:text-zinc-100">{displayCount}</span> matching meeting(s)
          {searchQuery && (
            <span>
              {" "}for &quot;<span className="font-semibold text-zinc-900 dark:text-zinc-100">{searchQuery}</span>&quot;
            </span>
          )}
          {selectedType !== "All" && (
            <span>
              {" "}in <span className="font-semibold text-zinc-900 dark:text-zinc-100">{selectedType}</span>
            </span>
          )}
        </div>
      </div>
    );
  }

  if (isFilterActive || totalItems === 0) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-4 sm:px-5 sm:py-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm text-xs">
      <div className="text-zinc-500 dark:text-zinc-400 text-center sm:text-left text-[11px] sm:text-xs">
        Showing <span className="font-semibold text-zinc-900 dark:text-zinc-100">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
          {Math.min(currentPage * itemsPerPage, totalItems)}
        </span>{" "}
        of <span className="font-semibold text-zinc-900 dark:text-zinc-100">{totalItems}</span> meetings
      </div>

      <div className="flex items-center justify-center gap-1 sm:gap-1.5 w-full sm:w-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="h-8 px-2 sm:px-3 text-xs flex items-center gap-1 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 shrink-0"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="hidden xs:inline sm:inline">Previous</span>
        </Button>

        <div className="flex items-center gap-0.5 sm:gap-1 px-1 overflow-x-auto max-w-[200px] xs:max-w-none justify-center">
          {(() => {
            const pages: (number | string)[] = [];
            if (totalPages <= 5) {
              for (let i = 1; i <= totalPages; i++) pages.push(i);
            } else {
              pages.push(1);
              if (currentPage > 3) {
                pages.push("...");
              }
              const start = Math.max(2, currentPage - 1);
              const end = Math.min(totalPages - 1, currentPage + 1);
              for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) pages.push(i);
              }
              if (currentPage < totalPages - 2) {
                pages.push("...");
              }
              if (!pages.includes(totalPages)) {
                pages.push(totalPages);
              }
            }

            return pages.map((page, idx) =>
              typeof page === "number" ? (
                <Button
                  key={idx}
                  variant={currentPage === page ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={`h-7 w-7 text-xs p-0 font-medium shrink-0 ${
                    currentPage === page
                      ? "bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`}
                >
                  {page}
                </Button>
              ) : (
                <span key={idx} className="px-0.5 text-xs text-zinc-400 font-medium shrink-0">
                  ...
                </span>
              )
            );
          })()}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="h-8 px-2 sm:px-3 text-xs flex items-center gap-1 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 shrink-0"
        >
          <span className="hidden xs:inline sm:inline">Next</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
