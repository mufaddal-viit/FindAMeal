import { normalizeSearchQuery } from "@/lib/searchQuery";
import type { Coordinates } from "@/types/place";

export const LOCATION_MAX_LENGTH = 60;
export const CURRENT_LOCATION_LABEL = "Current location";

export type SearchCoordinates = Coordinates;

export function sanitizeLocationInput(value: string) {
  return value.slice(0, LOCATION_MAX_LENGTH);
}

export function normalizeLocationInput(value: string) {
  return normalizeSearchQuery(value).slice(0, LOCATION_MAX_LENGTH);
}

export function parseCoordinateParam(
  value: string | string[] | undefined,
  min: number,
  max: number
) {
  const rawValue = Array.isArray(value) ? (value[0] ?? "") : (value ?? "");

  if (!rawValue) {
    return undefined;
  }

  const parsedValue = Number(rawValue);

  if (!Number.isFinite(parsedValue) || parsedValue < min || parsedValue > max) {
    return undefined;
  }

  return Number(parsedValue.toFixed(6));
}
