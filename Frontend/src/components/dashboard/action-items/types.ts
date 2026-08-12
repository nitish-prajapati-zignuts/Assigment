import { ActionItem } from "@/types/meeting";

export interface ActionItemWithContext extends ActionItem {
  id: string;
  meetingId: string;
  meetingTitle: string;
  isOverdue: boolean;
}

export interface ActionItemMetrics {
  total: number;
  inProgress: number;
  blocked: number;
  overdue: number;
}
