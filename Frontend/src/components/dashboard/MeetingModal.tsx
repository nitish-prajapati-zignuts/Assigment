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
  "Retrospective",
  "Other",
];

const meetingSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  date: z.string().min(1, "Date is required"),
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

interface AppUser {
  id: string;
  name: string;
  email: string;
}

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (meeting: Partial<Meeting>) => Promise<void> | void;
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
      date: new Date().toISOString().split("T")[0],
      type: "Internal Meeting",
      participants: "",
      transcript: "",
    },
  });

  // Fetch all registered application users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/auth/users");
        if (Array.isArray(res.data)) {
          setAppUsers(res.data);
        }
      } catch (err) {
        console.log("Using default participant fallback list");
        setAppUsers([
          { id: "1", name: "Nitish Prajapati", email: "nitish@zignuts.com" },
          { id: "2", name: "Alex Johnson", email: "alex@company.com" },
          { id: "3", name: "Sarah Smith", email: "sarah@company.com" },
        ]);
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

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
        date: new Date().toISOString().split("T")[0],
        type: "Internal Meeting",
        participants: "",
        transcript: "",
      });
      setFileName(null);
      setFileSize(null);
      setActiveTab("paste");
    }
  }, [initialData, isOpen, reset]);

  const selectedType = watch("type");
  const transcriptValue = watch("transcript");
  const currentParticipantsStr = watch("participants") || "";

  // Add selected user from dropdown to participants string
  const handleSelectUser = (userEmail: string | null) => {
    if (!userEmail) return;

    const existingList = currentParticipantsStr
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    if (!existingList.includes(userEmail)) {
      const newList = [...existingList, userEmail].join(", ");
      setValue("participants", newList);
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
      <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Meeting" : "Create New Meeting"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Update the details of your meeting."
              : "Fill in the information below to schedule a new meeting."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="title">Meeting Title</Label>
            <Input
              id="title"
              placeholder="e.g. Q3 Sprint Planning"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Meeting Date</Label>
              <Input id="date" type="date" {...register("date")} />
              {errors.date && (
                <p className="text-xs text-red-500">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Meeting Type</Label>
              <Select
                value={selectedType}
                onValueChange={(val) => {
                  if (val) setValue("type", val as MeetingType);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {meetingTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-xs text-red-500">{errors.type.message}</p>
              )}
            </div>
          </div>

          {/* Participant Selection with Dropdown of All Application Users */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="participants" className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-zinc-500" />
                Participants (Emails)
              </Label>

              {/* Dropdown selecting from registered application users */}
              <div className="w-60">
                <Select onValueChange={(val) => { if (val) handleSelectUser(val as string); }}>
                  <SelectTrigger className="h-8 text-xs bg-zinc-50 dark:bg-zinc-900 border-dashed">
                    <div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-300">
                      <UserPlus className="h-3.5 w-3.5 text-blue-500" />
                      <span>Add Registered User</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {appUsers.map((user) => (
                      <SelectItem key={user.id} value={user.email} className="text-xs">
                        <div className="flex flex-col">
                          <span className="font-semibold">{user.name}</span>
                          <span className="text-[10px] text-zinc-400">{user.email}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Input
              id="participants"
              placeholder="alex@company.com, sarah@company.com"
              {...register("participants")}
            />
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
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                      isDragging
                        ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30"
                        : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    }`}
                  >
                    <FileUp className="mx-auto h-8 w-8 text-zinc-400 mb-2" />
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      Drag & drop your transcript file here, or click to browse
                    </p>
                    <p className="text-xs text-zinc-500 mb-3">
                      Supports plain text, markdown, log, CSV, and JSON files (.txt, .md, .log, .csv, .json)
                    </p>
                    <Input
                      type="file"
                      accept=".txt,.md,.text,.log,.csv,.json"
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
