"use client";

import { useState } from "react";
import { ActionItem, Meeting } from "@/types/meeting";
import { Button } from "@/components/ui/button";
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

interface CreateActionItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: Partial<ActionItem> & { meetingId: string }) => void;
  meetings: Meeting[];
  initialData?: (ActionItem & { meetingId?: string; id?: string }) | null;
}

export function CreateActionItemModal({
  isOpen,
  onClose,
  onSave,
  meetings,
  initialData,
}: CreateActionItemModalProps) {
  const [task, setTask] = useState(initialData?.task || "");
  const [meetingId, setMeetingId] = useState(
    initialData?.meetingId || (meetings[0]?.id || "")
  );
  const [owner, setOwner] = useState(initialData?.owner || "Unassigned");
  const [dueDate, setDueDate] = useState(initialData?.dueDate || "");
  const [priority, setPriority] = useState<ActionItem["priority"]>(
    initialData?.priority || "Medium"
  );
  const [status, setStatus] = useState<ActionItem["status"]>(
    initialData?.status || "Open"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim() || !meetingId) return;

    onSave({
      ...(initialData?.id ? { id: initialData.id } : {}),
      meetingId,
      task: task.trim(),
      owner: owner.trim() || "Unassigned",
      dueDate: dueDate.trim() || "Not specified",
      priority,
      status,
    });

    onClose();
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
            <Select value={meetingId} onValueChange={(val) => val && setMeetingId(val)}>
              <SelectTrigger id="meeting">
                <SelectValue placeholder="Select meeting" />
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
            {/* Owner */}
            <div className="space-y-2">
              <Label htmlFor="owner">Assignee / Owner</Label>
              <Input
                id="owner"
                placeholder="e.g. Alex or Unassigned"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
              />
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
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? "Save Changes" : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
