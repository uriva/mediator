"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useQuery, transact, tx, id } from "@/lib/instant";
import { ensureAliceIdentity, createDisputeConversation } from "@/lib/alice-and-bot";
import { saveLocalDisputeId } from "@/lib/dispute-storage";
import { Navbar } from "@/components/Navbar";
import { AuthDialog } from "@/components/AuthDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ShieldCheck,
  Scale,
  CheckCircle2,
  Users,
  ArrowRight,
  Lock,
  Sparkles,
} from "lucide-react";

interface InviteClientProps {
  inviteCode: string;
}

export default function InviteClient({ inviteCode }: InviteClientProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [authOpen, setAuthOpen] = useState(false);

  const { data, isLoading } = useQuery({
    disputes: {
      $: { where: { inviteCode } },
      participants: {},
      facts: {},
    },
  });

  const dispute = data?.disputes?.[0] as any;

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispute) return;

    const participantName =
      name.trim() || user?.email?.split("@")[0] || "Invited Respondent";
    const participantEmail = email.trim() || user?.email || undefined;

    setLoading(true);
    setLoadingStep("Generating secure encryption keys...");

    try {
      // 1. Establish Alice & Bot keypair for this participant
      const credentials = await ensureAliceIdentity(participantName);

      setLoadingStep("Connecting to multi-party room...");
      // 2. Collect all participants' publicSignKeys
      const existingKeys = (dispute.participants || [])
        .map((p: any) => p.publicSignKey)
        .filter(Boolean);
      const allKeys = Array.from(new Set([...existingKeys, credentials.publicSignKey]));

      // 3. Provision or update multi-party conversation with both parties & bot
      let conversationId = dispute.conversationId;
      try {
        const convRes = await createDisputeConversation({
          title: dispute.title,
          participantKeys: allKeys,
          credentials,
        });
        if ("conversationId" in convRes && convRes.conversationId) {
          conversationId = convRes.conversationId;
        }
      } catch (e) {
        console.warn("Could not re-key conversation upon join:", e);
      }

      setLoadingStep("Recording attendance in room...");
      // 4. Check if participant already recorded
      const alreadyJoined = (dispute.participants || []).some(
        (p: any) =>
          (participantEmail && p.email === participantEmail) ||
          p.publicSignKey === credentials.publicSignKey
      );

      const now = Date.now();
      const participantId = id();
      const updates = alreadyJoined
        ? [
            tx.disputes[dispute.id].update({
              status: "in_mediation",
              conversationId,
              updatedAt: now,
            }),
          ]
        : [
            tx.disputes[dispute.id].update({
              status: "in_mediation",
              conversationId,
              updatedAt: now,
            }),
            tx.disputeParticipants[participantId]
              .create({
                disputeId: dispute.id,
                userId: user?.id || undefined,
                email: participantEmail,
                name: participantName,
                role: "respondent",
                publicSignKey: credentials.publicSignKey,
                joinedAt: now,
              })
              .link({ dispute: dispute.id }),
          ];

      await transact(updates);

      saveLocalDisputeId(dispute.id);
      setLoadingStep("Entering mediation chamber...");
      toast.success("Welcome to the mediation room");
      router.push(`/dispute/${dispute.id}`);
    } catch (err: any) {
      console.error("Failed to join mediation:", err);
      toast.error(err?.message || "Could not join session");
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar onOpenAuth={() => setAuthOpen(true)} />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground font-medium">
            Locating mediation invitation...
          </p>
        </div>
      </div>
    );
  }

  if (!dispute) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar onOpenAuth={() => setAuthOpen(true)} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <Scale className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl font-bold">Invalid Invitation Link</h2>
          <p className="text-xs text-muted-foreground">
            This invitation code ({inviteCode}) could not be verified. Please check with the party who invited you.
          </p>
          <Link href="/" className="inline-flex items-center justify-center rounded-xl border border-border px-3.5 py-2 text-xs font-medium hover:bg-muted transition-colors">
            Go to Mediator Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      <Navbar onOpenAuth={() => setAuthOpen(true)} />

      <main className="flex-1 max-w-xl mx-auto w-full px-4 py-12 sm:py-16 flex flex-col justify-center">
        <div className="p-7 sm:p-10 rounded-3xl bg-card border border-border/80 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-2">
              <span className="text-2xl">🕊️</span>
            </div>
            <Badge
              variant="outline"
              className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border-primary/30 text-primary bg-primary/5"
            >
              Mediation Invitation
            </Badge>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
              You Have Been Invited to Mediate
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
              {dispute.creatorName || "The initiating party"} has invited you to enter a neutral, structured dialogue to reach a fair resolution.
            </p>
          </div>

          {/* Dispute Context Box */}
          <div className="p-4 rounded-2xl bg-muted/40 border border-border/70 space-y-2">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Matter Subject
            </span>
            <p className="font-serif font-bold text-base text-foreground">
              {dispute.title}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {dispute.description}
            </p>
          </div>

          {/* Core Guarantees for the Invitee */}
          <div className="space-y-2 text-xs text-muted-foreground border-y border-border/60 py-4">
            <span className="font-semibold text-foreground text-[11px] uppercase tracking-wide block mb-1">
              Mediation Ground Rules:
            </span>
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>
                <strong className="text-foreground">Neutral Ground:</strong> The AI Mediator never takes sides, assigns blame, or favors one party.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>
                <strong className="text-foreground">Strict Fact Rule:</strong> Nothing is recorded as an agreed fact unless YOU confirm it, or concrete verified evidence is provided.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>
                <strong className="text-foreground">Confidential & Encrypted:</strong> Messages are exchanged securely through end-to-end encrypted Alice & Bot channels.
              </span>
            </div>
          </div>

          {/* Join Form or Loading Spinner */}
          {loading ? (
            <div className="py-10 px-4 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto">
                  <div className="w-7 h-7 border-2.5 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              </div>
              <div className="space-y-1.5 max-w-xs mx-auto">
                <h3 className="font-serif font-bold text-lg text-foreground">
                  Entering Mediation Chamber
                </h3>
                <p className="text-xs text-primary font-medium animate-pulse">
                  {loadingStep || "Connecting to secure session..."}
                </p>
                <p className="text-[11px] text-muted-foreground pt-1">
                  Exchanging encryption keys with the other party and the AI Mediator.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleJoin} className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/80 tracking-wide">
                  Your name
                </label>
                <Input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl h-11 border-border/80 text-sm focus-visible:ring-primary"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/80 tracking-wide flex items-center justify-between">
                  <span>Email Address (Optional)</span>
                  <span className="text-[11px] text-muted-foreground font-normal">
                    To receive settlement updates
                  </span>
                </label>
                <Input
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl h-11 border-border/80 text-sm focus-visible:ring-primary"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm transition-all gap-2 shadow-xs"
              >
                <span>Enter Mediation Room</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          )}
        </div>
      </main>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}
