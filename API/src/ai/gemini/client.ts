import { AI_CONFIG } from "../../config/ai.config";
import { env } from "../../config/env";
import { HttpError } from "../../utils/httpError";
import type { AiModelConfig } from "../types";

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
  const defaultModelConfig = AI_CONFIG.models["gemini-flash"];

  return getGeminiGenerateConfigForModel(defaultModelConfig);
}

export function getGeminiGenerateConfigForModel(modelConfig: AiModelConfig) {
  return {
    temperature: modelConfig.temperature,
    topP: modelConfig.topP,
    maxOutputTokens: modelConfig.maxOutputTokens,
    tools: [{ googleSearch: {} }]
  };
}
