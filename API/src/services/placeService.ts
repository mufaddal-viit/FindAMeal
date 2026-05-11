import { findDemoPlaceById, getAllDemoPlaces } from "../data/demoPlaces";
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

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Apply filters and sorting to places
 */
function filterAndSortPlaces(places: PlaceSummary[], filters: PlaceFilters): PlaceSummary[] {
  let filtered = places;

  // Filter by location (simple text match for demo)
  if (filters.location) {
    const locationLower = filters.location.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.city.toLowerCase().includes(locationLower) ||
        p.country.toLowerCase().includes(locationLower) ||
        p.address.toLowerCase().includes(locationLower)
    );
  }

  // Filter by category/cuisine
  if (filters.category) {
    const categoryLower = filters.category.toLowerCase();
    filtered = filtered.filter((p) =>
      p.cuisines.some((c) => c.toLowerCase().includes(categoryLower)) ||
      p.tags.some((t) => t.toLowerCase().includes(categoryLower))
    );
  }

  // Filter by radius (if coordinates provided)
  if (
    filters.lat !== undefined &&
    filters.lng !== undefined &&
    filters.radiusKm !== undefined
  ) {
    filtered = filtered.filter((p) => {
      if (!p.coordinates) return false;
      const distance = calculateDistance(
        filters.lat!,
        filters.lng!,
        p.coordinates.latitude,
        p.coordinates.longitude
      );
      return distance <= filters.radiusKm!;
    });
  }

  // Filter by minimum rating
  if (filters.minRating !== undefined) {
    filtered = filtered.filter((p) => (p.rating ?? 0) >= filters.minRating!);
  }

  // Filter by price levels
  if (filters.priceLevels && filters.priceLevels.length > 0) {
    filtered = filtered.filter((p) => p.priceLevel && filters.priceLevels!.includes(p.priceLevel));
  }

  // Filter by open now
  if (filters.openNow) {
    filtered = filtered.filter((p) => p.openNow === true);
  }

  // Apply sorting
  const sorted = [...filtered];
  switch (filters.sort) {
    case "distance":
      if (filters.lat !== undefined && filters.lng !== undefined) {
        sorted.sort((a, b) => {
          if (!a.coordinates || !b.coordinates) return 0;
          const distA = calculateDistance(
            filters.lat!,
            filters.lng!,
            a.coordinates.latitude,
            a.coordinates.longitude
          );
          const distB = calculateDistance(
            filters.lat!,
            filters.lng!,
            b.coordinates.latitude,
            b.coordinates.longitude
          );
          return distA - distB;
        });
      }
      break;
    case "rating":
      sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      break;
    case "price-low":
      sorted.sort((a, b) => {
        const priceA = a.priceLevel ? a.priceLevel.length : 0;
        const priceB = b.priceLevel ? b.priceLevel.length : 0;
        return priceA - priceB;
      });
      break;
    case "price-high":
      sorted.sort((a, b) => {
        const priceA = a.priceLevel ? a.priceLevel.length : 0;
        const priceB = b.priceLevel ? b.priceLevel.length : 0;
        return priceB - priceA;
      });
      break;
  }

  return sorted;
}

export async function getPlaces(
  filters: PlaceFilters,
  requestIp: string
): Promise<PlacesResult> {
  const aiSearchResult = await findRestaurantsWithAI(filters, requestIp);
  const hasCoordinates =
    typeof filters.lat === "number" && typeof filters.lng === "number";

  // Merge AI results with demo data for better results
  const allPlaces = [...aiSearchResult.data];

  // Apply backend filtering and sorting
  const filteredPlaces = filterAndSortPlaces(allPlaces, filters);

  // Apply pagination
  const startIdx = (filters.page - 1) * filters.pageSize;
  const endIdx = startIdx + filters.pageSize;
  const paginatedPlaces = filteredPlaces.slice(startIdx, endIdx);

  cachePlaces(paginatedPlaces);

  const totalPages = Math.ceil(filteredPlaces.length / filters.pageSize) || 1;

  return {
    data: paginatedPlaces,
    source: "ai",
    meta: {
      query: filters.query ?? "",
      total: filteredPlaces.length,
      page: filters.page,
      pageSize: filters.pageSize,
      totalPages,
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
