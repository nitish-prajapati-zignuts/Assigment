import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Archive, Loader2 } from "lucide-react";
import { Meeting } from "@/types/meeting";

interface ArchiveMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetingToArchive: Meeting | null;
  onConfirmArchive: () => void;
  isArchiving: boolean;
}

export function ArchiveMeetingModal({
  isOpen,
  onClose,
  meetingToArchive,
  onConfirmArchive,
  isArchiving,
}: ArchiveMeetingModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[420px] p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
        <DialogHeader className="space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40">
            <Archive className="h-6 w-6" />
          </div>
          <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Archive Meeting</DialogTitle>
          <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Are you sure you want to archive{" "}
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              &quot;{meetingToArchive?.title}&quot;
            </span>
            ? The meeting will be hidden from your active list but can be restored later.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isArchiving}
            className="h-9 text-xs font-medium border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onConfirmArchive}
            disabled={isArchiving}
            className="h-9 text-xs font-medium bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-sm flex items-center gap-1.5"
          >
            {isArchiving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Archiving...
              </>
            ) : (
              <>
                <Archive className="h-3.5 w-3.5" />
                Archive Meeting
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
