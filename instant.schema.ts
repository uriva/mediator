import { i } from "@instantdb/react";

const _schema = i.schema({
  entities: {
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
      name: i.string().optional(),
      avatar: i.string().optional(),
      aliceAndBotPublicSignKey: i.string().indexed().optional(),
      aliceAndBotPrivateSignKey: i.string().optional(),
      aliceAndBotPrivateEncryptKey: i.string().optional(),
      createdAt: i.number().indexed().optional(),
      lastSeen: i.number().optional(),
    }),
    disputes: i.entity({
      title: i.string().indexed(),
      description: i.string(),
      category: i.string().indexed().optional(),
      status: i.string().indexed(),
      conversationId: i.string().indexed().optional(),
      inviteCode: i.string().unique().indexed().optional(),
      creatorEmail: i.string().indexed().optional(),
      creatorName: i.string().optional(),
      resolutionSummary: i.string().optional(),
      actionItems: i.json().optional(),
      createdAt: i.number().indexed(),
      updatedAt: i.number().indexed().optional(),
      resolvedAt: i.number().indexed().optional(),
      closedAt: i.number().optional(),
    }),
    disputeParticipants: i.entity({
      disputeId: i.string().indexed(),
      userId: i.string().indexed().optional(),
      email: i.string().indexed().optional(),
      name: i.string(),
      role: i.string().indexed(),
      publicSignKey: i.string().indexed().optional(),
      joinedAt: i.number().indexed(),
    }),
    facts: i.entity({
      disputeId: i.string().indexed(),
      statement: i.string(),
      basis: i.string().indexed(),
      evidenceDetails: i.string().optional(),
      status: i.string().indexed(),
      addedBy: i.string().optional(),
      createdAt: i.number().indexed(),
      updatedAt: i.number().optional(),
    }),
    evidence: i.entity({
      disputeId: i.string().indexed(),
      title: i.string(),
      description: i.string().optional(),
      fileUrl: i.string().optional(),
      submittedBy: i.string(),
      submittedAt: i.number().indexed(),
    }),
    proposals: i.entity({
      disputeId: i.string().indexed(),
      title: i.string(),
      terms: i.string(),
      status: i.string().indexed(),
      proposedBy: i.string(),
      acceptedBy: i.json().optional(),
      createdAt: i.number().indexed(),
    }),
  },
  links: {
    disputeParticipantLink: {
      forward: { on: "disputeParticipants", has: "one", label: "dispute" },
      reverse: { on: "disputes", has: "many", label: "participants" },
    },
    disputeFactLink: {
      forward: { on: "facts", has: "one", label: "dispute" },
      reverse: { on: "disputes", has: "many", label: "facts" },
    },
    disputeEvidenceLink: {
      forward: { on: "evidence", has: "one", label: "dispute" },
      reverse: { on: "disputes", has: "many", label: "evidenceItems" },
    },
    disputeProposalLink: {
      forward: { on: "proposals", has: "one", label: "dispute" },
      reverse: { on: "disputes", has: "many", label: "proposals" },
    },
  },
});

type _AppSchema = typeof _schema;
export interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export default schema;
