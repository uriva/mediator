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
  const title = escapeSvg(url.searchParams.get("title") || "Peaceful AI Mediation");
  const category = escapeSvg(url.searchParams.get("category") || "Dispute Resolution");
  const status = escapeSvg(url.searchParams.get("status") || "In Mediation");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#F9F8F5" stroke="#F0ECE4" stroke-width="32"/>
  <text x="90" y="120" font-family="sans-serif" font-size="28" font-weight="800" fill="#1C2923">Mediator — Serene Dispute Resolution</text>
  <text x="90" y="230" font-family="sans-serif" font-size="16" font-weight="700" fill="#3E6353">${category} • ${status}</text>
  <text x="90" y="320" font-family="sans-serif" font-size="52" font-weight="800" fill="#1C2923">${title.slice(0, 42)}</text>
  <text x="90" y="540" font-family="sans-serif" font-size="22" fill="#5C7066">mediator.uriv.me</text>
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
