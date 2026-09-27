import { setPrompt, setCustomTools } from "@prompt2bot/client";
import { init } from "@instantdb/admin";
import { BASE_MEDIATOR_PROMPT } from "../src/lib/mediator-prompt.ts";
import { getMediatorTools } from "../src/lib/mediator-tools.ts";

const baseUrl = process.env.BASE_URL || "https://mediator.uriva.deno.net";
const apiToken =
  process.env.PROMPT2BOT_API_TOKEN || "p2b_95a4a7fd33ae84a54a2cb205c491675409d6a54a";
const botId =
  process.env.PROMPT2BOT_BOT_ID || "81660ef7-d43a-4c71-844a-aa34cfe4e99e";
const p2bInstantAdminToken =
  process.env.P2B_INSTANT_ADMIN_TOKEN || "2340dc79-f1a9-4f7f-b368-fe1d1c8fd5a9";

async function main() {
  console.log(`[register-agent] Target bot: ${botId}`);
  console.log(`[register-agent] Base URL: ${baseUrl}`);

  // 1. Ensure Bot Group Chat Behavior is set to "always" (so it responds to all group messages)
  try {
    const p2bDb = init({
      appId: "4633a4fd-b3f6-4d8c-b11b-a953e63c4cee",
      adminToken: p2bInstantAdminToken,
    });
    await p2bDb.transact([
      p2bDb.tx.bots[botId].update({
        groupChatBehavior: "always",
        name: "Mediator",
      }),
    ]);
    console.log("[register-agent] ✓ Ensured groupChatBehavior is set to 'always'");
  } catch (err) {
    console.warn("[register-agent] Could not update bot groupChatBehavior in InstantDB:", err);
  }

  // 2. Update Base Prompt
  console.log("[register-agent] Updating bot default prompt...");
  const promptRes = await setPrompt({
    apiToken,
    botId,
    prompt: BASE_MEDIATOR_PROMPT,
  });

  if (!promptRes.success) {
    console.error("[register-agent] Failed to set prompt:", promptRes.error);
    process.exit(1);
  }
  console.log("[register-agent] ✓ Bot prompt updated successfully.");

  // 3. Register Custom Tools & remote_config
  const tools = getMediatorTools(baseUrl);
  console.log(
    `[register-agent] Registering ${tools.length} tools: ${tools
      .map((t) => t.name)
      .join(", ")}...`
  );

  const toolsRes = await setCustomTools({
    apiToken,
    botId,
    tools,
    skills: [],
  });

  if (!toolsRes.success) {
    console.error("[register-agent] Failed to register tools:", toolsRes.error);
    process.exit(1);
  }

  console.log("[register-agent] ✓ Custom tools registered successfully with prompt2bot.");
  console.log("[register-agent] Remote config & tool hooks are live!");
}

main().catch((err) => {
  console.error("[register-agent] Unexpected error:", err);
  process.exit(1);
});
