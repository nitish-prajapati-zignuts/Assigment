"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MeetingType, SummaryLength, SummaryTemplate } from "@/types/meeting";
import { FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";

const meetingTypes: MeetingType[] = [
  "Client Meeting",
  "Sales Meeting",
  "Project Meeting",
  "Internal Meeting",
  "Requirement Discussion",
];

interface MeetingFormBasicInfoProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  typeValue: MeetingType;
  setValue: UseFormSetValue<any>;
  summaryLength: SummaryLength;
  setSummaryLength: (val: SummaryLength) => void;
  template: SummaryTemplate;
  setTemplate: (val: SummaryTemplate) => void;
  language: string;
  setLanguage: (val: string) => void;
  isEditing?: boolean;
}

export function MeetingFormBasicInfo({
  register,
  errors,
  typeValue,
  setValue,
  summaryLength,
  setSummaryLength,
  template,
  setTemplate,
  language,
  setLanguage,
  isEditing,
}: MeetingFormBasicInfoProps) {
  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
          Meeting Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          placeholder="e.g. Q3 Marketing Budget & Product Strategy Sync"
          {...register("title")}
          className="text-xs bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
        />
        {errors.title && <p className="text-[11px] text-red-500 font-medium">{errors.title.message as string}</p>}
      </div>

      {/* Date & Type Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="date" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Meeting Date <span className="text-red-500">*</span>
            </Label>
            {isEditing && <span className="text-[10px] text-zinc-400 font-medium italic">Date Locked (Preserved)</span>}
          </div>
          <Input
            id="date"
            type="date"
            disabled={isEditing}
            {...register("date")}
            className="text-xs bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 disabled:opacity-60 disabled:cursor-not-allowed"
          />
          {errors.date && <p className="text-[11px] text-red-500 font-medium">{errors.date.message as string}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="type" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Meeting Category <span className="text-red-500">*</span>
          </Label>
          <Select value={typeValue} onValueChange={(val) => val && setValue("type", val as MeetingType)}>
            <SelectTrigger className="text-xs bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {meetingTypes.map((t) => (
                <SelectItem key={t} value={t} className="text-xs">
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* AI Customization Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-zinc-50/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800">
        <div className="space-y-1">
          <Label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">Summary Depth</Label>
          <Select value={summaryLength} onValueChange={(v) => v && setSummaryLength(v as SummaryLength)}>
            <SelectTrigger className="h-7 text-xs bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Short">Short (Brief)</SelectItem>
              <SelectItem value="Medium">Medium (Standard)</SelectItem>
              <SelectItem value="Detailed">Detailed (In-depth)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">Prompt Template</Label>
          <Select value={template} onValueChange={(v) => v && setTemplate(v as SummaryTemplate)}>
            <SelectTrigger className="h-7 text-xs bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Standard">Standard Briefing</SelectItem>
              <SelectItem value="Executive">Executive Summary</SelectItem>
              <SelectItem value="Developer">Developer Tasks</SelectItem>
              <SelectItem value="Technical">Technical Decisions</SelectItem>
              <SelectItem value="Sales">Sales Qualification</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">Output Language</Label>
          <Select value={language} onValueChange={(v) => v && setLanguage(v)}>
            <SelectTrigger className="h-7 text-xs bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Spanish">Spanish</SelectItem>
              <SelectItem value="French">French</SelectItem>
              <SelectItem value="German">German</SelectItem>
              <SelectItem value="Japanese">Japanese</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
