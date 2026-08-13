"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Share2, Copy, CheckCircle2, Lock, Clock, Loader2 } from "lucide-react";

interface MeetingShareableSectionProps {
  isPublished: boolean;
  shareToken: string | null;
  isPublishing: boolean;
  copied: boolean;
  hasSharePassword: boolean;
  sharePasswordInput: string;
  setSharePasswordInput: (val: string) => void;
  expirationHours: string;
  setExpirationHours: (val: string) => void;
  shareExpiresAtDate: string | null;
  onTogglePublish: (val: boolean) => void;
  onCopyLink: () => void;
  onUpdateSettings: () => void;
  onClearPassword: () => void;
  onClearExpiration: () => void;
}

export function MeetingShareableSection({
  isPublished,
  shareToken,
  isPublishing,
  copied,
  hasSharePassword,
  sharePasswordInput,
  setSharePasswordInput,
  expirationHours,
  setExpirationHours,
  shareExpiresAtDate,
  onTogglePublish,
  onCopyLink,
  onUpdateSettings,
  onClearPassword,
  onClearExpiration,
}: MeetingShareableSectionProps) {
  return (
    <div className="bg-amber-500/10 dark:bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
            <Share2 className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              Public Meeting Sharing
              {isPublished && (
                <Badge
                  variant="outline"
                  className="text-[10px] bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200"
                >
                  Live Link Active
                </Badge>
              )}
            </h4>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Share encrypted read-only summary & transcript with clients or team members.
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant={isPublished ? "destructive" : "default"}
          onClick={() => onTogglePublish(!isPublished)}
          disabled={isPublishing}
          className="h-8 text-xs shrink-0"
        >
          {isPublishing ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
              Updating...
            </>
          ) : isPublished ? (
            "Revoke Share Link"
          ) : (
            "Enable Share Link"
          )}
        </Button>
      </div>

      {isPublished && (
        <div className="pt-2 border-t border-amber-200/60 dark:border-amber-900/40 space-y-3">
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={shareToken ? `${window.location.origin}/share/${shareToken}` : "Generating encrypted link..."}
              className="h-8 text-xs font-mono bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 select-all flex-1"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={onCopyLink}
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
                    onClick={onClearPassword}
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
                    onClick={onUpdateSettings}
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
                    onClick={onClearExpiration}
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
                      setTimeout(onUpdateSettings, 100);
                    }
                  }
                }}
              >
                <SelectTrigger className="h-7 text-xs bg-white dark:bg-zinc-900">
                  <SelectValue placeholder="Expires in..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never" className="text-xs">
                    Never (Permanent)
                  </SelectItem>
                  <SelectItem value="1" className="text-xs">
                    Expires in 1 Hour
                  </SelectItem>
                  <SelectItem value="24" className="text-xs">
                    Expires in 24 Hours (1 Day)
                  </SelectItem>
                  <SelectItem value="168" className="text-xs">
                    Expires in 7 Days
                  </SelectItem>
                  <SelectItem value="720" className="text-xs">
                    Expires in 30 Days
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Security & Expiration Badges */}
          {(hasSharePassword || shareExpiresAtDate) && (
            <div className="flex flex-wrap gap-2 pt-1">
              {hasSharePassword && (
                <Badge
                  variant="secondary"
                  className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 flex items-center gap-1"
                >
                  <Lock className="h-3 w-3" /> Password Protected
                </Badge>
              )}
              {shareExpiresAtDate && (
                <Badge
                  variant="secondary"
                  className="text-[10px] bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 flex items-center gap-1"
                >
                  <Clock className="h-3 w-3" />
                  Expires {new Date(shareExpiresAtDate).toLocaleDateString()} at{" "}
                  {new Date(shareExpiresAtDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </Badge>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
