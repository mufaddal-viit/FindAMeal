import { PRICE_LEVEL_VALUES, PRICE_RANGE_VALUES } from "../types/place";
import { PLACE_SORT_VALUES } from "../types/placeFilters";
import type { AiModelConfig, AiProviderId } from "../ai/types";
import { AI_PROVIDER_IDS } from "../ai/types";
import { env } from "./env";

const FLASH_PROVIDER_ID = "gemini-flash" satisfies AiProviderId;
const PRO_PROVIDER_ID = "gemini-pro" satisfies AiProviderId;
const GROQ_PROVIDER_ID = "groq-llama-3.3-70b" satisfies AiProviderId;

const models = {
  [FLASH_PROVIDER_ID]: {
    id: FLASH_PROVIDER_ID,
    label: "Gemini 2.5 Flash",
    modelName: "gemini-2.5-flash",
    maxInputTokens: 1500,
    maxOutputTokens: 4096,
    temperature: 0.2,
    topP: 0.8,
    timeoutMs: 30000
  },
  [PRO_PROVIDER_ID]: {
    id: PRO_PROVIDER_ID,
    label: "Gemini 2.5 Pro",
    modelName: "gemini-2.5-pro",
    maxInputTokens: 1500,
    maxOutputTokens: 4096,
    temperature: 0.15,
    topP: 0.8,
    timeoutMs: 45000
  },
  [GROQ_PROVIDER_ID]: {
    id: GROQ_PROVIDER_ID,
    label: "Groq Llama 3.3 70B",
    modelName: "llama-3.3-70b-versatile",
    maxInputTokens: 8192,
    maxOutputTokens: 4096,
    temperature: 0.2,
    topP: 0.8,
    timeoutMs: 30000
  }
} as const satisfies Record<AiProviderId, AiModelConfig>;

const selectedProvider = AI_PROVIDER_IDS.includes(env.aiProvider as AiProviderId)
  ? (env.aiProvider as AiProviderId)
  : FLASH_PROVIDER_ID;

export const AI_CONFIG = {
  selection: {
    provider: selectedProvider
  },
  models,
  search: {
    maxResults: 10,
    minResults: 1,
  },
  rateLimit: {
    maxRequestsPerMinute: 10,
    maxRequestsPerDay: 200,
  },
  input: {
    maxQueryLength: 200,
    maxLocationLength: 300,
    maxCategoryLength: 60,
    forbiddenPatterns: [
      /ignore previous instructions/i,
      /system prompt/i,
      /you are now/i,
      /forget everything/i,
      /disregard/i,
      /<script/i,
    ],
  },
  response: {
    validPriceLevels: PRICE_LEVEL_VALUES,
    validPriceRanges: PRICE_RANGE_VALUES,
    validSortValues: PLACE_SORT_VALUES,
    placeholderImageUrl:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
  },
  cache: {
    resultTtlMs: 30 * 60 * 1000,
  },
} as const;
