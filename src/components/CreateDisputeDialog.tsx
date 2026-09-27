"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, transact, tx, id } from "@/lib/instant";
import { ensureAliceIdentity, createDisputeConversation } from "@/lib/alice-and-bot";
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
import { Sparkles, FileText, User, HelpCircle } from "lucide-react";

const CATEGORIES = [
  { value: "financial", label: "Financial / Debt / Loan" },
  { value: "housing", label: "Rental / Tenancy / Property" },
  { value: "workplace", label: "Workplace / Freelance / Contract" },
  { value: "services", label: "Goods / Services / Deliverables" },
  { value: "personal", label: "Interpersonal / Family / Community" },
  { value: "other", label: "Other Dispute" },
];

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

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("financial");
  const [creatorName, setCreatorName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error("Please provide both a title and summary of the dispute");
      return;
    }

    const name = creatorName.trim() || user?.email?.split("@")[0] || "Initiator";

    setLoading(true);
    const toastId = toast.loading("Establishing secure mediation room...");

    try {
      // 1. Ensure client has an Alice & Bot keypair
      const credentials = await ensureAliceIdentity(name);

      // 2. Create encrypted Alice & Bot conversation with the Mediator Bot
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
          category,
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

      toast.success("Mediation room established", { id: toastId });
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
      <DialogContent className="sm:max-w-lg rounded-2xl p-6 sm:p-8 bg-card border-border/70 shadow-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1.5">
          <div className="flex items-center gap-2 text-primary font-serif font-semibold text-sm">
            <span className="text-lg">🌿</span> Step into Neutral Ground
          </div>
          <DialogTitle className="font-serif text-2xl font-bold text-foreground">
            Initiate a Mediation
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            Provide the initial context. Once created, you will receive a private invite link to bring the other party into the room.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Dispute Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/80 tracking-wide flex items-center justify-between">
              <span>Dispute Subject / Headline</span>
              <span className="text-[11px] text-muted-foreground font-normal">e.g. Deposit return, Unpaid invoice</span>
            </label>
            <Input
              type="text"
              placeholder="e.g., Security Deposit Return for Apt 3B"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-xl h-11 border-border/80 text-sm focus-visible:ring-primary"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/80 tracking-wide">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-11 rounded-xl border border-border/80 bg-background px-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Your Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/80 tracking-wide">
              Your Name / Title
            </label>
            <Input
              type="text"
              placeholder="e.g., Jordan Miller (Tenant)"
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              className="rounded-xl h-11 border-border/80 text-sm focus-visible:ring-primary"
            />
          </div>

          {/* Situation Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/80 tracking-wide flex items-center justify-between">
              <span>Overview & Desired Resolution</span>
              <span className="text-[11px] text-muted-foreground font-normal">State the main points calmly</span>
            </label>
            <Textarea
              rows={4}
              placeholder="Briefly describe the key events, amounts or agreements involved, and what fair outcome you are hoping to reach..."
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
              className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm transition-all shadow-xs"
            >
              {loading ? "Creating Mediation Room..." : "Create & Enter Room"}
            </Button>
            <p className="text-[11px] text-center text-muted-foreground mt-2">
              The AI Mediator will welcome both parties and only record facts agreed upon by all sides.
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
