"use client";

import dynamic from "next/dynamic";
import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useId, useRef, useState } from "react";
import type { LocationPickerResult } from "@/components/LocationPicker";
import SearchFiltersDropdown from "@/components/SearchFiltersDropdown";
import { usePlaceFilters } from "@/hooks/usePlaceFilters";
import {
  LOCATION_MAX_LENGTH,
  normalizeLocationInput,
  sanitizeLocationInput,
  type SearchCoordinates
} from "@/lib/locationQuery";
import { buildResultsSearchParams } from "@/lib/placeFilterParams";
import {
  SEARCH_QUERY_MAX_LENGTH,
  sanitizeSearchQueryInput,
  validateSearchQuery
} from "@/lib/searchQuery";
import type { PriceLevel } from "@/types/place";

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
  initialRadiusKm?: number;
  initialMinRating?: number;
  initialPriceLevels?: PriceLevel[];
  initialOpenNow?: boolean;
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
  initialRadiusKm,
  initialMinRating,
  initialPriceLevels,
  initialOpenNow = false,
  initialLatitude,
  initialLongitude,
  compact = false
}: SearchFormProps) {
  const helpTextId = useId();
  const errorTextId = useId();
  const filtersDropdownRef = useRef<HTMLDivElement | null>(null);
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
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const {
    category,
    setCategory,
    sort,
    setSort,
    radiusKm,
    setRadiusKm,
    minRating,
    setMinRating,
    priceLevels,
    togglePriceLevel,
    openNow,
    setOpenNow,
    activeFilterCount,
    resetFilters
  } = usePlaceFilters({
    initialCategory,
    initialSort,
    initialRadiusKm,
    initialMinRating,
    initialPriceLevels,
    initialOpenNow
  });
  const effectiveCoordinates = mapSelection?.coordinates ?? null;
  const hasCoordinates = Boolean(effectiveCoordinates);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsLocationPickerOpen(false);
        setIsFiltersOpen(false);
      }
    };
    const handlePointerDown = (event: MouseEvent) => {
      if (
        isFiltersOpen &&
        filtersDropdownRef.current &&
        !filtersDropdownRef.current.contains(event.target as Node)
      ) {
        setIsFiltersOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscapeKey);
    window.addEventListener("mousedown", handlePointerDown);

    return () => {
      window.removeEventListener("keydown", handleEscapeKey);
      window.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isFiltersOpen]);

  useEffect(() => {
    if (!isLocationPickerOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
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
    setRadiusKm(undefined);
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
    setSort("distance");
    setIsLocationPickerOpen(false);
    setIsFiltersOpen(false);
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

    const params = buildResultsSearchParams({
      query: validation.normalized,
      location: normalizedLocation,
      category,
      sort,
      latitude: effectiveCoordinates?.latitude,
      longitude: effectiveCoordinates?.longitude,
      radiusKm,
      minRating,
      priceLevels,
      openNow,
      page: 1,
      pageSize: 20
    });

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
          Find meals
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 px-1">
        <button
          type="button"
          onClick={() => {
            setIsFiltersOpen(false);
            setIsLocationPickerOpen(true);
          }}
          aria-label="Open location picker"
          className="rounded-full border border-leaf/15 bg-sand px-4 py-2 text-sm font-medium text-leaf transition hover:border-leaf hover:bg-paper"
        >
          Choose location
        </button>
        <div ref={filtersDropdownRef} className="relative">
          <button
            type="button"
            aria-label="Open advanced filters"
            aria-expanded={isFiltersOpen}
            aria-controls="search-filters-dropdown"
            onClick={() => setIsFiltersOpen((current) => !current)}
            className="inline-flex items-center gap-2 rounded-full border border-leaf/15 bg-sand px-4 py-2 text-sm font-medium text-leaf transition hover:border-leaf hover:bg-paper"
          >
            <span>Filters</span>
            {activeFilterCount > 0 ? (
              <span className="rounded-full bg-leaf px-2 py-0.5 text-xs font-semibold text-paper">
                {activeFilterCount}
              </span>
            ) : null}
          </button>

          {isFiltersOpen ? (
            <div
              id="search-filters-dropdown"
              className="absolute left-0 top-[calc(100%+0.75rem)] z-20 w-[min(100vw-2rem,56rem)]"
            >
              <SearchFiltersDropdown
                category={category}
                sort={sort}
                radiusKm={radiusKm}
                minRating={minRating}
                priceLevels={priceLevels}
                openNow={openNow}
                hasCoordinates={hasCoordinates}
                activeFilterCount={activeFilterCount}
                onCategoryChange={setCategory}
                onSortChange={setSort}
                onRadiusChange={setRadiusKm}
                onMinRatingChange={setMinRating}
                onTogglePriceLevel={togglePriceLevel}
                onOpenNowChange={setOpenNow}
                onReset={resetFilters}
              />
            </div>
          ) : null}
        </div>

        {mapSelection ? (
          <p className="text-xs text-leaf/80">
            Selected location: {mapSelection.address}
          </p>
        ) : location ? (
          <p className="text-xs text-leaf/80">Location: {location}</p>
        ) : (
          <p className="text-xs text-leaf/70">
            Add a location to unlock map-based distance filters.
          </p>
        )}
      </div>

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
