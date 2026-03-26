import type { DataSource, PlaceSummary } from "../types/place";
import { filterDemoPlaces, findDemoPlaceById } from "../data/demoPlaces";

interface PlacesResult {
  data: PlaceSummary[];
  source: DataSource;
}

interface PlaceResult {
  data: PlaceSummary | null;
  source: DataSource;
}

export async function getPlaces(query?: string): Promise<PlacesResult> {
  return {
    data: filterDemoPlaces(query),
    source: "demo"
  };
}

export async function getPlaceById(id: string): Promise<PlaceResult> {
  return {
    data: findDemoPlaceById(id),
    source: "demo"
  };
}
