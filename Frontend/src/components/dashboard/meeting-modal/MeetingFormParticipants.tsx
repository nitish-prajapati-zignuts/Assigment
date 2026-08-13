"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus } from "lucide-react";
import { FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";

export interface AppUser {
  id: string;
  name: string;
  email: string;
}

interface MeetingFormParticipantsProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  watchParticipants: string;
  setValue: UseFormSetValue<any>;
  appUsers: AppUser[];
}

export function MeetingFormParticipants({
  errors,
  watchParticipants,
  setValue,
  appUsers,
}: MeetingFormParticipantsProps) {
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionFilter, setMentionFilter] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue("participants", val);

    const cursor = e.target.selectionStart || val.length;
    const textBeforeCursor = val.substring(0, cursor);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const query = textBeforeCursor.substring(lastAtIndex + 1);
      if (!query.includes(",") && !query.includes(" ")) {
        setMentionFilter(query.toLowerCase());
        setShowMentionDropdown(true);
        return;
      }
    }
    setShowMentionDropdown(false);
  };

  const applyUserMention = (userEmail: string) => {
    const currentVal = watchParticipants || "";
    const existingParts = currentVal
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p && !p.startsWith("@"));

    if (!existingParts.includes(userEmail)) {
      existingParts.push(userEmail);
    }

    const newVal = existingParts.join(", ");
    setValue("participants", newVal);
    setShowMentionDropdown(false);
  };

  const filteredUsers = appUsers.filter(
    (u) => u.name.toLowerCase().includes(mentionFilter) || u.email.toLowerCase().includes(mentionFilter)
  );

  const participantChips = (watchParticipants || "")
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  return (
    <div className="space-y-2 relative">
      <div className="flex items-center justify-between">
        <Label
          htmlFor="participants"
          className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5"
        >
          <Users className="h-3.5 w-3.5 text-indigo-500" /> Attendees & Participants{" "}
          <span className="text-red-500">*</span>
        </Label>
        <span className="text-[10px] text-zinc-400 font-normal">
          Type <kbd className="px-1 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded font-mono">@</kbd> to mention user
        </span>
      </div>

      <Input
        id="participants"
        placeholder="e.g. john@acme.com, sarah@company.com or type @"
        value={watchParticipants || ""}
        onChange={handleInputChange}
        className="text-xs bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
      />
      {errors.participants && (
        <p className="text-[11px] text-red-500 font-medium">{errors.participants.message as string}</p>
      )}

      {/* Participant Chips Display */}
      {participantChips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {participantChips.map((chip, idx) => (
            <Badge
              key={idx}
              variant="secondary"
              className="text-[11px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200"
            >
              {chip}
            </Badge>
          ))}
        </div>
      )}

      {/* Mention Dropdown Popup */}
      {showMentionDropdown && filteredUsers.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl max-h-48 overflow-y-auto p-1 space-y-0.5">
          <div className="px-2 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Select Registered User
          </div>
          {filteredUsers.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => applyUserMention(u.email)}
              className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-indigo-50 dark:hover:bg-indigo-950/60 flex items-center justify-between transition-colors"
            >
              <div>
                <p className="font-semibold text-zinc-800 dark:text-zinc-200">{u.name}</p>
                <p className="text-[10px] text-zinc-400">{u.email}</p>
              </div>
              <UserPlus className="h-3.5 w-3.5 text-indigo-500" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
