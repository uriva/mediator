// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/react";

const rules = {
  $users: {
    allow: {
      view: "true",
      create: "false",
      delete: "false",
      update: "auth.id == data.id",
    },
  },
  disputes: {
    allow: {
      view: "true",
      create: "true",
      update: "true",
      delete: "false",
    },
  },
  disputeParticipants: {
    allow: {
      view: "true",
      create: "true",
      update: "true",
      delete: "false",
    },
  },
  facts: {
    allow: {
      view: "true",
      create: "true",
      update: "true",
      delete: "true",
    },
  },
  evidence: {
    allow: {
      view: "true",
      create: "true",
      update: "true",
      delete: "true",
    },
  },
  proposals: {
    allow: {
      view: "true",
      create: "true",
      update: "true",
      delete: "true",
    },
  },
} satisfies InstantRules;

export default rules;
