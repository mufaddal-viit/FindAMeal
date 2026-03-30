import { AI_CONFIG } from "../../config/ai.config";
import { env } from "../../config/env";
import { HttpError } from "../../utils/httpError";

export interface GeminiClientLike {
  models: {
    generateContent: (input: {
      model: string;
      contents: string;
      config: ReturnType<typeof getGeminiGenerateConfig>;
    }) => Promise<unknown>;
  };
}

let geminiClientPromise: Promise<GeminiClientLike> | null = null;

export async function getGeminiClient() {
  if (!env.geminiApiKey) {
    throw new HttpError(500, "GEMINI_API_KEY is not configured.");
  }

  if (!geminiClientPromise) {
    geminiClientPromise = import("@google/genai").then(({ GoogleGenAI }) => {
      return new GoogleGenAI({
        apiKey: env.geminiApiKey
      });
    });
  }

  return geminiClientPromise;
}

export function getGeminiGenerateConfig() {
  return {
    temperature: AI_CONFIG.model.temperature,
    topP: AI_CONFIG.model.topP,
    maxOutputTokens: AI_CONFIG.model.maxOutputTokens,
    tools: [{ googleSearch: {} }]
  };
}
