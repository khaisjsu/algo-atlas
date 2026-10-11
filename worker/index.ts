/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import { findModule, moduleCatalog, publicModule } from "../app/lib/catalog";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      return handleApi(request, url);
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    return handler.fetch(request, env, ctx);
  },
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
});

async function handleApi(request: Request, url: URL): Promise<Response> {
  if (request.method === "GET" && url.pathname === "/api/health") {
    return json({ ok: true, service: "algo-atlas", modules: moduleCatalog.length });
  }

  if (request.method === "GET" && url.pathname === "/api/modules") {
    return json({ modules: moduleCatalog.map(publicModule) });
  }

  const match = url.pathname.match(/^\/api\/modules\/([^/]+)(?:\/run)?$/);
  if (!match) return json({ error: "Not found" }, 404);

  const lesson = findModule(match[1]);
  if (!lesson) return json({ error: `Unknown module: ${match[1]}` }, 404);

  if (request.method === "GET" && url.pathname.endsWith("/run") === false) {
    return json({ module: publicModule(lesson) });
  }

  if (request.method !== "POST" || !url.pathname.endsWith("/run")) {
    return json({ error: "Use POST /api/modules/:slug/run to execute a lesson." }, 405);
  }

  let payload: { action?: string; values?: Record<string, string> } = {};
  try {
    payload = await request.json() as typeof payload;
  } catch {
    return json({ error: "Request body must be valid JSON." }, 400);
  }

  const action = lesson.actions.find((candidate) => candidate.id === payload.action) ?? lesson.actions.find((candidate) => candidate.id !== "create");
  if (!action) return json({ error: "This module has no executable action." }, 400);

  const result = action.run(lesson.initial(), payload.values ?? {});
  if ("error" in result) return json({ error: result.error }, 400);
  return json({ module: lesson.slug, action: action.id, model: result.model, steps: result.steps, totalSteps: result.steps.length });
}

export default worker;
