export const PRICE_LEVEL_VALUES = ["$", "$$", "$$$", "$$$$"] as const;
export const PRICE_RANGE_VALUES = ["budget", "mid", "premium"] as const;

export type PriceLevel = (typeof PRICE_LEVEL_VALUES)[number];
export type PriceRange = (typeof PRICE_RANGE_VALUES)[number];

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface PlaceSummary {
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

export interface AiSearchMetadata {
  provider?: string;
  model?: string;
  queryUsed: string;
  searchQueries: string[];
  sources: string[];
  timestamp: string;
}

export type DataSource = "ai" | "database" | "fallback" | "demo";
