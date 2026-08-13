"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { Meeting, MeetingSummary } from "@/types/meeting";
import { exportMeetingToMarkdown, exportMeetingToPDF } from "@/lib/exportUtils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Users,
  Clock,
  FileText,
  Sparkles,
  Target,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ArrowRightCircle,
  Gavel,
  CheckSquare,
  User,
  Loader2,
  Info,
  Share2,
  Copy,
  Lock,
  Bot,
  Send,
  CornerDownLeft,
} from "lucide-react";

import { SentimentSpeakerAnalytics } from "./meetings/SentimentSpeakerAnalytics";

import { SummaryTemplate } from "@/types/meeting";

function formatInlineText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\(Source\s*#\d+\)|\[Source\s*#\d+\])/g);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-extrabold text-zinc-900 dark:text-zinc-50">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (/\(Source\s*#\d+\)|\[Source\s*#\d+\]/i.test(part)) {
      const match = part.match(/Source\s*#\d+/i);
      return (
        <span
          key={i}
          className="inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 rounded-md bg-indigo-100/80 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200/80 dark:border-indigo-800/80 text-[10px]"
        >
          {match ? match[0] : part}
        </span>
      );
    }

    return part;
  });
}

function FormattedChatMessage({ content }: { content: string }) {
  if (!content) return null;

  const lines = content.split("\n");

  return (
    <div className="space-y-1.5 font-sans leading-relaxed text-xs sm:text-sm">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        if (trimmed.startsWith("# ")) {
          return (
            <h3 key={idx} className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 mt-2 mb-1">
              {formatInlineText(trimmed.replace(/^#\s+/, ""))}
            </h3>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h4 key={idx} className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mt-2 mb-1">
              {formatInlineText(trimmed.replace(/^##\s+/, ""))}
            </h4>
          );
        }
        if (trimmed.startsWith("### ")) {
          return (
            <h5 key={idx} className="text-xs font-bold text-indigo-500 mt-1.5 mb-1">
              {formatInlineText(trimmed.replace(/^###\s+/, ""))}
            </h5>
          );
        }

        if (trimmed.startsWith("* ") || trimmed.startsWith("- ") || /^\d+\.\s/.test(trimmed)) {
          const bulletText = trimmed.replace(/^(\*|-|\d+\.)\s+/, "");
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 py-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
              <div className="flex-1 text-zinc-800 dark:text-zinc-200">{formatInlineText(bulletText)}</div>
            </div>
          );
        }

        return (
          <p key={idx} className="text-zinc-800 dark:text-zinc-200">
            {formatInlineText(line)}
          </p>
        );
      })}
    </div>
  );
}

interface MeetingDetailModalProps {
  meeting: Meeting | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (meeting: Meeting) => void;
  isSummarizing?: boolean;
  hideShareableSection?: boolean;
}

export function MeetingDetailModal({

  meeting,
  isOpen,
  onClose,
  onEdit,
  isSummarizing = false,
  hideShareableSection = false,
}: MeetingDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "transcript" | "chat">("summary");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("English");
  const [selectedTemplate, setSelectedTemplate] = useState<SummaryTemplate>("Standard");
  const [currentSummary, setCurrentSummary] = useState<MeetingSummary | null | undefined>(
    meeting?.summary
  );

  // RAG Chat State
  const [chatInput, setChatInput] = useState("");
  const [isChatSending, setIsChatSending] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    { id: string; role: "user" | "assistant"; content: string; sources?: { title: string; type: string }[] }[]
  >([
    {
      id: "welcome-msg",
      role: "assistant",
      content:
        "Hi! I'm your RAG AI Assistant for this meeting. Ask me anything about project decisions, technical blockers, task owners, or deadline dates!",
    },
  ]);

  // Share state
  const [isPublished, setIsPublished] = useState<boolean>(!!meeting?.isMeetingPublished);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Security & Expiration settings
  const [sharePasswordInput, setSharePasswordInput] = useState<string>("");
  const [hasSharePassword, setHasSharePassword] = useState<boolean>(!!meeting?.hasPassword);
  const [expirationHours, setExpirationHours] = useState<string>("never");
  const [shareExpiresAtDate, setShareExpiresAtDate] = useState<string | null>(meeting?.shareExpiresAt || null);

  // Sync state when meeting prop changes & auto-fetch token if published
  useEffect(() => {
    setCurrentSummary(meeting?.summary);
    const published = !!meeting?.isMeetingPublished;
    setIsPublished(published);
    setShareToken(null);
    setActiveTab("summary");
    setHasSharePassword(!!meeting?.hasPassword);
    setShareExpiresAtDate(meeting?.shareExpiresAt || null);
    setSharePasswordInput("");
    setExpirationHours("never");
    setChatInput("");
    setChatMessages([
      {
        id: "welcome-msg",
        role: "assistant",
        content:
          "Hi! I'm your RAG AI Assistant for this meeting. Ask me anything about project decisions, technical blockers, task owners, or deadline dates!",
      },
    ]);

    if (published && meeting?.id) {
      setIsPublishing(true);
      api.patch(`/meetings/${meeting.id}/publish`, { isMeetingPublished: true })
        .then((res) => {
          if (res.data?.shareToken) {
            setShareToken(res.data.shareToken);
          }
          if (res.data?.hasPassword !== undefined) setHasSharePassword(res.data.hasPassword);
          if (res.data?.shareExpiresAt !== undefined) setShareExpiresAtDate(res.data.shareExpiresAt);
        })
        .catch((err) => console.error("Failed to fetch share token on modal open:", err))
        .finally(() => setIsPublishing(false));
    }
  }, [meeting]);

  const handleSendChatMessage = async (promptText?: string) => {
    const query = promptText || chatInput;
    if (!query.trim() || !meeting || isChatSending) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg = { id: userMsgId, role: "user" as const, content: query.trim() };
    setChatMessages((prev) => [...prev, userMsg]);
    if (!promptText) setChatInput("");
    setIsChatSending(true);

    try {
      const history = chatMessages.slice(-6).map((m) => ({ role: m.role, content: m.content }));
      const res = await api.post(`/meetings/${meeting.id}/chat`, {
        question: query.trim(),
        history,
      });

      const aiMsg = {
        id: `ai-${Date.now()}`,
        role: "assistant" as const,
        content: res.data.answer || "I could not find information regarding that in this meeting.",
        sources: res.data.retrievedSources || [],
      };
      setChatMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("RAG Chat request error:", err);
      toast.error("Failed to query RAG AI. Please check server connection.");
    } finally {
      setIsChatSending(false);
    }
  };


  const handleUpdateShareSettings = async (overridePublished?: boolean) => {
    if (!meeting) return;
    try {
      setIsPublishing(true);
      const nextPub = overridePublished !== undefined ? overridePublished : isPublished;

      const payload: any = {
        isMeetingPublished: nextPub,
      };

      if (sharePasswordInput.trim().length > 0) {
        payload.sharePassword = sharePasswordInput.trim();
      }

      if (expirationHours !== "never") {
        payload.expiresInHours = parseInt(expirationHours, 10);
      }

      const res = await api.patch(`/meetings/${meeting.id}/publish`, payload);

      const updatedStatus = res.data.isMeetingPublished;
      setIsPublished(updatedStatus);
      meeting.isMeetingPublished = updatedStatus;
      setHasSharePassword(res.data.hasPassword);
      setShareExpiresAtDate(res.data.shareExpiresAt);
      meeting.hasPassword = res.data.hasPassword;
      meeting.shareExpiresAt = res.data.shareExpiresAt;

      if (res.data.shareToken) {
        setShareToken(res.data.shareToken);
      }
      setSharePasswordInput("");
    } catch (err) {
      console.error("Failed to update share settings:", err);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleClearPassword = async () => {
    if (!meeting) return;
    try {
      setIsPublishing(true);
      const res = await api.patch(`/meetings/${meeting.id}/publish`, {
        isMeetingPublished: isPublished,
        removePassword: true,
      });
      setHasSharePassword(false);
      meeting.hasPassword = false;
    } catch (err) {
      console.error("Failed to clear share password:", err);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleClearExpiration = async () => {
    if (!meeting) return;
    try {
      setIsPublishing(true);
      const res = await api.patch(`/meetings/${meeting.id}/publish`, {
        isMeetingPublished: isPublished,
        clearExpiration: true,
      });
      setShareExpiresAtDate(null);
      meeting.shareExpiresAt = null;
      setExpirationHours("never");
    } catch (err) {
      console.error("Failed to clear expiration:", err);
    } finally {
      setIsPublishing(false);
    }
  };

  const getShareUrl = () => {
    if (typeof window === "undefined") return "";
    const origin = window.location.origin;
    if (shareToken) {
      return `${origin}/share/${shareToken}`;
    }
    return `${origin}/share/loading`;
  };

  const handleCopyLink = async () => {
    try {
      let urlToCopy = getShareUrl();
      if (!shareToken && meeting) {
        setIsPublishing(true);
        const res = await api.patch(`/meetings/${meeting.id}/publish`, {
          isMeetingPublished: true,
        });
        setIsPublished(true);
        meeting.isMeetingPublished = true;
        setShareToken(res.data.shareToken);
        urlToCopy = `${window.location.origin}/share/${res.data.shareToken}`;
        setIsPublishing(false);
      }

      await navigator.clipboard.writeText(urlToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
      setIsPublishing(false);
    }
  };

  if (!meeting) return null;

  const summaryData = currentSummary || meeting.summary;

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

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    try {
      const res = await api.post(`/meetings/${meeting.id}/summarize`, {
        language: selectedLanguage,
        template: selectedTemplate,
      });
      if (res.data && res.data.summary) {
        setCurrentSummary(res.data.summary);
        meeting.summary = res.data.summary;
      }
    } catch (err) {
      console.error("Failed to generate AI summary:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case "Urgent":
        return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200";
      case "High":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200";
      case "Medium":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200";
      case "Low":
      default:
        return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200";
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-green-200";
      case "In Progress":
        return "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 border-sky-200";
      case "Pending":
      default:
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[750px] w-[95vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-2xl">
        <DialogHeader className="pr-6">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
            <Badge variant="secondary" className="text-xs">
              {meeting.type}
            </Badge>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  exportMeetingToMarkdown(meeting);
                  toast.success("Exported meeting notes as Markdown");
                }}
                className="h-7 text-[11px] font-semibold flex items-center gap-1.5 rounded-lg border-zinc-200 dark:border-zinc-800"
              >
                Markdown (.md)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  exportMeetingToPDF(meeting);
                  toast.info("Preparing PDF print view...");
                }}
                className="h-7 text-[11px] font-semibold flex items-center gap-1.5 rounded-lg border-zinc-200 dark:border-zinc-800 text-indigo-600 dark:text-indigo-400"
              >
                PDF (.pdf)
              </Button>
            </div>
          </div>
          <DialogTitle className="text-lg sm:text-xl font-bold leading-tight">
            {meeting.title}
          </DialogTitle>
        </DialogHeader>


        <div className="space-y-4 sm:space-y-5 py-2">
          {/* Metadata Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 text-xs sm:text-sm bg-zinc-50 p-3 rounded-xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
              <Calendar className="h-4 sm:h-5 w-4 sm:w-5 text-zinc-500 shrink-0" />
              <span className="truncate">
                <strong>Date:</strong> {meeting.date}
              </span>
            </div>
            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
              <Clock className="h-4 sm:h-5 w-4 sm:w-5 text-zinc-500 shrink-0" />
              <span className="truncate">
                <strong>Created:</strong> {meeting.createdAt}
              </span>
            </div>
          </div>

          {/* Participants */}
          <div>
            <h4 className="text-xs font-semibold flex items-center gap-2 mb-2 text-zinc-500 uppercase tracking-wider">
              <Users className="h-4 w-4 sm:h-4.5 sm:w-4.5 shrink-0" />
              Participants
            </h4>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {meeting.participants.map((email) => (
                <Badge key={email} variant="outline" className="text-[11px] sm:text-xs font-normal">
                  {email}
                </Badge>
              ))}
            </div>
          </div>

          {/* Shareable Link Section */}
          {!hideShareableSection && (
            <div className="bg-gradient-to-r from-amber-500/10 via-zinc-500/5 to-purple-500/10 p-3.5 sm:p-4 rounded-xl border border-amber-200/60 dark:border-amber-900/40 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <Share2 className="h-4 sm:h-5 w-4 sm:w-5 text-amber-500 shrink-0" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                    Shareable Public Access
                  </h4>
                </div>
                <Button
                  size="sm"
                  variant={isPublished ? "default" : "outline"}
                  onClick={() => handleUpdateShareSettings(!isPublished)}
                  disabled={isPublishing}
                  className={`h-8 sm:h-7 text-xs w-full sm:w-auto flex items-center justify-center ${isPublished
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                    }`}
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-1.5 shrink-0" />
                      <span className="truncate">Checking publish status...</span>
                    </>
                  ) : isPublished ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-1.5 shrink-0" />
                      <span>Link Active (Published)</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-1.5 shrink-0" />
                      <span>Publish & Share</span>
                    </>
                  )}
                </Button>
              </div>

              {isPublished && (
                <div className="space-y-3 pt-1">
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Anyone with this encrypted link can view the meeting summary & outcomes:
                  </p>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <Input
                      readOnly
                      value={shareToken ? `${window.location.origin}/share/${shareToken}` : "Generating encrypted link..."}
                      className="h-8 text-xs font-mono bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 select-all flex-1"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyLink}
                      disabled={isPublishing || !shareToken}
                      className="h-8 text-xs shrink-0 flex items-center justify-center gap-1 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-950/40"
                    >
                      {isPublishing && !shareToken ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                          Generating...
                        </>
                      ) : copied ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy Link
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Password & Expiration Controls Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 border-t border-amber-200/40 dark:border-amber-900/30">
                    {/* Password Setting */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                          <Lock className="h-3 w-3 text-amber-500" /> Access Password
                        </label>
                        {hasSharePassword && (
                          <button
                            type="button"
                            onClick={handleClearPassword}
                            className="text-[10px] text-red-500 hover:underline font-medium"
                          >
                            Remove Lock
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Input
                          type="password"
                          placeholder={hasSharePassword ? "•••••••• (Password Set)" : "Set Access Password"}
                          value={sharePasswordInput}
                          onChange={(e) => setSharePasswordInput(e.target.value)}
                          className="h-7 text-xs bg-white dark:bg-zinc-900"
                        />
                        {sharePasswordInput.trim() && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateShareSettings()}
                            disabled={isPublishing}
                            className="h-7 text-[10px] px-2 bg-amber-500 hover:bg-amber-600 text-white"
                          >
                            Save
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Link Expiration Window Setting */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                          <Clock className="h-3 w-3 text-amber-500" /> Link Expiration
                        </label>
                        {shareExpiresAtDate && (
                          <button
                            type="button"
                            onClick={handleClearExpiration}
                            className="text-[10px] text-red-500 hover:underline font-medium"
                          >
                            Clear Expiry
                          </button>
                        )}
                      </div>
                      <Select
                        value={expirationHours}
                        onValueChange={(val) => {
                          if (val) {
                            setExpirationHours(val);
                            if (val !== "never") {
                              setTimeout(() => handleUpdateShareSettings(), 100);
                            }
                          }
                        }}
                      >
                        <SelectTrigger className="h-7 text-xs bg-white dark:bg-zinc-900">
                          <SelectValue placeholder="Expires in..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="never" className="text-xs">Never (Permanent)</SelectItem>
                          <SelectItem value="1" className="text-xs">Expires in 1 Hour</SelectItem>
                          <SelectItem value="24" className="text-xs">Expires in 24 Hours (1 Day)</SelectItem>
                          <SelectItem value="168" className="text-xs">Expires in 7 Days</SelectItem>
                          <SelectItem value="720" className="text-xs">Expires in 30 Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Active Security & Expiration Badges */}
                  {(hasSharePassword || shareExpiresAtDate) && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {hasSharePassword && (
                        <Badge variant="secondary" className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 flex items-center gap-1">
                          <Lock className="h-3 w-3" /> Password Protected
                        </Badge>
                      )}
                      {shareExpiresAtDate && (
                        <Badge variant="secondary" className="text-[10px] bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Expires {new Date(shareExpiresAtDate).toLocaleDateString()} at {new Date(shareExpiresAtDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Structured Summary, Transcript & RAG Chat Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "summary" | "transcript" | "chat")}
            className="w-full"
          >
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <TabsList className="grid w-full sm:w-[380px] grid-cols-3">
                <TabsTrigger value="summary" className="flex items-center justify-center gap-1.5 text-xs">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  AI Summary
                </TabsTrigger>
                <TabsTrigger value="transcript" className="flex items-center justify-center gap-1.5 text-xs">
                  <FileText className="h-4 w-4 text-blue-500" />
                  Transcript
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex items-center justify-center gap-1.5 text-xs">
                  <Bot className="h-4 w-4 text-indigo-500" />
                  Ask AI Chat
                </TabsTrigger>
              </TabsList>


              <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2">
                <Select
                  value={selectedTemplate}
                  onValueChange={(val) => val && setSelectedTemplate(val as SummaryTemplate)}
                >
                  <SelectTrigger className="h-8 text-xs border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 w-36 font-medium">
                    <SelectValue placeholder="Select Style" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                    <SelectItem value="Standard">Standard Briefing</SelectItem>
                    <SelectItem value="Executive">Executive Summary</SelectItem>
                    <SelectItem value="Developer">Developer Tasks</SelectItem>
                    <SelectItem value="Technical">Technical Decisions</SelectItem>
                    <SelectItem value="Sales">Sales Qualification</SelectItem>
                  </SelectContent>
                </Select>

                <Badge key={selectedLanguage} variant="outline" className="text-xs font-normal">
                  {selectedLanguage}
                </Badge>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleGenerateSummary}
                  disabled={isGenerating || isPublished}
                  title={isPublished ? "Unpublish meeting to re-generate AI notes" : "Re-generate AI notes"}
                  className={`h-8 text-xs flex items-center gap-1.5 ${
                    isPublished ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                  ) : (
                    <Sparkles className="h-4 w-4 text-amber-500" />
                  )}
                  {isGenerating ? "Generating..." : "Re-generate AI Notes"}
                </Button>
              </div>
            </div>

            {/* AI Structured Summary View */}
            <TabsContent value="summary" className="mt-3 space-y-4">
              {summaryData ? (
                <div className="space-y-4">
                  {/* Template Style Badge Indicator */}
                  {summaryData.templateStyle && (
                    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/50 text-xs text-indigo-700 dark:text-indigo-300 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-indigo-500" />
                        <span>AI Prompt Template Style:</span>
                      </div>
                      <Badge variant="secondary" className="bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 border-indigo-300 font-semibold">
                        {summaryData.templateStyle}
                      </Badge>
                    </div>
                  )}

                  {/* Sentiment & Speaker Analytics Visual Widget */}
                  <SentimentSpeakerAnalytics
                    sentiment={summaryData.sentimentAnalysis}
                    speakers={summaryData.speakerAnalytics}
                  />

                  {/* TEMPLATE SPECIFIC CUSTOM DETAILS SECTION */}
                  {summaryData.executiveDetails && (
                    <div className="bg-purple-900/10 dark:bg-purple-950/30 border border-purple-300 dark:border-purple-800 p-4 rounded-xl space-y-3 shadow-sm">
                      <h5 className="text-xs font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5 uppercase tracking-wide">
                        <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        Executive Strategic Briefing
                      </h5>
                      <div className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
                        <div>
                          <span className="font-semibold text-purple-950 dark:text-purple-200">Strategic Impact: </span>
                          <span>{stripHtml(summaryData.executiveDetails.strategicImpact)}</span>
                        </div>
                        {summaryData.executiveDetails.financialOrTimelineRisks?.length > 0 && (
                          <div>
                            <span className="font-semibold text-purple-950 dark:text-purple-200">Financial / Timeline Risks:</span>
                            <ul className="list-disc list-inside pl-2 space-y-0.5 mt-1">
                              {summaryData.executiveDetails.financialOrTimelineRisks.map((r, i) => (
                                <li key={i}>{stripHtml(r)}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {summaryData.executiveDetails.executiveRecommendations?.length > 0 && (
                          <div>
                            <span className="font-semibold text-purple-950 dark:text-purple-200">Recommendations:</span>
                            <ul className="list-disc list-inside pl-2 space-y-0.5 mt-1">
                              {summaryData.executiveDetails.executiveRecommendations.map((rec, i) => (
                                <li key={i}>{stripHtml(rec)}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {summaryData.developerDetails && (
                    <div className="bg-cyan-900/10 dark:bg-cyan-950/30 border border-cyan-300 dark:border-cyan-800 p-4 rounded-xl space-y-3 shadow-sm">
                      <h5 className="text-xs font-bold text-cyan-900 dark:text-cyan-300 flex items-center gap-1.5 uppercase tracking-wide">
                        <Sparkles className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                        Developer Task & Engineering Breakdown
                      </h5>
                      <div className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
                        {summaryData.developerDetails.codeDeliverables?.length > 0 && (
                          <div>
                            <span className="font-semibold text-cyan-950 dark:text-cyan-200">Code Deliverables:</span>
                            <ul className="list-disc list-inside pl-2 space-y-0.5 mt-1">
                              {summaryData.developerDetails.codeDeliverables.map((c, i) => (
                                <li key={i}>{stripHtml(c)}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {summaryData.developerDetails.architecturalChanges?.length > 0 && (
                          <div>
                            <span className="font-semibold text-cyan-950 dark:text-cyan-200">Architectural Changes:</span>
                            <ul className="list-disc list-inside pl-2 space-y-0.5 mt-1">
                              {summaryData.developerDetails.architecturalChanges.map((a, i) => (
                                <li key={i}>{stripHtml(a)}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {summaryData.developerDetails.apiContractsAndDependencies?.length > 0 && (
                          <div>
                            <span className="font-semibold text-cyan-950 dark:text-cyan-200">API Contracts & Dependencies:</span>
                            <ul className="list-disc list-inside pl-2 space-y-0.5 mt-1">
                              {summaryData.developerDetails.apiContractsAndDependencies.map((api, i) => (
                                <li key={i}>{stripHtml(api)}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {summaryData.developerDetails.technicalBlockers?.length > 0 && (
                          <div>
                            <span className="font-semibold text-cyan-950 dark:text-cyan-200">Engineering Blockers:</span>
                            <ul className="list-disc list-inside pl-2 space-y-0.5 mt-1">
                              {summaryData.developerDetails.technicalBlockers.map((b, i) => (
                                <li key={i}>{stripHtml(b)}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {summaryData.technicalDetails && (
                    <div className="bg-emerald-900/10 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 p-4 rounded-xl space-y-3 shadow-sm">
                      <h5 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5 uppercase tracking-wide">
                        <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        Technical Decisions & Architecture Trade-offs
                      </h5>
                      <div className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
                        {summaryData.technicalDetails.systemArchitectureChoices?.length > 0 && (
                          <div>
                            <span className="font-semibold text-emerald-950 dark:text-emerald-200">System Architecture Choices:</span>
                            <ul className="list-disc list-inside pl-2 space-y-0.5 mt-1">
                              {summaryData.technicalDetails.systemArchitectureChoices.map((s, i) => (
                                <li key={i}>{stripHtml(s)}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {summaryData.technicalDetails.techStackTradeoffs?.length > 0 && (
                          <div>
                            <span className="font-semibold text-emerald-950 dark:text-emerald-200">Tech Stack Trade-offs:</span>
                            <ul className="list-disc list-inside pl-2 space-y-0.5 mt-1">
                              {summaryData.technicalDetails.techStackTradeoffs.map((t, i) => (
                                <li key={i}>{stripHtml(t)}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {summaryData.technicalDetails.engineeringConstraints?.length > 0 && (
                          <div>
                            <span className="font-semibold text-emerald-950 dark:text-emerald-200">Engineering Constraints:</span>
                            <ul className="list-disc list-inside pl-2 space-y-0.5 mt-1">
                              {summaryData.technicalDetails.engineeringConstraints.map((e, i) => (
                                <li key={i}>{stripHtml(e)}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {summaryData.salesDetails && (
                    <div className="bg-amber-900/10 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 p-4 rounded-xl space-y-3 shadow-sm">
                      <h5 className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5 uppercase tracking-wide">
                        <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        Sales Lead Qualification Discovery
                      </h5>
                      <div className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
                        {summaryData.salesDetails.clientPainPoints?.length > 0 && (
                          <div>
                            <span className="font-semibold text-amber-950 dark:text-amber-200">Client Pain Points:</span>
                            <ul className="list-disc list-inside pl-2 space-y-0.5 mt-1">
                              {summaryData.salesDetails.clientPainPoints.map((p, i) => (
                                <li key={i}>{stripHtml(p)}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div>
                          <span className="font-semibold text-amber-950 dark:text-amber-200">Budget & Decision Authority: </span>
                          <span>{stripHtml(summaryData.salesDetails.budgetAndAuthority)}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-amber-950 dark:text-amber-200">Timeline Expectations: </span>
                          <span>{stripHtml(summaryData.salesDetails.timelineExpectations)}</span>
                        </div>
                        {summaryData.salesDetails.nextSalesSteps?.length > 0 && (
                          <div>
                            <span className="font-semibold text-amber-950 dark:text-amber-200">Next Sales Actions:</span>
                            <ul className="list-disc list-inside pl-2 space-y-0.5 mt-1">
                              {summaryData.salesDetails.nextSalesSteps.map((n, i) => (
                                <li key={i}>{stripHtml(n)}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 1. Purpose of the Meeting */}
                  <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-4 rounded-lg space-y-1.5 shadow-sm">
                    <h5 className="text-xs font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5 uppercase tracking-wide">
                      <Target className="h-5 w-5" />
                      1. Purpose of the Meeting
                    </h5>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      {stripHtml(summaryData.purpose)}
                    </p>
                  </div>

                  {/* 2. Important Discussion Points */}
                  <div className="bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 p-4 rounded-lg space-y-2 shadow-sm">
                    <h5 className="text-xs font-bold text-blue-800 dark:text-blue-400 flex items-center gap-1.5 uppercase tracking-wide">
                      <MessageSquare className="h-5 w-5" />
                      2. Important Discussion Points
                    </h5>
                    <ul className="space-y-1.5 text-sm text-zinc-700 dark:text-zinc-300 list-disc list-inside">
                      {summaryData.discussionPoints?.map((dp, i) => (
                        <li key={i} className="leading-snug pl-1">
                          {stripHtml(dp)}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 3. Major Outcomes */}
                  <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 p-4 rounded-lg space-y-2 shadow-sm">
                    <h5 className="text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5 uppercase tracking-wide">
                      <CheckCircle2 className="h-5 w-5" />
                      3. Major Outcomes
                    </h5>
                    <ul className="space-y-1.5 text-sm text-zinc-700 dark:text-zinc-300 list-disc list-inside">
                      {summaryData.majorOutcomes?.map((mo, i) => (
                        <li key={i} className="leading-snug pl-1">
                          {stripHtml(mo)}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 4. Important Concerns */}
                  <div className="bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 p-4 rounded-lg space-y-2 shadow-sm">
                    <h5 className="text-xs font-bold text-rose-800 dark:text-rose-400 flex items-center gap-1.5 uppercase tracking-wide">
                      <AlertTriangle className="h-5 w-5" />
                      4. Important Concerns
                    </h5>
                    <ul className="space-y-1.5 text-sm text-zinc-700 dark:text-zinc-300 list-disc list-inside">
                      {summaryData.importantConcerns?.map((ic, i) => (
                        <li key={i} className="leading-snug pl-1">
                          {stripHtml(ic)}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 5. Unanswered Questions */}
                  <div className="bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/50 p-4 rounded-lg space-y-2 shadow-sm">
                    <h5 className="text-xs font-bold text-orange-800 dark:text-orange-400 flex items-center gap-1.5 uppercase tracking-wide">
                      <HelpCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      5. Unanswered Questions
                    </h5>
                    {summaryData.unansweredQuestions && summaryData.unansweredQuestions.length > 0 ? (
                      <ul className="space-y-1.5 text-sm text-zinc-700 dark:text-zinc-300 list-disc list-inside">
                        {summaryData.unansweredQuestions.map((uq, i) => (
                          <li key={i} className="leading-snug pl-1">
                            {stripHtml(uq)}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="flex items-center gap-2 py-2 text-xs text-orange-700/80 dark:text-orange-400/80 italic">
                        <HelpCircle className="h-5 w-5 text-orange-400 opacity-60" />
                        <span>No unanswered questions identified in this meeting.</span>
                      </div>
                    )}
                  </div>

                  {/* 5. Next Steps */}
                  <div className="bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 p-4 rounded-lg space-y-2 shadow-sm">
                    <h5 className="text-xs font-bold text-indigo-800 dark:text-indigo-400 flex items-center gap-1.5 uppercase tracking-wide">
                      <ArrowRightCircle className="h-5 w-5" />
                      5. Next Steps
                    </h5>
                    <ul className="space-y-1.5 text-sm text-zinc-700 dark:text-zinc-300 list-disc list-inside">
                      {summaryData.nextSteps?.map((ns, i) => (
                        <li key={i} className="leading-snug pl-1">
                          {stripHtml(ns)}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 6. Key Decisions Made */}
                  <div className="bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 p-4 rounded-lg space-y-3 shadow-sm">
                    <h5 className="text-xs font-bold text-purple-800 dark:text-purple-300 flex items-center gap-1.5 uppercase tracking-wide">
                      <Gavel className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      6. Key Decisions Made
                    </h5>

                    {summaryData.keyDecisions && summaryData.keyDecisions.length > 0 ? (
                      <div className="space-y-2.5">
                        {summaryData.keyDecisions.map((kd, idx) => (
                          <div
                            key={idx}
                            className="bg-white dark:bg-zinc-900 p-3 rounded border border-purple-100 dark:border-purple-900/40 shadow-sm space-y-1"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-purple-500"></span>
                                {stripHtml(kd.decision)}
                              </span>
                              <Badge
                                variant="secondary"
                                className="text-[10px] uppercase tracking-wider bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 shrink-0"
                              >
                                {stripHtml(kd.category)}
                              </Badge>
                            </div>
                            {kd.context && (
                              <p className="text-xs text-zinc-500 dark:text-zinc-400 pl-3 italic">
                                Context: {stripHtml(kd.context)}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-zinc-500 bg-white/70 dark:bg-zinc-900/70 p-3 rounded border border-purple-100 dark:border-purple-900/30">
                        <Info className="h-5 w-5 text-purple-400 shrink-0" />
                        <span>
                          No explicit key decisions were recorded during this meeting.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 7. AI Extracted Action Items */}
                  <div className="bg-teal-50/70 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/50 p-4 rounded-lg space-y-3 shadow-sm">
                    <h5 className="text-xs font-bold text-teal-800 dark:text-teal-300 flex items-center gap-1.5 uppercase tracking-wide">
                      <CheckSquare className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                      7. Extracted Action Items
                    </h5>

                    {summaryData.actionItems && summaryData.actionItems.length > 0 ? (
                      <div className="space-y-2.5">
                        {summaryData.actionItems.map((item, idx) => (
                          <div
                            key={idx}
                            className="bg-white dark:bg-zinc-900 p-3 rounded border border-teal-100 dark:border-teal-900/40 shadow-sm space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-start gap-1.5 pt-0.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0"></span>
                                {stripHtml(item.task)}
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] uppercase ${getPriorityBadgeClass(item.priority)}`}
                                >
                                  {item.priority}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] uppercase ${getStatusBadgeClass(item.status)}`}
                                >
                                  {item.status}
                                </Badge>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 pl-3">
                              <span className="flex items-center gap-1">
                                <User className="h-4 w-4 text-zinc-400" />
                                Owner: <strong className="text-zinc-700 dark:text-zinc-300">{stripHtml(item.owner)}</strong>
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4 text-zinc-400" />
                                Due: <strong className="text-zinc-700 dark:text-zinc-300">{stripHtml(item.dueDate)}</strong>
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-zinc-500 bg-white/70 dark:bg-zinc-900/70 p-3 rounded border border-teal-100 dark:border-teal-900/30">
                        <Info className="h-5 w-5 text-teal-400 shrink-0" />
                        <span>No actionable tasks were extracted from this transcript.</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : isSummarizing || isGenerating ? (
                <div className="text-center py-10 border border-amber-200 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/10 rounded-lg space-y-3">
                  <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400">
                    <Loader2 className="h-7 w-7 animate-spin" />
                    <Sparkles className="h-7 w-7 text-amber-500 animate-pulse" />
                  </div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    AI Summary Job is Processing
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                    Our AI model is currently generating structured notes, purpose, discussion points, key decisions, and action items. This will update automatically once completed.
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
                  <Sparkles className="mx-auto h-10 w-10 text-amber-400 mb-2" />
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    No AI Summary generated yet
                  </p>
                  <p className="text-xs text-zinc-500 mb-4">
                    Click below to generate structured meeting notes covering purpose, discussion, outcomes, concerns & next steps.
                  </p>
                  <Button
                    size="sm"
                    onClick={handleGenerateSummary}
                    disabled={isGenerating}
                    className="flex items-center gap-2 mx-auto"
                  >
                    {isGenerating && <Loader2 className="h-5 w-5 animate-spin" />}
                    Generate AI Summary
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Transcript & Rich Text Notes View */}
            <TabsContent value="transcript" className="mt-3">
              <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-md border border-zinc-200 dark:border-zinc-800 text-sm min-h-[160px] leading-relaxed prose dark:prose-invert max-w-none">
                {meeting.transcript ? (
                  meeting.transcript.includes("<") && meeting.transcript.includes(">") ? (
                    <div dangerouslySetInnerHTML={{ __html: meeting.transcript }} />
                  ) : (
                    <div className="whitespace-pre-wrap">{meeting.transcript}</div>
                  )
                ) : (
                  <span className="text-zinc-400 italic">
                    No transcript available for this meeting.
                  </span>
                )}
              </div>
            </TabsContent>

            {/* RAG-Powered Ask AI Chat View */}
            <TabsContent value="chat" className="mt-3 space-y-3">
              <div className="bg-zinc-50/70 dark:bg-zinc-900/70 backdrop-blur-md rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-4 space-y-4">
                {/* Header & Quick Suggestion Chips */}
                <div className="space-y-2 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                      <Bot className="h-4 w-4" /> RAG Knowledge Assistant
                    </span>
                    <Badge variant="outline" className="text-[10px] bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200">
                      Grounded Answers
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[
                      "💻 What technical blockers were discussed?",
                      "👤 Who handles deliverables & tasks?",
                      "📋 Summary of key decisions made",
                      "📅 What are the deadline dates?",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => handleSendChatMessage(suggestion.replace(/^[^\s]+\s*/, ""))}
                        disabled={isChatSending}
                        className="text-[11px] px-2.5 py-1 bg-white hover:bg-indigo-50 dark:bg-zinc-800 dark:hover:bg-indigo-950/60 text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-300 rounded-lg border border-zinc-200/80 dark:border-zinc-700/60 transition-all cursor-pointer font-medium shadow-2xs"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Messages Container */}
                <div className="min-h-[220px] max-h-[350px] overflow-y-auto space-y-3 pr-1">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-indigo-600 text-white shadow-xs rounded-br-none"
                            : "bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700/60 rounded-bl-none shadow-xs"
                        }`}
                      >
                        {msg.role === "user" ? (
                          <div className="whitespace-pre-wrap font-sans font-medium">{msg.content}</div>
                        ) : (
                          <FormattedChatMessage content={msg.content} />
                        )}


                        {/* RAG Source Attribution Badges */}
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-700/60 flex flex-wrap items-center gap-1.5 text-[10px]">
                            <span className="text-zinc-400 font-semibold">Sources:</span>
                            {msg.sources.map((src, i) => (
                              <span
                                key={i}
                                className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 font-medium"
                              >
                                {src.title}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {isChatSending && (
                    <div className="flex items-center gap-2 text-xs text-indigo-500 font-medium p-2 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl max-w-[200px]">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>RAG Assistant searching context...</span>
                    </div>
                  )}
                </div>

                {/* Input Bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendChatMessage();
                  }}
                  className="flex items-center gap-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60"
                >
                  <Input
                    placeholder="Ask anything about this meeting..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    disabled={isChatSending}
                    className="h-10 text-xs sm:text-sm bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 focus-visible:ring-indigo-500/40 rounded-xl"
                  />
                  <Button
                    type="submit"
                    disabled={isChatSending || !chatInput.trim()}
                    className="h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center gap-1.5 text-xs shadow-xs"
                  >
                    {isChatSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <span>Ask</span>
                        <Send className="h-3.5 w-3.5" />
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>

        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={() => {
              onClose();
              onEdit(meeting);
            }}
          >
            Edit Meeting
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
