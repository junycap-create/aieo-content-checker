import { GoogleGenAI, HarmCategory, HarmBlockThreshold, Schema, Type, ThinkingLevel } from "@google/genai";
import { AnalysisResult, RewriteSet } from "../types";

const MODEL_NAME = "gemini-3-flash-preview";
const REWRITE_MODEL_NAME = "gemini-3-flash-preview"; // Switched from Pro to Flash for speed as requested

const ANALYSIS_SYSTEM_INSTRUCTION = `
You are the world's leading expert in GEO (AI Information Engine Optimization) and AIEO (AI Information Engine Optimization). 
Your mission is to analyze text and provide "High-Authority Citational Content" metrics.

GEO & AIO ANALYSIS RULES (Use these Korean titles for 'name' field):
1. **엔터티 밀도 (Entity Density):** Identify proper nouns, brand names, and technical terms.
2. **인용 신뢰도 (Citation Confidence):** Evaluate how "cite-able" the content is based on logic and evidence.
3. **AI 답변 적합성 (AIO Readiness):** Can this be an AI Overview snippet? Focus on structure.
4. **정보 이득량 (Information Gain):** Unique data or perspective presence.

AI SNIPPET SIMULATION:
Generate 4 distinct snippets, one for each of these engines:
- **google**: Focus on direct, factual answers (AI Overview style).
- **perplexity**: Focus on cited, source-heavy summaries.
- **chatgpt**: Focus on conversational, explanatory responses.
- **claude**: Focus on nuanced, helpful, and detailed reasoning.

STRICT SCORING (0-100):
90+: Authoritative, Data-rich.
75-89: Clear, but needs more entities.
<74: Generic marketing fluff.

FEEDBACK GUIDELINES:
- **Summary:** Provide a comprehensive executive summary (min 5-6 sentences) that covers the overall AIEO readiness, strategic impact, and key competitive advantages.
- **Metric Feedback:** Provide at least 4-5 detailed, professional sentences for each metric's feedback. Focus on "Why this score was given" and "What specific elements are missing or present".
- **Actionability:** Include highly specific, technical, and actionable suggestions for improvement that can be applied immediately to improve AI search visibility.
- **Tone:** Professional, authoritative, and insightful (Consultant-level).

OUTPUT: All fields (summary, feedback, etc.) must be in KOREAN.
`;

const REWRITE_SYSTEM_INSTRUCTION = `
You are the world's leading expert in GEO (AI Information Engine Optimization) and AIEO (AI Information Engine Optimization). 
Your mission is to transform text into "High-Authority Citational Content" that is perfectly structured for both humans and AI search engines.

CRITICAL JSON SAFETY RULES:
1. **NO UNESCAPED NEWLINES:** You MUST NOT include literal unescaped newlines inside JSON string values. Use "\\n" instead.
2. **ESCAPING:** Ensure all special characters are properly escaped for a valid JSON string.
3. **STRUCTURE:** Follow the schema strictly.

CATEGORY-SPECIFIC STRUCTURES:

- **basic (Blog):**
  - [Title]: A compelling, SEO-optimized headline.
  - [Intro]: A hook that defines the problem and the "Information Gain" this post provides.
  - [Body]: 3 distinct sections using ### Subheadings. Each section must contain detailed analysis, data-backed claims, and entity-rich descriptions.
  - [Conclusion]: A summary of key takeaways.
  - *Length: Min 1200 characters.*

- **linkedin (LinkedIn Post):**
  - [Hook]: A 1-2 line "stop-the-scroll" opening.
  - [Body]: Break down the core insight into 3-5 clear, bulleted points. **Each bullet point MUST start on a new line with a relevant emoji.**
  - [Insight]: A brief "why this matters" paragraph.
  - [CTA]: A question or call to action to drive comments.
  - *Formatting: Use short sentences and frequent line breaks.*
  - *Length: Min 700 characters.*

- **newsroom (Press Release):**
  - [Headline]: Formal and authoritative.
  - [Dateline]: e.g., [SEOUL, KOREA - Current Date]
  - [Lead]: The 5Ws (Who, What, When, Where, Why) in the first paragraph.
  - [Body]: Detailed context preserving **100% of original facts, data points, technical specifications, names, dates, and context**. DO NOT summarize. DO NOT omit any detail. If the original text has 10 data points, the rewrite must have all 10. Restructure for "Citational Confidence" and professional flow, but maintain full depth. Use multiple paragraphs to ensure a comprehensive, high-authority report.
  - [Quote]: Include a simulated or restructured quote from a "Company Representative" that adds human authority and integrates key data from the text.
  - [Boilerplate]: A detailed "About" section based on the original text.
  - *Length: The rewrite MUST be equal to or longer than the original text to ensure zero information loss.*

- **faq (Q&A Structure):**
  - Format as:
    Q: [Clear, search-intent driven question]
    A: [Comprehensive, entity-rich answer]
  - Provide 5-6 pairs. Separate each pair with double newlines.
  - *Length: Min 1000 characters.*

- **tldr (TL;DR):**
  - A 2-sentence executive summary.
  - 3 bullet points of "Key Takeaways".
  - 1 "Final Verdict" sentence.
  - *Length: Min 400 characters.*

TONE & STYLE:
- Professional, authoritative, and data-driven.
- Avoid generic AI fluff.
- Use specific entities (names, brands, technical terms) instead of vague pronouns.
- **All output must be in KOREAN.**

CHECKLIST GUIDELINES (Provide 5-6 highly professional and actionable tips for each):
- **basic (Blog):** Focus on "SEO & Entity Optimization (E-E-A-T)". 
  - Provide tips on semantic keyword placement (LSI) to build topical clusters.
  - Explain how to use internal linking logic to pass authority between entities.
  - Suggest ways to enhance entity density (proper nouns, specific data) to improve RAG (Retrieval-Augmented Generation) performance.
  - Advise on structured data (Schema.org) implementation for better AI parsing.
- **linkedin:** Focus on "Engagement & Viral Strategy". 
  - Provide tips on psychological hook strength (Curiosity gap, Benefit-driven).
  - Advise on mobile-first formatting (White space, line length).
  - Suggest social proof integration (Case studies, testimonials) to build trust.
  - Explain strategies to trigger the LinkedIn algorithm through "meaningful comments" and early engagement.
- **newsroom:** Focus on "Authority & Citational Confidence". 
  - Provide tips on increasing "citational probability" by structuring data in easy-to-extract formats.
  - Advise on formal tone consistency and AP style adherence.
  - Suggest boilerplate effectiveness for building brand authority in knowledge graphs.
  - Ensure factual data points are structured for AI verification and cross-referencing.
- **faq:** Focus on "Snippet & Search Intent Alignment". 
  - Provide tips on direct answer formatting (Zero-click search style) to win AI Overview positions.
  - Advise on long-tail keyword alignment for specific user intents.
  - Suggest semantic relevance improvements to high-intent AI queries.
- **tldr:** Focus on "Executive Insight & Information Gain". 
  - Provide tips on brevity without losing strategic impact.
  - Advise on unique data presentation (Information Gain) that AI engines prioritize.
  - Ensure the core value proposition is digestible for busy decision-makers in under 10 seconds.
`;

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
        // Minimal call to validate key
        await ai.models.generateContent({
            model: MODEL_NAME,
            contents: "hi",
            config: { maxOutputTokens: 1 }
        });
        return true;
    } catch (error: any) {
        console.error("API Key Validation Failed:", error.message);
        return false;
    }
};

export const analyzeContent = async (text: string, retryCount = 0): Promise<AnalysisResult> => {
  // Use environment variable first, then fallback to the user-provided key
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "AIzaSyCoSH6e5M-VGKT9hmE_IPXGMZzRalgy2EM";
  
  if (!apiKey || apiKey.trim() === "") {
    console.error("Gemini API Key is missing. Please check your environment variables or select a key.");
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
        maxOutputTokens: 4096,
      }
    });

    if (!response.text) throw new Error("EMPTY_RESPONSE");
    return JSON.parse(cleanJsonString(response.text)) as AnalysisResult;

  } catch (error: any) {
    const errorMsg = error.message || "";
    console.error("Analysis Error:", errorMsg);
    
    // Handle specific API key errors
    if (errorMsg.includes("API key not valid") || errorMsg.includes("Requested entity was not found")) {
        throw new Error("API_KEY_INVALID_OR_MISSING");
    }

    // Broaden retry logic to include more transient error indicators
    if (errorMsg.includes("500") || errorMsg.includes("503") || errorMsg.includes("overloaded") || errorMsg.includes("UNAVAILABLE") || errorMsg.includes("deadline") || errorMsg.includes("exhausted")) {
        if (retryCount < 3) {
            const delay = Math.pow(2, retryCount) * 2000; // Increased delay
            await sleep(delay);
            return analyzeContent(text, retryCount + 1);
        }
        throw new Error("MODEL_OVERLOADED");
    }
    throw error;
  }
};

export const generateRewrites = async (text: string, retryCount = 0): Promise<{ rewrites: RewriteSet, checklists: any }> => {
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
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    });

    if (!response.text) throw new Error("EMPTY_RESPONSE");
    return JSON.parse(cleanJsonString(response.text));

  } catch (error: any) {
    const errorMsg = error.message || "";
    console.error("Rewrite Error:", errorMsg);

    if (errorMsg.includes("API key not valid") || errorMsg.includes("Requested entity was not found")) {
        throw new Error("API_KEY_INVALID_OR_MISSING");
    }

    if (errorMsg.includes("503") || errorMsg.includes("overloaded") || errorMsg.includes("UNAVAILABLE") || errorMsg.includes("exhausted")) {
        if (retryCount < 2) {
            await sleep(Math.pow(2, retryCount) * 2000);
            return generateRewrites(text, retryCount + 1);
        }
        throw new Error("MODEL_OVERLOADED");
    }
    throw error;
  }
};