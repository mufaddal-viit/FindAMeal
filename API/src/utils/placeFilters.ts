import { z } from "zod";
import type { PlaceFilters } from "../types/placeFilters";
import { PLACE_SORT_VALUES } from "../types/placeFilters";
import { PRICE_LEVEL_VALUES } from "../types/place";
import { HttpError } from "./httpError";
import {
  ALLOWED_SEARCH_CHARACTERS_REGEX,
  HAS_CONTROL_CHAR_REGEX,
  SEARCH_QUERY_MAX_LENGTH,
  normalizeSearchQuery
} from "./searchQuery";

const LOCATION_MAX_LENGTH = 200;
const CATEGORY_MAX_LENGTH = 60;
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 10;
const MAX_RADIUS_KM = 50;

function preprocessText(value: unknown) {
  if (typeof value !== "string") {
    return value;
  }

  return normalizeSearchQuery(value);
}

function preprocessNumber(value: unknown) {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    return Number(value);
  }

  return value;
}

function optionalTextSchema(fieldName: string, maxLength: number) {
  return z
    .preprocess(preprocessText, z.string())
    .refine(
      (value) => !HAS_CONTROL_CHAR_REGEX.test(value),
      `${fieldName} contains unsupported control characters.`
    )
    .refine(
      (value) => value.length <= maxLength,
      `${fieldName} must be ${maxLength} characters or fewer.`
    )
    .transform((value) => value || undefined)
    .optional();
}

const querySchema = z
  .preprocess(preprocessText, z.string())
  .refine(
    (value) => !HAS_CONTROL_CHAR_REGEX.test(value),
    "Search query contains unsupported control characters."
  )
  .refine(
    (value) => value.length <= SEARCH_QUERY_MAX_LENGTH,
    `Search query must be ${SEARCH_QUERY_MAX_LENGTH} characters or fewer.`
  )
  .refine(
    (value) => !value || ALLOWED_SEARCH_CHARACTERS_REGEX.test(value),
    "Use letters, numbers, spaces, and only these symbols: & ' . , ( ) / -"
  )
  .transform((value) => value || undefined)
  .optional();

const optionalNumberSchema = (fieldName: string) =>
  z
    .preprocess(preprocessNumber, z.number())
    .refine(
      (value) => Number.isFinite(value),
      `${fieldName} must be a valid number.`
    )
    .optional();

const priceLevelsSchema = z
  .preprocess((value) => {
    if (value === undefined || value === null || value === "") {
      return undefined;
    }

    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === "string") {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return value;
  }, z.array(z.enum(PRICE_LEVEL_VALUES)))
  .transform((values) => Array.from(new Set(values)))
  .optional();

const openNowSchema = z
  .preprocess((value) => {
    if (value === undefined || value === null || value === "") {
      return undefined;
    }

    if (typeof value === "boolean") {
      return value;
    }

    if (value === "true") {
      return true;
    }

    if (value === "false") {
      return false;
    }

    return value;
  }, z.boolean())
  .optional();

const placeFiltersSchema = z
  .object({
    query: querySchema,
    location: optionalTextSchema("Location", LOCATION_MAX_LENGTH),
    category: optionalTextSchema("Category", CATEGORY_MAX_LENGTH),
    lat: optionalNumberSchema("Latitude").refine(
      (value) => value === undefined || (value >= -90 && value <= 90),
      "Latitude must be between -90 and 90."
    ),
    lng: optionalNumberSchema("Longitude").refine(
      (value) => value === undefined || (value >= -180 && value <= 180),
      "Longitude must be between -180 and 180."
    ),
    radiusKm: optionalNumberSchema("Radius")
      .refine(
        (value) => value === undefined || value > 0,
        "Radius must be greater than 0."
      )
      .refine(
        (value) => value === undefined || value <= MAX_RADIUS_KM,
        `Radius must be ${MAX_RADIUS_KM} km or fewer.`
      ),
    minRating: optionalNumberSchema("Minimum rating").refine(
      (value) => value === undefined || (value >= 0 && value <= 5),
      "Minimum rating must be between 0 and 5."
    ),
    priceLevels: priceLevelsSchema,
    openNow: openNowSchema,
    sort: z.enum(PLACE_SORT_VALUES).default("rating"),
    page: z.coerce
      .number()
      .int()
      .min(1, "Page must be at least 1.")
      .default(DEFAULT_PAGE),
    pageSize: z.coerce
      .number()
      .int()
      .min(1, "Page size must be at least 1.")
      .max(MAX_PAGE_SIZE, `Page size must be ${MAX_PAGE_SIZE} or fewer.`)
      .default(DEFAULT_PAGE_SIZE)
  })
  .superRefine((filters, context) => {
    const hasLatitude = typeof filters.lat === "number";
    const hasLongitude = typeof filters.lng === "number";

    if (!filters.location) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Location is required."
      });
    }

    if (hasLatitude !== hasLongitude) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Latitude and longitude must be provided together."
      });
    }

    if (filters.radiusKm !== undefined && (!hasLatitude || !hasLongitude)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Radius filtering requires both latitude and longitude."
      });
    }
  });

export function parsePlaceFilters(body: unknown): PlaceFilters {
  const parsedFilters = placeFiltersSchema.safeParse(body);

  if (!parsedFilters.success) {
    throw new HttpError(
      400,
      parsedFilters.error.issues[0]?.message ?? "Invalid filters."
    );
  }

  return parsedFilters.data as PlaceFilters;
}
