"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import EmptyState from "@/components/EmptyState";
import PageHeader from "@/components/PageHeader";
import PlaceCard from "@/components/PlaceCard";
import SearchForm from "@/components/SearchForm";
import FilterPanel from "@/components/FilterPanel";
import ViewToggle from "@/components/ViewToggle";
import ListView from "@/components/ListView";
import type {
  SearchCategory,
  SearchSortValue
} from "@/lib/searchFormOptions";
import type { Place, PlacesResponseMeta, PriceLevel } from "@/types/place";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-96 w-full rounded-[1.5rem] border border-leaf/10 bg-paper animate-pulse" />
  )
});

interface ResultsPageContentProps {
  places: Place[];
  meta: PlacesResponseMeta | null;
  error?: string | null;
  query: string;
  location?: string;
  category?: SearchCategory;
  sort?: SearchSortValue;
  radiusKm?: number;
  minRating?: number;
  priceLevels?: PriceLevel[];
  openNow?: boolean;
  latitude?: number;
  longitude?: number;
}

export default function ResultsPageContent({
  places,
  meta,
  error = null,
  query,
  location = "",
  category = "All",
  sort = "rating",
  radiusKm,
  minRating,
  priceLevels = [],
  openNow = false,
  latitude,
  longitude
}: ResultsPageContentProps) {
  const [currentView, setCurrentView] = useState<"map" | "list">("list");
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | undefined>();

  return (
    <main className="space-y-8 py-10">
      <section className="space-y-6 rounded-[2.5rem] border border-leaf/10 bg-paper p-8 shadow-lg shadow-leaf/10 dark:border-slate-700 dark:bg-slate-800 dark:shadow-slate-900/30">
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
          initialRadiusKm={radiusKm}
          initialMinRating={minRating}
          initialPriceLevels={priceLevels}
          initialOpenNow={openNow}
          initialLatitude={latitude}
          initialLongitude={longitude}
          compact
        />
        {meta ? (
          <div className="space-y-1 text-xs sm:text-sm">
            <p className="text-leaf/70 dark:text-slate-400">
              Data source:{" "}
              <span className="font-semibold text-ink dark:text-slate-200">{meta.source}</span>
            </p>
            {meta.ai ? (
              <p className="text-leaf/70 dark:text-slate-400">
                AI searched for{" "}
                <span className="font-semibold text-ink dark:text-slate-200">
                  {meta.ai.queryUsed}
                </span>
                {meta.ai.sources.length > 0
                  ? ` across ${meta.ai.sources.length} source(s).`
                  : "."}
              </p>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-ink dark:text-slate-300">
            {error
              ? "Results unavailable"
              : `${meta?.total ?? places.length} place${
                  (meta?.total ?? places.length) !== 1 ? "s" : ""
                } found`}
          </p>
          <div className="flex items-center gap-3">
            {!error && places.length > 0 && <ViewToggle currentView={currentView} onViewChange={setCurrentView} />}
            <Link
              href="/"
              className="rounded-full border border-leaf/10 bg-sand px-3 py-2 text-sm font-medium text-ink transition hover:border-leaf hover:bg-paper dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:border-emerald-500 dark:hover:bg-slate-600"
            >
              ← Home
            </Link>
          </div>
        </div>

        {!error && places.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
            {/* Main content */}
            <div className="space-y-4">
              {currentView === "list" ? (
                <ListView
                  places={places}
                  selectedPlaceId={selectedPlaceId}
                  onSelectPlace={setSelectedPlaceId}
                />
              ) : (
                <MapView
                  places={places}
                  selectedPlaceId={selectedPlaceId}
                  onSelectPlace={setSelectedPlaceId}
                  centerLat={latitude}
                  centerLng={longitude}
                />
              )}

              {/* Selected place details in list view */}
              {currentView === "list" && selectedPlaceId && (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {places
                    .filter((p) => p.id === selectedPlaceId)
                    .map((place) => (
                      <PlaceCard
                        key={place.id}
                        place={place}
                        distanceKm={place.distanceKm}
                      />
                    ))}
                </div>
              )}

              {/* All cards view */}
              {currentView === "list" && !selectedPlaceId && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {places.map((place) => (
                    <PlaceCard
                      key={place.id}
                      place={place}
                      distanceKm={place.distanceKm}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="hidden lg:block">
              <FilterPanel
                minRating={minRating}
                priceLevels={priceLevels}
                openNow={openNow}
                radiusKm={radiusKm}
              />
            </div>
          </div>
        ) : null}

        {/* Mobile filter toggle */}
        {!error && places.length > 0 && (
          <div className="block lg:hidden">
            <FilterPanel
              minRating={minRating}
              priceLevels={priceLevels}
              openNow={openNow}
              radiusKm={radiusKm}
            />
          </div>
        )}
      </section>

      {error ? (
        <EmptyState
          title="Could not load places"
          description={error}
        />
      ) : null}

      {!error && places.length === 0 ? (
        <EmptyState
          title="No places found"
          description="Try a broader city, a different category, or adjust the current location and sort selection."
        />
      ) : null}
    </main>
  );
}
