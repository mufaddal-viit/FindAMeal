import { AI_CONFIG } from "../config/ai.config";
import { HttpError } from "../utils/httpError";
import { detectInjectionAttempt, checkRateLimit, sanitizeFilters } from "./gemini/safeguards";
import { getAiProvider } from "./registry";
import type { AiSearchResult } from "./types";
import type { PlaceFilters } from "../types/placeFilters";

export async function findRestaurantsWithAI(
  rawFilters: PlaceFilters,
  requestIp: string
): Promise<AiSearchResult> {
  checkRateLimit(requestIp);

  const filters = sanitizeFilters(rawFilters);

  if (detectInjectionAttempt(filters)) {
    throw new HttpError(400, "Query contains disallowed content.");
  }

  const providerId = AI_CONFIG.selection.provider;
  const provider = getAiProvider(providerId);

  console.log("[ai-router] selected provider", {
    provider: providerId
  });

  const result = await provider.searchRestaurants(filters);

  console.log("[ai-router] provider succeeded", {
    provider: providerId,
    resultCount: result.data.length
  });

  return result;
}
