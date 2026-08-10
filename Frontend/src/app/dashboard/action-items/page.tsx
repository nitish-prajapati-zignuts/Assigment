"use client";

import { useState, useMemo, useEffect } from "react";
import api from "@/lib/axios";
import { ActionItem, Meeting } from "@/types/meeting";
import { CreateActionItemModal } from "@/components/dashboard/CreateActionItemModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Plus,
  Search,
  Filter,
  CheckSquare,
  AlertTriangle,
  Clock,
  User,
  Calendar,
  Edit,
  Trash2,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface ActionItemWithContext extends ActionItem {
  id: string;
  meetingId: string;
  meetingTitle: string;
  isOverdue: boolean;
}

export default function ActionTrackerPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [actionItems, setActionItems] = useState<ActionItemWithContext[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedPriority, setSelectedPriority] = useState<string>("All");
  const [selectedOwner, setSelectedOwner] = useState<string>("All");
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);

  // Pagination state (Server-side pagination)
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<
    (ActionItem & { meetingId?: string; id?: string }) | null
  >(null);

  // Reset to page 1 whenever any filter or search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    selectedStatus,
    selectedPriority,
    selectedOwner,
    showOverdueOnly,
  ]);

  // Fetch real meetings from API
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const res = await api.get("/meetings");
        const meetingsData = res.data?.data || res.data;
        if (Array.isArray(meetingsData)) {
          setMeetings(meetingsData);
        }
      } catch (err) {
        console.error("Failed to fetch meetings for action tracker:", err);
      }
    };
    fetchMeetings();
  }, []);

  // Helper to check if item is overdue
  const checkIsOverdue = (dueDate: string, status: string): boolean => {
    if (!dueDate || dueDate === "Not specified" || status === "Completed") {
      return false;
    }
    const today = new Date().toISOString().split("T")[0];
    return dueDate < today;
  };

  const stripHtml = (input: string | null | undefined): string => {
    if (!input) return "";
    let str = input;
    if (/<[a-z][\s\S]*>/i.test(str)) {
      str = str
        .replace(/<br\s*\/?>/gi, " ")
        .replace(/<\/(p|div|li|tr|h[1-6])>/gi, "\n")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/&rsquo;/gi, "'")
        .replace(/&lsquo;/gi, "'")
        .replace(/&rdquo;/gi, '"')
        .replace(/&ldquo;/gi, '"')
        .replace(/&mdash;/gi, "—")
        .replace(/&ndash;/gi, "–")
        .replace(/[ \t]+/g, " ")
        .replace(/\n\s*\n+/g, "\n")
        .trim();
    } else {
      str = str
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/&rsquo;/gi, "'")
        .replace(/&lsquo;/gi, "'")
        .replace(/&rdquo;/gi, '"')
        .replace(/&ldquo;/gi, '"')
        .replace(/&mdash;/gi, "—")
        .replace(/&ndash;/gi, "–")
        .replace(/[ \t]+/g, " ")
        .trim();
    }
    return str;
  };

  // Build aggregated action items from API with server-side pagination
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setIsLoading(true);
        const res = await api.get("/action-items", {
          params: {
            page: currentPage,
            limit: ITEMS_PER_PAGE,
          },
        });

        console.log("Action Items API Response:", res.data);

        if (res.data.data && res.data.pagination) {
          // Server-side paginated response
          const formatted = res.data.data.map((item: any) => ({
            id: item.id || `item-${Math.random()}`,
            meetingId: item.meetingId || "1",
            meetingTitle:
              meetings.find((m) => m.id === item.meetingId)?.title ||
              "General Meeting",
            task: stripHtml(item.task),
            owner: stripHtml(item.owner) || "Unassigned",
            dueDate: stripHtml(item.dueDate) || "Not specified",
            priority: item.priority || "Medium",
            status: item.status || "Open",
            isOverdue: checkIsOverdue(item.dueDate, item.status),
          }));
          setActionItems(formatted);
          setTotalPages(res.data.pagination.totalPages);
          setTotalItems(res.data.pagination.total);
        } else if (Array.isArray(res.data)) {
          // Fallback for non-paginated response
          const formatted = res.data.map((item: any) => ({
            id: item.id || `item-${Math.random()}`,
            meetingId: item.meetingId || "1",
            meetingTitle:
              meetings.find((m) => m.id === item.meetingId)?.title ||
              "General Meeting",
            task: stripHtml(item.task),
            owner: stripHtml(item.owner) || "Unassigned",
            dueDate: stripHtml(item.dueDate) || "Not specified",
            priority: item.priority || "Medium",
            status: item.status || "Open",
            isOverdue: checkIsOverdue(item.dueDate, item.status),
          }));
          setActionItems(formatted);
          setTotalPages(1);
          setTotalItems(formatted.length);
        } else {
          setActionItems([]);
          setTotalPages(1);
          setTotalItems(0);
        }
      } catch (err) {
        console.error("Failed to fetch action items from API:", err);
        setActionItems([]);
        setTotalPages(1);
        setTotalItems(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [meetings, currentPage]);

  // Extract unique owners for filter dropdown
  const uniqueOwners = useMemo(() => {
    const set = new Set<string>();
    actionItems.forEach((item) => {
      if (item.owner) set.add(item.owner);
    });
    return Array.from(set);
  }, [actionItems]);

  // Client-side filtering for search and filters
  const filteredItems = useMemo(() => {
    return actionItems.filter((item) => {
      const matchesSearch =
        item.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.meetingTitle.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedStatus === "All" || item.status === selectedStatus;

      const matchesPriority =
        selectedPriority === "All" || item.priority === selectedPriority;

      const matchesOwner =
        selectedOwner === "All" || item.owner === selectedOwner;

      const matchesOverdue = !showOverdueOnly || item.isOverdue;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesOwner &&
        matchesOverdue
      );
    });
  }, [
    actionItems,
    searchQuery,
    selectedStatus,
    selectedPriority,
    selectedOwner,
    showOverdueOnly,
  ]);

  // Use filtered items for display
  const displayItems = filteredItems;

  // Summary Metrics (based on all action items, not just current page)
  const [allActionItems, setAllActionItems] = useState<ActionItemWithContext[]>([]);

  // Fetch all action items for metrics (without pagination)
  useEffect(() => {
    const fetchAllItems = async () => {
      try {
        const res = await api.get("/action-items", {
          params: {
            page: 1,
            limit: 1000, // Get all items for metrics
          },
        });

        if (res.data.data) {
          const formatted = res.data.data.map((item: any) => ({
            id: item.id || `item-${Math.random()}`,
            meetingId: item.meetingId || "1",
            meetingTitle: "General Meeting",
            task: stripHtml(item.task),
            owner: stripHtml(item.owner) || "Unassigned",
            dueDate: stripHtml(item.dueDate) || "Not specified",
            priority: item.priority || "Medium",
            status: item.status || "Open",
            isOverdue: checkIsOverdue(item.dueDate, item.status),
          }));
          setAllActionItems(formatted);
        }
      } catch (err) {
        console.error("Failed to fetch all action items for metrics:", err);
      }
    };

    fetchAllItems();
  }, []);

  const metrics = useMemo(() => {
    const total = allActionItems.length;
    const inProgress = allActionItems.filter(
      (i) => i.status === "In Progress"
    ).length;
    const blocked = allActionItems.filter((i) => i.status === "Blocked").length;
    const overdue = allActionItems.filter((i) => i.isOverdue).length;

    return { total, inProgress, blocked, overdue };
  }, [allActionItems]);



  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case "Urgent":
        return "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/80 dark:text-red-300 dark:border-red-800 font-semibold";
      case "High":
        return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800 font-semibold";
      case "Medium":
        return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800";
      case "Low":
        return "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700";
      default:
        return "bg-zinc-100 text-zinc-700 border-zinc-200";
    }
  };

  // Status Change Handler
  const handleStatusChange = async (
    id: string,
    newStatus: ActionItem["status"]
  ) => {
    try {
      await api.put(`/action-items/${id}`, { status: newStatus });
      setActionItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
              ...item,
              status: newStatus,
              isOverdue: checkIsOverdue(item.dueDate, newStatus),
            }
            : item
        )
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // Create / Edit Handler
  const handleSaveItem = async (
    itemData: Partial<ActionItem> & { meetingId: string }
  ) => {
    try {
      if (itemData.id && !itemData.id.includes("-item-")) {
        const res = await api.put(`/action-items/${itemData.id}`, itemData);
        setActionItems((prev) =>
          prev.map((item) =>
            item.id === itemData.id
              ? {
                ...item,
                task: stripHtml(res.data.task),
                owner: stripHtml(res.data.owner),
                dueDate: stripHtml(res.data.dueDate),
                priority: res.data.priority,
                status: res.data.status,
                isOverdue: checkIsOverdue(res.data.dueDate, res.data.status),
              }
              : item
          )
        );
      } else {
        const res = await api.post("/action-items", itemData);
        const meetingObj = meetings.find((m) => m.id === itemData.meetingId);
        const newItemWithContext: ActionItemWithContext = {
          id: res.data.id || `item-${Date.now()}`,
          meetingId: itemData.meetingId,
          meetingTitle: meetingObj ? meetingObj.title : "General Meeting",
          task: stripHtml(res.data.task || itemData.task),
          owner: stripHtml(res.data.owner || itemData.owner) || "Unassigned",
          dueDate:
            stripHtml(res.data.dueDate || itemData.dueDate) || "Not specified",
          priority: res.data.priority || itemData.priority || "Medium",
          status: res.data.status || itemData.status || "Open",
          isOverdue: checkIsOverdue(
            res.data.dueDate || itemData.dueDate || "",
            res.data.status || itemData.status || "Open"
          ),
        };
        setActionItems((prev) => [newItemWithContext, ...prev]);
      }
    } catch (err) {
      console.error("Failed to save action item:", err);
    }
  };

  // Delete Handler
  const handleDeleteItem = async (id: string) => {
    if (confirm("Are you sure you want to delete this action item?")) {
      try {
        await api.delete(`/action-items/${id}`);
        setActionItems((prev) => prev.filter((item) => item.id !== id));
      } catch (err) {
        console.error("Failed to delete action item:", err);
      }
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header & Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 dark:border-zinc-800 pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Action Tracker
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage, filter, and track deliverables extracted across all meeting notes.
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingItem(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 shadow-sm bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 font-medium"
        >
          <Plus className="h-4 w-4" />
          Add Action Item
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm transition-all duration-200 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Total Action Items
            </CardTitle>
            <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800/80">
              <CheckSquare className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {metrics.total}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm transition-all duration-200 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              In Progress Tasks
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
              {metrics.inProgress}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm transition-all duration-200 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Blocked Tasks
            </CardTitle>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
              <AlertCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
              {metrics.blocked}
            </div>
          </CardContent>
        </Card>

        <Card
          className={`rounded-xl border transition-all duration-200 hover:shadow-md ${metrics.overdue > 0
            ? "border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/10"
            : "border-zinc-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm hover:border-zinc-300 dark:hover:border-zinc-700"
            }`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
              Overdue Tasks
            </CardTitle>
            <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
              <AlertTriangle className="h-4 w-4 animate-pulse" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-red-600 dark:text-red-400">
              {metrics.overdue}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Bar: Search & Multi-Filters */}
      <div className="flex flex-col gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
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
              <AlertTriangle className="h-3.5 w-3.5" />
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

      {/* Desktop & Tablet Table View */}
      <div className="hidden md:block bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-x-auto shadow-sm">
        <Table className="w-full min-w-[900px]">
          <TableHeader>
            <TableRow className="border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 hover:bg-transparent">
              <TableHead className="w-[35%] min-w-[280px] font-semibold text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider pl-6 py-3.5">
                Task Description
              </TableHead>
              <TableHead className="w-[18%] min-w-[140px] font-semibold text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider py-3.5">
                Meeting Context
              </TableHead>
              <TableHead className="w-[13%] min-w-[120px] font-semibold text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider py-3.5">
                Owner
              </TableHead>
              <TableHead className="w-[14%] min-w-[130px] font-semibold text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider py-3.5">
                Due Date
              </TableHead>
              <TableHead className="w-[10%] min-w-[90px] font-semibold text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider py-3.5">
                Priority
              </TableHead>
              <TableHead className="w-[10%] min-w-[110px] font-semibold text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider py-3.5">
                Status
              </TableHead>
              <TableHead className="text-right min-w-[80px] font-semibold text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider pr-6 py-3.5">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16">
                  <div className="flex flex-col items-center justify-center gap-2 text-zinc-500">
                    <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
                    <span className="text-xs font-medium">Loading action items...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : displayItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-12 text-zinc-500 dark:text-zinc-400"
                >
                  <p className="text-sm font-medium">No action items found matching your filters.</p>
                  <p className="text-xs text-zinc-400 mt-1">Try clearing search parameters or overdue filter.</p>
                </TableCell>
              </TableRow>
            ) : (
              displayItems.map((item) => (
                <TableRow
                  key={item.id}
                  className={`border-b border-zinc-100 dark:border-zinc-800/50 transition-colors ${item.isOverdue
                    ? "bg-red-50/40 dark:bg-red-950/20 hover:bg-red-50/60 dark:hover:bg-red-950/30"
                    : "hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40"
                    }`}
                >
                  {/* Task Description */}
                  <TableCell className="font-medium min-w-[280px] max-w-[380px] pl-6 py-3.5">
                    <div className="flex items-start gap-2.5">
                      <span className="h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-500 mt-1.5 shrink-0" />
                      <span className="text-xs leading-relaxed text-zinc-900 dark:text-zinc-100 break-words whitespace-normal font-medium">
                        {item.task}
                      </span>
                    </div>
                  </TableCell>

                  {/* Meeting Context */}
                  <TableCell className="text-xs text-zinc-500 dark:text-zinc-400 min-w-[140px] max-w-[180px] py-3.5">
                    <span className="truncate block font-medium" title={item.meetingTitle}>
                      {item.meetingTitle}
                    </span>
                  </TableCell>

                  {/* Owner */}
                  <TableCell className="min-w-[120px] py-3.5">
                    <span className="flex items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                      <User className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                      <span className="truncate">{item.owner}</span>
                    </span>
                  </TableCell>

                  {/* Due Date & Overdue Highlight */}
                  <TableCell className="min-w-[130px] py-3.5">
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                        <Calendar className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                        <span>{item.dueDate}</span>
                      </span>
                      {item.isOverdue && (
                        <Badge variant="destructive" className="text-[9px] px-1.5 py-0 w-fit font-bold rounded-sm">
                          OVERDUE
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  {/* Priority */}
                  <TableCell className="min-w-[90px] py-3.5">
                    <Badge
                      variant="outline"
                      className={`text-xs font-medium rounded-md px-2 py-0.5 ${getPriorityBadgeClass(item.priority)}`}
                    >
                      {item.priority}
                    </Badge>
                  </TableCell>

                  {/* Status Dropdown */}
                  <TableCell className="min-w-[110px] py-3.5">
                    <Select
                      value={item.status}
                      onValueChange={(val) =>
                        val && handleStatusChange(item.id, val as ActionItem["status"])
                      }
                    >
                      <SelectTrigger className="h-7 text-xs w-28 border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                        <SelectItem value="Open">Open</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Blocked">Blocked</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right min-w-[80px] pr-6 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingItem(item);
                          setIsModalOpen(true);
                        }}
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-md"
                        title="Edit Action Item"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteItem(item.id)}
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md"
                        title="Delete Action Item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Responsive Cards View */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-400 mb-2" />
            <span className="text-xs font-medium">Loading action items...</span>
          </div>
        ) : displayItems.length === 0 ? (
          <div className="p-6 text-center bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500">
            <p className="text-sm font-medium">No action items found matching your filters.</p>
            <p className="text-xs text-zinc-400 mt-1">Try clearing search parameters or overdue filter.</p>
          </div>
        ) : (
          displayItems.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border bg-white dark:bg-zinc-900 shadow-sm space-y-3 transition-colors ${item.isOverdue
                  ? "border-red-200 dark:border-red-900/50 bg-red-50/20 dark:bg-red-950/10"
                  : "border-zinc-200/80 dark:border-zinc-800/80"
                }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                  {item.task}
                </p>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingItem(item);
                      setIsModalOpen(true);
                    }}
                    className="h-7 w-7 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteItem(item.id)}
                    className="h-7 w-7 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Meeting: <span className="text-zinc-800 dark:text-zinc-200">{item.meetingTitle}</span>
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                <span className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
                  <User className="h-3.5 w-3.5 text-zinc-400" />
                  {item.owner}
                </span>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                  <span className="text-zinc-600 dark:text-zinc-400">{item.dueDate}</span>
                  {item.isOverdue && (
                    <Badge variant="destructive" className="text-[9px] px-1 py-0 font-bold ml-1">
                      OVERDUE
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <Badge
                  variant="outline"
                  className={`text-xs font-medium rounded-md px-2 py-0.5 ${getPriorityBadgeClass(item.priority)}`}
                >
                  Priority: {item.priority}
                </Badge>

                <Select
                  value={item.status}
                  onValueChange={(val) =>
                    val && handleStatusChange(item.id, val as ActionItem["status"])
                  }
                >
                  <SelectTrigger className="h-7 text-xs w-28 border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Blocked">Blocked</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {!searchQuery &&
        selectedStatus === "All" &&
        selectedPriority === "All" &&
        selectedOwner === "All" &&
        !showOverdueOnly &&
        totalItems > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-zinc-900 px-5 py-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm text-xs">
            <div className="text-zinc-500 dark:text-zinc-400 text-center sm:text-left">
              Showing <span className="font-semibold text-zinc-900 dark:text-zinc-100">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}
              </span>{" "}
              of <span className="font-semibold text-zinc-900 dark:text-zinc-100">{totalItems}</span> action items
            </div>

            <div className="flex flex-wrap items-center justify-center gap-1.5 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="h-8 text-xs flex items-center gap-1 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </Button>

              <div className="flex items-center gap-1 px-1">
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
                        className={`h-7 w-7 text-xs p-0 font-medium ${currentPage === page
                            ? "bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                            : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                          }`}
                      >
                        {page}
                      </Button>
                    ) : (
                      <span key={idx} className="px-1 text-xs text-zinc-400 font-medium">
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
                className="h-8 text-xs flex items-center gap-1 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

      {/* Filtered Results Info (when search/filter is active) */}
      {(searchQuery ||
        selectedStatus !== "All" ||
        selectedPriority !== "All" ||
        selectedOwner !== "All" ||
        showOverdueOnly) &&
        displayItems.length > 0 && (
          <div className="bg-white dark:bg-zinc-900 px-5 py-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm text-xs">
            <div className="text-zinc-500 dark:text-zinc-400">
              Found <span className="font-semibold text-zinc-900 dark:text-zinc-100">{displayItems.length}</span> matching action item(s)
            </div>
          </div>
        )}

      {/* Modal */}
      <CreateActionItemModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
        meetings={meetings}
        initialData={editingItem}
      />
    </div>
  );
}