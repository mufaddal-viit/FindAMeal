"use client";

import Link from "next/link";
import EmptyState from "@/components/EmptyState";
import PageHeader from "@/components/PageHeader";
import PlaceCard from "@/components/PlaceCard";
import SearchForm from "@/components/SearchForm";
import { usePlaces } from "@/hooks/usePlaces";
import { buildPlaceResults } from "@/lib/placeResults";
import type {
  SearchCategory,
  SearchSortValue
} from "@/lib/searchFormOptions";

interface ResultsPageContentProps {
  query: string;
  location?: string;
  category?: SearchCategory;
  sort?: SearchSortValue;
  latitude?: number;
  longitude?: number;
}

export default function ResultsPageContent({
  query,
  location = "",
  category = "All",
  sort = "rating",
  latitude,
  longitude
}: ResultsPageContentProps) {
  const { places, loading, error, source } = usePlaces(query);
  const { places: visiblePlaces, effectiveSort } = buildPlaceResults({
    places,
    location,
    category,
    sort,
    userCoordinates:
      typeof latitude === "number" && typeof longitude === "number"
        ? {
            latitude,
            longitude
          }
        : null
  });

  return (
    <main className="space-y-8 py-10">
      <section className="space-y-6 rounded-[2.5rem] border border-leaf/10 bg-paper p-8 shadow-lg shadow-leaf/10">
        <PageHeader
          eyebrow="Results"
          title={query ? `Places matching "${query}"` : "Browse places"}
          description=""
        />
        <SearchForm
          initialValue={query}
          initialLocation={location}
          initialCategory={category}
          initialSort={sort}
          initialLatitude={latitude}
          initialLongitude={longitude}
          compact
        />
        {source ? (
          <div className="space-y-1">
            <p className="text-sm text-leaf/70">
              Data source:{" "}
              <span className="font-semibold text-ink">{source}</span>
            </p>
            {sort === "distance" && effectiveSort !== "distance" ? (
              <p className="text-sm text-leaf/70">
                Distance sorting needs your current location. Showing top-rated
                places instead.
              </p>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-leaf/80">
            {loading
              ? "Loading places..."
              : `${visiblePlaces.length} place(s) found`}
          </p>
          <Link
            href="/"
            className="text-sm font-semibold text-amber border-2 border-sand rounded-2xl px-2 py-1 transition hover:text-ink"
          >
            Back home
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-[420px] animate-pulse rounded-[2rem] border border-leaf/10 bg-paper shadow-sm shadow-leaf/10"
              />
            ))}
          </div>
        ) : null}

        {!loading && !error && visiblePlaces.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visiblePlaces.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                distanceKm={place.distanceKm}
              />
            ))}
          </div>
        ) : null}
      </section>

      {!loading && error ? (
        <EmptyState
          title="Could not load places"
          description={`${error} Make sure the API server is running on the expected URL.`}
        />
      ) : null}

      {!loading && !error && visiblePlaces.length === 0 ? (
        <EmptyState
          title="No places found"
          description="Try a broader city, a different category, or adjust the current location and sort selection."
        />
      ) : null}
    </main>
  );
}
