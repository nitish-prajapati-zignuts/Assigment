export type SummaryLength = "Short" | "Medium" | "Long";

export type MeetingType =
  | "Client Meeting"
  | "Sales Meeting"
  | "Project Meeting"
  | "Internal Meeting"
  | "Requirement Discussion"
  | "Retrospective"
  | "Other";

export interface KeyDecision {
  category: string;
  decision: string;
  context?: string;
}

export interface ActionItem {
  id?: string;
  meetingId?: string;
  task: string;
  owner: string;
  dueDate: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "Open" | "In Progress" | "Blocked" | "Completed" | "Pending";
}

export interface MeetingSummary {
  purpose: string;
  discussionPoints: string[];
  majorOutcomes: string[];
  importantConcerns: string[];
  unansweredQuestions?: string[];
  nextSteps: string[];
  keyDecisions?: KeyDecision[];
  actionItems?: ActionItem[];
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  type: MeetingType;
  participants: string[];
  transcript: string;
  summary?: MeetingSummary | null;
  createdAt: string;
  updatedAt: string;
}
