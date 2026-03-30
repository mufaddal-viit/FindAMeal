import { AI_CONFIG } from "../../config/ai.config";
import type { AiSearchFilters } from "./types";

export function buildRestaurantSearchPrompt(filters: AiSearchFilters) {
  const {
    query,
    location,
    lat,
    lng,
    category,
    radiusKm,
    minRating,
    priceLevels,
    openNow,
    sort,
    page,
    pageSize
  } = filters;
  const activeFilters: string[] = [];

  if (category) {
    activeFilters.push(`- Cuisine or category must match: ${category}`);
  }

  if (typeof radiusKm === "number") {
    activeFilters.push(
      `- Only include restaurants within ${radiusKm} km of the user location when that can be verified.`
    );
  }

  if (typeof minRating === "number") {
    activeFilters.push(
      `- Never include a restaurant rated below ${minRating} out of 5.`
    );
  }

  if (priceLevels && priceLevels.length > 0) {
    activeFilters.push(
      `- Only include restaurants with one of these price levels: ${priceLevels.join(", ")}.`
    );
  }

  if (openNow) {
    activeFilters.push("- Only include restaurants that are open now.");
  }

  switch (sort) {
    case "distance":
      activeFilters.push("- Prefer the nearest verified restaurants first.");
      break;
    case "price-low":
      activeFilters.push("- Prefer more affordable restaurants first.");
      break;
    case "price-high":
      activeFilters.push("- Prefer premium restaurants first.");
      break;
    case "rating":
    default:
      activeFilters.push("- Prefer the highest rated relevant restaurants first.");
      break;
  }

  activeFilters.push(
    `- Return the results for page ${page} with up to ${pageSize} restaurants.`
  );

  return `
ROLE:
You are a restaurant search assistant embedded in a food discovery app.
Your job is to find real, existing restaurants based on the user's location and search filters.

STRICT RULES:
- Return only a valid JSON array. No explanation, no markdown, no code fences.
- Never invent or hallucinate restaurants. Only include places you can ground with Google Search.
- If you cannot verify a field, use null instead of guessing.
- Respect every active filter exactly.
- Return at most ${Math.min(pageSize, AI_CONFIG.search.maxResults)} restaurants.
- If fewer than ${AI_CONFIG.search.minResults} verified matches exist, return an empty array [].

USER LOCATION:
- Address: ${location}
- Coordinates: ${typeof lat === "number" && typeof lng === "number" ? `${lat}, ${lng}` : "not provided"}

USER QUERY:
"${query}"

ACTIVE FILTERS:
${activeFilters.join("\n")}

OUTPUT FORMAT:
[
  {
    "name": "exact restaurant name",
    "description": "one sentence explaining why this restaurant matches the search intent",
    "address": "full street address",
    "city": "city name or null",
    "country": "country name or null",
    "cuisines": ["array", "of", "cuisine", "labels"],
    "rating": "number between 0 and 5 or null",
    "priceLevel": "$ | $$ | $$$ | $$$$ | null",
    "priceRange": "budget | mid | premium | null",
    "openNow": "boolean or null",
    "distanceKm": "number or null",
    "latitude": "number or null",
    "longitude": "number or null",
    "tags": ["array", "of", "keyword", "tags"],
    "sourceUrl": "https://... or null"
  }
]
`.trim();
}
