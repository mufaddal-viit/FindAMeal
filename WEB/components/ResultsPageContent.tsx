import Link from "next/link";
import EmptyState from "@/components/EmptyState";
import PageHeader from "@/components/PageHeader";
import PlaceCard from "@/components/PlaceCard";
import SearchForm from "@/components/SearchForm";
import type {
  SearchCategory,
  SearchSortValue
} from "@/lib/searchFormOptions";
import type { Place, PlacesResponseMeta, PriceLevel } from "@/types/place";

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
          initialRadiusKm={radiusKm}
          initialMinRating={minRating}
          initialPriceLevels={priceLevels}
          initialOpenNow={openNow}
          initialLatitude={latitude}
          initialLongitude={longitude}
          compact
        />
        {meta ? (
          <div className="space-y-1">
            <p className="text-sm text-leaf/70">
              Data source:{" "}
              <span className="font-semibold text-ink">{meta.source}</span>
            </p>
            {meta.ai ? (
              <p className="text-sm text-leaf/70">
                AI searched for{" "}
                <span className="font-semibold text-ink">
                  {meta.ai.queryUsed}
                </span>
                {meta.ai.sources.length > 0
                  ? ` across ${meta.ai.sources.length} source(s).`
                  : "."}
              </p>
            ) : null}
            {sort === "distance" && meta.effectiveSort !== "distance" ? (
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
            {error
              ? "Results unavailable"
              : `${meta?.total ?? places.length} place(s) found`}
          </p>
          <Link
            href="/"
            className="text-sm font-semibold text-amber border-2 border-sand rounded-2xl px-2 py-1 transition hover:text-ink"
          >
            Back home
          </Link>
        </div>

        {!error && places.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {places.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                distanceKm={place.distanceKm}
              />
            ))}
          </div>
        ) : null}
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
