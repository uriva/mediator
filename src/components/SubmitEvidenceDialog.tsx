"use client";

import { useState } from "react";
import { transact, tx, id } from "@/lib/instant";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Paperclip, Link as LinkIcon, FileText } from "lucide-react";

interface SubmitEvidenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disputeId: string;
  submitterName: string;
}

export function SubmitEvidenceDialog({
  open,
  onOpenChange,
  disputeId,
  submitterName,
}: SubmitEvidenceDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a title for this evidence");
      return;
    }

    setLoading(true);
    try {
      const evidenceId = id();
      await transact([
        tx.evidence[evidenceId]
          .create({
            disputeId,
            title: title.trim(),
            description: description.trim() || undefined,
            fileUrl: fileUrl.trim() || undefined,
            submittedBy: submitterName || "Participant",
            submittedAt: Date.now(),
          })
          .link({ dispute: disputeId }),
        tx.disputes[disputeId].update({
          updatedAt: Date.now(),
        }),
      ]);

      toast.success("Evidence added to dispute locker");
      setTitle("");
      setDescription("");
      setFileUrl("");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit evidence");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl p-6 sm:p-8 bg-card border-border/70 shadow-xl">
        <DialogHeader className="space-y-1.5">
          <div className="flex items-center gap-2 text-primary font-serif font-semibold text-sm">
            <Paperclip className="w-4 h-4" /> Evidence Locker
          </div>
          <DialogTitle className="font-serif text-2xl font-bold text-foreground">
            Submit Concrete Evidence
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            Provide verifiable records (e.g. receipt dates, contract clauses, photo descriptions, or document links). The AI Mediator uses this to substantiate facts.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/80 tracking-wide">
              Document / Item Title
            </label>
            <Input
              type="text"
              placeholder="e.g. Move-out Inspection Checklist, Bank Transfer Receipt"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-xl h-11 border-border/80 text-sm focus-visible:ring-primary"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/80 tracking-wide">
              Details & Context
            </label>
            <Textarea
              rows={3}
              placeholder="Explain what this evidence shows (dates, amounts, specific clauses)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-xl border-border/80 text-sm resize-none focus-visible:ring-primary p-3"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/80 tracking-wide flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Link / Document URL (Optional)</span>
            </label>
            <Input
              type="url"
              placeholder="https://drive.google.com/... or public image link"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              className="rounded-xl h-11 border-border/80 text-sm focus-visible:ring-primary"
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm transition-all"
            >
              {loading ? "Adding Evidence..." : "Add to Evidence Locker"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
