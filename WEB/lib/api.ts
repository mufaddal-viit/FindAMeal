import axios from "axios";
import { normalizeSearchQuery, validateSearchQuery } from "@/lib/searchQuery";
import type { PlaceResponse, PlacesResponse } from "@/types/place";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api",
  timeout: 10000
});

export async function fetchPlaces(query?: string, signal?: AbortSignal) {
  const normalizedQuery = normalizeSearchQuery(query ?? "");
  const validation = validateSearchQuery(normalizedQuery);

  if (validation.error) {
    throw new Error(validation.error);
  }

  const response = await api.get<PlacesResponse>("/places", {
    params: normalizedQuery ? { q: normalizedQuery } : undefined,
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
