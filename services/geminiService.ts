import { GoogleGenAI, HarmCategory, HarmBlockThreshold, Schema, Type } from "@google/genai";
import { AnalysisResult } from "../types";

// 초고속 처리를 위해 Flash 모델 고정
const MODEL_NAME = "gemini-3-flash-preview";

const SYSTEM_INSTRUCTION = `
You are the AIEO (AI Information Engine Optimization) Engine. 
Evaluate PR content for LLM citation readiness. Be strict.

SCORING (0-100):
90+: Structurally perfect, Data-heavy.
75-89: Clear flow, lacks density.
<74: Vague adjectives, marketing fluff.

METRICS: Structure, Data, Coherence, Snippetability.
LANGUAGE: Korean (All content/feedback). Status: English.
`;

const responseSchema: Schema = {
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
          question: { type: Type.STRING },
          answer: { type: Type.STRING }
        },
        required: ["question", "answer"]
      }
    },
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
  required: ["totalScore", "summary", "metrics", "snippets", "rewrites", "checklists"]
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function cleanJsonString(text: string): string {
    let clean = text.trim();
    if (clean.startsWith('```json')) clean = clean.replace(/^```json/, '').replace(/```\s*$/, '');
    else if (clean.startsWith('```')) clean = clean.replace(/^```/, '').replace(/```\s*$/, '');
    return clean;
}

export const analyzeContent = async (text: string, retryCount = 0): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey.trim() === "") throw new Error("API_KEY_INVALID_OR_MISSING");

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: text,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        thinkingConfig: { thinkingBudget: 4096 }, // 속도와 분석 질의 균형을 위해 4k로 최적화
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        ],
      }
    });

    if (!response.text) throw new Error("EMPTY_RESPONSE");
    return JSON.parse(cleanJsonString(response.text)) as AnalysisResult;

  } catch (error: any) {
    const errorMsg = error.message || "";
    if (errorMsg.includes("503") || errorMsg.includes("overloaded") || errorMsg.includes("UNAVAILABLE")) {
        if (retryCount < 2) {
            await sleep(Math.pow(2, retryCount) * 1000);
            return analyzeContent(text, retryCount + 1);
        }
        throw new Error("MODEL_OVERLOADED");
    }
    if (errorMsg.includes("API Key") || errorMsg.includes("not found")) throw new Error("API_KEY_INVALID_OR_MISSING");
    throw error;
  }
};