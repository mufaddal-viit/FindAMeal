import type { PlaceFilters } from "../../types/placeFilters";
import type { Coordinates, PlaceSummary, PriceLevel, PriceRange } from "../../types/place";

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

export interface AiSearchResult {
  data: PlaceSummary[];
  meta: {
    queryUsed: string;
    searchQueries: string[];
    sources: string[];
    timestamp: string;
  };
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
