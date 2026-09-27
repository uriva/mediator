export type RemoteTool = {
  name: string;
  description: string;
  url: string;
  parameters: Record<string, unknown>;
};

export const TOOL_NAMES = {
  REMOTE_CONFIG: "remote_config",
  RECORD_AGREED_FACT: "record_agreed_fact",
  UPDATE_FACT: "update_fact",
  REMOVE_FACT: "remove_fact",
  PROPOSE_RESOLUTION: "propose_resolution",
  MARK_DISPUTE_RESOLVED: "mark_dispute_resolved",
} as const;

export const getMediatorTools = (baseUrl: string): RemoteTool[] => [
  {
    name: TOOL_NAMES.REMOTE_CONFIG,
    description:
      "Internal infrastructure hook called on every message to supply dynamic dispute context, agreed facts, and mediation instructions.",
    url: `${baseUrl}/api/ai_tools/${TOOL_NAMES.REMOTE_CONFIG}`,
    parameters: {
      type: "object",
      properties: {},
    },
  },
  {
    name: TOOL_NAMES.RECORD_AGREED_FACT,
    description:
      "Records an established fact onto the official dispute record. Use ONLY when BOTH parties explicitly confirm and agree on the statement in chat, OR when concrete evidence (receipts, contract, photo, document) has been presented. Do NOT record disputed assertions as facts.",
    url: `${baseUrl}/api/ai_tools/${TOOL_NAMES.RECORD_AGREED_FACT}`,
    parameters: {
      type: "object",
      properties: {
        disputeId: {
          type: "string",
          description: "The unique ID of the dispute.",
        },
        statement: {
          type: "string",
          description:
            "The concise, objective statement of fact that is agreed upon or evidenced.",
        },
        basis: {
          type: "string",
          enum: ["mutual_agreement", "concrete_evidence"],
          description:
            "Whether the fact is established by mutual agreement between both parties or by concrete evidence.",
        },
        evidenceDetails: {
          type: "string",
          description:
            "Brief explanation of the basis (e.g. 'Both parties confirmed tenancy ended July 31' or 'Bank transfer receipt dated Aug 3 verifies payment').",
        },
      },
      required: ["disputeId", "statement", "basis"],
    },
  },
  {
    name: TOOL_NAMES.UPDATE_FACT,
    description:
      "Modifies or clarifies an existing fact on the dispute record after both parties discuss and agree on the correction.",
    url: `${baseUrl}/api/ai_tools/${TOOL_NAMES.UPDATE_FACT}`,
    parameters: {
      type: "object",
      properties: {
        factId: {
          type: "string",
          description: "The ID of the fact to modify.",
        },
        statement: {
          type: "string",
          description: "The updated, clarified wording of the fact.",
        },
        reason: {
          type: "string",
          description:
            "The reason for the update and confirmation that parties agreed.",
        },
      },
      required: ["factId", "statement"],
    },
  },
  {
    name: TOOL_NAMES.REMOVE_FACT,
    description:
      "Removes an erroneous or contested fact from the official record if it was disputed or entered by mistake.",
    url: `${baseUrl}/api/ai_tools/${TOOL_NAMES.REMOVE_FACT}`,
    parameters: {
      type: "object",
      properties: {
        factId: {
          type: "string",
          description: "The ID of the fact to remove.",
        },
        reason: {
          type: "string",
          description: "Why this fact is being removed from the record.",
        },
      },
      required: ["factId", "reason"],
    },
  },
  {
    name: TOOL_NAMES.PROPOSE_RESOLUTION,
    description:
      "Submits a structured settlement or resolution proposal for both parties to review and accept.",
    url: `${baseUrl}/api/ai_tools/${TOOL_NAMES.PROPOSE_RESOLUTION}`,
    parameters: {
      type: "object",
      properties: {
        disputeId: {
          type: "string",
          description: "The unique ID of the dispute.",
        },
        title: {
          type: "string",
          description: "A short, neutral title for the proposal.",
        },
        terms: {
          type: "string",
          description:
            "The detailed, actionable settlement terms addressing the interests of both sides.",
        },
      },
      required: ["disputeId", "title", "terms"],
    },
  },
  {
    name: TOOL_NAMES.MARK_DISPUTE_RESOLVED,
    description:
      "Concludes the mediation by marking the dispute officially resolved and recording the finalized mutual agreement.",
    url: `${baseUrl}/api/ai_tools/${TOOL_NAMES.MARK_DISPUTE_RESOLVED}`,
    parameters: {
      type: "object",
      properties: {
        disputeId: {
          type: "string",
          description: "The unique ID of the dispute.",
        },
        resolutionSummary: {
          type: "string",
          description:
            "Complete summary of the agreed resolution, obligations, and timelines.",
        },
        actionItems: {
          type: "array",
          items: { type: "string" },
          description:
            "List of specific next steps or commitments each party has agreed to perform.",
        },
      },
      required: ["disputeId", "resolutionSummary"],
    },
  },
];
