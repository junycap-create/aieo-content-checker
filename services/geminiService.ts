import { AnalysisResult, RewriteSet } from "../types";

/**
 * Client-side Gemini service.
 *
 * The browser never holds an API key: every call goes to the server-side proxy
 * (`/api/gemini`, a Vercel Serverless Function) which uses the server
 * environment variable `GEMINI_API_KEY`.
 */

const API_ENDPOINT = "/api/gemini";

// Cache keys
const CACHE_PREFIX = "aieo_cache_";

// Analysis + rewrite can take a while on the model side.
const REQUEST_TIMEOUT_MS = 120000;

/** Error groups the UI knows how to explain to the user. */
export type ServiceErrorType =
  | "MAINTENANCE"   // server key missing/invalid, or endpoint unavailable
  | "QUOTA"         // AI project out of credit (HTTP 402)
  | "RATE_LIMIT"    // too many requests (HTTP 429)
  | "OVERLOADED"    // model temporarily overloaded (HTTP 503)
  | "GENERAL";      // anything else, including network failure

export class ServiceError extends Error {
  readonly type: ServiceErrorType;
  readonly code: string;
  readonly status: number;

  constructor(type: ServiceErrorType, code: string, status: number, message: string) {
    super(message);
    this.name = "ServiceError";
    this.type = type;
    this.code = code;
    this.status = status;
  }
}

export interface ServiceHealth {
  ok: boolean;
  keyConfigured: boolean;
  model: string;
}

const mapServiceErrorType = (code: string, status: number): ServiceErrorType => {
  switch (code) {
    case "KEY_NOT_CONFIGURED":
    case "KEY_INVALID":
      return "MAINTENANCE";
    case "QUOTA_EXHAUSTED":
      return "QUOTA";
    case "RATE_LIMITED":
      return "RATE_LIMIT";
    case "MODEL_OVERLOADED":
      return "OVERLOADED";
    default:
      if (status === 402) return "QUOTA";
      if (status === 429) return "RATE_LIMIT";
      if (status === 503) return "MAINTENANCE";
      return "GENERAL";
  }
};

interface ApiErrorPayload {
  error?: { code?: string; message?: string };
}

const postToApi = async <T>(action: string, text: string): Promise<T> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ action, text }),
      signal: controller.signal,
    });

    const payload = await response.json().catch(() => null) as (T & ApiErrorPayload) | null;

    if (!response.ok || payload === null) {
      const code = payload?.error?.code ?? "UNKNOWN";
      const message = payload?.error?.message ?? `Request failed with HTTP ${response.status}.`;
      throw new ServiceError(mapServiceErrorType(code, response.status), code, response.status, message);
    }

    return payload as T;
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    const aborted = error instanceof DOMException && error.name === "AbortError";
    throw new ServiceError(
      "GENERAL",
      aborted ? "REQUEST_TIMEOUT" : "NETWORK_ERROR",
      0,
      aborted ? "The analysis request timed out." : String((error as Error)?.message ?? error),
    );
  } finally {
    clearTimeout(timer);
  }
};

// Helper for caching
const getCache = <T>(key: string): T | null => {
  const cached = localStorage.getItem(CACHE_PREFIX + key);
  if (!cached) return null;
  try {
    const { data, expiry } = JSON.parse(cached);
    if (Date.now() > expiry) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
};

const setCache = (key: string, data: any, ttl = 3600000) => { // Default 1 hour
  localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({
    data,
    expiry: Date.now() + ttl
  }));
};

const generateHash = (text: string) => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString();
};

/** Server key/health check, used instead of asking the browser for a key. */
export const checkServiceHealth = async (): Promise<ServiceHealth> => {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    const payload = await response.json().catch(() => null) as Partial<ServiceHealth> | null;
    const keyConfigured = Boolean(payload?.keyConfigured);
    return {
      ok: Boolean(payload?.ok) && keyConfigured,
      keyConfigured,
      model: typeof payload?.model === "string" ? payload.model : "",
    };
  } catch {
    return { ok: false, keyConfigured: false, model: "" };
  }
};

/**
 * Embedding only enriches the report, so a failure degrades to an empty vector
 * unless the server itself is unavailable (key problem), which must surface.
 */
export const getEmbedding = async (text: string): Promise<number[]> => {
  try {
    const payload = await postToApi<{ values: number[] }>("embed", text);
    return payload.values ?? [];
  } catch (error) {
    if (error instanceof ServiceError && error.type === "MAINTENANCE") throw error;
    console.error("Embedding Error:", error);
    return [];
  }
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const analyzeContent = async (text: string, retryCount = 0): Promise<AnalysisResult> => {
  const hash = generateHash(text);
  const cached = getCache<AnalysisResult>(`analysis_${hash}`);
  if (cached) return cached;

  try {
    const payload = await postToApi<{ result: AnalysisResult }>("analyze", text);
    if (!payload.result) {
      throw new ServiceError("GENERAL", "EMPTY_RESPONSE", 200, "Empty analysis result.");
    }
    setCache(`analysis_${hash}`, payload.result);
    return payload.result;
  } catch (error) {
    if (error instanceof ServiceError && error.type === "OVERLOADED" && retryCount < 2) {
      await sleep(1000 * (retryCount + 1));
      return analyzeContent(text, retryCount + 1);
    }
    throw error;
  }
};

export const generateRewrites = async (
  text: string,
  retryCount = 0,
): Promise<{ rewrites: RewriteSet, checklists: any }> => {
  const hash = generateHash(text);
  const cached = getCache<{ rewrites: RewriteSet, checklists: any }>(`rewrite_${hash}`);
  if (cached) return cached;

  try {
    const payload = await postToApi<{ rewrites: RewriteSet, checklists: any }>("rewrite", text);
    if (!payload.rewrites || !payload.checklists) {
      throw new ServiceError("GENERAL", "EMPTY_RESPONSE", 200, "Empty rewrite result.");
    }
    setCache(`rewrite_${hash}`, payload);
    return payload;
  } catch (error) {
    if (error instanceof ServiceError && error.type === "OVERLOADED" && retryCount < 1) {
      await sleep(1000);
      return generateRewrites(text, retryCount + 1);
    }
    throw error;
  }
};
