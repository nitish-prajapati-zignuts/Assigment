"use client";

import { useState, useMemo, useEffect } from "react";
import api from "@/lib/axios";
import { ActionItem, Meeting } from "@/types/meeting";
import { initialMeetings } from "@/data/mockMeetings";
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
} from "lucide-react";

interface ActionItemWithContext extends ActionItem {
  id: string;
  meetingId: string;
  meetingTitle: string;
  isOverdue: boolean;
}

export default function ActionTrackerPage() {
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);
  const [actionItems, setActionItems] = useState<ActionItemWithContext[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [selectedPriority, setSelectedPriority] = useState<string>("All");
  const [selectedOwner, setSelectedOwner] = useState<string>("All");
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<
    (ActionItem & { meetingId?: string; id?: string }) | null
  >(null);

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

  // Build aggregated action items from meetings or API
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await api.get("/action-items");
        if (Array.isArray(res.data) && res.data.length > 0) {
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
          return;
        }
      } catch (err) {
        console.log("Using local initialMeetings fallback for Action Tracker.");
      }

      // Fallback from initialMeetings
      const fallbackList: ActionItemWithContext[] = [];
      initialMeetings.forEach((m) => {
        if (m.summary?.actionItems) {
          m.summary.actionItems.forEach((ai, idx) => {
            fallbackList.push({
              ...ai,
              id: `${m.id}-item-${idx}`,
              meetingId: m.id,
              meetingTitle: m.title,
              isOverdue: checkIsOverdue(ai.dueDate, ai.status),
            });
          });
        }
      });
      setActionItems(fallbackList);
    };

    fetchItems();
  }, [meetings]);

  // Extract unique owners for filter dropdown
  const uniqueOwners = useMemo(() => {
    const set = new Set<string>();
    actionItems.forEach((item) => {
      if (item.owner) set.add(item.owner);
    });
    return Array.from(set);
  }, [actionItems]);

  // Filtered Action Items
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

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = actionItems.length;
    const inProgress = actionItems.filter(
      (i) => i.status === "In Progress"
    ).length;
    const blocked = actionItems.filter((i) => i.status === "Blocked").length;
    const overdue = actionItems.filter((i) => i.isOverdue).length;

    return { total, inProgress, blocked, overdue };
  }, [actionItems]);

  // Create or Update Action Item
  const handleSaveItem = async (
    itemData: Partial<ActionItem> & { meetingId: string }
  ) => {
    const isEdit = Boolean(itemData.id);

    try {
      if (isEdit) {
        const res = await api.put(`/action-items/${itemData.id}`, itemData);
        if (res.data) {
          const updated = res.data;
          setActionItems((prev) =>
            prev.map((i) =>
              i.id === itemData.id
                ? {
                    ...i,
                    ...updated,
                    meetingTitle:
                      meetings.find((m) => m.id === updated.meetingId)?.title ||
                      i.meetingTitle,
                    isOverdue: checkIsOverdue(updated.dueDate, updated.status),
                  }
                : i
            )
          );
          return;
        }
      } else {
        const res = await api.post("/action-items", itemData);
        if (res.data) {
          const created = res.data;
          const newItem: ActionItemWithContext = {
            ...created,
            meetingTitle:
              meetings.find((m) => m.id === created.meetingId)?.title ||
              "General Meeting",
            isOverdue: checkIsOverdue(created.dueDate, created.status),
          };
          setActionItems((prev) => [newItem, ...prev]);
          return;
        }
      }
    } catch (err) {
      console.error("Failed to sync item to API backend:", err);
    }

    // Local state fallback
    if (isEdit) {
      setActionItems((prev) =>
        prev.map((i) =>
          i.id === itemData.id
            ? {
                ...i,
                ...itemData,
                isOverdue: checkIsOverdue(
                  itemData.dueDate || i.dueDate,
                  itemData.status || i.status
                ),
              }
            : i
        )
      );
    } else {
      const newItem: ActionItemWithContext = {
        id: `item-${Date.now()}`,
        meetingId: itemData.meetingId,
        meetingTitle:
          meetings.find((m) => m.id === itemData.meetingId)?.title ||
          "General Meeting",
        task: itemData.task || "",
        owner: itemData.owner || "Unassigned",
        dueDate: itemData.dueDate || "Not specified",
        priority: itemData.priority || "Medium",
        status: itemData.status || "Open",
        isOverdue: checkIsOverdue(
          itemData.dueDate || "Not specified",
          itemData.status || "Open"
        ),
      };
      setActionItems((prev) => [newItem, ...prev]);
    }
  };

  // Delete Action Item
  const handleDeleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this action item?")) return;

    try {
      await api.delete(`/action-items/${id}`);
    } catch (err) {
      console.error("Failed to delete item via API:", err);
    }

    setActionItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Inline Status Change Handler
  const handleStatusChange = async (id: string, newStatus: ActionItem["status"]) => {
    setActionItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              status: newStatus,
              isOverdue: checkIsOverdue(i.dueDate, newStatus),
            }
          : i
      )
    );

    try {
      await api.put(`/action-items/${id}`, { status: newStatus });
    } catch (err) {
      console.error("Failed to update status via API:", err);
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case "Urgent":
        return "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border-red-200";
      case "High":
        return "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border-orange-200";
      case "Medium":
        return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200";
      case "Low":
      default:
        return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Central Action Tracker</h1>
          <p className="text-sm text-zinc-500">
            Monitor, assign, filter, and manage tasks across all meeting transcripts.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingItem(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Action Item
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-zinc-500">
              Total Action Items
            </CardTitle>
            <CheckSquare className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-zinc-500">
              In Progress
            </CardTitle>
            <Clock className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sky-600 dark:text-sky-400">
              {metrics.inProgress}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-zinc-500">
              Blocked Tasks
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {metrics.blocked}
            </div>
          </CardContent>
        </Card>

        <Card className={metrics.overdue > 0 ? "border-red-300 dark:border-red-900 bg-red-50/30" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-red-600 dark:text-red-400">
              Overdue Tasks
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {metrics.overdue}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Bar: Search & Multi-Filters */}
      <div className="flex flex-col gap-4 bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search task, owner, meeting..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant={showOverdueOnly ? "destructive" : "outline"}
              size="sm"
              onClick={() => setShowOverdueOnly(!showOverdueOnly)}
              className="flex items-center gap-1.5 text-xs h-9"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              {showOverdueOnly ? "Showing Overdue Only" : "Filter Overdue"}
            </Button>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-zinc-500 uppercase">
              Filter by Status
            </label>
            <Select value={selectedStatus} onValueChange={(v) => v && setSelectedStatus(v)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Blocked">Blocked</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-zinc-500 uppercase">
              Filter by Priority
            </label>
            <Select value={selectedPriority} onValueChange={(v) => v && setSelectedPriority(v)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Priorities</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-zinc-500 uppercase">
              Filter by Owner
            </label>
            <Select value={selectedOwner} onValueChange={(v) => v && setSelectedOwner(v)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="All Owners" />
              </SelectTrigger>
              <SelectContent>
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

      {/* Action Items Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task Description</TableHead>
              <TableHead>Meeting Context</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-zinc-500"
                >
                  No action items found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow
                  key={item.id}
                  className={item.isOverdue ? "bg-red-50/40 dark:bg-red-950/20" : ""}
                >
                  {/* Task Description */}
                  <TableCell className="font-medium max-w-[280px]">
                    <div className="flex items-start gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 shrink-0"></span>
                      <span className="leading-snug">{item.task}</span>
                    </div>
                  </TableCell>

                  {/* Meeting Context */}
                  <TableCell className="text-xs text-zinc-500">
                    {item.meetingTitle}
                  </TableCell>

                  {/* Owner */}
                  <TableCell>
                    <span className="flex items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-300">
                      <User className="h-3.5 w-3.5 text-zinc-400" />
                      {item.owner}
                    </span>
                  </TableCell>

                  {/* Due Date & Overdue Highlight */}
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400">
                        <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                        {item.dueDate}
                      </span>
                      {item.isOverdue && (
                        <Badge variant="destructive" className="text-[9px] py-0 w-fit">
                          OVERDUE
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  {/* Priority */}
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-xs ${getPriorityBadgeClass(item.priority)}`}
                    >
                      {item.priority}
                    </Badge>
                  </TableCell>

                  {/* Status Dropdown */}
                  <TableCell>
                    <Select
                      value={item.status}
                      onValueChange={(val) =>
                        val && handleStatusChange(item.id, val as ActionItem["status"])
                      }
                    >
                      <SelectTrigger className="h-7 text-xs w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Open">Open</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Blocked">Blocked</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingItem(item);
                          setIsModalOpen(true);
                        }}
                        title="Edit Action Item"
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteItem(item.id)}
                        title="Delete Action Item"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

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
