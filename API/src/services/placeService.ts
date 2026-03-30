import { findDemoPlaceById } from "../data/demoPlaces";
import { findRestaurantsWithAI } from "../ai";
import { AI_CONFIG } from "../config/ai.config";
import type { DataSource, PlaceSummary } from "../types/place";
import type {
  AppliedPlaceFilters,
  PlaceFilters,
  PlacesResultMeta
} from "../types/placeFilters";

interface CachedPlaceEntry {
  place: PlaceSummary;
  expiresAt: number;
}

interface PlacesResult {
  data: PlaceSummary[];
  source: DataSource;
  meta: PlacesResultMeta;
}

interface PlaceResult {
  data: PlaceSummary | null;
  source: DataSource;
}

const aiPlaceCache = new Map<string, CachedPlaceEntry>();

function getAppliedFilters(
  filters: PlaceFilters,
  hasCoordinates: boolean
): AppliedPlaceFilters {
  return {
    location: filters.location,
    category: filters.category,
    hasCoordinates,
    radiusKm: filters.radiusKm,
    minRating: filters.minRating,
    priceLevels: filters.priceLevels,
    openNow: filters.openNow
  };
}

function pruneExpiredCacheEntries() {
  const now = Date.now();

  for (const [cacheKey, cacheEntry] of aiPlaceCache.entries()) {
    if (cacheEntry.expiresAt <= now) {
      aiPlaceCache.delete(cacheKey);
    }
  }
}

function cachePlaces(places: PlaceSummary[]) {
  pruneExpiredCacheEntries();
  const expiresAt = Date.now() + AI_CONFIG.cache.resultTtlMs;

  places.forEach((place) => {
    aiPlaceCache.set(place.id, {
      place,
      expiresAt
    });
  });
}

function getCachedPlaceById(id: string) {
  pruneExpiredCacheEntries();
  const cacheEntry = aiPlaceCache.get(id);

  if (!cacheEntry) {
    return null;
  }

  if (cacheEntry.expiresAt <= Date.now()) {
    aiPlaceCache.delete(id);
    return null;
  }

  return cacheEntry.place;
}

export async function getPlaces(
  filters: PlaceFilters,
  requestIp: string
): Promise<PlacesResult> {
  const aiSearchResult = await findRestaurantsWithAI(filters, requestIp);
  const hasCoordinates =
    typeof filters.lat === "number" && typeof filters.lng === "number";

  cachePlaces(aiSearchResult.data);

  return {
    data: aiSearchResult.data,
    source: "ai",
    meta: {
      query: filters.query ?? "",
      total: aiSearchResult.data.length,
      page: filters.page,
      pageSize: filters.pageSize,
      totalPages: aiSearchResult.data.length === 0 ? 0 : filters.page,
      sort: filters.sort,
      effectiveSort: filters.sort,
      appliedFilters: getAppliedFilters(filters, hasCoordinates),
      ai: aiSearchResult.meta
    }
  };
}

export async function getPlaceById(id: string): Promise<PlaceResult> {
  const cachedPlace = getCachedPlaceById(id);

  if (cachedPlace) {
    return {
      data: cachedPlace,
      source: "ai"
    };
  }

  return {
    data: findDemoPlaceById(id),
    source: "demo"
  };
}
