"use client";

import dynamic from "next/dynamic";
import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useId, useState } from "react";
import type { LocationPickerResult } from "@/components/LocationPicker";
import {
  LOCATION_MAX_LENGTH,
  normalizeLocationInput,
  sanitizeLocationInput,
  type SearchCoordinates
} from "@/lib/locationQuery";
import {
  SEARCH_CATEGORIES,
  SEARCH_SORT_OPTIONS,
  type SearchCategory,
  type SearchSortValue,
  isSearchCategory,
  isSearchSortValue
} from "@/lib/searchFormOptions";
import {
  SEARCH_QUERY_MAX_LENGTH,
  sanitizeSearchQueryInput,
  validateSearchQuery
} from "@/lib/searchQuery";

const LocationPicker = dynamic(() => import("@/components/LocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="rounded-[1.5rem] border border-leaf/10 bg-paper p-6 text-sm text-leaf/80">
      Loading map picker...
    </div>
  )
});

interface MapSelection {
  coordinates: SearchCoordinates;
  address: string;
}

interface SearchFormProps {
  initialValue?: string;
  initialLocation?: string;
  initialCategory?: string;
  initialSort?: string;
  initialLatitude?: number;
  initialLongitude?: number;
  compact?: boolean;
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 text-leaf/70"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 text-leaf/70"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10Z" />
      <circle cx="12" cy="11" r="2.5" />
    </svg>
  );
}

export default function SearchForm({
  initialValue = "",
  initialLocation = "",
  initialCategory = "All",
  initialSort = "rating",
  initialLatitude,
  initialLongitude,
  compact = false
}: SearchFormProps) {
  const helpTextId = useId();
  const errorTextId = useId();
  const initialSanitizedValue = sanitizeSearchQueryInput(initialValue);
  const resolvedInitialCoordinates: SearchCoordinates | null =
    typeof initialLatitude === "number" && typeof initialLongitude === "number"
      ? {
          latitude: initialLatitude,
          longitude: initialLongitude
        }
      : null;
  const initialMapSelection =
    resolvedInitialCoordinates && initialLocation
      ? {
          coordinates: resolvedInitialCoordinates,
          address: initialLocation
        }
      : null;
  const [query, setQuery] = useState(initialSanitizedValue);
  const [location, setLocation] = useState(sanitizeLocationInput(initialLocation));
  const [error, setError] = useState<string | null>(
    validateSearchQuery(initialSanitizedValue).error
  );
  const [mapSelection, setMapSelection] = useState<MapSelection | null>(
    initialMapSelection
  );
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory>(
    isSearchCategory(initialCategory) ? initialCategory : "All"
  );
  const [sortBy, setSortBy] = useState<SearchSortValue>(
    isSearchSortValue(initialSort) ? initialSort : "rating"
  );
  const effectiveCoordinates = mapSelection?.coordinates ?? null;

  useEffect(() => {
    if (!isLocationPickerOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsLocationPickerOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isLocationPickerOpen]);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const nextValue = sanitizeSearchQueryInput(event.target.value);
    const validation = validateSearchQuery(nextValue);

    setQuery(nextValue);
    setError(validation.error);
  }

  function handleBlur() {
    const validation = validateSearchQuery(query);

    setQuery(validation.normalized);
    setError(validation.error);
  }

  function handleLocationChange(event: ChangeEvent<HTMLInputElement>) {
    setMapSelection(null);
    setLocation(sanitizeLocationInput(event.target.value));
  }

  function handleLocationBlur() {
    setLocation(normalizeLocationInput(location));
  }

  function handleLocationPickerConfirm(result: LocationPickerResult) {
    setMapSelection({
      coordinates: {
        latitude: result.lat,
        longitude: result.lng
      },
      address: result.address
    });
    setLocation(result.address);
    setSortBy("distance");
    setIsLocationPickerOpen(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validation = validateSearchQuery(query);
    const normalizedLocation = normalizeLocationInput(location);

    setQuery(validation.normalized);
    setLocation(normalizedLocation);
    setError(validation.error);

    if (validation.error) {
      return;
    }

    const params = new URLSearchParams();

    if (validation.normalized) {
      params.set("q", validation.normalized);
    }

    if (normalizedLocation) {
      params.set("location", normalizedLocation);
    }

    if (effectiveCoordinates) {
      params.set("lat", effectiveCoordinates.latitude.toString());
      params.set("lng", effectiveCoordinates.longitude.toString());
    }

    if (selectedCategory !== "All") {
      params.set("category", selectedCategory);
    }

    if (sortBy !== "rating") {
      params.set("sort", sortBy);
    }

    const destination = params.toString()
      ? `/results?${params.toString()}`
      : "/results";
    window.location.assign(destination);
  }

  return (
    <form
      action="/results"
      method="get"
      onSubmit={handleSubmit}
      className={`mx-auto space-y-4 rounded-[2rem] border border-leaf/10 bg-paper p-4 shadow-lg shadow-leaf/10 backdrop-blur ${
        compact ? "w-full" : "w-full max-w-5xl"
      }`}
      noValidate
    >
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.72fr)_auto]">
        <label
          className={`flex h-16 items-center gap-3 rounded-[1.4rem] border bg-sand px-5 transition focus-within:border-leaf ${
            error ? "border-amber" : "border-leaf/10"
          }`}
        >
          <SearchIcon />
          <input
            type="text"
            name="q"
            value={query}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Pizza, Sushi, Burger..."
            maxLength={SEARCH_QUERY_MAX_LENGTH}
            autoComplete="off"
            enterKeyHint="search"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorTextId : helpTextId}
            className="w-full bg-transparent text-base text-ink outline-none placeholder:text-leaf/60"
          />
        </label>

        <label className="flex h-16 items-center gap-3 rounded-[1.4rem] border border-leaf/10 bg-sand px-5 transition focus-within:border-leaf">
          <LocationIcon />
          <input
            type="text"
            name="location"
            value={location}
            onChange={handleLocationChange}
            onBlur={handleLocationBlur}
            placeholder="Dubai, UAE"
            maxLength={LOCATION_MAX_LENGTH}
            autoComplete="off"
            className="w-full bg-transparent text-base text-ink outline-none placeholder:text-leaf/60"
          />
        </label>

        <button
          type="submit"
          className="h-16 rounded-[1.4rem] bg-leaf px-7 text-base font-semibold text-paper transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
        >
          Search
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 px-1">
        <button
          type="button"
          onClick={() => setIsLocationPickerOpen(true)}
          aria-label="Open location picker"
          className="rounded-full border border-leaf/15 bg-sand px-4 py-2 text-sm font-medium text-leaf transition hover:border-leaf hover:bg-paper"
        >
          Choose location
        </button>
        {mapSelection ? (
          <p className="text-xs text-leaf/80">
            Selected location: {mapSelection.address}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        {SEARCH_CATEGORIES.map((category) => {
          const active = selectedCategory === category;

          return (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
                active
                  ? "border-leaf bg-leaf text-paper"
                  : "border-leaf/15 bg-sand text-leaf hover:border-leaf hover:bg-paper"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="hidden lg:block" />
        <label className="flex items-center gap-3 rounded-[1.4rem] border border-leaf/10 bg-sand px-5 py-4 transition focus-within:border-leaf lg:min-w-[360px]">
          <span className="text-sm font-medium text-leaf/80">Sort by</span>
          <select
            name="sort"
            value={sortBy}
            onChange={(event) =>
              setSortBy(
                isSearchSortValue(event.target.value)
                  ? event.target.value
                  : "rating"
              )
            }
            className="w-full bg-transparent text-base font-medium text-ink outline-none"
          >
            {SEARCH_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <input type="hidden" name="category" value={selectedCategory} />

      <div className="flex flex-col gap-1 px-2">
        <p id={helpTextId} className="text-xs text-leaf/70">
          Up to {SEARCH_QUERY_MAX_LENGTH} characters. Allowed: letters, numbers,
          spaces, and &apos; &amp; . , ( ) / -
        </p>
        {error ? (
          <p
            id={errorTextId}
            role="alert"
            className="text-xs font-medium text-amber"
          >
            {error}
          </p>
        ) : null}
      </div>

      {isLocationPickerOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/55 px-4 py-6">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Choose a location on the map"
            className="relative flex max-h-[90vh] w-full max-w-4xl flex-col gap-4 overflow-hidden rounded-[2rem] border border-leaf/10 bg-paper p-5 shadow-2xl shadow-ink/25"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-leaf">
                  Location Picker
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-ink">
                  Search, detect, or place the pin
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsLocationPickerOpen(false)}
                aria-label="Close location picker"
                className="rounded-full border border-leaf/15 bg-sand px-4 py-2 text-sm font-medium text-leaf transition hover:border-leaf hover:bg-paper"
              >
                Close
              </button>
            </div>

            <div className="overflow-y-auto pr-1">
              <LocationPicker onLocationConfirm={handleLocationPickerConfirm} />
            </div>
          </div>
        </div>
      ) : null}
    </form>
  );
}
