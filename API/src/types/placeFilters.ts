import type { AiSearchMetadata, PriceLevel } from "./place";

export const PLACE_SORT_VALUES = [
  "distance",
  "rating",
  "price-low",
  "price-high"
] as const;

export type PlaceSort = (typeof PLACE_SORT_VALUES)[number];

export interface PlaceFilters {
  query?: string;
  location: string;
  category?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  minRating?: number;
  priceLevels?: PriceLevel[];
  openNow?: boolean;
  sort: PlaceSort;
  page: number;
  pageSize: number;
}

export interface AppliedPlaceFilters {
  location?: string;
  category?: string;
  hasCoordinates: boolean;
  radiusKm?: number;
  minRating?: number;
  priceLevels?: PriceLevel[];
  openNow?: boolean;
}

export interface PlacesResultMeta {
  query: string;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  sort: PlaceSort;
  effectiveSort: PlaceSort;
  appliedFilters: AppliedPlaceFilters;
  ai?: AiSearchMetadata;
}
