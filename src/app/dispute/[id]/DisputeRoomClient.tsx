"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useAuth, useQuery, transact, tx } from "@/lib/instant";
import {
  ensureAliceIdentity,
  type Credentials,
  loadLocalCredentials,
  createDisputeConversation,
} from "@/lib/alice-and-bot";
import { saveLocalDisputeId } from "@/lib/dispute-storage";
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

export default function DisputeRoomClient({ disputeId: rawDisputeId }: DisputeRoomClientProps) {
  const disputeId =
    typeof window !== "undefined" && rawDisputeId === "_"
      ? window.location.pathname.split("/").filter(Boolean).pop() || rawDisputeId
      : rawDisputeId;
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

  // Save dispute ID to private local storage
  useEffect(() => {
    if (disputeId) {
      saveLocalDisputeId(disputeId);
    }
  }, [disputeId]);

  // Initialize Alice & Bot credentials
  useEffect(() => {
    if (!credentials) {
      const defaultName =
        user?.email?.split("@")[0] ||
        "party-" + Math.random().toString(36).substring(2, 6);
      ensureAliceIdentity(defaultName).then((c) => setCredentials(c));
    }
  }, [credentials, user]);

  const isAllPartiesJoined = (dispute?.participants || []).length >= 2;

  // Auto-provision or recover multi-party conversation once all parties join
  useEffect(() => {
    if (
      isAllPartiesJoined &&
      credentials &&
      dispute &&
      !dispute.conversationId
    ) {
      const allKeys = (dispute.participants || [])
        .map((p: any) => p.publicSignKey)
        .filter(Boolean);
      const combined = Array.from(
        new Set([...allKeys, credentials.publicSignKey])
      );

      createDisputeConversation({
        title: dispute.title,
        participantKeys: combined,
        credentials,
      })
        .then((res) => {
          if ("conversationId" in res && res.conversationId) {
            transact([
              tx.disputes[dispute.id].update({
                conversationId: res.conversationId,
                status: "in_mediation",
                updatedAt: Date.now(),
              }),
            ]);
          }
        })
        .catch(console.error);
    }
  }, [isAllPartiesJoined, credentials, dispute?.conversationId]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-white dark:bg-neutral-950">
        <Navbar onOpenAuth={() => setAuthOpen(true)} />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent dark:border-neutral-100" />
          <div className="space-y-1 text-center">
            <h3 className="text-sm font-semibold">Opening the room…</h3>
            <p className="font-mono text-[11px] uppercase tracking-wider text-neutral-400">
              loading the record
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!dispute) {
    return (
      <div className="flex min-h-screen flex-col bg-white dark:bg-neutral-950">
        <Navbar onOpenAuth={() => setAuthOpen(true)} />
        <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-400 dark:border-neutral-800">
            <Scale className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold tracking-tight">
            Session not found
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            This mediation may have moved, or the link is wrong.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-neutral-200 px-4 py-2 text-xs font-medium transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
          >
            Back home
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

  const statusLabel = isResolved
    ? "settled"
    : dispute.status === "in_mediation"
    ? "in mediation"
    : "intake";

  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50">
      <Navbar onOpenAuth={() => setAuthOpen(true)} />

      {/* Header */}
      <div className="border-b border-neutral-100 dark:border-neutral-900">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-4 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3 sm:items-center">
            <Link
              href="/"
              className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-400 transition-colors hover:text-neutral-900 dark:border-neutral-800 dark:hover:text-neutral-100"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] uppercase tracking-wider text-neutral-400">
                <span>{statusLabel}</span>
                <span className="text-neutral-300 dark:text-neutral-700">/</span>
                <span className="capitalize">
                  {dispute.category || "general"}
                </span>
              </div>
              <h1 className="mt-0.5 truncate text-base font-semibold tracking-tight sm:text-lg">
                {dispute.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isResolved && (
              <Button
                onClick={() => setAgreementOpen(true)}
                size="sm"
                className="h-9 gap-1.5 rounded-full bg-neutral-900 px-4 text-xs font-medium text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Agreement</span>
              </Button>
            )}

            <Button
              onClick={() => setShareOpen(true)}
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 rounded-full border-neutral-200 px-4 text-xs font-medium dark:border-neutral-800"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Invite</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Room + record */}
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 px-5 py-5 sm:px-6 lg:flex-row">
        {/* Chat */}
        <div className="flex min-h-[520px] w-full flex-col lg:w-[58%]">
          <div className="flex items-center justify-between px-1 pb-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-neutral-900 dark:bg-neutral-100" />
              <span className="font-medium">Mediation room</span>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
              {participants.length} parties + mediator
            </span>
          </div>

          {!isAllPartiesJoined ? (
            <div className="flex min-h-[460px] flex-1 flex-col items-center justify-center gap-6 rounded-2xl border border-neutral-200 p-6 text-center dark:border-neutral-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-neutral-200 text-lg dark:border-neutral-800">
                ⚖
              </div>

              <div className="max-w-sm space-y-1.5">
                <h3 className="text-base font-semibold tracking-tight">
                  The room opens when both sides join
                </h3>
                <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                  To stay neutral, the mediator doesn&apos;t start the
                  conversation until both parties are present.
                </p>
              </div>

              <div className="w-full max-w-sm space-y-2 rounded-xl border border-neutral-200 p-3.5 text-left dark:border-neutral-800">
                <span className="block font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                  in the room
                </span>
                {participants.map((p: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="font-medium">{p.name}</span>
                    <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                      <CheckCircle2 className="h-3 w-3" /> present
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t border-dashed border-neutral-200 pt-2 text-xs text-neutral-400 dark:border-neutral-800">
                  <span>the other side</span>
                  <span className="font-mono text-[10px] uppercase tracking-wider">
                    pending
                  </span>
                </div>
              </div>

              <div className="w-full max-w-sm space-y-2">
                <Button
                  onClick={() => setShareOpen(true)}
                  className="h-11 w-full gap-2 rounded-full bg-neutral-900 text-xs font-medium text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
                >
                  <Share2 className="h-4 w-4" />
                  Invite the other side
                </Button>
                <p className="text-[11px] text-neutral-400">
                  The chat unlocks the second they open the link.
                </p>
              </div>
            </div>
          ) : credentials && dispute.conversationId ? (
            <AliceChat
              conversationId={dispute.conversationId}
              credentials={credentials}
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-neutral-200 p-8 text-center dark:border-neutral-800">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent dark:border-neutral-100" />
              <p className="text-xs text-neutral-400">Starting the room…</p>
            </div>
          )}
        </div>

        {/* Record */}
        <div className="flex min-h-[460px] w-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 dark:border-neutral-800 dark:bg-neutral-950 lg:w-[42%]">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold">The record</h2>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                facts · evidence · resolution
              </p>
            </div>
            <span className="shrink-0 font-mono text-[10px] text-neutral-400">
              {facts.length} agreed
            </span>
          </div>

          <Tabs
            defaultValue="facts"
            className="flex flex-1 flex-col overflow-hidden"
          >
            <TabsList className="mb-3 grid h-9 grid-cols-3 gap-1 rounded-full bg-neutral-100 p-1 dark:bg-neutral-900">
              <TabsTrigger
                value="facts"
                className="rounded-full text-[11px] font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-neutral-800"
              >
                Facts
              </TabsTrigger>
              <TabsTrigger
                value="evidence"
                className="rounded-full text-[11px] font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-neutral-800"
              >
                Evidence
              </TabsTrigger>
              <TabsTrigger
                value="resolution"
                className="rounded-full text-[11px] font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-neutral-800"
              >
                Resolution
              </TabsTrigger>
            </TabsList>

            {/* Facts */}
            <TabsContent
              value="facts"
              className="flex-1 space-y-2.5 overflow-y-auto pr-1 focus-visible:outline-hidden"
            >
              <div className="flex items-start gap-2 rounded-xl bg-neutral-50 p-3 text-[11px] leading-relaxed text-neutral-500 dark:bg-neutral-900/60 dark:text-neutral-400">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  Only facts both sides confirm, or facts backed by evidence,
                  end up here.
                </span>
              </div>

              {facts.length === 0 ? (
                <div className="space-y-2 px-4 py-10 text-center">
                  <CheckCircle2 className="mx-auto h-5 w-5 text-neutral-400" />
                  <p className="text-sm font-medium">Finding common ground</p>
                  <p className="mx-auto max-w-xs text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                    As both sides agree on dates, events or amounts in the chat,
                    confirmed facts land here.
                  </p>
                </div>
              ) : (
                facts.map((fact: any, idx: number) => (
                  <div
                    key={fact.id || idx}
                    className="space-y-1.5 rounded-xl border border-neutral-200 p-3.5 dark:border-neutral-800"
                  >
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-400" />
                      <span className="text-xs font-medium leading-snug">
                        {fact.statement}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 border-t border-neutral-100 pt-1.5 font-mono text-[10px] uppercase tracking-wider text-neutral-400 dark:border-neutral-900">
                      <span>
                        {fact.basis === "mutual_agreement"
                          ? "mutual agreement"
                          : "concrete evidence"}
                      </span>
                      {fact.evidenceDetails && (
                        <span
                          className="max-w-[170px] truncate"
                          title={fact.evidenceDetails}
                        >
                          {fact.evidenceDetails}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            {/* Evidence */}
            <TabsContent
              value="evidence"
              className="flex-1 space-y-2.5 overflow-y-auto pr-1 focus-visible:outline-hidden"
            >
              <div className="flex items-center justify-between pb-1">
                <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                  documents & proof
                </span>
                <Button
                  size="sm"
                  onClick={() => setEvidenceOpen(true)}
                  className="h-8 gap-1 rounded-full bg-neutral-900 px-3.5 text-xs font-medium text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </Button>
              </div>

              {evidenceItems.length === 0 ? (
                <div className="space-y-3 px-4 py-10 text-center">
                  <Paperclip className="mx-auto h-5 w-5 text-neutral-400" />
                  <p className="text-sm font-medium">Nothing filed yet</p>
                  <p className="mx-auto max-w-xs text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                    Drop in receipts, contracts, photos or statements to back up
                    a disputed fact.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEvidenceOpen(true)}
                    className="mt-1 rounded-full border-neutral-200 text-xs font-medium dark:border-neutral-800"
                  >
                    Submit first item
                  </Button>
                </div>
              ) : (
                evidenceItems.map((item: any, idx: number) => (
                  <div
                    key={item.id || idx}
                    className="space-y-1.5 rounded-xl border border-neutral-200 p-3.5 dark:border-neutral-800"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Paperclip className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                        <h4 className="text-xs font-semibold">{item.title}</h4>
                      </div>
                      <span className="font-mono text-[10px] text-neutral-400">
                        {item.submittedBy}
                      </span>
                    </div>

                    {item.description && (
                      <p className="pl-5.5 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                        {item.description}
                      </p>
                    )}

                    {item.fileUrl && (
                      <div className="pl-5.5 pt-0.5">
                        <a
                          href={item.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-medium underline underline-offset-4"
                        >
                          Open document <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>
                ))
              )}
            </TabsContent>

            {/* Resolution */}
            <TabsContent
              value="resolution"
              className="flex-1 space-y-3 overflow-y-auto pr-1 focus-visible:outline-hidden"
            >
              {isResolved ? (
                <div className="space-y-3 rounded-xl border border-neutral-200 p-4 text-center dark:border-neutral-800">
                  <CheckCircle2 className="mx-auto h-5 w-5 text-neutral-400" />
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold">Settled</h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Both sides reached and signed an agreement.
                    </p>
                  </div>
                  <Button
                    onClick={() => setAgreementOpen(true)}
                    className="w-full gap-1.5 rounded-full bg-neutral-900 text-xs font-medium text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    View &amp; print agreement
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1 rounded-xl bg-neutral-50 p-3.5 text-xs leading-relaxed dark:bg-neutral-900/60">
                    <span className="block font-medium">Mediation in progress</span>
                    <p className="text-neutral-500 dark:text-neutral-400">
                      Once the mediator has the facts and both perspectives, it
                      proposes settlement options right here.
                    </p>
                  </div>

                  {proposals.length > 0 && (
                    <div className="space-y-2">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                        proposed options
                      </span>
                      {proposals.map((pr: any, idx: number) => (
                        <div
                          key={pr.id || idx}
                          className="space-y-1.5 rounded-xl border border-neutral-200 p-3.5 dark:border-neutral-800"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold">
                              {pr.title}
                            </span>
                            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                              {pr.status}
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
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
