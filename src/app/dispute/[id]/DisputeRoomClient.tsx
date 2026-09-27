"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useAuth, useQuery } from "@/lib/instant";
import {
  ensureAliceIdentity,
  type Credentials,
  loadLocalCredentials,
} from "@/lib/alice-and-bot";
import { Navbar } from "@/components/Navbar";
import { ShareDialog } from "@/components/ShareDialog";
import { SubmitEvidenceDialog } from "@/components/SubmitEvidenceDialog";
import { SettlementAgreementModal } from "@/components/SettlementAgreementModal";
import { AuthDialog } from "@/components/AuthDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  Share2,
  Paperclip,
  Users,
  Printer,
  Sparkles,
  ArrowLeft,
  Scale,
  ExternalLink,
  Plus,
  Info,
} from "lucide-react";

// Dynamically import AliceChat so Lit Web Components are client-only
const AliceChat = dynamic(() => import("@/components/AliceChat"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-card/60 backdrop-blur-xs min-h-[460px] rounded-2xl border border-border/70">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <span className="text-xs text-muted-foreground font-medium">
        Connecting to encrypted mediation channel...
      </span>
    </div>
  ),
});

interface DisputeRoomClientProps {
  disputeId: string;
}

export default function DisputeRoomClient({ disputeId }: DisputeRoomClientProps) {
  const { user } = useAuth();

  const [credentials, setCredentials] = useState<Credentials | null>(
    loadLocalCredentials
  );
  const [shareOpen, setShareOpen] = useState(false);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [agreementOpen, setAgreementOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  // Subscribe in real-time to dispute, facts, evidence, and proposals
  const { data, isLoading } = useQuery({
    disputes: {
      $: { where: { id: disputeId } },
      participants: {},
      facts: { $: { order: { createdAt: "asc" } } },
      evidenceItems: { $: { order: { submittedAt: "desc" } } },
      proposals: { $: { order: { createdAt: "desc" } } },
    },
  });

  const dispute = data?.disputes?.[0] as any;

  // Initialize Alice & Bot credentials
  useEffect(() => {
    if (!credentials) {
      const defaultName =
        user?.email?.split("@")[0] ||
        "party-" + Math.random().toString(36).substring(2, 6);
      ensureAliceIdentity(defaultName).then((c) => setCredentials(c));
    }
  }, [credentials, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar onOpenAuth={() => setAuthOpen(true)} />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-muted-foreground font-medium">
            Entering mediation chamber...
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
          <h2 className="font-serif text-2xl font-bold">Dispute Not Found</h2>
          <p className="text-xs text-muted-foreground">
            This dispute may have been moved or the link is incorrect.
          </p>
          <Link href="/" className="inline-flex items-center justify-center rounded-xl border border-border px-3.5 py-2 text-xs font-medium hover:bg-muted transition-colors">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const facts = (dispute.facts || []).filter((f: any) => f.status === "agreed");
  const evidenceItems = dispute.evidenceItems || [];
  const proposals = dispute.proposals || [];
  const participants = dispute.participants || [];
  const isResolved = dispute.status === "resolved";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar onOpenAuth={() => setAuthOpen(true)} />

      {/* Mediation Header */}
      <div className="border-b border-border/70 bg-card/60 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                    isResolved
                      ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
                      : dispute.status === "in_mediation"
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "bg-muted text-muted-foreground border-border"
                  }`}
                >
                  {isResolved
                    ? "Agreement Reached"
                    : dispute.status === "in_mediation"
                    ? "In Mediation"
                    : "Intake"}
                </Badge>

                <span className="text-xs text-muted-foreground capitalize font-medium">
                  {dispute.category || "General Dispute"}
                </span>
              </div>

              <h1 className="font-serif text-lg sm:text-xl font-bold text-foreground leading-snug">
                {dispute.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {isResolved && (
              <Button
                onClick={() => setAgreementOpen(true)}
                size="sm"
                className="rounded-xl h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs gap-1.5 shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>View Agreement</span>
              </Button>
            )}

            <Button
              onClick={() => setShareOpen(true)}
              variant="outline"
              size="sm"
              className="rounded-xl h-9 border-border/80 text-xs font-medium gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5 text-primary" />
              <span>Invite Party</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Chamber Layout */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col lg:flex-row gap-5 min-h-0">
        {/* Left: Encrypted Group Chat with AI Mediator */}
        <div className="w-full lg:w-[58%] flex flex-col flex-1 min-h-[520px] lg:min-h-0">
          <div className="flex items-center justify-between pb-2 px-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-semibold text-foreground">
                Impartial Mediation Chamber
              </span>
              <span>•</span>
              <span>Encrypted via Alice & Bot</span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Users className="w-3 h-3 text-primary" />
              <span>{participants.length} Disputants + Mediator</span>
            </div>
          </div>

          {credentials && dispute.conversationId ? (
            <AliceChat
              conversationId={dispute.conversationId}
              credentials={credentials}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-card rounded-2xl border border-border/70 text-center space-y-3">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-muted-foreground">
                Initializing encrypted session keys...
              </p>
            </div>
          )}
        </div>

        {/* Right: Official Mediation Record & Live Fact Board */}
        <div className="w-full lg:w-[42%] flex flex-col bg-card rounded-2xl border border-border/70 p-4 sm:p-5 shadow-xs overflow-hidden min-h-[460px]">
          <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
            <div>
              <h2 className="font-serif font-bold text-base text-foreground flex items-center gap-2">
                <span>⚖️ Official Mediation Record</span>
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Objective facts & verified evidentiary record
              </p>
            </div>

            <Badge
              variant="outline"
              className="text-xs font-semibold px-2 py-0.5 rounded-full border-primary/30 text-primary bg-primary/5"
            >
              {facts.length} Agreed {facts.length === 1 ? "Fact" : "Facts"}
            </Badge>
          </div>

          <Tabs defaultValue="facts" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid grid-cols-3 h-9 rounded-xl bg-muted/60 p-1 mb-3">
              <TabsTrigger
                value="facts"
                className="rounded-lg text-xs font-medium data-[state=active]:bg-card data-[state=active]:shadow-2xs"
              >
                Facts ({facts.length})
              </TabsTrigger>
              <TabsTrigger
                value="evidence"
                className="rounded-lg text-xs font-medium data-[state=active]:bg-card data-[state=active]:shadow-2xs"
              >
                Evidence ({evidenceItems.length})
              </TabsTrigger>
              <TabsTrigger
                value="resolution"
                className="rounded-lg text-xs font-medium data-[state=active]:bg-card data-[state=active]:shadow-2xs"
              >
                Resolution
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Agreed Facts */}
            <TabsContent
              value="facts"
              className="flex-1 overflow-y-auto space-y-2.5 pr-1 focus-visible:outline-hidden"
            >
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/15 text-[11px] text-foreground/80 leading-relaxed flex items-start gap-2">
                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>
                  The AI Mediator only records statements both parties confirm in chat, or for which concrete evidence exists.
                </span>
              </div>

              {facts.length === 0 ? (
                <div className="py-12 px-4 text-center space-y-2 text-muted-foreground">
                  <div className="w-10 h-10 rounded-xl bg-muted/60 flex items-center justify-center mx-auto text-primary">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <p className="font-serif font-bold text-sm text-foreground">
                    Discovering Common Ground
                  </p>
                  <p className="text-xs max-w-xs mx-auto leading-relaxed">
                    As both parties discuss and agree on dates, events, or amounts in the chat, the Mediator will add confirmed facts here.
                  </p>
                </div>
              ) : (
                facts.map((fact: any, idx: number) => (
                  <div
                    key={fact.id || idx}
                    className="p-3.5 rounded-xl border border-border/70 bg-card hover:border-primary/40 transition-colors space-y-1.5 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-xs font-medium text-foreground leading-snug">
                          {fact.statement}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground pl-6 pt-1 border-t border-border/40">
                      <Badge
                        variant="secondary"
                        className="text-[9px] px-1.5 py-0 rounded font-normal"
                      >
                        {fact.basis === "mutual_agreement"
                          ? "Mutual Consensus"
                          : "Concrete Evidence"}
                      </Badge>

                      {fact.evidenceDetails && (
                        <span className="truncate max-w-[170px]" title={fact.evidenceDetails}>
                          {fact.evidenceDetails}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            {/* TAB 2: Evidence Locker */}
            <TabsContent
              value="evidence"
              className="flex-1 overflow-y-auto space-y-2.5 pr-1 focus-visible:outline-hidden"
            >
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Submitted documents & verifiable proof
                </span>
                <Button
                  size="sm"
                  onClick={() => setEvidenceOpen(true)}
                  className="h-8 px-2.5 rounded-lg text-xs bg-primary hover:bg-primary/90 text-primary-foreground gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Evidence
                </Button>
              </div>

              {evidenceItems.length === 0 ? (
                <div className="py-12 px-4 text-center space-y-2 text-muted-foreground">
                  <div className="w-10 h-10 rounded-xl bg-muted/60 flex items-center justify-center mx-auto text-primary">
                    <Paperclip className="w-5 h-5" />
                  </div>
                  <p className="font-serif font-bold text-sm text-foreground">
                    Evidence Locker is Empty
                  </p>
                  <p className="text-xs max-w-xs mx-auto leading-relaxed">
                    Upload receipt dates, contract agreements, photos, or bank statements to help substantiate disputed facts.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEvidenceOpen(true)}
                    className="rounded-xl text-xs mt-2"
                  >
                    Submit First Item
                  </Button>
                </div>
              ) : (
                evidenceItems.map((item: any, idx: number) => (
                  <div
                    key={item.id || idx}
                    className="p-3.5 rounded-xl border border-border/70 bg-card space-y-1.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-primary shrink-0" />
                        <h4 className="font-semibold text-xs text-foreground">
                          {item.title}
                        </h4>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        by {item.submittedBy}
                      </span>
                    </div>

                    {item.description && (
                      <p className="text-xs text-muted-foreground pl-6 leading-relaxed">
                        {item.description}
                      </p>
                    )}

                    {item.fileUrl && (
                      <div className="pl-6 pt-1">
                        <a
                          href={item.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-primary hover:underline inline-flex items-center gap-1 font-medium"
                        >
                          View Document <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                ))
              )}
            </TabsContent>

            {/* TAB 3: Resolution & Proposals */}
            <TabsContent
              value="resolution"
              className="flex-1 overflow-y-auto space-y-3 pr-1 focus-visible:outline-hidden"
            >
              {isResolved ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-foreground">
                      Dispute Concluded
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      A mutual accord has been reached and formalized.
                    </p>
                  </div>
                  <Button
                    onClick={() => setAgreementOpen(true)}
                    className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    View & Print Official Agreement
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 text-xs text-muted-foreground space-y-1">
                    <span className="font-semibold text-foreground block">
                      Mediation in Progress
                    </span>
                    <p>
                      Once the AI Mediator finishes gathering facts and exploring both perspectives, it will present structured compromise proposals here.
                    </p>
                  </div>

                  {proposals.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                        Proposed Settlement Options
                      </span>
                      {proposals.map((pr: any, idx: number) => (
                        <div
                          key={pr.id || idx}
                          className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-xs text-primary">
                              {pr.title}
                            </span>
                            <Badge variant="outline" className="text-[9px] uppercase">
                              {pr.status}
                            </Badge>
                          </div>
                          <p className="text-xs whitespace-pre-wrap text-foreground/80 leading-relaxed">
                            {pr.terms}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Dialogs */}
      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        dispute={dispute}
      />
      <SubmitEvidenceDialog
        open={evidenceOpen}
        onOpenChange={setEvidenceOpen}
        disputeId={disputeId}
        submitterName={user?.email?.split("@")[0] || "Participant"}
      />
      <SettlementAgreementModal
        open={agreementOpen}
        onOpenChange={setAgreementOpen}
        dispute={dispute}
        facts={facts}
        participants={participants}
      />
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}
