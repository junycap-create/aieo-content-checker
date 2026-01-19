
import { GoogleGenAI, HarmCategory, HarmBlockThreshold, Schema, Type } from "@google/genai";
import { AnalysisResult } from "../types";

// 지침에 따라 텍스트 작업을 위한 최신 모델 사용
const MODEL_NAME = "gemini-3-flash-preview";

const SYSTEM_INSTRUCTION = `
You are the AIEO (AI Information Engine Optimization) Engine. 
Your goal is to evaluate PR content based on how well it would be interpreted, summarized, and cited by LLM-based search engines (ChatGPT, Perplexity, Gemini).

**SCORING GUIDELINES (BE STRICT & CRITICAL):**
Do not be generous. Evaluate purely on "Machine Readability" and "Information Density", not literary quality.
- **90-100 (Excellent):** Perfect structure (Headlines, Bullet points), Verified Data (Specific numbers), Clear Definitions. Ready for immediate Featured Snippet citation.
- **75-89 (Good):** Clear message and logical flow, but lacks specific data points or structural formatting (e.g., paragraphs are too long).
- **50-74 (Average):** Vague assertions ("We are the best", "Innovative"), passive voice, lack of named entities/numbers. Hard for AI to extract facts.
- **0-49 (Weak):** Unstructured, purely emotional/marketing fluff, no factual basis, or incoherent.

**METRICS DEFINITION:**
1. **Structure Readability:** usage of formatting (headers, lists) vs wall of text.
2. **Data Presence:** usage of specific numbers, dates, proper nouns vs adjectives/adverbs.
3. **Coherence & Repetition:** consistent usage of key terms vs ambiguous pronouns (it, that, they).
4. **Snippetability:** presence of direct Q&A style sentences vs complex compound sentences.

**CONTENT INSTRUCTIONS:**
- **Rewrites:** Must be full-length and detailed.
- **Checklists:** For each rewrite type, provide 3 specific, actionable insights relevant to THAT specific format. 
  - For **basic (Blog)**, focus on SEO keywords and logical flow.
  - For **linkedin**, focus on hooks, emojis usage, and engagement.
  - For **newsroom**, focus on journalistic tone, objective facts, and boilerplate.
  - For **faq**, focus on user intent coverage and answer clarity.
  - For **tldr**, focus on key message extraction and brevity.
- **Language:** All feedback/text must be in KOREAN. Status values must be English.
`;

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    totalScore: { type: Type.NUMBER, description: "0-100 score" },
    summary: { type: Type.STRING, description: "Detailed executive summary in Korean (min 300 chars)" },
    metrics: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Metric Name in Korean" },
          score: { type: Type.NUMBER },
          feedback: { type: Type.STRING, description: "Specific feedback in Korean" },
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
          question: { type: Type.STRING, description: "Likely user query in Korean" },
          answer: { type: Type.STRING, description: "Detailed answer in Korean (3-5 sentences)" }
        },
        required: ["question", "answer"]
      }
    },
    rewrites: {
      type: Type.OBJECT,
      properties: {
        basic: { type: Type.STRING, description: "Full length Blog Post style in Korean (Markdown)" },
        linkedin: { type: Type.STRING, description: "LinkedIn style in Korean (Markdown)" },
        newsroom: { type: Type.STRING, description: "Press Release style in Korean (Markdown)" },
        faq: { type: Type.STRING, description: "Q&A style in Korean (Markdown)" },
        tldr: { type: Type.STRING, description: "TL;DR style in Korean (Markdown)" }
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

function cleanJsonString(text: string): string {
    let clean = text.trim();
    if (clean.startsWith('```json')) {
        clean = clean.replace(/^```json/, '').replace(/```\s*$/, '');
    } else if (clean.startsWith('```')) {
        clean = clean.replace(/^```/, '').replace(/```\s*$/, '');
    }
    return clean;
}

export const analyzeContent = async (text: string): Promise<AnalysisResult> => {
  // 호출 직전에 process.env.API_KEY를 참조하여 GoogleGenAI 인스턴스 생성
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey.trim() === "") {
    throw new Error("API_KEY_MISSING");
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
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        ],
      }
    });

    if (!response.text) {
        throw new Error("AI 응답이 비어있습니다.");
    }

    const cleanedText = cleanJsonString(response.text);
    return JSON.parse(cleanedText) as AnalysisResult;

  } catch (error: any) {
    // "Requested entity was not found" 에러는 대개 API 키 문제이므로 상위로 전달하여 처리
    if (error.message?.includes("Requested entity was not found")) {
        throw new Error("API_KEY_INVALID");
    }
    throw error;
  }
};
