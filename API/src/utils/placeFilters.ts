import type { Request } from "express";
import { z } from "zod";
import type { PlaceFilters } from "../types/placeFilters";
import {
  PLACE_SORT_VALUES
} from "../types/placeFilters";
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
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const MAX_RADIUS_KM = 100;

const optionalTextSchema = (fieldName: string, maxLength: number) =>
  z
    .string()
    .refine(
      (value) => !HAS_CONTROL_CHAR_REGEX.test(value),
      `${fieldName} contains unsupported control characters.`
    )
    .transform(normalizeSearchQuery)
    .refine(
      (value) => value.length <= maxLength,
      `${fieldName} must be ${maxLength} characters or fewer.`
    )
    .transform((value) => value || undefined)
    .optional();

const optionalQuerySchema = z
  .string()
  .refine(
    (value) => !HAS_CONTROL_CHAR_REGEX.test(value),
    "Search query contains unsupported control characters."
  )
  .transform(normalizeSearchQuery)
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
    .string()
    .transform((value, context) => {
      const parsedValue = Number(value);

      if (!Number.isFinite(parsedValue)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${fieldName} must be a valid number.`
        });
        return z.NEVER;
      }

      return parsedValue;
    })
    .optional();

const placeFiltersSchema = z
  .object({
    query: optionalQuerySchema,
    location: optionalTextSchema("Location", LOCATION_MAX_LENGTH),
    category: optionalTextSchema("Category", CATEGORY_MAX_LENGTH),
    lat: optionalNumberSchema("Latitude")
      .refine(
        (value) => value === undefined || (value >= -90 && value <= 90),
        "Latitude must be between -90 and 90."
      ),
    lng: optionalNumberSchema("Longitude")
      .refine(
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
    minRating: optionalNumberSchema("Minimum rating")
      .refine(
        (value) => value === undefined || (value >= 0 && value <= 5),
        "Minimum rating must be between 0 and 5."
      ),
    priceLevels: z
      .string()
      .transform((value) =>
        value
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      )
      .refine(
        (values) => values.every((value) => PRICE_LEVEL_VALUES.includes(value as (typeof PRICE_LEVEL_VALUES)[number])),
        `Price levels must be one of: ${PRICE_LEVEL_VALUES.join(", ")}.`
      )
      .transform((values) =>
        values.length > 0 ? Array.from(new Set(values)) as (typeof PRICE_LEVEL_VALUES)[number][] : undefined
      )
      .optional(),
    openNow: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .optional(),
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

function getSingleQueryValue(
  value: Request["query"][string],
  fieldName: string
) {
  if (Array.isArray(value)) {
    throw new HttpError(400, `Only one ${fieldName} value is allowed.`);
  }

  if (typeof value === "string") {
    return value;
  }

  if (value === undefined) {
    return undefined;
  }

  throw new HttpError(400, `Invalid ${fieldName} value.`);
}

export function parsePlaceFilters(query: Request["query"]): PlaceFilters {
  const rawFilters = {
    query: getSingleQueryValue(query.q, "search query"),
    location: getSingleQueryValue(query.location, "location"),
    category: getSingleQueryValue(query.category, "category"),
    lat: getSingleQueryValue(query.lat, "latitude"),
    lng: getSingleQueryValue(query.lng, "longitude"),
    radiusKm: getSingleQueryValue(query.radiusKm, "radius"),
    minRating: getSingleQueryValue(query.minRating, "minimum rating"),
    priceLevels: getSingleQueryValue(query.priceLevels, "price levels"),
    openNow: getSingleQueryValue(query.openNow, "openNow"),
    sort: getSingleQueryValue(query.sort, "sort"),
    page: getSingleQueryValue(query.page, "page"),
    pageSize: getSingleQueryValue(query.pageSize, "page size")
  };
  const parsedFilters = placeFiltersSchema.safeParse(rawFilters);

  if (!parsedFilters.success) {
    throw new HttpError(400, parsedFilters.error.issues[0]?.message ?? "Invalid filters.");
  }

  return parsedFilters.data;
}
