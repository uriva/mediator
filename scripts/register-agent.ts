import { setPrompt, setCustomTools } from "@prompt2bot/client";
import { BASE_MEDIATOR_PROMPT } from "../src/lib/mediator-prompt.ts";
import { getMediatorTools } from "../src/lib/mediator-tools.ts";

const baseUrl = process.env.BASE_URL || "https://mediator.uriva.deno.net";
const apiToken =
  process.env.PROMPT2BOT_API_TOKEN || "p2b_95a4a7fd33ae84a54a2cb205c491675409d6a54a";
const botId =
  process.env.PROMPT2BOT_BOT_ID || "81660ef7-d43a-4c71-844a-aa34cfe4e99e";
const secret =
  process.env.PROMPT2BOT_SECRET || "0ca19ee2-1114-44ed-9014-56b2b8bef649";

async function main() {
  console.log(`[register-agent] Target bot: ${botId}`);
  console.log(`[register-agent] Base URL: ${baseUrl}`);

  // 1. Update Base Prompt
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

  // 2. Register Custom Tools & remote_config
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
