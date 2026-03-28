import axios from "axios";
import { normalizeLocationInput } from "@/lib/locationQuery";
import { normalizeSearchQuery, validateSearchQuery } from "@/lib/searchQuery";
import type { PlaceListFilters, PlaceResponse, PlacesResponse } from "@/types/place";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api",
  timeout: 10000
});

function buildPlacesParams(filters: PlaceListFilters) {
  const params = new URLSearchParams();
  const normalizedQuery = normalizeSearchQuery(filters.query ?? "");
  const validation = validateSearchQuery(normalizedQuery);

  if (validation.error) {
    throw new Error(validation.error);
  }

  const normalizedLocation = normalizeLocationInput(filters.location ?? "");

  if (validation.normalized) {
    params.set("q", validation.normalized);
  }

  if (normalizedLocation) {
    params.set("location", normalizedLocation);
  }

  if (filters.category) {
    params.set("category", filters.category);
  }

  if (filters.sort && filters.sort !== "rating") {
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

  if (typeof filters.openNow === "boolean") {
    params.set("openNow", filters.openNow ? "true" : "false");
  }

  if (typeof filters.page === "number" && filters.page > 1) {
    params.set("page", filters.page.toString());
  }

  if (typeof filters.pageSize === "number") {
    params.set("pageSize", filters.pageSize.toString());
  }

  return params;
}

export async function fetchPlaces(filters: PlaceListFilters = {}, signal?: AbortSignal) {
  const params = buildPlacesParams(filters);
  const response = await api.get<PlacesResponse>("/places", {
    params,
    signal
  });

  return response.data;
}

export async function fetchPlace(id: string, signal?: AbortSignal) {
  const response = await api.get<PlaceResponse>(`/places/${id}`, {
    signal
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
