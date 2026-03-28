import type { PlaceSort } from "@/types/placeFilters";

export type PriceLevel = "$" | "$$" | "$$$" | "$$$$";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Place {
  id: string;
  name: string;
  city: string;
  country: string;
  description: string;
  cuisines: string[];
  imageUrl: string;
  priceLevel: PriceLevel;
  rating: number;
  openNow?: boolean;
  coordinates?: Coordinates;
  distanceKm?: number;
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

export interface PlacesResponseMeta {
  query: string;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  sort: PlaceSort;
  effectiveSort: PlaceSort;
  source: string;
  appliedFilters: PlacesAppliedFilters;
}

export interface PlacesResponse {
  data: Place[];
  meta: PlacesResponseMeta;
}

export interface PlaceResponse {
  data: Place;
  meta: {
    source: string;
  };
}
