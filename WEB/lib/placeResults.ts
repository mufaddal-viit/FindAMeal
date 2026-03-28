import {
  CURRENT_LOCATION_LABEL,
  normalizeLocationInput,
  type SearchCoordinates
} from "@/lib/locationQuery";
import type {
  SearchCategory,
  SearchSortValue
} from "@/lib/searchFormOptions";
import type { Place } from "@/types/place";

const CURRENT_LOCATION_KEY = normalizeLocationInput(CURRENT_LOCATION_LABEL).toLowerCase();
const PRICE_LEVEL_SCORES: Record<string, number> = {
  $: 1,
  $$: 2,
  $$$: 3,
  $$$$: 4
};

export interface PlaceResultItem extends Place {
  distanceKm?: number;
}

interface BuildPlaceResultsOptions {
  places: Place[];
  location?: string;
  category?: SearchCategory;
  sort?: SearchSortValue;
  userCoordinates?: SearchCoordinates | null;
}

interface BuildPlaceResultsResult {
  places: PlaceResultItem[];
  effectiveSort: SearchSortValue;
}

function toLowerCaseSearchable(value: string) {
  return value.toLowerCase();
}

function getPriceLevelScore(priceLevel: string) {
  return PRICE_LEVEL_SCORES[priceLevel] ?? Number.MAX_SAFE_INTEGER;
}

function calculateDistanceKm(
  origin: SearchCoordinates,
  destination: SearchCoordinates
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

function matchesLocation(place: Place, normalizedLocation: string) {
  if (!normalizedLocation || normalizedLocation.toLowerCase() === CURRENT_LOCATION_KEY) {
    return true;
  }

  const locationCandidates = [
    place.city,
    place.country,
    `${place.city} ${place.country}`,
    `${place.city}, ${place.country}`
  ].map(toLowerCaseSearchable);
  const locationQuery = normalizedLocation.toLowerCase();

  return locationCandidates.some((candidate) => candidate.includes(locationQuery));
}

function matchesCategory(place: Place, category: SearchCategory) {
  if (category === "All") {
    return true;
  }

  const categoryQuery = category.toLowerCase();
  const searchableValues = [place.name, place.description, ...place.cuisines].map(
    toLowerCaseSearchable
  );

  return searchableValues.some((value) => value.includes(categoryQuery));
}

function compareByName(leftPlace: PlaceResultItem, rightPlace: PlaceResultItem) {
  return leftPlace.name.localeCompare(rightPlace.name);
}

function compareByRating(leftPlace: PlaceResultItem, rightPlace: PlaceResultItem) {
  return (
    rightPlace.rating - leftPlace.rating ||
    getPriceLevelScore(leftPlace.priceLevel) - getPriceLevelScore(rightPlace.priceLevel) ||
    compareByName(leftPlace, rightPlace)
  );
}

function compareByPriceLow(leftPlace: PlaceResultItem, rightPlace: PlaceResultItem) {
  return (
    getPriceLevelScore(leftPlace.priceLevel) - getPriceLevelScore(rightPlace.priceLevel) ||
    rightPlace.rating - leftPlace.rating ||
    compareByName(leftPlace, rightPlace)
  );
}

function compareByPriceHigh(leftPlace: PlaceResultItem, rightPlace: PlaceResultItem) {
  return (
    getPriceLevelScore(rightPlace.priceLevel) - getPriceLevelScore(leftPlace.priceLevel) ||
    rightPlace.rating - leftPlace.rating ||
    compareByName(leftPlace, rightPlace)
  );
}

function compareByDistance(leftPlace: PlaceResultItem, rightPlace: PlaceResultItem) {
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

export function buildPlaceResults({
  places,
  location = "",
  category = "All",
  sort = "rating",
  userCoordinates = null
}: BuildPlaceResultsOptions): BuildPlaceResultsResult {
  const normalizedLocation = normalizeLocationInput(location);
  const effectiveSort =
    sort === "distance" && !userCoordinates ? "rating" : sort;
  const visiblePlaces = places
    .map<PlaceResultItem>((place) => ({
      ...place,
      distanceKm:
        userCoordinates && place.coordinates
          ? calculateDistanceKm(userCoordinates, place.coordinates)
          : undefined
    }))
    .filter((place) => matchesLocation(place, normalizedLocation))
    .filter((place) => matchesCategory(place, category));

  visiblePlaces.sort((leftPlace, rightPlace) => {
    switch (effectiveSort) {
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

  return {
    places: visiblePlaces,
    effectiveSort
  };
}
