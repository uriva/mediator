"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, transact, tx, id } from "@/lib/instant";
import { ensureAliceIdentity, createDisputeConversation } from "@/lib/alice-and-bot";
import { saveLocalDisputeId } from "@/lib/dispute-storage";
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

interface CreateDisputeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateDisputeDialog({
  open,
  onOpenChange,
}: CreateDisputeDialogProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [creatorName, setCreatorName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error("Please provide both a title and description");
      return;
    }

    const name = creatorName.trim() || user?.email?.split("@")[0] || "Initiator";

    setLoading(true);
    const toastId = toast.loading("Creating mediation room...");

    try {
      // 1. Ensure user has an Alice & Bot identity
      const credentials = await ensureAliceIdentity(name);

      // 2. Create encrypted Alice & Bot conversation with Mediator Bot
      const convResult = await createDisputeConversation({
        title: title.trim(),
        participantKeys: [credentials.publicSignKey],
        credentials,
      });

      if ("error" in convResult || !convResult.conversationId) {
        throw new Error(
          ("error" in convResult && convResult.error) ||
            "Failed to provision encrypted chat channel"
        );
      }

      const conversationId = convResult.conversationId;
      const disputeId = id();
      const participantId = id();
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const now = Date.now();

      // 3. Store dispute and initial participant in InstantDB
      await transact([
        tx.disputes[disputeId].create({
          title: title.trim(),
          description: description.trim(),
          category: "General",
          status: "intake",
          conversationId,
          inviteCode,
          creatorEmail: user?.email || undefined,
          creatorName: name,
          createdAt: now,
          updatedAt: now,
        }),
        tx.disputeParticipants[participantId]
          .create({
            disputeId,
            userId: user?.id || undefined,
            email: user?.email || undefined,
            name,
            role: "initiator",
            publicSignKey: credentials.publicSignKey,
            joinedAt: now,
          })
          .link({ dispute: disputeId }),
      ]);

      saveLocalDisputeId(disputeId);
      toast.success("Mediation room created", { id: toastId });
      onOpenChange(false);
      router.push(`/dispute/${disputeId}`);
    } catch (err: any) {
      console.error("Failed to create dispute:", err);
      toast.error(err?.message || "Could not establish dispute", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl p-6 sm:p-7 bg-card border-border/70 shadow-xl">
        <DialogHeader className="space-y-1">
          <DialogTitle className="font-serif text-2xl font-bold text-foreground">
            Initiate a Mediation
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Start a structured, private mediation room.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
          {/* Your Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground/80">
              Your name
            </label>
            <Input
              type="text"
              placeholder="Your name"
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              className="rounded-xl h-10 border-border/80 text-sm focus-visible:ring-primary"
              required
            />
          </div>

          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground/80">
              Title
            </label>
            <Input
              type="text"
              placeholder="Dispute title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-xl h-10 border-border/80 text-sm focus-visible:ring-primary"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground/80">
              Description
            </label>
            <Textarea
              rows={4}
              placeholder="Describe the situation and desired outcome..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-xl border-border/80 text-sm resize-none focus-visible:ring-primary p-3"
              required
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm transition-all"
            >
              {loading ? "Creating Room..." : "Create Mediation Room"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
