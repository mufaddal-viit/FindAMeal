import type { Coordinates, PlaceSummary, PriceLevel, PriceRange } from "../types/place";
import type { PlaceFilters } from "../types/placeFilters";

export const AI_PROVIDER_IDS = [
  "gemini-flash",
  "gemini-pro",
  "groq-llama-3.3-70b"
] as const;

export type AiProviderId = (typeof AI_PROVIDER_IDS)[number];

export interface AiSearchFilters extends PlaceFilters {
  query: string;
  location: string;
}

export interface AiRawRestaurant {
  name: string;
  description: string;
  address: string;
  city: string | null;
  country: string | null;
  cuisines: string[];
  rating: number | null;
  priceLevel: PriceLevel | null;
  priceRange: PriceRange | null;
  openNow: boolean | null;
  distanceKm: number | null;
  latitude: number | null;
  longitude: number | null;
  tags: string[];
  sourceUrl: string | null;
}

export interface AiParsedResponse {
  results: AiRawRestaurant[];
  searchQueries: string[];
  sources: string[];
}

export interface AiSearchMetadata {
  provider: AiProviderId;
  model: string;
  queryUsed: string;
  searchQueries: string[];
  sources: string[];
  timestamp: string;
}

export interface AiSearchResult {
  data: PlaceSummary[];
  meta: AiSearchMetadata;
}

export interface PlaceSearchRequestBody {
  query?: string;
  location?: string;
  category?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  minRating?: number;
  priceLevels?: PriceLevel[];
  openNow?: boolean;
  sort?: PlaceFilters["sort"];
  page?: number;
  pageSize?: number;
}

export interface ResolvedCoordinates extends Coordinates {
  latitude: number;
  longitude: number;
}

export interface AiModelConfig {
  id: AiProviderId;
  label: string;
  modelName: string;
  maxInputTokens: number;
  maxOutputTokens: number;
  temperature: number;
  topP: number;
  timeoutMs: number;
}

export interface AiSearchProvider {
  id: AiProviderId;
  searchRestaurants(filters: AiSearchFilters): Promise<AiSearchResult>;
}
