import { createHash } from "node:crypto";
import { AI_CONFIG } from "../../config/ai.config";
import type { PlaceSummary } from "../../types/place";
import type { PlaceFilters } from "../../types/placeFilters";
import { HttpError } from "../../utils/httpError";
import { getGeminiClient, getGeminiGenerateConfig } from "./client";
import { parseGeminiResponse } from "./parser";
import { buildRestaurantSearchPrompt } from "./prompt";
import {
  GeminiTimeoutError,
  InjectionError,
  assertTokenBudget,
  checkRateLimit,
  detectInjectionAttempt,
  sanitizeFilters,
} from "./safeguards";
import type { AiRawRestaurant, AiSearchResult } from "./types";

function generatePlaceId(rawRestaurant: AiRawRestaurant) {
  const idSeed = [
    rawRestaurant.name,
    rawRestaurant.address,
    rawRestaurant.sourceUrl ?? "",
  ].join("|");
  const hash = createHash("sha1").update(idSeed).digest("hex").slice(0, 12);

  return `ai-${hash}`;
}

function toCoordinates(rawRestaurant: AiRawRestaurant) {
  if (
    typeof rawRestaurant.latitude !== "number" ||
    typeof rawRestaurant.longitude !== "number"
  ) {
    return null;
  }

  return {
    latitude: rawRestaurant.latitude,
    longitude: rawRestaurant.longitude,
  };
}

function toPlaceSummary(rawRestaurant: AiRawRestaurant): PlaceSummary {
  const coordinates = toCoordinates(rawRestaurant);

  return {
    id: generatePlaceId(rawRestaurant),
    name: rawRestaurant.name,
    description: rawRestaurant.description,
    address: rawRestaurant.address,
    city: rawRestaurant.city ?? "Unknown city",
    country: rawRestaurant.country ?? "Unknown country",
    cuisines: rawRestaurant.cuisines,
    imageUrl: AI_CONFIG.response.placeholderImageUrl,
    rating: rawRestaurant.rating,
    priceLevel: rawRestaurant.priceLevel,
    priceRange: rawRestaurant.priceRange,
    openNow: rawRestaurant.openNow,
    distanceKm: rawRestaurant.distanceKm,
    sourceUrl: rawRestaurant.sourceUrl,
    tags: rawRestaurant.tags,
    coordinates,
  };
}

function dedupePlaces(places: PlaceSummary[]) {
  return Array.from(new Map(places.map((place) => [place.id, place])).values());
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  let timeoutId: NodeJS.Timeout | null = null;

  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new GeminiTimeoutError());
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

export async function findRestaurantsWithAI(
  rawFilters: PlaceFilters,
  requestIp: string,
): Promise<AiSearchResult> {
  checkRateLimit(requestIp);

  const filters = sanitizeFilters(rawFilters);

  if (detectInjectionAttempt(filters)) {
    throw new InjectionError();
  }

  const prompt = buildRestaurantSearchPrompt(filters);
  assertTokenBudget(prompt);
  console.log(prompt);
  const client = await getGeminiClient();

  try {
    const response = await withTimeout(
      client.models.generateContent({
        model: AI_CONFIG.model.name,
        contents: prompt,
        config: getGeminiGenerateConfig(),
      }),
      AI_CONFIG.timeout.requestMs,
    );
    const parsedResponse = parseGeminiResponse(
      response as Parameters<typeof parseGeminiResponse>[0],
    );
    const places = dedupePlaces(parsedResponse.results.map(toPlaceSummary));
    

    return {
      data: places,
      meta: {
        queryUsed: filters.query,
        searchQueries: parsedResponse.searchQueries,
        sources: parsedResponse.sources,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(
      502,
      error instanceof Error
        ? `Gemini API call failed: ${error.message}`
        : "Gemini API call failed.",
    );
  }
}
