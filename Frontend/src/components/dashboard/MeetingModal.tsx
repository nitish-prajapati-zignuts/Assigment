"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Meeting, SummaryLength, SummaryTemplate } from "@/types/meeting";
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
import { Loader2 } from "lucide-react";

import { MeetingFormBasicInfo } from "./meeting-modal/MeetingFormBasicInfo";
import { MeetingFormParticipants, AppUser } from "./meeting-modal/MeetingFormParticipants";
import { MeetingFormTranscriptEditor } from "./meeting-modal/MeetingFormTranscriptEditor";

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

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    meeting: Partial<Meeting> & {
      language?: string;
      summaryLength?: SummaryLength;
      template?: SummaryTemplate;
      customPrompt?: string;
    }
  ) => Promise<void> | void;
  initialData?: Meeting | null;
}

export function MeetingModal({ isOpen, onClose, onSave, initialData }: MeetingModalProps) {
  const [appUsers, setAppUsers] = useState<AppUser[]>([]);
  const [summaryLength, setSummaryLength] = useState<SummaryLength>("Medium");
  const [template, setTemplate] = useState<SummaryTemplate>("Standard");
  const [customPrompt, setCustomPrompt] = useState<string>("");
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

  // Fetch registered users AND user settings from database on modal open
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, settingsRes] = await Promise.allSettled([api.get("/auth/users"), api.get("/settings")]);

        if (usersRes.status === "fulfilled" && Array.isArray(usersRes.value.data)) {
          setAppUsers(usersRes.value.data);
        }

        if (settingsRes.status === "fulfilled" && settingsRes.value.data) {
          const s = settingsRes.value.data;
          if (s.summaryLength) setSummaryLength(s.summaryLength);
          if (s.template) setTemplate(s.template);
          if (s.customPrompt) setCustomPrompt(s.customPrompt);
        }
      } catch (err) {
        console.error("Failed to fetch initial modal data from API:", err);
      } finally {
        setUsersFetched(true);
      }
    };

    if (isOpen && !usersFetched) {
      fetchData();
    }
  }, [isOpen, usersFetched]);

  // Sync initialData when editing
  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title,
        date: initialData.date ? initialData.date.substring(0, 10) : todayStr,
        type: initialData.type || "Internal Meeting",
        participants: Array.isArray(initialData.participants)
          ? initialData.participants.join(", ")
          : initialData.participants || "",
        transcript: initialData.transcript || "",
      });
    } else {
      reset({
        title: "",
        date: todayStr,
        type: "Internal Meeting",
        participants: "",
        transcript: "",
      });
    }
  }, [initialData, reset, todayStr, isOpen]);

  const watchType = watch("type");
  const watchParticipants = watch("participants");
  const watchTranscript = watch("transcript");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: MeetingFormValues) => {
    try {
      setIsSubmitting(true);
      const participantList = data.participants
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      const payload: any = {
        ...data,
        participants: participantList,
        language,
        summaryLength,
        template,
        customPrompt,
      };

      // If editing an existing meeting, attach id and omit date parameter so original date is preserved
      if (initialData) {
        payload.id = initialData.id;
        delete payload.date;
      }

      await onSave(payload);
      onClose();
    } catch (error) {
      console.error("Failed to save meeting:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-3xl sm:max-w-3xl md:max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            {initialData ? "Edit Meeting Note" : "Log New Meeting & Generate Summary"}
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-500">
            Enter meeting details, attendees, and transcripts to generate AI-powered summaries and action items.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Basic Info: Title, Date, Type, AI Controls */}
          <MeetingFormBasicInfo
            register={register}
            errors={errors}
            typeValue={watchType}
            setValue={setValue}
            summaryLength={summaryLength}
            setSummaryLength={setSummaryLength}
            template={template}
            setTemplate={setTemplate}
            language={language}
            setLanguage={setLanguage}
            isEditing={!!initialData}
          />

          {/* Attendees Chips & Mentions Autocomplete */}
          <MeetingFormParticipants
            register={register}
            errors={errors}
            watchParticipants={watchParticipants}
            setValue={setValue}
            appUsers={appUsers}
          />

          {/* Notes & Transcript Editor (File Upload + Rich Text) */}
          <MeetingFormTranscriptEditor watchTranscript={watchTranscript} setValue={setValue} />

          <DialogFooter className="pt-2 border-t border-zinc-100 dark:border-zinc-800 gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="h-9 text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-9 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {initialData ? "Updating Meeting..." : "Saving & Processing..."}
                </>
              ) : initialData ? (
                "Update Meeting Note"
              ) : (
                "Save & Generate AI Notes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
