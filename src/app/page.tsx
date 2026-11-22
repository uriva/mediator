"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useQuery } from "@/lib/instant";
import { getLocalDisputeIds } from "@/lib/dispute-storage";
import { Navbar } from "@/components/Navbar";
import { CreateDisputeDialog } from "@/components/CreateDisputeDialog";
import { AuthDialog } from "@/components/AuthDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpRight, Plus } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [localDisputeIds, setLocalDisputeIds] = useState<string[]>([]);
  const [isLocalLoaded, setIsLocalLoaded] = useState(false);

  useEffect(() => {
    setLocalDisputeIds(getLocalDisputeIds());
    setIsLocalLoaded(true);
  }, []);

  const { data, isLoading } = useQuery({
    disputes: {
      $: { order: { createdAt: "desc" } },
      participants: {},
      facts: {},
    },
  });

  const disputes = (data?.disputes || []) as any[];

  // Only show mediations the current user created or joined
  const myDisputes = disputes.filter((d) => {
    if (
      user?.email &&
      (d.creatorEmail === user.email ||
        d.participants?.some((p: any) => p.email === user.email))
    ) {
      return true;
    }
    return localDisputeIds.includes(d.id);
  });

  const isWaiting = isLoading || !isLocalLoaded;

  const handleJoinWithCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    const cleanCode = joinCode.trim().toUpperCase().replace(/.*\/invite\//, "");
    router.push(`/invite/${cleanCode}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50">
      <Navbar
        onOpenCreate={() => setCreateOpen(true)}
        onOpenAuth={() => setAuthOpen(true)}
      />

      <main className="mx-auto w-full max-w-xl flex-1 space-y-10 px-6 py-12 sm:py-16">
        {/* Hero */}
        <section className="space-y-5">
          <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
            Talk it out. Settle it fair.
          </h1>
          <p className="max-w-md text-sm text-neutral-500 dark:text-neutral-400 sm:text-base">
            An impartial AI mediator puts both sides in one room, pins down the
            facts you actually agree on, and helps you land a settlement.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <Button
              onClick={() => setCreateOpen(true)}
              className="h-11 gap-2 rounded-full bg-neutral-900 px-5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              <span>Start a mediation</span>
              <ArrowUpRight className="h-4 w-4" />
            </Button>

            <form
              onSubmit={handleJoinWithCode}
              className="flex items-center gap-2"
            >
              <Input
                type="text"
                placeholder="Invite code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="h-11 w-32 rounded-full border-neutral-200 bg-white text-center font-mono text-xs uppercase placeholder:normal-case placeholder:font-sans dark:border-neutral-800 dark:bg-neutral-950"
              />
              <Button
                type="submit"
                variant="ghost"
                className="h-11 rounded-full px-3 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
              >
                Join
              </Button>
            </form>
          </div>
        </section>

        {/* Sessions */}
        <section className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold">Your sessions</h2>
            <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-400">
              private
            </span>
          </div>

          {isWaiting ? (
            <div className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse border-b border-neutral-100 bg-neutral-50/60 p-5 last:border-b-0 dark:border-neutral-900 dark:bg-neutral-900/40"
                />
              ))}
            </div>
          ) : myDisputes.length === 0 ? (
            <div className="space-y-3 rounded-2xl border border-dashed border-neutral-200 p-8 text-center dark:border-neutral-800">
              <p className="text-sm font-medium">No sessions yet</p>
              <p className="mx-auto max-w-xs text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                Create a private room and invite the other side, or join one with
                an invite code.
              </p>
              <Button
                onClick={() => setCreateOpen(true)}
                className="h-9 gap-1.5 rounded-full bg-neutral-900 px-4 text-xs font-medium text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                <Plus className="h-3.5 w-3.5" />
                Create first session
              </Button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800">
              {myDisputes.map((dispute: any) => {
                const agreedFactsCount = (dispute.facts || []).filter(
                  (f: any) => f.status === "agreed"
                ).length;
                const participantCount = (dispute.participants || []).length;
                const isResolved = dispute.status === "resolved";

                return (
                  <Link
                    key={dispute.id}
                    href={`/dispute/${dispute.id}`}
                    className="group block border-b border-neutral-100 p-5 transition-colors last:border-b-0 hover:bg-neutral-50/70 dark:border-neutral-900 dark:hover:bg-neutral-900/40"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold tracking-tight">
                        {dispute.title}
                      </span>
                      <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                        {isResolved
                          ? "settled"
                          : dispute.status === "in_mediation"
                          ? "in mediation"
                          : "intake"}
                      </span>
                    </div>

                    {dispute.description && (
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                        {dispute.description}
                      </p>
                    )}

                    <div className="mt-2 flex items-center gap-3 font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                      <span>{agreedFactsCount} agreed facts</span>
                      <span>·</span>
                      <span>{participantCount} parties</span>
                      <span>·</span>
                      <span className="capitalize">
                        {dispute.category || "general"}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* How it works */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold">How it works</h2>

          <div className="divide-y divide-neutral-100 overflow-hidden rounded-2xl border border-neutral-200 dark:divide-neutral-900 dark:border-neutral-800">
            {[
              {
                n: "01",
                title: "One room, both sides",
                body: "Both parties join the same encrypted conversation with the AI mediator. No side channels, no favouritism.",
              },
              {
                n: "02",
                title: "Only agreed facts",
                body: "The mediator records a fact only when both sides confirm it, or when there's a receipt to back it up.",
              },
              {
                n: "03",
                title: "A settlement you can sign",
                body: "Once the facts and interests are mapped, it proposes fair options and seals the final agreement.",
              },
            ].map((step) => (
              <div key={step.n} className="flex gap-4 p-5">
                <span className="font-mono text-[11px] text-neutral-400">
                  {step.n}
                </span>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="mx-auto flex w-full max-w-xl flex-wrap items-center justify-between gap-3 px-6 pb-8 text-xs text-neutral-400">
        <span>Private rooms · invite only · no accounts needed</span>
        <span className="font-mono text-[11px]">mediator.uriv.me</span>
      </footer>

      <CreateDisputeDialog open={createOpen} onOpenChange={setCreateOpen} />
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}
