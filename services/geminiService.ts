import { GoogleGenAI, HarmCategory, HarmBlockThreshold, Schema, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const MODEL_NAME = "gemini-3-flash-preview";

const SYSTEM_INSTRUCTION = `
You are the world-class GEO (Generative Engine Optimization) & AIEO Specialist. 
Your goal is to transform standard PR content into "AI-First" authority content.

GEO ANALYSIS CRITERIA:
1. **Entity Density:** High usage of proper nouns and specific named entities.
2. **Authority & Citability:** Presence of unique data, quotes, and verifiable facts that AI models prefer to cite as sources.
3. **Direct Answerability:** How easily can a Generative Engine (AIO) convert this into a direct answer.
4. **Information Gain:** Does this provide new information compared to common knowledge?

STRICT SCORING (0-100):
90+: High Authority, Verifiable Data, Excellent Structure.
75-89: Clear, but needs more "Cite-able" elements (Specific names, stats).
<74: Generic marketing fluff, lack of entities, hard for AI to cite.

OUTPUT REQUIREMENTS:
- All text feedback in KOREAN.
- Strictly follow the JSON Schema.
- Provide a 'geoInsight' object focusing on Visibility and Citability.
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
  required: ["totalScore", "summary", "metrics", "snippets", "rewrites", "checklists", "geoInsight"]
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
        thinkingConfig: { thinkingBudget: 4096 },
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
    throw error;
  }
};