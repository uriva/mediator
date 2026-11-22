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
      emptyMessage: "Say your piece — the mediator is listening.",
      customColors: {
        primary: isDark ? "#fafafa" : "#0a0a0a",
        background: isDark ? "#0a0a0a" : "#ffffff",
        text: isDark ? "#fafafa" : "#0a0a0a",
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
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center text-sm dark:border-neutral-800 dark:bg-neutral-950">
        <p className="font-medium">Couldn’t open the room.</p>
        <p className="mt-1 text-xs text-neutral-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-[460px] w-full flex-1 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      {!ready && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/90 text-neutral-400 backdrop-blur-xs dark:bg-neutral-950/90">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent dark:border-neutral-100" />
          <span className="font-mono text-[10px] uppercase tracking-wider">
            connecting
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
