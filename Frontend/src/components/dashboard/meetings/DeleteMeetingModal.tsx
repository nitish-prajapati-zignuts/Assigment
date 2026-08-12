import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";
import { Meeting } from "@/types/meeting";

interface DeleteMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetingToDelete: Meeting | null;
  onConfirmDelete: () => void;
  isDeleting: boolean;
}

export function DeleteMeetingModal({
  isOpen,
  onClose,
  meetingToDelete,
  onConfirmDelete,
  isDeleting,
}: DeleteMeetingModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[420px] p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
        <DialogHeader className="space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/50 flex items-center justify-center text-red-600 dark:text-red-400 border border-red-200/60 dark:border-red-900/40">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Delete Meeting
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Are you sure you want to delete <span className="font-semibold text-zinc-900 dark:text-zinc-100">&quot;{meetingToDelete?.title}&quot;</span>? This will permanently remove the meeting transcript, AI summary, and action items.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
            className="h-9 text-xs font-medium border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onConfirmDelete}
            disabled={isDeleting}
            className="h-9 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-sm flex items-center gap-1.5"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                Delete Meeting
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
