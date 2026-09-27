"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, CheckCircle2, ShieldCheck, Download } from "lucide-react";

interface SettlementAgreementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dispute: {
    id: string;
    title: string;
    description: string;
    status: string;
    resolutionSummary?: string;
    actionItems?: string[];
    resolvedAt?: number;
    createdAt: number;
    creatorName?: string;
  };
  facts: Array<{ statement: string; basis: string }>;
  participants: Array<{ name: string; role: string }>;
}

export function SettlementAgreementModal({
  open,
  onOpenChange,
  dispute,
  facts,
  participants,
}: SettlementAgreementModalProps) {
  useEffect(() => {
    if (open && dispute.status === "resolved") {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#3E6353", "#74AB93", "#EAE5DC", "#BAAF9E"],
      });
    }
  }, [open, dispute.status]);

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = dispute.resolvedAt
    ? new Date(dispute.resolvedAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl rounded-2xl p-6 sm:p-10 bg-card border-border/80 shadow-2xl max-h-[90vh] overflow-y-auto print:border-none print:shadow-none print:max-h-none print:p-0">
        <DialogHeader className="border-b border-border/60 pb-6 space-y-2 text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 mb-2">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="text-xs uppercase tracking-widest text-primary font-bold">
            Official Mediation Record
          </span>
          <DialogTitle className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
            Memorandum of Understanding & Resolution
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Executed on {formattedDate} via Mediator Impartial Dispute Resolution
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-6 text-sm text-foreground/90 leading-relaxed font-sans">
          {/* Dispute Header */}
          <div className="p-4 rounded-xl bg-muted/40 border border-border/60 space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Matter In Controversy
            </span>
            <p className="font-serif font-bold text-base text-foreground">
              {dispute.title}
            </p>
            <p className="text-xs text-muted-foreground">{dispute.description}</p>
          </div>

          {/* Participating Parties */}
          <div>
            <h4 className="font-serif font-bold text-sm text-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              1. Disputing Parties
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {participants.map((p, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-border/60 bg-card/60 flex items-center justify-between"
                >
                  <span className="font-semibold">{p.name}</span>
                  <span className="text-muted-foreground capitalize font-mono text-[11px]">
                    Role: {p.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Established Agreed Facts */}
          <div>
            <h4 className="font-serif font-bold text-sm text-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              2. Confirmed Factual Foundation
            </h4>
            {facts.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">
                No preliminary facts were formally recorded.
              </p>
            ) : (
              <ul className="space-y-2 text-xs">
                {facts.map((fact, idx) => (
                  <li
                    key={idx}
                    className="p-2.5 rounded-lg bg-muted/30 border border-border/40 flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="text-foreground">{fact.statement}</span>
                      <span className="block text-[10px] text-muted-foreground mt-0.5">
                        Basis:{" "}
                        {fact.basis === "mutual_agreement"
                          ? "Mutual Consensus of Parties"
                          : "Concrete Evidentiary Record"}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Terms of Settlement */}
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
            <h4 className="font-serif font-bold text-base text-primary uppercase tracking-wide">
              3. Agreed Terms of Settlement
            </h4>
            <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed text-foreground/90">
              {dispute.resolutionSummary ||
                "The parties are currently deliberating settlement terms with the AI Mediator."}
            </p>

            {dispute.actionItems && dispute.actionItems.length > 0 && (
              <div className="pt-2 border-t border-primary/10">
                <span className="text-[11px] font-semibold text-primary block mb-1.5 uppercase tracking-wide">
                  Specific Action Items & Commitments:
                </span>
                <ul className="list-disc list-inside space-y-1 text-xs text-foreground/80">
                  {dispute.actionItems.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Mutual Release Clause */}
          <div className="text-[11px] text-muted-foreground border-t border-border/60 pt-4 space-y-1">
            <span className="font-semibold text-foreground/80 block">
              4. Good-Faith Accord:
            </span>
            <p>
              By agreeing to the terms above, both parties confirm that these conditions satisfactorily resolve the disputed issues and commit to executing their respective undertakings in good faith.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60 print:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-2 rounded-xl text-xs font-medium"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save as PDF
            </Button>
            <Button
              size="sm"
              onClick={() => onOpenChange(false)}
              className="rounded-xl text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
