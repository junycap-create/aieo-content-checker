import { GoogleGenAI, HarmCategory, HarmBlockThreshold, Schema, Type } from "@google/genai";
import { AnalysisResult } from "../types";

// 1.5x 이상의 속도 향상을 위해 Flash 모델 사용 (추론 효율성 최적화)
const MODEL_NAME = "gemini-3-flash-preview";

const SYSTEM_INSTRUCTION = `
You are the AIEO (AI Information Engine Optimization) Engine. 
Goal: Evaluate PR content for LLM-based search engine citation readiness.

STRICT SCORING (0-100):
- 90+: Perfect structure, Specific Data, Clear Entities.
- 75-89: Logical flow, but lacks structural density.
- 50-74: Vague adjectives, marketing fluff, no facts.
- 0-49: Unstructured, emotional, or incoherent.

METRICS: Structure, Data Presence, Coherence, Snippetability.
OUTPUT: Detailed summary, metrics, predicted Q&A snippets, and channel-specific rewrites.
LANGUAGE: Korean (Feedback/Content), English (Status/Enum).
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
    if (clean.startsWith('```json')) {
        clean = clean.replace(/^```json/, '').replace(/```\s*$/, '');
    } else if (clean.startsWith('```')) {
        clean = clean.replace(/^```/, '').replace(/```\s*$/, '');
    }
    return clean;
}

export const analyzeContent = async (text: string, retryCount = 0): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey.trim() === "") {
    throw new Error("API_KEY_INVALID_OR_MISSING");
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: text,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        // 속도 향상을 위해 thinking budget을 8k로 최적화 (분석의 질과 속도의 균형)
        thinkingConfig: { thinkingBudget: 8192 },
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        ],
      }
    });

    if (!response.text) {
        throw new Error("EMPTY_RESPONSE");
    }

    const cleanedText = cleanJsonString(response.text);
    return JSON.parse(cleanedText) as AnalysisResult;

  } catch (error: any) {
    const errorMsg = error.message || "";
    
    // 503 Error (Overloaded) 핸들링 유지
    if (errorMsg.includes("503") || errorMsg.includes("overloaded") || errorMsg.includes("UNAVAILABLE")) {
        if (retryCount < 2) {
            const waitTime = Math.pow(2, retryCount) * 1500; // 재시도 대기 시간 단축 (1.5s, 3s)
            console.warn(`Model overloaded. Retrying in ${waitTime}ms...`);
            await sleep(waitTime);
            return analyzeContent(text, retryCount + 1);
        }
        throw new Error("MODEL_OVERLOADED");
    }

    if (errorMsg.includes("API Key must be set") || errorMsg.includes("Requested entity was not found")) {
        throw new Error("API_KEY_INVALID_OR_MISSING");
    }
    
    throw error;
  }
};