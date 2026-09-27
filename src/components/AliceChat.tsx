"use client";

import { useEffect, useRef, useState } from "react";
import type { Credentials } from "@/lib/alice-and-bot";

interface AliceChatProps {
  conversationId: string;
  credentials: Credentials;
  isDark?: boolean;
}

export default function AliceChat({
  conversationId,
  credentials,
  isDark = false,
}: AliceChatProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chatElementRef = useRef<HTMLElement | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    import("@alice-and-bot/core/components")
      .then(() => {
        if (mounted) setReady(true);
      })
      .catch((err) => {
        console.error("Failed to load Alice & Bot components:", err);
        if (mounted) setError(err?.message || "Failed to load chat interface");
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!ready || !containerRef.current || !conversationId || !credentials) {
      return;
    }

    if (!chatElementRef.current) {
      const el = document.createElement("alice-connected-chat");
      chatElementRef.current = el;
      containerRef.current.appendChild(el);
    }

    Object.assign(chatElementRef.current, {
      conversationId,
      credentials,
      darkModeOverride: isDark,
      customColors: {
        primary: isDark ? "#74ab93" : "#3e6353",
        background: isDark ? "#1c2420" : "#ffffff",
        text: isDark ? "#ece9e2" : "#222926",
        hideTitle: true,
        chatMaxWidth: "100%",
        inputMaxWidth: "100%",
      },
    });

    return () => {
      if (chatElementRef.current) {
        chatElementRef.current.remove();
        chatElementRef.current = null;
      }
    };
  }, [ready, conversationId, credentials?.publicSignKey, isDark]);

  if (error) {
    return (
      <div className="p-8 text-center text-sm text-destructive bg-destructive/10 rounded-2xl border border-destructive/20">
        <p className="font-medium">Could not load the secure mediation chat.</p>
        <p className="text-xs text-muted-foreground mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col flex-1 min-h-[460px] rounded-2xl overflow-hidden bg-card border border-border/70 shadow-xs">
      {!ready && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-card/80 backdrop-blur-xs text-muted-foreground z-10">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium tracking-wide">
            Connecting to encrypted mediation room...
          </span>
        </div>
      )}
      <div
        ref={containerRef}
        className="w-full h-full flex-1 flex flex-col overflow-hidden"
      />
    </div>
  );
}
