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
}

export type DataSource = "database" | "fallback" | "demo";

