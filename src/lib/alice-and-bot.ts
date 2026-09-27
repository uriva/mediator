"use client";

import {
  aliasToPublicSignKey,
  createConversation,
  createIdentity,
  type Credentials,
  getConversations,
} from "@alice-and-bot/core";

export type { Credentials };

export const MEDIATOR_BOT_ALIAS = "mediator";

export const MEDIATOR_BOT_KEY =
  "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvy8a75EkU9PGaNKiGMWne1dLvXNW7uoVFMt+eP9W6blumZVZGTTJCla80dpUUC/THNv68eQ45PbofiBXN10/Cl8cZ2IgiNcA3GdHk5eMzDOgAXgLrm8mAr9h9raoFpIHbNLk3W86FTyGYwhTDNC1KNO4aTwoywlaMNA97N3ZAfmEYXX4P/vecINVyhDwjZFqGw0pQdJ3W9ehNgXcn46rr/kVx5ku1dZfazh1SqCmr9zkZAj6crL0Zi2AViaBCgyPvnPvKxQQ0vh4h3wahGMXQB4cvwGe4IIJeJcR1rKxUaJA4rGytoxhI6hRZMJH7q3k8kxfaBM/bYzjS52KUj6EIwIDAQAB";

const STORAGE_KEY = "mediator_alice_credentials";

export const loadLocalCredentials = (): Credentials | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const storeLocalCredentials = (credentials: Credentials) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials));
  } catch (err) {
    console.error("Failed to store credentials in localStorage:", err);
  }
};

export const ensureAliceIdentity = async (
  identifier: string = "party-" + Math.random().toString(36).substring(2, 7)
): Promise<Credentials> => {
  const existing = loadLocalCredentials();
  if (existing) return existing;

  const created = await createIdentity(identifier);
  storeLocalCredentials(created);
  return created;
};

export const createDisputeConversation = async ({
  title,
  participantKeys,
  credentials,
}: {
  title: string;
  participantKeys: string[];
  credentials: Credentials;
}): Promise<{ conversationId: string } | { error: string }> => {
  // Always include the Mediator bot
  const allParticipants = Array.from(
    new Set([...participantKeys, MEDIATOR_BOT_KEY])
  );

  // Check if conversation already exists for this exact set
  try {
    const existing = await getConversations(allParticipants);
    if (Array.isArray(existing) && existing.length > 0) {
      return { conversationId: existing[0].id };
    }
  } catch {
    // proceed to create
  }

  const result = await createConversation(
    allParticipants,
    `Mediation: ${title}`,
    credentials
  );

  if ("conversationId" in result) {
    return { conversationId: result.conversationId };
  }

  // Fallback check
  try {
    const fallback = await getConversations(allParticipants);
    if (Array.isArray(fallback) && fallback.length > 0) {
      return { conversationId: fallback[0].id };
    }
  } catch {
    // return original error
  }

  return { error: ("error" in result && result.error) || "Failed to create conversation" };
};
