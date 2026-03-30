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
import { SEARCH_SORT_OPTIONS } from "@/lib/searchFormOptions";
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
  const [formError, setFormError] = useState<string | null>(null);
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
  const sortLabel =
    SEARCH_SORT_OPTIONS.find((option) => option.value === sort)?.label ??
    "Rating";
  const selectedFilterLabels = [
    category !== "All" ? category : null,
    radiusKm ? `< ${radiusKm} km` : null,
    minRating ? `${minRating}+ stars` : null,
    priceLevels.length > 0 ? priceLevels.join(" ") : null,
    openNow ? "Open now" : null,
    sort !== "rating" ? `Sort: ${sortLabel}` : null
  ].filter((label): label is string => Boolean(label));
  const locationStatus = mapSelection
    ? "Pinned from map"
    : location
      ? "Manual area set"
      : "Location needed";

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
    setFormError(null);
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
    setFormError(null);
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

    if (!normalizedLocation) {
      setFormError("Location is required.");
      return;
    }

    setFormError(null);

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
      pageSize: 10
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
      className={`mx-auto overflow-visible rounded-[2.15rem] border border-leaf/10 bg-paper p-4 shadow-xl shadow-leaf/10 backdrop-blur ${
        compact ? "w-full" : "w-full max-w-5xl"
      }`}
      noValidate
    >
      <div className="rounded-[1.8rem] border border-leaf/10 bg-sand p-4 sm:p-5">
        <div
          className={`flex flex-wrap items-start justify-between gap-4 border-b border-leaf/10 ${
            compact ? "pb-4" : "pb-5"
          }`}
        >
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-leaf">
              {compact ? "Refine search" : "Search mission"}
            </p>
            <h2
              className={`font-semibold text-ink ${
                compact ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"
              }`}
            >
              {compact
                ? "Tighten the shortlist without leaving the page."
                : "Tell FindAMeal what you want, where to look, and how strict to be."}
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-leaf/80">
              Start with the craving, lock the location, then use filters only
              when they help the decision.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-leaf/10 bg-paper px-3 py-1.5 text-xs font-medium text-leaf">
              {locationStatus}
            </span>
            <span className="rounded-full border border-leaf/10 bg-paper px-3 py-1.5 text-xs font-medium text-leaf">
              {activeFilterCount > 0
                ? `${activeFilterCount} filter${activeFilterCount > 1 ? "s" : ""} active`
                : "Clean search"}
            </span>
            <span className="rounded-full border border-leaf/10 bg-paper px-3 py-1.5 text-xs font-medium text-leaf">
              {hasCoordinates ? "Distance-ready" : "Text area search"}
            </span>
          </div>
        </div>

        {!compact ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-leaf/10 bg-paper p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-leaf/70">
                Query
              </p>
              <p className="mt-2 text-lg font-semibold text-ink">
                {query || "Add a craving or cuisine"}
              </p>
              <p className="mt-1 text-sm text-leaf/75">
                Search by dish, cuisine, or a broad intent like brunch.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-leaf/10 bg-paper p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-leaf/70">
                Area
              </p>
              <p className="mt-2 text-lg font-semibold text-ink">
                {location || "Choose where to search"}
              </p>
              <p className="mt-1 text-sm text-leaf/75">
                Use the map picker for precise distance-based sorting.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-leaf/10 bg-paper p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-leaf/70">
                Active filters
              </p>
              <p className="mt-2 text-lg font-semibold text-ink">
                {activeFilterCount > 0 ? `${activeFilterCount} selected` : "Optional"}
              </p>
              <p className="mt-1 text-sm text-leaf/75">
                Category, rating, price, distance, and open-now all feed the
                same search request.
              </p>
            </div>
          </div>
        ) : null}

        <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)_auto]">
          <label
            className={`rounded-[1.55rem] border bg-paper px-4 py-3 transition focus-within:border-leaf ${
              error ? "border-amber" : "border-leaf/10"
            }`}
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-leaf/70">
              Meal or cuisine
            </span>
            <div className="mt-2 flex items-center gap-3">
              <SearchIcon />
              <input
                type="text"
                name="q"
                value={query}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Pizza, sushi, burgers, brunch..."
                maxLength={SEARCH_QUERY_MAX_LENGTH}
                autoComplete="off"
                enterKeyHint="search"
                aria-invalid={Boolean(error || formError)}
                aria-describedby={error || formError ? errorTextId : helpTextId}
                className="w-full bg-transparent text-base text-ink outline-none placeholder:text-leaf/60"
              />
            </div>
          </label>

          <label className="rounded-[1.55rem] border border-leaf/10 bg-paper px-4 py-3 transition focus-within:border-leaf">
            <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-leaf/70">
              Search area
            </span>
            <div className="mt-2 flex items-center gap-3">
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
                aria-invalid={Boolean(formError)}
                aria-describedby={formError ? errorTextId : helpTextId}
                className="w-full bg-transparent text-base text-ink outline-none placeholder:text-leaf/60"
              />
            </div>
          </label>

          <button
            type="submit"
            className="flex min-h-[4.75rem] min-w-[11rem] flex-col items-center justify-center rounded-[1.55rem] bg-leaf px-7 text-center transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="text-base font-semibold text-paper">Find meals</span>
            <span className="mt-1 text-xs font-medium uppercase tracking-[0.22em] text-paper">
              Search now
            </span>
          </button>
        </div>

        <div
          className={`mt-4 flex flex-col gap-3 ${
            compact ? "" : "xl:flex-row xl:items-start xl:justify-between"
          }`}
        >
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setIsFiltersOpen(false);
                setIsLocationPickerOpen(true);
              }}
              aria-label="Open location picker"
              className="rounded-full border border-leaf/15 bg-paper px-4 py-2.5 text-sm font-medium text-leaf transition hover:border-leaf hover:bg-sand"
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
                className="inline-flex items-center gap-2 rounded-full border border-leaf/15 bg-paper px-4 py-2.5 text-sm font-medium text-leaf transition hover:border-leaf hover:bg-sand"
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
          </div>

          <div className="rounded-[1.5rem] border border-leaf/10 bg-paper px-4 py-3 xl:min-w-[19rem] xl:max-w-[24rem]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-leaf/70">
              Search status
            </p>
            <p className="mt-2 text-sm font-medium text-ink">
              {mapSelection
                ? `Map pin ready for ${mapSelection.address}`
                : location
                  ? `Searching near ${location}`
                  : "Add a location before searching"}
            </p>
            <p className="mt-1 text-xs leading-5 text-leaf/75">
              {hasCoordinates
                ? "Distance sort and radius filters can use your selected coordinates."
                : "A typed area works for search, but map selection makes distance filters more precise."}
            </p>
          </div>
        </div>

        <div
          className={`mt-4 grid gap-3 ${
            compact ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]" : "lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]"
          }`}
        >
          <div className="rounded-[1.5rem] border border-leaf/10 bg-paper px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-leaf/70">
              Input rules
            </p>
            <p id={helpTextId} className="mt-2 text-xs leading-5 text-leaf/75">
              Up to {SEARCH_QUERY_MAX_LENGTH} characters. Allowed: letters,
              numbers, spaces, and &apos; &amp; . , ( ) / -
            </p>
            {error ? (
              <p
                id={errorTextId}
                role="alert"
                className="mt-2 text-xs font-medium text-amber"
              >
                {error}
              </p>
            ) : formError ? (
              <p
                id={errorTextId}
                role="alert"
                className="mt-2 text-xs font-medium text-amber"
              >
                {formError}
              </p>
            ) : null}
          </div>

          <div className="rounded-[1.5rem] border border-leaf/10 bg-paper px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-leaf/70">
                Active filters
              </p>
              <span className="text-xs font-medium text-leaf/70">
                Sort: {sortLabel}
              </span>
            </div>
            {selectedFilterLabels.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedFilterLabels.map((label) => (
                  <span
                    key={label}
                    className="rounded-full border border-leaf/10 bg-sand px-3 py-1.5 text-xs font-medium text-leaf"
                  >
                    {label}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-xs leading-5 text-leaf/75">
                No advanced filters yet. Use the Filters dropdown only when you
                need a tighter shortlist.
              </p>
            )}
          </div>
        </div>
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
