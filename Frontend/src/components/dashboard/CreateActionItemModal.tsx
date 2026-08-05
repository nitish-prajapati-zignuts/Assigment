"use client";

import { useState, useEffect } from "react";
import { ActionItem, Meeting } from "@/types/meeting";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AppUser {
  id: string;
  name: string;
  email: string;
}

interface CreateActionItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: Partial<ActionItem> & { meetingId: string }) => Promise<void> | void;
  meetings: Meeting[];
  initialData?: (ActionItem & { meetingId?: string; id?: string }) | null;
  isSubmitting?: boolean;
}

export function CreateActionItemModal({
  isOpen,
  onClose,
  onSave,
  meetings,
  initialData,
  isSubmitting = false,
}: CreateActionItemModalProps) {
  const [task, setTask] = useState("");
  const [meetingId, setMeetingId] = useState("");
  const [owner, setOwner] = useState("Unassigned");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<ActionItem["priority"]>("Medium");
  const [status, setStatus] = useState<ActionItem["status"]>("Open");
  const [appUsers, setAppUsers] = useState<AppUser[]>([]);
  const [localSubmitting, setLocalSubmitting] = useState(false);

  // Fetch registered application users for Assignee dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/auth/users");
        if (Array.isArray(res.data)) {
          setAppUsers(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch registered users for assignee dropdown:", err);
      }
    };
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  // Sync state on modal open or initialData change
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTask(initialData.task || "");
        setMeetingId(initialData.meetingId || (meetings[0]?.id || ""));
        setOwner(initialData.owner || "Unassigned");
        setDueDate(initialData.dueDate || "");
        setPriority(initialData.priority || "Medium");
        setStatus(initialData.status || "Open");
      } else {
        setTask("");
        setMeetingId(meetings[0]?.id || "");
        setOwner("Unassigned");
        setDueDate("");
        setPriority("Medium");
        setStatus("Open");
      }
    }
  }, [isOpen, initialData, meetings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim() || !meetingId) return;

    try {
      setLocalSubmitting(true);
      await onSave({
        ...(initialData?.id ? { id: initialData.id } : {}),
        meetingId,
        task: task.trim(),
        owner: owner.trim() || "Unassigned",
        dueDate: dueDate.trim() || "Not specified",
        priority,
        status,
      });
      onClose();
    } catch (err) {
      console.error("Failed to save action item:", err);
    } finally {
      setLocalSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Action Item" : "Create Action Item"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Update task details, assignment, or status."
              : "Add a new task manually to the central action tracker."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Task Description */}
          <div className="space-y-2">
            <Label htmlFor="task">Task Description</Label>
            <Input
              id="task"
              placeholder="e.g. Set up database backup cron job"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              required
            />
          </div>

          {/* Meeting Selection */}
          <div className="space-y-2">
            <Label htmlFor="meeting">Associated Meeting</Label>
            <Select
              value={meetingId}
              onValueChange={(val) => {
                if (val && typeof val === "string") setMeetingId(val);
              }}
            >
              <SelectTrigger id="meeting" className="w-full">
                <SelectValue placeholder="Select meeting">
                  {meetings.find((m) => String(m.id) === String(meetingId))
                    ? `${meetings.find((m) => String(m.id) === String(meetingId))?.title} (${meetings.find((m) => String(m.id) === String(meetingId))?.date})`
                    : "Select meeting"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {meetings.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.title} ({m.date})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Owner / Assignee Select Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="owner">Assignee / Owner</Label>
              <Select
                value={owner}
                onValueChange={(val) => {
                  if (val && typeof val === "string") setOwner(val);
                }}
              >
                <SelectTrigger id="owner" className="w-full">
                  <SelectValue placeholder="Select assignee">{owner}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Unassigned">Unassigned</SelectItem>
                  {appUsers.map((user) => (
                    <SelectItem key={user.id} value={user.name}>
                      <div className="flex flex-col text-left">
                        <span className="font-semibold text-xs">{user.name}</span>
                        <span className="text-[10px] text-zinc-400">{user.email}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate.includes("-") ? dueDate : ""}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={priority}
                onValueChange={(val) =>
                  val && setPriority(val as ActionItem["priority"])
                }
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={(val) =>
                  val && setStatus(val as ActionItem["status"])
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Blocked">Blocked</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting || localSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || localSubmitting}>
              {(isSubmitting || localSubmitting) && (
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              )}
              {initialData ? "Save Changes" : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
