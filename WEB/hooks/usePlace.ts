"use client";

import { useEffect, useState } from "react";
import { fetchPlace, getApiErrorMessage } from "@/lib/api";
import type { Place } from "@/types/place";

export function usePlace(id: string) {
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadPlace() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchPlace(id, controller.signal);
        setPlace(response.data);
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

    void loadPlace();

    return () => controller.abort();
  }, [id]);

  return { place, loading, error, source };
}

