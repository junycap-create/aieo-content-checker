import {
  GoogleGenAI,
  Schema,
  Type,
  ThinkingLevel,
} from "@google/genai";
import type { AnalysisResult, RewriteSet } from "../types";

/**
 * Server-only Gemini access for the AIEO content checker.
 *
 * The API key lives in the server environment (`process.env.GEMINI_API_KEY`)
 * and is never sent to the browser or inlined into the client bundle.
 */

const MODEL_NAME = "gemini-3-flash-preview";
const REWRITE_MODEL_NAME = "gemini-3-flash-preview";
const EMBEDDING_MODEL_NAME = "gemini-embedding-2-preview";

/** Upper bound for a single analysis/rewrite request body (characters). */
export const MAX_INPUT_CHARS = 60000;

const ANALYSIS_SYSTEM_INSTRUCTION = `
Expert in GEO/AIEO. Analyze text for "High-Authority Citational Content".
RULES:
1. 엔터티 밀도 (Entity Density): Proper nouns, brands, technical terms.
2. 인용 신뢰도 (Citation Confidence): Logic & evidence based.
3. AI 답변 적합성 (AIO Readiness): Structure for AI Overviews.
4. 정보 이득량 (Information Gain): Unique data/perspective.

SNIPPETS: Generate 4 snippets (google, perplexity, chatgpt, claude).
SCORING: 0-100.
FEEDBACK: Summary (5-6 sentences), Metric Feedback (4-5 sentences each), Actionable tips.
OUTPUT: KOREAN.
`;

const REWRITE_SYSTEM_INSTRUCTION = `
Expert in GEO/AIEO. Transform text into "High-Authority Citational Content".
JSON SAFETY: No unescaped newlines.
STRUCTURES:
- basic (Blog): Title, Intro, 3 Body sections (###), Conclusion. (Min 1200 chars)
- linkedin: Hook, Body (bullets + emojis), Insight, CTA. (Min 700 chars)
- newsroom: Headline, Dateline, Lead (5Ws), Body (100% facts preserved), Quote, Boilerplate.
- faq: 5-6 Q&A pairs. (Min 1000 chars)
- tldr: 2-sentence summary, 3 bullets, Final Verdict.
OUTPUT: KOREAN.
`;

export type GeminiErrorCode =
  | "KEY_NOT_CONFIGURED"
  | "KEY_INVALID"
  | "QUOTA_EXHAUSTED"
  | "RATE_LIMITED"
  | "MODEL_OVERLOADED"
  | "BAD_REQUEST"
  | "EMPTY_RESPONSE"
  | "UPSTREAM_ERROR";

/** Error with the HTTP status the proxy should return to the browser. */
export class GeminiServiceError extends Error {
  readonly code: GeminiErrorCode;
  readonly httpStatus: number;

  constructor(code: GeminiErrorCode, httpStatus: number, message: string) {
    super(message);
    this.name = "GeminiServiceError";
    this.code = code;
    this.httpStatus = httpStatus;
  }
}

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    totalScore: { type: Type.NUMBER },
    summary: { type: Type.STRING },
    metrics: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          score: { type: Type.NUMBER },
          feedback: { type: Type.STRING },
          status: { type: Type.STRING, enum: ["Good", "Needs Improvement", "Weak"] },
        },
        required: ["name", "score", "feedback", "status"],
      },
    },
    snippets: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          engine: { type: Type.STRING, enum: ["google", "perplexity", "chatgpt", "claude"] },
          question: { type: Type.STRING },
          answer: { type: Type.STRING },
        },
        required: ["engine", "question", "answer"],
      },
    },
    geoInsight: {
      type: Type.OBJECT,
      properties: {
        visibilityIndex: { type: Type.NUMBER },
        entityDensity: { type: Type.NUMBER },
        citationConfidence: { type: Type.NUMBER },
        optimizationChecklist: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["visibilityIndex", "entityDensity", "citationConfidence", "optimizationChecklist"],
    },
  },
  required: ["totalScore", "summary", "metrics", "snippets", "geoInsight"],
};

const rewriteSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    rewrites: {
      type: Type.OBJECT,
      properties: {
        basic: { type: Type.STRING },
        linkedin: { type: Type.STRING },
        newsroom: { type: Type.STRING },
        faq: { type: Type.STRING },
        tldr: { type: Type.STRING },
      },
      required: ["basic", "linkedin", "newsroom", "faq", "tldr"],
    },
    checklists: {
      type: Type.OBJECT,
      properties: {
        basic: { type: Type.ARRAY, items: { type: Type.STRING } },
        linkedin: { type: Type.ARRAY, items: { type: Type.STRING } },
        newsroom: { type: Type.ARRAY, items: { type: Type.STRING } },
        faq: { type: Type.ARRAY, items: { type: Type.STRING } },
        tldr: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["basic", "linkedin", "newsroom", "faq", "tldr"],
    },
  },
  required: ["rewrites", "checklists"],
};

/** Read on every call so a changed Vercel env var applies without a rebuild. */
const getApiKey = (): string => {
  const key = (process.env.GEMINI_API_KEY || process.env.API_KEY || "").trim();
  if (!key) {
    throw new GeminiServiceError(
      "KEY_NOT_CONFIGURED",
      503,
      "GEMINI_API_KEY is not set on the server.",
    );
  }
  return key;
};

const getClient = (): GoogleGenAI => new GoogleGenAI({ apiKey: getApiKey() });

const cleanJsonString = (text: string): string => {
  let clean = text.trim();
  if (clean.startsWith("```json")) clean = clean.replace(/^```json/, "").replace(/```\s*$/, "");
  else if (clean.startsWith("```")) clean = clean.replace(/^```/, "").replace(/```\s*$/, "");
  return clean;
};

const assertUsableText = (text: unknown, action: string): string => {
  if (typeof text !== "string" || text.trim() === "") {
    throw new GeminiServiceError("BAD_REQUEST", 400, `${action}: text is required.`);
  }
  if (text.length > MAX_INPUT_CHARS) {
    throw new GeminiServiceError(
      "BAD_REQUEST",
      400,
      `${action}: text exceeds ${MAX_INPUT_CHARS} characters.`,
    );
  }
  return text;
};

// Google returns 429 for both "slow down" and "you are out of credit"; only the
// message tells them apart, and the user needs a different action for each.
const BILLING_HINTS = [
  /prepayment credits/i,
  /credits are depleted/i,
  /billing/i,
  /insufficient (funds|balance)/i,
  /account (has been )?disabled/i,
];

/** Map a Gemini SDK/HTTP failure onto a stable error code and browser status. */
export const toGeminiServiceError = (error: unknown): GeminiServiceError => {
  if (error instanceof GeminiServiceError) return error;

  const status = typeof (error as { status?: unknown })?.status === "number"
    ? (error as { status: number }).status
    : undefined;
  const message = error instanceof Error ? error.message : String(error ?? "");

  if (status === 429) {
    if (BILLING_HINTS.some((pattern) => pattern.test(message))) {
      return new GeminiServiceError("QUOTA_EXHAUSTED", 402, message);
    }
    return new GeminiServiceError("RATE_LIMITED", 429, message);
  }
  // Google answers an unusable key with 400/403 and this wording.
  if (/API key not valid|API_KEY_INVALID|API key expired|invalid.*api.*key/i.test(message)) {
    return new GeminiServiceError("KEY_INVALID", 502, message);
  }
  if (status === 401 || status === 403) {
    return new GeminiServiceError("KEY_INVALID", 502, message);
  }
  if (status === 400) {
    return new GeminiServiceError("BAD_REQUEST", 400, message);
  }
  if (status === 500 || status === 502 || status === 503 || status === 504 ||
      /overloaded|UNAVAILABLE|DEADLINE_EXCEEDED|timeout/i.test(message)) {
    return new GeminiServiceError("MODEL_OVERLOADED", 503, message);
  }
  return new GeminiServiceError("UPSTREAM_ERROR", 502, message);
};

const parseJsonResponse = <T>(text: string | undefined, action: string): T => {
  if (!text) {
    throw new GeminiServiceError("EMPTY_RESPONSE", 502, `${action}: Gemini returned an empty response.`);
  }
  try {
    return JSON.parse(cleanJsonString(text)) as T;
  } catch {
    throw new GeminiServiceError("EMPTY_RESPONSE", 502, `${action}: Gemini returned invalid JSON.`);
  }
};

export interface ServiceHealth {
  ok: boolean;
  keyConfigured: boolean;
  model: string;
}

export const getServiceHealth = (): ServiceHealth => {
  const keyConfigured = Boolean((process.env.GEMINI_API_KEY || process.env.API_KEY || "").trim());
  return { ok: keyConfigured, keyConfigured, model: MODEL_NAME };
};

export const analyzeContent = async (rawText: unknown): Promise<AnalysisResult> => {
  const text = assertUsableText(rawText, "analyze");
  try {
    const response = await getClient().models.generateContent({
      model: MODEL_NAME,
      contents: text,
      config: {
        systemInstruction: ANALYSIS_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.1,
        maxOutputTokens: 2048, // Reduced for speed
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }, // Speed optimization
      },
    });
    return parseJsonResponse<AnalysisResult>(response.text, "analyze");
  } catch (error) {
    throw toGeminiServiceError(error);
  }
};

export const generateRewrites = async (
  rawText: unknown,
): Promise<{ rewrites: RewriteSet; checklists: Record<string, string[]> }> => {
  const text = assertUsableText(rawText, "rewrite");
  try {
    const response = await getClient().models.generateContent({
      model: REWRITE_MODEL_NAME,
      contents: text,
      config: {
        systemInstruction: REWRITE_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: rewriteSchema,
        temperature: 0.7,
        maxOutputTokens: 4096, // Reduced for speed
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }, // Speed optimization
      },
    });
    return parseJsonResponse<{ rewrites: RewriteSet; checklists: Record<string, string[]> }>(
      response.text,
      "rewrite",
    );
  } catch (error) {
    throw toGeminiServiceError(error);
  }
};

/**
 * Embedding is only used to enrich the report, so a failure here returns an
 * empty vector instead of failing the whole analysis. Key problems still throw
 * so the caller can report them.
 */
export const getEmbedding = async (rawText: unknown): Promise<number[]> => {
  const text = assertUsableText(rawText, "embed");
  try {
    const result = await getClient().models.embedContent({
      model: EMBEDDING_MODEL_NAME,
      contents: [text],
    });
    return result.embeddings?.[0]?.values ?? [];
  } catch (error) {
    const serviceError = toGeminiServiceError(error);
    if (serviceError.code === "KEY_NOT_CONFIGURED" || serviceError.code === "KEY_INVALID") {
      throw serviceError;
    }
    console.error("[gemini] embedding failed:", serviceError.code);
    return [];
  }
};
