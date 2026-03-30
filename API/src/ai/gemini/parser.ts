import { z } from "zod";
import { AI_CONFIG } from "../../config/ai.config";
import { PRICE_LEVEL_VALUES, PRICE_RANGE_VALUES } from "../../types/place";
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
  sourceUrl: z.string().url().nullable(),
});

const rawRestaurantArraySchema = z.array(rawRestaurantSchema);
const wrappedRestaurantArraySchema = z.object({
  results: rawRestaurantArraySchema
});

function previewText(value: string, maxLength = 200) {
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}

function logParser(step: string, details?: Record<string, unknown>) {
  if (details) {
    console.log(`[ai-parser] ${step}`, details);
    return;
  }

  console.log(`[ai-parser] ${step}`);
}

function getResponseText(response: GeminiResponseLike) {
  if (typeof response.text === "function") {
    return response.text();
  }

  return response.text ?? "";
}

function normalizeRestaurant(
  rawRestaurant: z.infer<typeof rawRestaurantSchema>,
): AiRawRestaurant {
  return {
    ...rawRestaurant,
    cuisines: Array.from(new Set(rawRestaurant.cuisines)),
    tags: Array.from(new Set(rawRestaurant.tags)),
  };
}

function extractBalancedJsonSegment(text: string, opener: "[" | "{") {
  const closer = opener === "[" ? "]" : "}";
  const startIndex = text.indexOf(opener);

  if (startIndex === -1) {
    return null;
  }

  let depth = 0;
  let inString = false;
  let isEscaped = false;

  for (let index = startIndex; index < text.length; index += 1) {
    const character = text[index];

    if (isEscaped) {
      isEscaped = false;
      continue;
    }

    if (inString && character === "\\") {
      isEscaped = true;
      continue;
    }

    if (character === "\"") {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (character === opener) {
      depth += 1;
      continue;
    }

    if (character === closer) {
      depth -= 1;

      if (depth === 0) {
        return text.slice(startIndex, index + 1);
      }
    }
  }

  return null;
}

function getJsonCandidates(rawText: string) {
  const cleanedText = rawText
    .replace(/```json/gi, "```")
    .replace(/```/g, "")
    .trim();
  const candidates = new Set<string>([cleanedText]);
  const arrayCandidate = extractBalancedJsonSegment(cleanedText, "[");
  const objectCandidate = extractBalancedJsonSegment(cleanedText, "{");

  if (arrayCandidate) {
    candidates.add(arrayCandidate);
  }

  if (objectCandidate) {
    candidates.add(objectCandidate);
  }

  return Array.from(candidates);
}

function normalizeParsedPayload(parsedJson: unknown) {
  const parsedArray = rawRestaurantArraySchema.safeParse(parsedJson);

  if (parsedArray.success) {
    return parsedArray.data;
  }

  const wrappedArray = wrappedRestaurantArraySchema.safeParse(parsedJson);

  if (wrappedArray.success) {
    return wrappedArray.data.results;
  }

  return null;
}

export function parseGeminiResponse(
  response: GeminiResponseLike,
): AiParsedResponse {
  const rawText = getResponseText(response).trim();

  logParser("received response", {
    rawLength: rawText.length,
    rawPreview: previewText(rawText)
  });

  if (!rawText) {
    logParser("empty response");
    throw new GeminiParseError("Gemini returned an empty response.");
  }

  const jsonCandidates = getJsonCandidates(rawText);

  logParser("generated JSON candidates", {
    candidateCount: jsonCandidates.length,
    candidates: jsonCandidates.map((candidate, index) => ({
      index,
      preview: previewText(candidate, 160)
    }))
  });

  for (const [index, candidate] of jsonCandidates.entries()) {
    try {
      logParser("trying candidate", {
        index,
        preview: previewText(candidate, 160)
      });

      const parsedJson = JSON.parse(candidate);
      const parsedRootType = Array.isArray(parsedJson)
        ? "array"
        : parsedJson === null
          ? "null"
          : typeof parsedJson;

      logParser("candidate JSON parsed", {
        index,
        parsedRootType
      });

      const normalizedResults = normalizeParsedPayload(parsedJson);

      if (!normalizedResults) {
        logParser("candidate rejected by schema", {
          index,
          parsedRootType
        });
        continue;
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

      logParser("candidate accepted", {
        index,
        resultCount: normalizedResults.length,
        searchQueryCount: searchQueries.length,
        sourceCount: sources.length
      });

      return {
        results: normalizedResults
          .map(normalizeRestaurant)
          .slice(0, AI_CONFIG.search.maxResults),
        searchQueries,
        sources,
      };
    } catch (error) {
      logParser("candidate parse failed", {
        index,
        message: error instanceof Error ? error.message : "Unknown parse error"
      });
      continue;
    }
  }

  logParser("all candidates failed", {
    rawPreview: previewText(rawText)
  });

  throw new GeminiParseError(
    `Failed to parse Gemini response as JSON. Raw snippet: "${rawText.slice(0, 200)}"`,
  );
}
