import { PRICE_LEVEL_VALUES, PRICE_RANGE_VALUES } from "../types/place";
import { PLACE_SORT_VALUES } from "../types/placeFilters";

export const AI_CONFIG = {
  model: {
    name: "gemini-2.5-flash",
    maxInputTokens: 1500,
    maxOutputTokens: 4096,
    temperature: 0.2,
    topP: 0.8,
  },
  search: {
    maxResults: 10,
    minResults: 1,
  },
  rateLimit: {
    maxRequestsPerMinute: 10,
    maxRequestsPerDay: 200,
  },
  timeout: {
    requestMs: 30000,
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
