import { demoPlaces, findDemoPlaceById } from "../data/demoPlaces";
import type {
  Coordinates,
  DataSource,
  PlaceSummary,
  PriceLevel
} from "../types/place";
import type {
  AppliedPlaceFilters,
  PlaceFilters,
  PlaceSort,
  PlacesResultMeta
} from "../types/placeFilters";

interface PlacesResult {
  data: PlaceSummary[];
  source: DataSource;
  meta: PlacesResultMeta;
}

interface PlaceResult {
  data: PlaceSummary | null;
  source: DataSource;
}

const PRICE_LEVEL_SCORES: Record<PriceLevel, number> = {
  $: 1,
  $$: 2,
  $$$: 3,
  $$$$: 4
};

function toLowerCase(value: string) {
  return value.toLowerCase();
}

function calculateDistanceKm(
  origin: Coordinates,
  destination: NonNullable<PlaceSummary["coordinates"]>
) {
  const earthRadiusKm = 6371;
  const latitudeDelta = toRadians(destination.latitude - origin.latitude);
  const longitudeDelta = toRadians(destination.longitude - origin.longitude);
  const originLatitude = toRadians(origin.latitude);
  const destinationLatitude = toRadians(destination.latitude);
  const haversineValue =
    Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2) +
    Math.cos(originLatitude) *
      Math.cos(destinationLatitude) *
      Math.sin(longitudeDelta / 2) *
      Math.sin(longitudeDelta / 2);
  const angularDistance =
    2 * Math.atan2(Math.sqrt(haversineValue), Math.sqrt(1 - haversineValue));

  return Number((earthRadiusKm * angularDistance).toFixed(1));
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function matchesQuery(place: PlaceSummary, query?: string) {
  if (!query) {
    return true;
  }

  const normalizedQuery = query.toLowerCase();

  return [
    place.name,
    place.city,
    place.country,
    place.description,
    ...place.cuisines
  ].some((value) => value.toLowerCase().includes(normalizedQuery));
}

function matchesLocation(
  place: PlaceSummary,
  location: string | undefined,
  hasCoordinates: boolean
) {
  if (!location || hasCoordinates) {
    return true;
  }

  const normalizedLocation = toLowerCase(location);

  return [
    place.city,
    place.country,
    `${place.city} ${place.country}`,
    `${place.city}, ${place.country}`
  ]
    .map(toLowerCase)
    .some((candidate) => candidate.includes(normalizedLocation));
}

function matchesCategory(place: PlaceSummary, category?: string) {
  if (!category) {
    return true;
  }

  const normalizedCategory = toLowerCase(category);

  return [place.name, place.description, ...place.cuisines]
    .map(toLowerCase)
    .some((value) => value.includes(normalizedCategory));
}

function matchesMinRating(place: PlaceSummary, minRating?: number) {
  return minRating === undefined || place.rating >= minRating;
}

function matchesPriceLevels(place: PlaceSummary, priceLevels?: PriceLevel[]) {
  return !priceLevels || priceLevels.length === 0 || priceLevels.includes(place.priceLevel);
}

function matchesOpenNow(place: PlaceSummary, openNow?: boolean) {
  return openNow !== true || place.openNow;
}

function matchesRadius(place: PlaceSummary, radiusKm?: number) {
  return radiusKm === undefined || place.distanceKm === undefined || place.distanceKm <= radiusKm;
}

function compareByName(leftPlace: PlaceSummary, rightPlace: PlaceSummary) {
  return leftPlace.name.localeCompare(rightPlace.name);
}

function compareByRating(leftPlace: PlaceSummary, rightPlace: PlaceSummary) {
  return (
    rightPlace.rating - leftPlace.rating ||
    PRICE_LEVEL_SCORES[leftPlace.priceLevel] - PRICE_LEVEL_SCORES[rightPlace.priceLevel] ||
    compareByName(leftPlace, rightPlace)
  );
}

function compareByPriceLow(leftPlace: PlaceSummary, rightPlace: PlaceSummary) {
  return (
    PRICE_LEVEL_SCORES[leftPlace.priceLevel] - PRICE_LEVEL_SCORES[rightPlace.priceLevel] ||
    rightPlace.rating - leftPlace.rating ||
    compareByName(leftPlace, rightPlace)
  );
}

function compareByPriceHigh(leftPlace: PlaceSummary, rightPlace: PlaceSummary) {
  return (
    PRICE_LEVEL_SCORES[rightPlace.priceLevel] - PRICE_LEVEL_SCORES[leftPlace.priceLevel] ||
    rightPlace.rating - leftPlace.rating ||
    compareByName(leftPlace, rightPlace)
  );
}

function compareByDistance(leftPlace: PlaceSummary, rightPlace: PlaceSummary) {
  if (leftPlace.distanceKm === undefined && rightPlace.distanceKm === undefined) {
    return compareByRating(leftPlace, rightPlace);
  }

  if (leftPlace.distanceKm === undefined) {
    return 1;
  }

  if (rightPlace.distanceKm === undefined) {
    return -1;
  }

  return (
    leftPlace.distanceKm - rightPlace.distanceKm ||
    rightPlace.rating - leftPlace.rating ||
    compareByName(leftPlace, rightPlace)
  );
}

function getAppliedFilters(filters: PlaceFilters, hasCoordinates: boolean): AppliedPlaceFilters {
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

function sortPlaces(places: PlaceSummary[], sort: PlaceSort) {
  places.sort((leftPlace, rightPlace) => {
    switch (sort) {
      case "distance":
        return compareByDistance(leftPlace, rightPlace);
      case "price-low":
        return compareByPriceLow(leftPlace, rightPlace);
      case "price-high":
        return compareByPriceHigh(leftPlace, rightPlace);
      case "rating":
      default:
        return compareByRating(leftPlace, rightPlace);
    }
  });
}

export async function getPlaces(filters: PlaceFilters): Promise<PlacesResult> {
  const hasCoordinates =
    typeof filters.lat === "number" && typeof filters.lng === "number";
  let originCoordinates: Coordinates | null = null;

  if (hasCoordinates) {
    originCoordinates = {
      latitude: filters.lat as number,
      longitude: filters.lng as number
    };
  }
  const effectiveSort =
    filters.sort === "distance" && !hasCoordinates ? "rating" : filters.sort;
  const filteredPlaces = demoPlaces
    .map<PlaceSummary>((place) => ({
      ...place,
      distanceKm:
        originCoordinates && place.coordinates
          ? calculateDistanceKm(originCoordinates, place.coordinates)
          : undefined
    }))
    .filter((place) => matchesQuery(place, filters.query))
    .filter((place) => matchesLocation(place, filters.location, hasCoordinates))
    .filter((place) => matchesCategory(place, filters.category))
    .filter((place) => matchesMinRating(place, filters.minRating))
    .filter((place) => matchesPriceLevels(place, filters.priceLevels))
    .filter((place) => matchesOpenNow(place, filters.openNow))
    .filter((place) => matchesRadius(place, filters.radiusKm));

  sortPlaces(filteredPlaces, effectiveSort);

  const total = filteredPlaces.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / filters.pageSize);
  const startIndex = (filters.page - 1) * filters.pageSize;
  const paginatedPlaces = filteredPlaces.slice(
    startIndex,
    startIndex + filters.pageSize
  );

  return {
    data: paginatedPlaces,
    source: "demo",
    meta: {
      query: filters.query ?? "",
      total,
      page: filters.page,
      pageSize: filters.pageSize,
      totalPages,
      sort: filters.sort,
      effectiveSort,
      appliedFilters: getAppliedFilters(filters, hasCoordinates)
    }
  };
}

export async function getPlaceById(id: string): Promise<PlaceResult> {
  return {
    data: findDemoPlaceById(id),
    source: "demo"
  };
}
