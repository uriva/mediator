import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { adminDb, id } from "@/lib/instant-admin";
import { TOOL_NAMES } from "@/lib/mediator-tools";
import {
  BASE_MEDIATOR_PROMPT,
  buildDynamicMediatorPrompt,
  type DisputeContext,
} from "@/lib/mediator-prompt";

const PROMPT2BOT_WEBHOOK_SECRET =
  process.env.PROMPT2BOT_WEBHOOK_SECRET || "caf68f8d-b707-446e-b61c-04192f322ef0";
const PROMPT2BOT_SECRET =
  process.env.PROMPT2BOT_SECRET || "0ca19ee2-1114-44ed-9014-56b2b8bef649";

const secretsToTry = [
  PROMPT2BOT_WEBHOOK_SECRET,
  PROMPT2BOT_SECRET,
  process.env.PROMPT2BOT_API_TOKEN || "",
].filter(Boolean);

interface SignedToolPayload<T> {
  payload: {
    meta: {
      botId: string;
      conversationId: string;
      userId: string;
      network: string;
      timestamp: string;
      nonce: string;
      toolCallId?: string;
      toolName?: string;
    };
    params: T;
  };
  signature: string;
}

const verifySignature = <T>(
  body: SignedToolPayload<T>
): { verified: boolean; meta: SignedToolPayload<T>["payload"]["meta"]; params: T } => {
  if (!body || typeof body !== "object" || !body.payload) {
    throw new Error("Invalid request structure");
  }

  const payloadStr = JSON.stringify(body.payload);
  const signature = body.signature;

  // Verify against available secrets
  let isMatch = false;
  for (const sec of secretsToTry) {
    const computed = createHmac("sha256", sec).update(payloadStr).digest("hex");
    if (computed === signature) {
      isMatch = true;
      break;
    }
  }

  // Also check timestamp age if signature matched
  const ts = Number(body.payload.meta?.timestamp);
  if (isMatch && Number.isFinite(ts) && Math.abs(Date.now() - ts) > 10 * 60_000) {
    console.warn("Tool request timestamp is older than 10 minutes");
  }

  return {
    verified: isMatch,
    meta: body.payload.meta,
    params: body.payload.params,
  };
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tool: string }> }
) {
  const { tool } = await params;

  let rawBody: SignedToolPayload<any>;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { meta, params: toolParams } = verifySignature(rawBody);

  console.log(`[ai_tools] Tool: ${tool}, convId: ${meta?.conversationId}`);

  try {
    // 1. REMOTE CONFIG: Called on every incoming message
    if (tool === TOOL_NAMES.REMOTE_CONFIG) {
      const convId = meta?.conversationId;

      if (!convId) {
        return NextResponse.json({
          prompt: BASE_MEDIATOR_PROMPT,
          timezoneIANA: "UTC",
        });
      }

      // Query dispute matching this conversation
      const { disputes } = await adminDb.query({
        disputes: {
          $: { where: { conversationId: convId } },
          participants: {},
          facts: {},
          evidenceItems: {},
          proposals: {},
        },
      });

      if (!disputes || disputes.length === 0) {
        // Fallback: check if any dispute is in intake
        return NextResponse.json({
          prompt: `${BASE_MEDIATOR_PROMPT}\n\nNote: Active mediation session initializing. Ask the parties for their names and an overview of their dispute.`,
          timezoneIANA: "UTC",
        });
      }

      const dispute = disputes[0] as any;
      const context: DisputeContext = {
        disputeId: dispute.id,
        title: dispute.title,
        description: dispute.description,
        status: dispute.status,
        category: dispute.category,
        creatorName: dispute.creatorName,
        participants: (dispute.participants || []).map((p: any) => ({
          name: p.name,
          role: p.role,
          email: p.email,
        })),
        agreedFacts: (dispute.facts || [])
          .filter((f: any) => f.status === "agreed")
          .map((f: any) => ({
            id: f.id,
            statement: f.statement,
            basis: f.basis,
            evidenceDetails: f.evidenceDetails,
          })),
        evidenceItems: (dispute.evidenceItems || []).map((e: any) => ({
          id: e.id,
          title: e.title,
          description: e.description,
          fileUrl: e.fileUrl,
          submittedBy: e.submittedBy,
        })),
        proposals: (dispute.proposals || []).map((pr: any) => ({
          id: pr.id,
          title: pr.title,
          terms: pr.terms,
          status: pr.status,
        })),
        resolutionSummary: dispute.resolutionSummary,
      };

      const prompt = buildDynamicMediatorPrompt(context);
      return NextResponse.json({
        prompt,
        timezoneIANA: "UTC",
      });
    }

    // 2. RECORD AGREED FACT
    if (tool === TOOL_NAMES.RECORD_AGREED_FACT) {
      const { disputeId, statement, basis, evidenceDetails } = toolParams;
      if (!disputeId || !statement || !basis) {
        return NextResponse.json(
          { error: "Missing required parameters: disputeId, statement, basis" },
          { status: 400 }
        );
      }

      const factId = id();
      await adminDb.transact([
        adminDb.tx.facts[factId]
          .create({
            disputeId,
            statement,
            basis,
            evidenceDetails: evidenceDetails || "",
            status: "agreed",
            addedBy: "mediator",
            createdAt: Date.now(),
          })
          .link({ dispute: disputeId }),
        adminDb.tx.disputes[disputeId].update({
          updatedAt: Date.now(),
          status: "in_mediation",
        }),
      ]);

      return NextResponse.json({
        success: true,
        factId,
        statement,
        basis,
        message: `Fact successfully recorded on the official dispute board: "${statement}"`,
      });
    }

    // 3. UPDATE FACT
    if (tool === TOOL_NAMES.UPDATE_FACT) {
      const { factId, statement, reason } = toolParams;
      if (!factId || !statement) {
        return NextResponse.json(
          { error: "Missing required parameters: factId, statement" },
          { status: 400 }
        );
      }

      await adminDb.transact([
        adminDb.tx.facts[factId].update({
          statement,
          status: "agreed",
          updatedAt: Date.now(),
        }),
      ]);

      return NextResponse.json({
        success: true,
        factId,
        updatedStatement: statement,
        reason: reason || "Updated per mutual clarification",
      });
    }

    // 4. REMOVE FACT
    if (tool === TOOL_NAMES.REMOVE_FACT) {
      const { factId, reason } = toolParams;
      if (!factId) {
        return NextResponse.json(
          { error: "Missing required parameter: factId" },
          { status: 400 }
        );
      }

      await adminDb.transact([
        adminDb.tx.facts[factId].update({
          status: "archived",
          updatedAt: Date.now(),
        }),
      ]);

      return NextResponse.json({
        success: true,
        factId,
        message: `Fact archived from official board: ${reason || "Removed by mediator"}`,
      });
    }

    // 5. PROPOSE RESOLUTION
    if (tool === TOOL_NAMES.PROPOSE_RESOLUTION) {
      const { disputeId, title: propTitle, terms } = toolParams;
      if (!disputeId || !propTitle || !terms) {
        return NextResponse.json(
          { error: "Missing required parameters: disputeId, title, terms" },
          { status: 400 }
        );
      }

      const proposalId = id();
      await adminDb.transact([
        adminDb.tx.proposals[proposalId]
          .create({
            disputeId,
            title: propTitle,
            terms,
            status: "proposed",
            proposedBy: "Mediator",
            createdAt: Date.now(),
          })
          .link({ dispute: disputeId }),
        adminDb.tx.disputes[disputeId].update({
          updatedAt: Date.now(),
        }),
      ]);

      return NextResponse.json({
        success: true,
        proposalId,
        title: propTitle,
        terms,
        message: "Settlement proposal submitted to both parties for evaluation.",
      });
    }

    // 6. MARK DISPUTE RESOLVED
    if (tool === TOOL_NAMES.MARK_DISPUTE_RESOLVED) {
      const { disputeId, resolutionSummary, actionItems } = toolParams;
      if (!disputeId || !resolutionSummary) {
        return NextResponse.json(
          { error: "Missing required parameters: disputeId, resolutionSummary" },
          { status: 400 }
        );
      }

      const now = Date.now();
      await adminDb.transact([
        adminDb.tx.disputes[disputeId].update({
          status: "resolved",
          resolutionSummary,
          actionItems: actionItems || [],
          resolvedAt: now,
          updatedAt: now,
        }),
      ]);

      return NextResponse.json({
        success: true,
        disputeId,
        status: "resolved",
        message: "Mediation successfully resolved. Agreement sealed.",
      });
    }

    return NextResponse.json({ error: `Unknown tool: ${tool}` }, { status: 404 });
  } catch (err: any) {
    console.error(`Error processing tool ${tool}:`, err);
    return NextResponse.json(
      { error: err?.message || "Internal tool execution error" },
      { status: 500 }
    );
  }
}
