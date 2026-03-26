"use client";

import { useEffect, useState } from "react";
import { fetchPlaces, getApiErrorMessage } from "@/lib/api";
import type { Place } from "@/types/place";

export function usePlaces(query: string) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPlaces() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchPlaces(query, controller.signal);
        setPlaces(response.data);
        setSource(response.meta.source);
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
  }, [query]);

  return { places, loading, error, source };
}

