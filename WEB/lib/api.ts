import axios from "axios";
import { normalizeLocationInput } from "@/lib/locationQuery";
import { normalizeSearchQuery, validateSearchQuery } from "@/lib/searchQuery";
import type {
  PlaceListFilters,
  PlaceResponse,
  PlacesResponse,
} from "@/types/place";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api",
  timeout: 40000,
});

function buildPlacesPayload(filters: PlaceListFilters) {
  const normalizedQuery = normalizeSearchQuery(filters.query ?? "");
  const validation = validateSearchQuery(normalizedQuery);

  if (validation.error) {
    throw new Error(validation.error);
  }

  const normalizedLocation = normalizeLocationInput(filters.location ?? "");
  const payload: PlaceListFilters = {};

  if (!normalizedLocation) {
    throw new Error("Location is required.");
  }

  if (validation.normalized) {
    payload.query = validation.normalized;
  }

  payload.location = normalizedLocation;

  if (filters.category) {
    payload.category = filters.category;
  }

  if (filters.sort) {
    payload.sort = filters.sort;
  }

  if (typeof filters.lat === "number" && typeof filters.lng === "number") {
    payload.lat = filters.lat;
    payload.lng = filters.lng;
  }

  if (typeof filters.radiusKm === "number") {
    payload.radiusKm = filters.radiusKm;
  }

  if (typeof filters.minRating === "number") {
    payload.minRating = filters.minRating;
  }

  if (filters.priceLevels && filters.priceLevels.length > 0) {
    payload.priceLevels = filters.priceLevels;
  }

  if (typeof filters.openNow === "boolean") {
    payload.openNow = filters.openNow;
  }

  if (typeof filters.page === "number" && filters.page > 1) {
    payload.page = filters.page;
  }

  if (typeof filters.pageSize === "number") {
    payload.pageSize = filters.pageSize;
  }

  return payload;
}

export async function fetchPlaces(
  filters: PlaceListFilters = {},
  signal?: AbortSignal,
) {
  const payload = buildPlacesPayload(filters);
  const response = await api.post<PlacesResponse>("/places", payload, {
    signal,
  });

  return response.data;
}

export async function fetchPlace(id: string, signal?: AbortSignal) {
  const response = await api.get<PlaceResponse>(`/places/${id}`, {
    signal,
  });

  return response.data;
}

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    return (
      (error.response?.data as { message?: string } | undefined)?.message ??
      error.message ??
      "Request failed."
    );
  }

  return "Something went wrong while talking to the API.";
}
