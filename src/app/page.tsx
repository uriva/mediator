"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useQuery } from "@/lib/instant";
import { Navbar } from "@/components/Navbar";
import { CreateDisputeDialog } from "@/components/CreateDisputeDialog";
import { AuthDialog } from "@/components/AuthDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ShieldCheck,
  Scale,
  Sparkles,
  ArrowRight,
  PlusCircle,
  Clock,
  CheckCircle2,
  Users,
  Compass,
  FileCheck2,
  Lock,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");

  // Query disputes
  const { data, isLoading } = useQuery({
    disputes: {
      $: { order: { createdAt: "desc" } },
      participants: {},
      facts: {},
    },
  });

  const disputes = (data?.disputes || []) as any[];

  // Filter for user disputes or show recent
  const myDisputes = user
    ? disputes.filter(
        (d) =>
          d.creatorEmail === user.email ||
          d.participants?.some((p: any) => p.email === user.email)
      )
    : disputes.slice(0, 4);

  const handleJoinWithCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    const cleanCode = joinCode.trim().toUpperCase().replace(/.*\/invite\//, "");
    router.push(`/invite/${cleanCode}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      <Navbar
        onOpenCreate={() => setCreateOpen(true)}
        onOpenAuth={() => setAuthOpen(true)}
      />

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Empowering Peaceful Human Accord Through AI
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-foreground leading-[1.12]">
            Transform conflict into <span className="italic font-normal text-primary">harmony</span> and agreed truth.
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            An impartial, serene AI mediator that brings disputing parties into structured group dialogue, establishes undisputed facts, and guides both sides to a fair, lasting resolution.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Button
              size="lg"
              onClick={() => setCreateOpen(true)}
              className="w-full sm:w-auto h-12 px-7 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm gap-2.5 shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Start a Mediation Session
            </Button>

            <form
              onSubmit={handleJoinWithCode}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <Input
                type="text"
                placeholder="Enter 6-char Invite Code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="w-full sm:w-48 h-12 rounded-2xl border-border/80 text-xs sm:text-sm font-mono uppercase text-center"
              />
              <Button
                type="submit"
                variant="outline"
                className="h-12 px-4 rounded-2xl border-border/80 font-medium text-xs sm:text-sm"
              >
                Join
              </Button>
            </form>
          </div>

          {/* Core assurances */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-primary" />
              100% Impartial AI
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Facts verified by mutual consensus
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-primary" />
              Encrypted group room
            </span>
          </div>
        </div>

        {/* User's Disputes List / Active Sessions */}
        <section className="mt-16 sm:mt-24">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-foreground">
                {user ? "Your Mediation Sessions" : "Active Mediation Rooms"}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {user
                  ? "Track ongoing deliberations and signed resolution agreements."
                  : "Explore active rooms or sign in to track your personal disputes."}
              </p>
            </div>
            {disputes.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCreateOpen(true)}
                className="gap-1.5 text-xs text-primary font-medium"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                New Dispute
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-44 rounded-2xl bg-card/60 border border-border/60 p-6 animate-pulse space-y-3"
                >
                  <div className="w-24 h-4 bg-muted rounded-md" />
                  <div className="w-3/4 h-6 bg-muted rounded-md" />
                  <div className="w-full h-12 bg-muted/60 rounded-md" />
                </div>
              ))}
            </div>
          ) : myDisputes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-10 sm:p-14 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 mx-auto flex items-center justify-center text-primary">
                <Scale className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="font-serif font-bold text-lg text-foreground">
                  No active disputes recorded yet
                </h3>
                <p className="text-xs text-muted-foreground">
                  Ready to resolve a conflict? Start by creating a private mediation room.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setCreateOpen(true)}
                className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium gap-2"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Create First Dispute
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                    className="group block p-6 rounded-2xl bg-card border border-border/70 hover:border-primary/50 shadow-2xs hover:shadow-md transition-all relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <Badge
                        variant="outline"
                        className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${
                          isResolved
                            ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
                            : dispute.status === "in_mediation"
                            ? "bg-primary/10 text-primary border-primary/30"
                            : "bg-muted text-muted-foreground border-border"
                        }`}
                      >
                        {isResolved
                          ? "Resolved"
                          : dispute.status === "in_mediation"
                          ? "In Mediation"
                          : "Intake"}
                      </Badge>

                      <span className="text-[11px] text-muted-foreground capitalize">
                        {dispute.category || "General"}
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {dispute.title}
                    </h3>

                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5 leading-relaxed">
                      {dispute.description}
                    </p>

                    <div className="flex items-center justify-between pt-5 mt-5 border-t border-border/60 text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 font-medium text-foreground/80">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                          {agreedFactsCount} facts
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {participantCount} parties
                        </span>
                      </div>

                      <span className="text-primary font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        Enter <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* 3 Pillars Section */}
        <section className="mt-20 sm:mt-28 border-t border-border/60 pt-16 sm:pt-20">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
            <span className="text-xs uppercase font-bold tracking-widest text-primary">
              The Mediation Methodology
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
              How Serene Mediation Works
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Built on proven dispute resolution frameworks to de-escalate tension and isolate truth from friction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-7 rounded-2xl bg-card/60 border border-border/70 space-y-3 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                1
              </div>
              <h3 className="font-serif font-bold text-lg text-foreground">
                Impartial Group Dialogue
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Both parties join an encrypted group conversation alongside the AI Mediator. No back-channel manipulation or favoritism—every voice is heard with equal dignity.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-card/60 border border-border/70 space-y-3 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                2
              </div>
              <h3 className="font-serif font-bold text-lg text-foreground">
                Grounded in Agreed Facts
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The agent exercises strict judgment: it only records facts that both sides explicitly confirm, or that are supported by concrete receipts, contracts, and evidence.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-card/60 border border-border/70 space-y-3 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                3
              </div>
              <h3 className="font-serif font-bold text-lg text-foreground">
                Peaceful Accord & Settlement
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Once mutual facts and core interests are mapped, the mediator synthesizes fair compromises, presents structured settlement proposals, and seals the final agreement.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 py-8 px-4 sm:px-6 lg:px-8 bg-muted/20 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-base">⚖️</span>
            <span className="font-serif font-bold text-foreground">Mediator</span>
            <span>—</span>
            <span>Promoting peace and clarity in everyday disputes</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Powered by prompt2bot & Alice & Bot</span>
            <span>•</span>
            <span>InstantDB Realtime</span>
          </div>
        </div>
      </footer>

      {/* Dialogs */}
      <CreateDisputeDialog open={createOpen} onOpenChange={setCreateOpen} />
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}
