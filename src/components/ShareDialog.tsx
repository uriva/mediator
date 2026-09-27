"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Copy, Check, Share2, MessageSquare, Mail, Send } from "lucide-react";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dispute: {
    id: string;
    title: string;
    inviteCode?: string;
  };
}

export function ShareDialog({ open, onOpenChange, dispute }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);

  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://mediator.deno.dev";

  const inviteUrl = dispute.inviteCode
    ? `${origin}/invite/${dispute.inviteCode}`
    : `${origin}/dispute/${dispute.id}`;

  const shareText = `You are invited to a neutral, structured mediation session on Mediator regarding: "${dispute.title}". Join the room to establish agreed facts and reach a peaceful resolution.`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast.success("Invitation link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Mediation: ${dispute.title}`,
          text: shareText,
          url: inviteUrl,
        });
      } catch {
        // user cancelled
      }
    } else {
      handleCopy();
    }
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `${shareText}\n\nJoin here: ${inviteUrl}`
  )}`;

  const mailtoUrl = `mailto:?subject=${encodeURIComponent(
    `Mediation Invitation: ${dispute.title}`
  )}&body=${encodeURIComponent(
    `Hello,\n\nYou have been invited to participate in an impartial, AI-assisted mediation session regarding "${dispute.title}".\n\nThe purpose is to calmly establish agreed facts, review any relevant evidence, and reach a fair agreement together.\n\nYou can join the private room here:\n${inviteUrl}\n\nBest regards.`
  )}`;

  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(
    inviteUrl
  )}&text=${encodeURIComponent(shareText)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl p-6 sm:p-8 bg-card border-border/70 shadow-xl">
        <DialogHeader className="space-y-1.5 text-center items-center">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-1">
            <Share2 className="w-6 h-6" />
          </div>
          <DialogTitle className="font-serif text-2xl font-bold text-foreground">
            Invite Participant
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground max-w-xs mx-auto">
            Share this private link with the other party to invite them into this mediation room.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Link Copy Box */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/80 tracking-wide">
              Invitation Link
            </label>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={inviteUrl}
                className="rounded-xl h-11 border-border/80 text-xs sm:text-sm bg-muted/40 font-mono"
              />
              <Button
                onClick={handleCopy}
                className="h-11 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 shrink-0"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span className="text-xs font-medium">Copy</span>
              </Button>
            </div>
          </div>

          {/* Social Quick Share Buttons */}
          <div className="pt-2">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              Quick Share Via
            </span>
            <div className="grid grid-cols-3 gap-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 h-10 rounded-xl border border-border/70 hover:bg-secondary/60 text-xs font-medium text-foreground transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                WhatsApp
              </a>
              <a
                href={mailtoUrl}
                className="flex items-center justify-center gap-2 h-10 rounded-xl border border-border/70 hover:bg-secondary/60 text-xs font-medium text-foreground transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-sky-600" />
                Email
              </a>
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 h-10 rounded-xl border border-border/70 hover:bg-secondary/60 text-xs font-medium text-foreground transition-colors"
              >
                <Send className="w-3.5 h-3.5 text-blue-500" />
                Telegram
              </a>
            </div>
          </div>

          {/* Native Share button if mobile */}
          {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
            <Button
              variant="outline"
              onClick={handleNativeShare}
              className="w-full h-10 rounded-xl border-border/80 text-xs font-medium gap-2"
            >
              <Share2 className="w-3.5 h-3.5" />
              More Share Options
            </Button>
          )}

          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/50 text-[11px] text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">Serene Mediation Guarantee:</span> When the invitee opens this link, they will see an impartial overview and can join the chat immediately without complicated setup.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
