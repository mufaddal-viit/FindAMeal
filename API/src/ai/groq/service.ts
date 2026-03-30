import { createHash } from "node:crypto";
import { AI_CONFIG } from "../../config/ai.config";
import type { PlaceSummary } from "../../types/place";
import { HttpError } from "../../utils/httpError";
import { buildRestaurantSearchPrompt } from "../gemini/prompt";
import { GeminiTimeoutError, assertTokenBudget } from "../gemini/safeguards";
import type {
  AiModelConfig,
  AiRawRestaurant,
  AiSearchFilters,
  AiSearchProvider,
  AiSearchResult
} from "../types";
import { createGroqChatCompletion } from "./client";
import { parseGroqResponse } from "./parser";

function generatePlaceId(rawRestaurant: AiRawRestaurant) {
  const idSeed = [
    rawRestaurant.name,
    rawRestaurant.address,
    rawRestaurant.sourceUrl ?? ""
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
    longitude: rawRestaurant.longitude
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
    coordinates
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
      })
    ]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

async function searchWithGroqModel(
  filters: AiSearchFilters,
  modelConfig: AiModelConfig
): Promise<AiSearchResult> {
  const prompt = buildRestaurantSearchPrompt(filters);
  const estimatedTokens = assertTokenBudget(prompt, modelConfig.maxInputTokens);

  console.log("[ai-provider] prompt built", {
    provider: modelConfig.id,
    model: modelConfig.modelName,
    estimatedTokens
  });

  try {
    const response = await withTimeout(
      createGroqChatCompletion(modelConfig, prompt),
      modelConfig.timeoutMs
    );
    const parsedResponse = parseGroqResponse(response);
    const places = dedupePlaces(parsedResponse.results.map(toPlaceSummary));

    return {
      data: places,
      meta: {
        provider: modelConfig.id,
        model: modelConfig.modelName,
        queryUsed: filters.query,
        searchQueries: parsedResponse.searchQueries,
        sources: parsedResponse.sources,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(
      502,
      error instanceof Error
        ? `${modelConfig.label} call failed: ${error.message}`
        : `${modelConfig.label} call failed.`
    );
  }
}

export function createGroqProvider(modelConfig: AiModelConfig): AiSearchProvider {
  return {
    id: modelConfig.id,
    searchRestaurants(filters) {
      return searchWithGroqModel(filters, modelConfig);
    }
  };
}
