import {
  normalizeLocationInput,
  parseCoordinateParam
} from "@/lib/locationQuery";
import {
  DISTANCE_FILTER_OPTIONS,
  PRICE_LEVEL_OPTIONS,
  RATING_FILTER_OPTIONS,
  isSearchCategory,
  isSearchSortValue,
  type SearchCategory,
  type SearchSortValue
} from "@/lib/searchFormOptions";
import {
  sanitizeSearchQueryInput,
  validateSearchQuery
} from "@/lib/searchQuery";
import type { PlaceListFilters, PriceLevel } from "@/types/place";

type SearchParamValue = string | string[] | undefined;

const DISTANCE_FILTER_VALUES = DISTANCE_FILTER_OPTIONS.flatMap((option) =>
  typeof option.value === "number" ? [option.value] : []
);
const RATING_FILTER_VALUES = RATING_FILTER_OPTIONS.flatMap((option) =>
  typeof option.value === "number" ? [option.value] : []
);
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export interface SearchFormFilterValues {
  query: string;
  location: string;
  category: SearchCategory;
  sort: SearchSortValue;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  minRating?: number;
  priceLevels: PriceLevel[];
  openNow: boolean;
  page: number;
  pageSize: number;
}

export interface ParsedSearchFilters {
  values: SearchFormFilterValues;
  error: string | null;
}

function getSingleValue(value: SearchParamValue) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function parseAllowedNumber(value: string, allowedValues: readonly number[]) {
  if (!value) {
    return undefined;
  }

  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return undefined;
  }

  return allowedValues.includes(parsedValue) ? parsedValue : undefined;
}

function parsePositiveInteger(
  value: string,
  fallback: number,
  max?: number
) {
  if (!value) {
    return fallback;
  }

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    return fallback;
  }

  if (typeof max === "number" && parsedValue > max) {
    return fallback;
  }

  return parsedValue;
}

function parsePriceLevels(value: string) {
  if (!value) {
    return [];
  }

  const uniqueValues = Array.from(
    new Set(
      value
        .split(",")
        .map((item) => item.trim())
        .filter((item): item is PriceLevel =>
          PRICE_LEVEL_OPTIONS.includes(item as PriceLevel)
        )
    )
  );

  return uniqueValues;
}

export function parseFiltersFromSearchParams(
  searchParams: Record<string, SearchParamValue>
): ParsedSearchFilters {
  const rawQuery = getSingleValue(searchParams.q);
  const queryValidation = validateSearchQuery(sanitizeSearchQueryInput(rawQuery));
  const rawLocation = getSingleValue(searchParams.location);
  const rawCategory = getSingleValue(searchParams.category);
  const rawSort = getSingleValue(searchParams.sort);
  const latitude = parseCoordinateParam(searchParams.lat, -90, 90);
  const longitude = parseCoordinateParam(searchParams.lng, -180, 180);
  const hasCoordinates =
    typeof latitude === "number" && typeof longitude === "number";
  const rawRadiusKm = parseAllowedNumber(
    getSingleValue(searchParams.radiusKm),
    DISTANCE_FILTER_VALUES
  );
  const rawMinRating = parseAllowedNumber(
    getSingleValue(searchParams.minRating),
    RATING_FILTER_VALUES
  );

  return {
    values: {
      query: queryValidation.normalized,
      location: normalizeLocationInput(rawLocation),
      category: isSearchCategory(rawCategory) ? rawCategory : "All",
      sort: isSearchSortValue(rawSort) ? rawSort : "rating",
      latitude,
      longitude,
      radiusKm: hasCoordinates ? rawRadiusKm : undefined,
      minRating: rawMinRating,
      priceLevels: parsePriceLevels(getSingleValue(searchParams.priceLevels)),
      openNow: getSingleValue(searchParams.openNow) === "true",
      page: parsePositiveInteger(
        getSingleValue(searchParams.page),
        DEFAULT_PAGE
      ),
      pageSize: parsePositiveInteger(
        getSingleValue(searchParams.pageSize),
        DEFAULT_PAGE_SIZE,
        MAX_PAGE_SIZE
      )
    },
    error: queryValidation.error
  };
}

export function toPlaceListFilters(
  values: SearchFormFilterValues
): PlaceListFilters {
  const filters: PlaceListFilters = {
    page: values.page,
    pageSize: values.pageSize
  };

  if (values.query) {
    filters.query = values.query;
  }

  if (values.location) {
    filters.location = values.location;
  }

  if (values.category !== "All") {
    filters.category = values.category;
  }

  if (values.sort !== "rating") {
    filters.sort = values.sort;
  }

  if (
    typeof values.latitude === "number" &&
    typeof values.longitude === "number"
  ) {
    filters.lat = values.latitude;
    filters.lng = values.longitude;
  }

  if (
    typeof values.radiusKm === "number" &&
    typeof filters.lat === "number" &&
    typeof filters.lng === "number"
  ) {
    filters.radiusKm = values.radiusKm;
  }

  if (typeof values.minRating === "number") {
    filters.minRating = values.minRating;
  }

  if (values.priceLevels.length > 0) {
    filters.priceLevels = values.priceLevels;
  }

  if (values.openNow) {
    filters.openNow = true;
  }

  return filters;
}

export function buildResultsSearchParams(values: SearchFormFilterValues) {
  const params = new URLSearchParams();
  const filters = toPlaceListFilters(values);

  if (filters.query) {
    params.set("q", filters.query);
  }

  if (filters.location) {
    params.set("location", filters.location);
  }

  if (filters.category) {
    params.set("category", filters.category);
  }

  if (filters.sort) {
    params.set("sort", filters.sort);
  }

  if (typeof filters.lat === "number" && typeof filters.lng === "number") {
    params.set("lat", filters.lat.toString());
    params.set("lng", filters.lng.toString());
  }

  if (typeof filters.radiusKm === "number") {
    params.set("radiusKm", filters.radiusKm.toString());
  }

  if (typeof filters.minRating === "number") {
    params.set("minRating", filters.minRating.toString());
  }

  if (filters.priceLevels && filters.priceLevels.length > 0) {
    params.set("priceLevels", filters.priceLevels.join(","));
  }

  if (filters.openNow) {
    params.set("openNow", "true");
  }

  if (typeof filters.page === "number" && filters.page > DEFAULT_PAGE) {
    params.set("page", filters.page.toString());
  }

  if (
    typeof filters.pageSize === "number" &&
    filters.pageSize !== DEFAULT_PAGE_SIZE
  ) {
    params.set("pageSize", filters.pageSize.toString());
  }

  return params;
}
