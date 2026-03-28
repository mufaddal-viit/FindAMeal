export const PRICE_LEVEL_VALUES = ["$", "$$", "$$$", "$$$$"] as const;

export type PriceLevel = (typeof PRICE_LEVEL_VALUES)[number];

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface PlaceSummary {
  id: string;
  name: string;
  city: string;
  country: string;
  description: string;
  cuisines: string[];
  imageUrl: string;
  priceLevel: PriceLevel;
  rating: number;
  openNow: boolean;
  coordinates?: Coordinates;
  distanceKm?: number;
}

export type DataSource = "database" | "fallback" | "demo";
