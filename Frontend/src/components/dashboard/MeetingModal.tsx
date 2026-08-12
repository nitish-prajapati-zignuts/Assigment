"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Meeting, MeetingType } from "@/types/meeting";
import api from "@/lib/axios";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUp, Type, CheckCircle2, Trash2, Loader2, UserPlus, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

const meetingTypes: MeetingType[] = [
  "Client Meeting",
  "Sales Meeting",
  "Project Meeting",
  "Internal Meeting",
  "Requirement Discussion",
];

const getTodayDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const meetingSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  date: z
    .string()
    .min(1, "Date is required")
    .refine((val) => val === getTodayDateString(), {
      message: "Only today's date can be selected.",
    }),
  type: z.enum([
    "Client Meeting",
    "Sales Meeting",
    "Project Meeting",
    "Internal Meeting",
    "Requirement Discussion",
    "Retrospective",
    "Other",
  ] as const),
  participants: z.string().min(1, "At least one participant is required"),
  transcript: z.string().optional(),
});

type MeetingFormValues = z.infer<typeof meetingSchema>;

import { SummaryLength, SummaryTemplate } from "@/types/meeting";

interface AppUser {
  id: string;
  name: string;
  email: string;
}

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (meeting: Partial<Meeting> & { language?: string; summaryLength?: SummaryLength; template?: SummaryTemplate }) => Promise<void> | void;
  initialData?: Meeting | null;
}

export function MeetingModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: MeetingModalProps) {
  const [activeTab, setActiveTab] = useState<"paste" | "upload">("paste");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [appUsers, setAppUsers] = useState<AppUser[]>([]);
  const [summaryLength, setSummaryLength] = useState<SummaryLength>("Medium");
  const [template, setTemplate] = useState<SummaryTemplate>("Standard");
  const [language, setLanguage] = useState<string>("English");
  const [usersFetched, setUsersFetched] = useState(false);

  const todayStr = getTodayDateString();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<MeetingFormValues>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      title: "",
      date: todayStr,
      type: "Internal Meeting",
      participants: "",
      transcript: "",
    },
  });

  // Fetch all registered application users only once
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/auth/users");
        if (Array.isArray(res.data)) {
          setAppUsers(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch registered users from API:", err);
        setAppUsers([]);
      } finally {
        setUsersFetched(true);
      }
    };

    // Only fetch if modal is open AND users haven't been fetched yet
    if (isOpen && !usersFetched) {
      fetchUsers();
    }
  }, [isOpen, usersFetched]);

  // Sync form values when initialData changes or modal opens
  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title,
        date: initialData.date,
        type: initialData.type,
        participants: initialData.participants.join(", "),
        transcript: initialData.transcript || "",
      });
      setFileName(null);
      setFileSize(null);
      setActiveTab("paste");
    } else {
      reset({
        title: "",
        date: getTodayDateString(),
        type: "Internal Meeting",
        participants: "",
        transcript: "",
      });
      setFileName(null);
      setFileSize(null);
      setActiveTab("paste");
    }
  }, [initialData, isOpen, reset]);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedType = watch("type");
  const transcriptValue = watch("transcript");
  const currentParticipantsStr = watch("participants") || "";

  // Parse already added participant emails/names
  const alreadySelectedList = currentParticipantsStr
    .split(",")
    .map((p) => p.trim().toLowerCase())
    .filter((p) => p.length > 0);

  // Filter registered users matching query after @ AND exclude already selected users
  const filteredUsers = appUsers.filter((user) => {
    const isAlreadySelected = alreadySelectedList.some(
      (selected) =>
        selected === user.email.toLowerCase() ||
        selected === user.name.toLowerCase()
    );
    if (isAlreadySelected) return false;

    const q = mentionQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q)
    );
  });

  // Handle Input Change and trigger @ menu
  const handleParticipantsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue("participants", val, { shouldValidate: true });

    const cursor = e.target.selectionStart || val.length;
    const textBeforeCursor = val.slice(0, cursor);
    const lastWord = textBeforeCursor.split(/[\s,]+/).pop() || "";

    if (lastWord.startsWith("@")) {
      setShowSuggestions(true);
      setMentionQuery(lastWord.slice(1));
      setSelectedIndex(0);
    } else {
      setShowSuggestions(false);
      setMentionQuery("");
    }
  };

  // Select user from Slack-style @ popup
  const applyUserMention = (userEmail: string) => {
    const currentVal = watch("participants") || "";

    // Extract all complete emails/tokens without @ prefix
    const existingParts = currentVal
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p.length > 0 && !p.startsWith("@"));

    if (!existingParts.includes(userEmail)) {
      existingParts.push(userEmail);
    }

    // Join all participants with ", " so there is a comma between items, but NO trailing comma at the end
    const newVal = existingParts.join(", ");

    setValue("participants", newVal, { shouldValidate: true });
    setShowSuggestions(false);
    setMentionQuery("");
  };

  // Keyboard Navigation for Slack-style @ menu
  const handleParticipantsKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || filteredUsers.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredUsers.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredUsers.length) % filteredUsers.length);
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      if (filteredUsers[selectedIndex]) {
        applyUserMention(filteredUsers[selectedIndex].email);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  // Add selected user from dropdown button to participants string
  const handleSelectUser = (userEmail: string | null) => {
    if (!userEmail) return;

    const existingList = currentParticipantsStr
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p.length > 0 && !p.startsWith("@"));

    if (!existingList.includes(userEmail)) {
      const newList = [...existingList, userEmail].join(", ");
      setValue("participants", newList, { shouldValidate: true });
    }
  };

  // Handle Tab Switch & Reset Opposite Input
  const handleTabChange = (newTab: "paste" | "upload") => {
    setActiveTab(newTab);
    setValue("transcript", "");
    setFileName(null);
    setFileSize(null);
  };

  const processFile = (file: File) => {
    setFileName(file.name);
    const sizeInKB = (file.size / 1024).toFixed(1);
    setFileSize(sizeInKB + " KB");
    setIsReadingFile(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setValue("transcript", content || "");
      setIsReadingFile(false);
    };
    reader.onerror = () => {
      setIsReadingFile(false);
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const clearFile = () => {
    setFileName(null);
    setFileSize(null);
    setValue("transcript", "");
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: MeetingFormValues) => {
    const formattedParticipants = data.participants
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    try {
      setIsSubmitting(true);
      await onSave({
        ...(initialData?.id ? { id: initialData.id } : {}),
        title: data.title,
        date: data.date,
        type: data.type,
        summaryLength,
        template,
        language,
        participants: formattedParticipants,
        transcript: data.transcript || "",
      });
      onClose();
    } catch (err) {
      console.error("Error submitting meeting form:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[720px] w-[95vw] max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-2xl">
        <DialogHeader className="pr-6">
          <DialogTitle className="text-lg sm:text-xl font-bold">
            {initialData ? "Edit Meeting" : "Create New Meeting"}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {initialData
              ? "Update the details of your meeting."
              : "Fill in the information below to schedule a new meeting."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs sm:text-sm font-medium">Meeting Title</Label>
            <Input
              id="title"
              placeholder="e.g. Q3 Sprint Planning"
              {...register("title")}
              className="text-xs sm:text-sm h-9"
            />
            {errors.title && (
              <p className="text-xs text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="date" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Meeting Date
              </Label>
              <Input
                id="date"
                type="date"
                min={initialData?.date && initialData.date < todayStr ? initialData.date : todayStr}
                max={todayStr}
                {...register("date")}
                className="text-xs h-9"
              />
              {errors.date && (
                <p className="text-[11px] text-red-500">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="type" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Meeting Type
              </Label>
              <Select
                value={selectedType}
                onValueChange={(val) => {
                  if (val) setValue("type", val as MeetingType);
                }}
              >
                <SelectTrigger className="text-xs h-9">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  {meetingTypes.map((t) => (
                    <SelectItem key={t} value={t} className="text-xs">
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-[11px] text-red-500">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="template" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                AI Summary Style
              </Label>
              <Select
                value={template}
                onValueChange={(val) => {
                  if (val) setTemplate(val as SummaryTemplate);
                }}
              >
                <SelectTrigger className="text-xs h-9">
                  <SelectValue placeholder="Select Style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Standard" className="text-xs">Standard Briefing</SelectItem>
                  <SelectItem value="Executive" className="text-xs">Executive Summary</SelectItem>
                  <SelectItem value="Developer" className="text-xs">Developer Tasks</SelectItem>
                  <SelectItem value="Technical" className="text-xs">Technical Decisions</SelectItem>
                  <SelectItem value="Sales" className="text-xs">Sales Qualification</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="summaryLength" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Summary Length
              </Label>
              <Select
                value={summaryLength}
                onValueChange={(val) => {
                  if (val) setSummaryLength(val as SummaryLength);
                }}
              >
                <SelectTrigger className="text-xs h-9">
                  <SelectValue placeholder="Select Length" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Short" className="text-xs">Short (Concise)</SelectItem>
                  <SelectItem value="Medium" className="text-xs">Medium (Standard)</SelectItem>
                  <SelectItem value="Long" className="text-xs">Long (Detailed)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 col-span-1 sm:col-span-2">
              <Label htmlFor="language" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Output Language
              </Label>
              <Select
                value={language}
                onValueChange={(val) => {
                  if (val) setLanguage(val);
                }}
              >
                <SelectTrigger className="text-xs h-9">
                  <SelectValue>{language}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English" className="text-xs">English</SelectItem>
                  <SelectItem value="Spanish" className="text-xs">Spanish (Español)</SelectItem>
                  <SelectItem value="French" className="text-xs">French (Français)</SelectItem>
                  <SelectItem value="German" className="text-xs">German (Deutsch)</SelectItem>
                  <SelectItem value="Hindi" className="text-xs">Hindi (हिंदी)</SelectItem>
                  <SelectItem value="Japanese" className="text-xs">Japanese (日本語)</SelectItem>
                  <SelectItem value="Chinese" className="text-xs">Chinese (中文)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Participant Selection with Dropdown of All Application Users */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="participants" className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-zinc-500" />
                Participants (Emails)
              </Label>
            </div>

            <div className="relative">
              <Input
                id="participants"
                placeholder="Type @ to search & mention registered users (e.g. @john, @sarah)"
                value={currentParticipantsStr}
                onChange={handleParticipantsChange}
                onKeyDown={handleParticipantsKeyDown}
                onBlur={() => {
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
              />

              {/* Slack-style @ Mention Popup Menu */}
              {showSuggestions && (
                <div className="absolute z-50 left-0 right-0 mt-1 max-h-52 overflow-y-auto rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl py-1">
                  <div className="px-3 py-1.5 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <span>Select the Participants</span>
                  </div>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user, idx) => (
                      <button
                        key={user.id}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          applyUserMention(user.email);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex flex-col transition-colors ${idx === selectedIndex
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium"
                          : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300"
                          }`}
                      >
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{user.name}</span>
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400">{user.email}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-xs text-zinc-400 text-center">
                      No matching user found
                    </div>
                  )}
                </div>
              )}
            </div>
            {errors.participants && (
              <p className="text-xs text-red-500">
                {errors.participants.message}
              </p>
            )}

            {/* Quick Preview Badges for Added Participants */}
            {currentParticipantsStr && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {currentParticipantsStr
                  .split(",")
                  .map((p) => p.trim())
                  .filter((p) => p.length > 0)
                  .map((email, idx) => (
                    <Badge key={idx} variant="secondary" className="text-[11px] font-normal">
                      {email}
                    </Badge>
                  ))}
              </div>
            )}
          </div>

          {/* Exclusive Transcript Input: Either Text Paste OR File Upload */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <Label>Meeting Transcript Method</Label>
              <span className="text-[11px] text-zinc-500">
                Select one method (Text OR File)
              </span>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={(v) => handleTabChange(v as "paste" | "upload")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="paste" className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Text Input Only
                </TabsTrigger>
                <TabsTrigger
                  value="upload"
                  className="flex items-center gap-2"
                >
                  <FileUp className="h-4 w-4" />
                  File Upload Only
                </TabsTrigger>
              </TabsList>

              <TabsContent value="paste" className="mt-2 space-y-2">
                <RichTextEditor
                  value={transcriptValue || ""}
                  onChange={(content) => setValue("transcript", content)}
                  placeholder="Type or paste meeting transcript/notes with headings, bold, italic, lists, links..."
                  height={260}
                />
              </TabsContent>

              <TabsContent value="upload" className="mt-2 space-y-3">
                {!fileName ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${isDragging
                      ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30"
                      : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                      }`}
                  >
                    <FileUp className="mx-auto h-8 w-8 text-zinc-400 mb-2" />
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Drag & drop your transcript file here, or click to browse
                    </p>
                    <p className="text-xs text-zinc-500 mb-3">
                      Supports plain text, markdown, log, CSV, and JSON files (.txt, .md)
                    </p>
                    <Input
                      type="file"
                      accept=".txt,.md"
                      onChange={handleFileUpload}
                      className="max-w-xs mx-auto cursor-pointer"
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/40 p-3 rounded border border-green-200 dark:border-green-900">
                      <div className="flex items-center gap-2">
                        {isReadingFile ? (
                          <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        )}
                        <span>
                          Loaded: <strong>{fileName}</strong>
                          {fileSize ? ` (${fileSize})` : ""} &bull;{" "}
                          {transcriptValue?.length || 0} characters
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearFile}
                        className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : initialData ? (
                "Save Changes"
              ) : (
                "Create Meeting"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
