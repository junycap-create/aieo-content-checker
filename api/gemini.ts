import type { IncomingMessage, ServerResponse } from "node:http";
import {
  analyzeContent,
  generateRewrites,
  getEmbedding,
  getServiceHealth,
  GeminiServiceError,
  toGeminiServiceError,
  type GeminiErrorCode,
} from "../server/gemini-core.js";

/**
 * Vercel Serverless Function: the only place the Gemini API key is used.
 *
 *   GET  /api/gemini                -> { ok, keyConfigured, model }
 *   POST /api/gemini { action, text }
 *        action = "analyze" | "rewrite" | "embed" | "health"
 *
 * Errors carry a stable `error.code` and an HTTP status the frontend maps to a
 * user-facing Korean message (402 quota, 429 rate limit, 503 not configured /
 * overloaded, 502 key rejected or upstream failure).
 */

export const config = { maxDuration: 60 };

const MAX_BODY_BYTES = 2 * 1024 * 1024;

const PUBLIC_MESSAGES: Record<GeminiErrorCode, string> = {
  KEY_NOT_CONFIGURED: "AI service is not configured on the server.",
  KEY_INVALID: "The server API key was rejected by the AI provider.",
  QUOTA_EXHAUSTED: "The AI project has run out of credit.",
  RATE_LIMITED: "Too many requests. Please retry in a moment.",
  MODEL_OVERLOADED: "The AI model is temporarily overloaded.",
  BAD_REQUEST: "The request was rejected as invalid.",
  EMPTY_RESPONSE: "The AI provider returned an empty response.",
  UPSTREAM_ERROR: "Unexpected error from the AI provider.",
};

const sendJson = (res: ServerResponse, status: number, body: unknown): void => {
  if (res.writableEnded) return;
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
};

const sendError = (res: ServerResponse, error: unknown): void => {
  const serviceError = toGeminiServiceError(error);
  console.error(`[api/gemini] ${serviceError.code}: ${serviceError.message}`);
  sendJson(res, serviceError.httpStatus, {
    error: { code: serviceError.code, message: PUBLIC_MESSAGES[serviceError.code] },
  });
};

const readJsonBody = async (req: IncomingMessage): Promise<Record<string, unknown>> => {
  // Vercel's Node runtime may hand over an already parsed body.
  const preParsed = (req as IncomingMessage & { body?: unknown }).body;
  if (preParsed && typeof preParsed === "object") {
    return preParsed as Record<string, unknown>;
  }
  if (typeof preParsed === "string" && preParsed.trim() !== "") {
    try {
      return JSON.parse(preParsed) as Record<string, unknown>;
    } catch {
      throw new GeminiServiceError("BAD_REQUEST", 400, "Request body is not valid JSON.");
    }
  }

  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buffer = typeof chunk === "string" ? Buffer.from(chunk) : chunk;
    size += buffer.length;
    if (size > MAX_BODY_BYTES) {
      throw new GeminiServiceError("BAD_REQUEST", 400, "Request body is too large.");
    }
    chunks.push(buffer);
  }
  if (chunks.length === 0) return {};
  const raw = Buffer.concat(chunks).toString("utf-8").trim();
  if (raw === "") return {};
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    throw new GeminiServiceError("BAD_REQUEST", 400, "Request body is not valid JSON.");
  }
};

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  const method = (req.method ?? "GET").toUpperCase();

  if (method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    if (method === "GET") {
      const health = getServiceHealth();
      sendJson(res, health.ok ? 200 : 503, health);
      return;
    }

    if (method !== "POST") {
      sendJson(res, 405, {
        error: { code: "BAD_REQUEST", message: "Only GET and POST are supported." },
      });
      return;
    }

    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
    const body = await readJsonBody(req);
    const action = typeof body.action === "string"
      ? body.action
      : (url.searchParams.get("action") ?? "");

    switch (action) {
      case "analyze": {
        const result = await analyzeContent(body.text);
        sendJson(res, 200, { result });
        return;
      }
      case "rewrite": {
        const rewrites = await generateRewrites(body.text);
        sendJson(res, 200, rewrites);
        return;
      }
      case "embed": {
        const values = await getEmbedding(body.text);
        sendJson(res, 200, { values });
        return;
      }
      case "health": {
        const health = getServiceHealth();
        sendJson(res, health.ok ? 200 : 503, health);
        return;
      }
      default:
        sendJson(res, 400, {
          error: {
            code: "BAD_REQUEST",
            message: 'Unknown action. Use "analyze", "rewrite", "embed" or "health".',
          },
        });
    }
  } catch (error) {
    sendError(res, error);
  }
}
