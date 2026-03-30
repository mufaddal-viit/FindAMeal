import { AI_CONFIG } from "../../config/ai.config";
import type { PlaceFilters } from "../../types/placeFilters";
import { HttpError } from "../../utils/httpError";
import type { AiSearchFilters } from "./types";

const rateLimitStore = new Map<
  string,
  { count: number; windowStart: number; dayCount: number; dayStart: number }
>();

function sanitizeString(value: string, maxLength: number) {
  return value
    .replace(/[<>"'`]/g, "")
    .replace(/\\/g, "")
    .trim()
    .slice(0, maxLength);
}

export function sanitizeFilters(rawFilters: PlaceFilters): AiSearchFilters {
  const location = sanitizeString(
    rawFilters.location,
    AI_CONFIG.input.maxLocationLength
  );

  if (!location) {
    throw new HttpError(400, "Location is required.");
  }

  const query = sanitizeString(
    rawFilters.query ?? "",
    AI_CONFIG.input.maxQueryLength
  );
  const category = rawFilters.category
    ? sanitizeString(rawFilters.category, AI_CONFIG.input.maxCategoryLength) ||
      undefined
    : undefined;

  return {
    ...rawFilters,
    query: query || "restaurants",
    location,
    category,
    priceLevels: rawFilters.priceLevels
      ? Array.from(new Set(rawFilters.priceLevels))
      : undefined
  };
}

export function detectInjectionAttempt(filters: Pick<AiSearchFilters, "query" | "location" | "category">) {
  const valuesToCheck = [filters.query, filters.location, filters.category].filter(
    (value): value is string => Boolean(value)
  );

  return valuesToCheck.some((value) =>
    AI_CONFIG.input.forbiddenPatterns.some((pattern) => pattern.test(value))
  );
}

export function estimateTokens(text: string) {
  return Math.ceil(text.length / 4);
}

export function assertTokenBudget(promptText: string, maxInputTokens: number) {
  const estimatedTokenCount = estimateTokens(promptText);

  if (estimatedTokenCount > maxInputTokens) {
    throw new HttpError(
      400,
      `Prompt too large: estimated ${estimatedTokenCount} tokens exceeds the limit of ${maxInputTokens}.`
    );
  }

  return estimatedTokenCount;
}

export function checkRateLimit(ipAddress: string) {
  const now = Date.now();
  const currentEntry = rateLimitStore.get(ipAddress) ?? {
    count: 0,
    windowStart: now,
    dayCount: 0,
    dayStart: now
  };

  if (now - currentEntry.windowStart > 60_000) {
    currentEntry.count = 0;
    currentEntry.windowStart = now;
  }

  if (now - currentEntry.dayStart > 86_400_000) {
    currentEntry.dayCount = 0;
    currentEntry.dayStart = now;
  }

  if (currentEntry.count >= AI_CONFIG.rateLimit.maxRequestsPerMinute) {
    throw new RateLimitError(
      "AI rate limit exceeded: too many requests in the last minute."
    );
  }

  if (currentEntry.dayCount >= AI_CONFIG.rateLimit.maxRequestsPerDay) {
    throw new RateLimitError(
      "AI rate limit exceeded: the daily quota has been reached."
    );
  }

  currentEntry.count += 1;
  currentEntry.dayCount += 1;
  rateLimitStore.set(ipAddress, currentEntry);
}

export class RateLimitError extends HttpError {
  constructor(message: string) {
    super(429, message);
    this.name = "RateLimitError";
  }
}

export class InjectionError extends HttpError {
  constructor(message = "Query contains disallowed content.") {
    super(400, message);
    this.name = "InjectionError";
  }
}

export class GeminiParseError extends HttpError {
  constructor(message: string) {
    super(502, message);
    this.name = "GeminiParseError";
  }
}

export class GeminiTimeoutError extends HttpError {
  constructor() {
    super(504, "AI service timed out.");
    this.name = "GeminiTimeoutError";
  }
}
