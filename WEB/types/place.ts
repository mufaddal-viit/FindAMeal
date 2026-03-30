import type { PlaceSort } from "@/types/placeFilters";

export type PriceLevel = "$" | "$$" | "$$$" | "$$$$";
export type PriceRange = "budget" | "mid" | "premium";
export type DataSource = "ai" | "database" | "fallback" | "demo";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Place {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  cuisines: string[];
  imageUrl: string;
  rating: number | null;
  priceLevel: PriceLevel | null;
  priceRange: PriceRange | null;
  openNow: boolean | null;
  distanceKm: number | null;
  sourceUrl: string | null;
  tags: string[];
  coordinates?: Coordinates | null;
}

export interface PlaceListFilters {
  query?: string;
  location?: string;
  category?: string;
  sort?: PlaceSort;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  minRating?: number;
  priceLevels?: PriceLevel[];
  openNow?: boolean;
  page?: number;
  pageSize?: number;
}

export interface PlacesAppliedFilters {
  location?: string;
  category?: string;
  hasCoordinates: boolean;
  radiusKm?: number;
  minRating?: number;
  priceLevels?: PriceLevel[];
  openNow?: boolean;
}

export interface AiSearchMetadata {
  provider?: string;
  model?: string;
  queryUsed: string;
  searchQueries: string[];
  sources: string[];
  timestamp: string;
}

export interface PlacesResponseMeta {
  query: string;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  sort: PlaceSort;
  effectiveSort: PlaceSort;
  source: DataSource;
  appliedFilters: PlacesAppliedFilters;
  ai?: AiSearchMetadata;
}

export interface PlacesResponse {
  data: Place[];
  meta: PlacesResponseMeta;
}

export interface PlaceResponse {
  data: Place;
  meta: {
    source: DataSource;
  };
}
