import { GoogleGenAI, HarmCategory, HarmBlockThreshold, Schema, Type, ThinkingLevel } from "@google/genai";
import { AnalysisResult, RewriteSet } from "../types";

const MODEL_NAME = "gemini-3-flash-preview";
const REWRITE_MODEL_NAME = "gemini-3-flash-preview";

// Cache keys
const CACHE_PREFIX = "aieo_cache_";

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

export const getEmbedding = async (text: string): Promise<number[]> => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "AIzaSyCoSH6e5M-VGKT9hmE_IPXGMZzRalgy2EM";
  try {
    const ai = new GoogleGenAI({ apiKey });
    const result = await ai.models.embedContent({
      model: "gemini-embedding-2-preview",
      contents: [text]
    });
    return result.embeddings[0].values;
  } catch (error) {
    console.error("Embedding Error:", error);
    return [];
  }
};

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
          status: { type: Type.STRING, enum: ["Good", "Needs Improvement", "Weak"] }
        },
        required: ["name", "score", "feedback", "status"]
      }
    },
    snippets: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          engine: { type: Type.STRING, enum: ["google", "perplexity", "chatgpt", "claude"] },
          question: { type: Type.STRING },
          answer: { type: Type.STRING }
        },
        required: ["engine", "question", "answer"]
      }
    },
    geoInsight: {
      type: Type.OBJECT,
      properties: {
        visibilityIndex: { type: Type.NUMBER },
        entityDensity: { type: Type.NUMBER },
        citationConfidence: { type: Type.NUMBER },
        optimizationChecklist: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["visibilityIndex", "entityDensity", "citationConfidence", "optimizationChecklist"]
    }
  },
  required: ["totalScore", "summary", "metrics", "snippets", "geoInsight"]
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
        tldr: { type: Type.STRING }
      },
      required: ["basic", "linkedin", "newsroom", "faq", "tldr"]
    },
    checklists: {
      type: Type.OBJECT,
      properties: {
        basic: { type: Type.ARRAY, items: { type: Type.STRING } },
        linkedin: { type: Type.ARRAY, items: { type: Type.STRING } },
        newsroom: { type: Type.ARRAY, items: { type: Type.STRING } },
        faq: { type: Type.ARRAY, items: { type: Type.STRING } },
        tldr: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["basic", "linkedin", "newsroom", "faq", "tldr"]
    }
  },
  required: ["rewrites", "checklists"]
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function cleanJsonString(text: string): string {
    let clean = text.trim();
    if (clean.startsWith('```json')) clean = clean.replace(/^```json/, '').replace(/```\s*$/, '');
    else if (clean.startsWith('```')) clean = clean.replace(/^```/, '').replace(/```\s*$/, '');
    return clean;
}

export const validateApiKey = async (apiKey: string): Promise<boolean> => {
    if (!apiKey || apiKey.trim() === "") return false;
    try {
        const ai = new GoogleGenAI({ apiKey });
        await ai.models.generateContent({
            model: MODEL_NAME,
            contents: "hi",
            config: { maxOutputTokens: 1, thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } }
        });
        return true;
    } catch (error: any) {
        console.error("API Key Validation Failed:", error.message);
        return false;
    }
};

export const analyzeContent = async (text: string, retryCount = 0): Promise<AnalysisResult> => {
  const hash = generateHash(text);
  const cached = getCache<AnalysisResult>(`analysis_${hash}`);
  if (cached) return cached;

  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "AIzaSyCoSH6e5M-VGKT9hmE_IPXGMZzRalgy2EM";
  
  if (!apiKey || apiKey.trim() === "") {
    throw new Error("API_KEY_INVALID_OR_MISSING");
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: text,
      config: {
        systemInstruction: ANALYSIS_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.1,
        maxOutputTokens: 2048, // Reduced for speed
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } // Speed optimization
      }
    });

    if (!response.text) throw new Error("EMPTY_RESPONSE");
    const result = JSON.parse(cleanJsonString(response.text)) as AnalysisResult;
    setCache(`analysis_${hash}`, result);
    return result;

  } catch (error: any) {
    const errorMsg = error.message || "";
    if (errorMsg.includes("API key not valid")) throw new Error("API_KEY_INVALID_OR_MISSING");

    if (errorMsg.includes("500") || errorMsg.includes("503") || errorMsg.includes("overloaded")) {
        if (retryCount < 2) {
            await sleep(1000 * (retryCount + 1));
            return analyzeContent(text, retryCount + 1);
        }
        throw new Error("MODEL_OVERLOADED");
    }
    throw error;
  }
};

export const generateRewrites = async (text: string, retryCount = 0): Promise<{ rewrites: RewriteSet, checklists: any }> => {
  const hash = generateHash(text);
  const cached = getCache<{ rewrites: RewriteSet, checklists: any }>(`rewrite_${hash}`);
  if (cached) return cached;

  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "AIzaSyCoSH6e5M-VGKT9hmE_IPXGMZzRalgy2EM";
  if (!apiKey || apiKey.trim() === "") throw new Error("API_KEY_INVALID_OR_MISSING");

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: REWRITE_MODEL_NAME,
      contents: text,
      config: {
        systemInstruction: REWRITE_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: rewriteSchema,
        temperature: 0.7,
        maxOutputTokens: 4096, // Reduced for speed
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } // Speed optimization
      }
    });

    if (!response.text) throw new Error("EMPTY_RESPONSE");
    const result = JSON.parse(cleanJsonString(response.text));
    setCache(`rewrite_${hash}`, result);
    return result;

  } catch (error: any) {
    const errorMsg = error.message || "";
    if (errorMsg.includes("503") || errorMsg.includes("overloaded")) {
        if (retryCount < 1) {
            await sleep(1000);
            return generateRewrites(text, retryCount + 1);
        }
        throw new Error("MODEL_OVERLOADED");
    }
    throw error;
  }
};
