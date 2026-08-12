import { TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { LayoutDashboard, BarChart3 } from "lucide-react";

export function DashboardTabsList() {
  return (
    <TabsList className="flex w-fit items-center gap-2 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      <TabsTrigger
        value="overview"
        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all text-zinc-600 dark:text-zinc-400 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-zinc-100 data-[state=active]:shadow-sm cursor-pointer"
      >
        <LayoutDashboard className="h-5 w-5" />
        Overview & Metrics
      </TabsTrigger>
      <TabsTrigger
        value="analytics"
        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all text-zinc-600 dark:text-zinc-400 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-zinc-100 data-[state=active]:shadow-sm cursor-pointer"
      >
        <BarChart3 className="h-5 w-5" />
        Visual Analytics & Charts
      </TabsTrigger>
    </TabsList>
  );
}
