import { z } from "zod";
import { AI_CONFIG } from "../../config/ai.config";
import {
  PRICE_LEVEL_VALUES,
  PRICE_RANGE_VALUES
} from "../../types/place";
import { GeminiParseError } from "./safeguards";
import type { AiParsedResponse, AiRawRestaurant } from "./types";

interface GeminiCandidate {
  groundingMetadata?: {
    webSearchQueries?: string[];
    groundingChunks?: Array<{
      web?: {
        uri?: string;
      };
    }>;
  };
}

interface GeminiResponseLike {
  text?: string | (() => string);
  candidates?: GeminiCandidate[];
}

const rawRestaurantSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  address: z.string().trim().min(1),
  city: z.string().trim().min(1).nullable(),
  country: z.string().trim().min(1).nullable(),
  cuisines: z.array(z.string().trim().min(1)).max(8),
  rating: z.number().min(0).max(5).nullable(),
  priceLevel: z.enum(PRICE_LEVEL_VALUES).nullable(),
  priceRange: z.enum(PRICE_RANGE_VALUES).nullable(),
  openNow: z.boolean().nullable(),
  distanceKm: z.number().min(0).nullable(),
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
  tags: z.array(z.string().trim().min(1)).max(10),
  sourceUrl: z.string().url().nullable()
});

const rawRestaurantArraySchema = z.array(rawRestaurantSchema);

function getResponseText(response: GeminiResponseLike) {
  if (typeof response.text === "function") {
    return response.text();
  }

  return response.text ?? "";
}

function normalizeRestaurant(rawRestaurant: z.infer<typeof rawRestaurantSchema>): AiRawRestaurant {
  return {
    ...rawRestaurant,
    cuisines: Array.from(new Set(rawRestaurant.cuisines)),
    tags: Array.from(new Set(rawRestaurant.tags))
  };
}

export function parseGeminiResponse(response: GeminiResponseLike): AiParsedResponse {
  const rawText = getResponseText(response).trim();

  if (!rawText) {
    throw new GeminiParseError("Gemini returned an empty response.");
  }

  const cleanedText = rawText
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(cleanedText);
  } catch {
    throw new GeminiParseError(
      `Failed to parse Gemini response as JSON. Raw snippet: "${cleanedText.slice(0, 160)}"`
    );
  }

  const parsedArray = rawRestaurantArraySchema.safeParse(parsedJson);

  if (!parsedArray.success) {
    throw new GeminiParseError(
      parsedArray.error.issues[0]?.message ?? "Gemini returned malformed restaurant data."
    );
  }

  const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
  const searchQueries = groundingMetadata?.webSearchQueries ?? [];
  const sources = (groundingMetadata?.groundingChunks ?? [])
    .map((chunk) => chunk.web?.uri)
    .filter((uri): uri is string => Boolean(uri))
    .filter((uri) => {
      try {
        new URL(uri);
        return true;
      } catch {
        return false;
      }
    });

  return {
    results: parsedArray.data
      .map(normalizeRestaurant)
      .slice(0, AI_CONFIG.search.maxResults),
    searchQueries,
    sources
  };
}
