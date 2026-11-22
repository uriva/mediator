import { POST as handleAiTool } from "./app/api/ai_tools/[tool]/route.ts";
import { NextRequest } from "./worker/nextServerShim.ts";

type AssetFetcher = {
  fetch: (req: Request) => Promise<Response>;
};

type WorkerEnv = Record<string, string | AssetFetcher | undefined> & {
  ASSETS?: AssetFetcher;
};

const syncEnv = (env: WorkerEnv) => {
  const g = globalThis as unknown as { process?: { env?: Record<string, string> } };
  g.process ??= { env: {} };
  g.process.env ??= {};
  for (const [k, v] of Object.entries(env)) {
    if (typeof v === "string") {
      g.process.env[k] = v;
    }
  }
};

const escapeSvg = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const renderOgSvg = (url: URL) => {
  const title = escapeSvg(url.searchParams.get("title") || "Talk it out. Settle it fair.");
  const category = escapeSvg(url.searchParams.get("category") || "General dispute");
  const status = escapeSvg(url.searchParams.get("status") || "In mediation");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#FFFFFF"/>
  <rect x="0.5" y="0.5" width="1199" height="629" fill="none" stroke="#E5E5E5" stroke-width="1"/>
  <circle cx="44" cy="44" r="9" fill="#0A0A0A"/>
  <text x="64" y="90" font-family="system-ui, sans-serif" font-size="22" font-weight="600" fill="#0A0A0A">mediator</text>
  <text x="160" y="90" font-family="ui-monospace, monospace" font-size="14" letter-spacing="1.5" fill="#A3A3A3">/ ${status.toUpperCase()}</text>
  <text x="1136" y="90" text-anchor="end" font-family="ui-monospace, monospace" font-size="14" letter-spacing="2" fill="#A3A3A3">${category.toUpperCase()}</text>
  <text x="64" y="240" font-family="system-ui, sans-serif" font-size="52" font-weight="600" letter-spacing="-1" fill="#0A0A0A">${title.slice(0, 36)}</text>
  <text x="64" y="310" font-family="system-ui, sans-serif" font-size="24" fill="#737373">Both sides. One room. Agreed facts only.</text>
  <line x1="64" y1="500" x2="1136" y2="500" stroke="#E5E5E5" stroke-width="1"/>
  <text x="64" y="544" font-family="system-ui, sans-serif" font-size="20" fill="#737373">No side channels · no favouritism · invite only</text>
  <text x="1136" y="544" text-anchor="end" font-family="ui-monospace, monospace" font-size="18" letter-spacing="1" fill="#0A0A0A">mediator.uriv.me</text>
</svg>`;
  return new Response(svg, {
    headers: { "Content-Type": "image/svg+xml; charset=utf-8" },
  });
};

export const worker = {
  fetch: async (req: Request, env: WorkerEnv) => {
    syncEnv(env);
    const url = new URL(req.url);
    const toolMatch = url.pathname.match(/^\/api\/ai_tools\/([^/]+)$/);
    if (toolMatch && req.method === "POST") {
      const tool = decodeURIComponent(toolMatch[1]);
      return await handleAiTool(
        Object.assign(req, { nextUrl: url }) as unknown as NextRequest,
        { params: Promise.resolve({ tool }) },
      );
    }
    if (url.pathname === "/api/og" && req.method === "GET") {
      return renderOgSvg(url);
    }
    if (env.ASSETS) {
      if (url.pathname.startsWith("/dispute/") && req.method === "GET") {
        const res = await env.ASSETS.fetch(new Request(new URL("/dispute/_", url), req));
        if (res.ok) return res;
      }
      if (url.pathname.startsWith("/invite/") && req.method === "GET") {
        const res = await env.ASSETS.fetch(new Request(new URL("/invite/_", url), req));
        if (res.ok) return res;
      }
      return await env.ASSETS.fetch(req);
    }
    return new Response("Not Found", { status: 404 });
  },
};

export default worker;
