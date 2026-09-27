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
  const [loadingStep, setLoadingStep] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error("Please provide both a title and description");
      return;
    }

    const name = creatorName.trim() || user?.email?.split("@")[0] || "Initiator";

    setLoading(true);
    setLoadingStep("Generating secure end-to-end encryption keys...");

    try {
      // 1. Ensure user has an Alice & Bot identity
      const credentials = await ensureAliceIdentity(name);

      setLoadingStep("Provisioning private mediation chamber...");
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

      setLoadingStep("Recording dispute onto ledger...");
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
      setLoadingStep("Entering your mediation room...");
      toast.success("Mediation room created");
      onOpenChange(false);
      router.push(`/dispute/${disputeId}`);
    } catch (err: any) {
      console.error("Failed to create dispute:", err);
      toast.error(err?.message || "Could not establish dispute");
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

        {loading ? (
          <div className="py-12 px-4 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto">
                <div className="w-7 h-7 border-2.5 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            </div>
            <div className="space-y-1.5 max-w-xs mx-auto">
              <h3 className="font-serif font-bold text-lg text-foreground">
                Setting Up Neutral Chamber
              </h3>
              <p className="text-xs text-primary font-medium animate-pulse">
                {loadingStep || "Preparing your private mediation room..."}
              </p>
              <p className="text-[11px] text-muted-foreground pt-1">
                Generating end-to-end encryption keys and establishing private record.
              </p>
            </div>
          </div>
        ) : (
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
                Create Mediation Room
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
