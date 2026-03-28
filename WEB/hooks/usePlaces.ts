"use client";

import { useEffect, useState } from "react";
import { fetchPlaces, getApiErrorMessage } from "@/lib/api";
import type { Place, PlaceListFilters, PlacesResponseMeta } from "@/types/place";

export function usePlaces(filters: PlaceListFilters) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PlacesResponseMeta | null>(null);
  const priceLevelsKey = (filters.priceLevels ?? []).join(",");
  const {
    query,
    location,
    category,
    sort,
    lat,
    lng,
    radiusKm,
    minRating,
    priceLevels,
    openNow,
    page,
    pageSize
  } = filters;

  useEffect(() => {
    const controller = new AbortController();

    async function loadPlaces() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchPlaces(
          {
            query,
            location,
            category,
            sort,
            lat,
            lng,
            radiusKm,
            minRating,
            priceLevels,
            openNow,
            page,
            pageSize
          },
          controller.signal
        );
        setPlaces(response.data);
        setMeta(response.meta);
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(getApiErrorMessage(requestError));
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadPlaces();

    return () => controller.abort();
  }, [
    category,
    lat,
    lng,
    location,
    minRating,
    openNow,
    page,
    pageSize,
    priceLevelsKey,
    priceLevels,
    query,
    radiusKm,
    sort
  ]);

  return { places, loading, error, meta };
}
