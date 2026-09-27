"use client";

const STORAGE_KEY = "mediator_my_dispute_ids";

export function getLocalDisputeIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalDisputeId(disputeId: string) {
  if (typeof window === "undefined" || !disputeId) return;
  try {
    const existing = getLocalDisputeIds();
    if (!existing.includes(disputeId)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, disputeId]));
    }
  } catch (err) {
    console.error("Failed to save local dispute ID:", err);
  }
}
