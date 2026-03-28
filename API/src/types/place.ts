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
  priceLevel: string;
  rating: number;
  coordinates?: Coordinates;
}

export type DataSource = "database" | "fallback" | "demo";
