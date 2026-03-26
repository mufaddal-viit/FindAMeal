"use client";

import Link from "next/link";
import EmptyState from "@/components/EmptyState";
import PageHeader from "@/components/PageHeader";
import PlaceCard from "@/components/PlaceCard";
import SearchForm from "@/components/SearchForm";
import { usePlaces } from "@/hooks/usePlaces";

interface ResultsPageContentProps {
  query: string;
}

export default function ResultsPageContent({ query }: ResultsPageContentProps) {
  const { places, loading, error, source } = usePlaces(query);

  return (
    <main className="space-y-8 py-10">
      <section className="space-y-6 rounded-[2.5rem] border border-leaf/10 bg-paper p-8 shadow-lg shadow-leaf/10">
        <PageHeader
          eyebrow="Results"
          title={query ? `Places matching "${query}"` : "Browse places"}
          description=""
        />
        <SearchForm initialValue={query} compact />
        {source ? (
          <p className="text-sm text-leaf/70">
            Data source:{" "}
            <span className="font-semibold text-ink">{source}</span>
          </p>
        ) : null}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-leaf/80">
            {loading ? "Loading places..." : `${places.length} place(s) found`}
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

        {!loading && !error && places.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {places.map((place) => (
              <PlaceCard key={place.id} place={place} />
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

      {!loading && !error && places.length === 0 ? (
        <EmptyState
          title="No places found"
          description="Try a broader city or cuisine search, or add more entries to the demo data file and search again."
        />
      ) : null}
    </main>
  );
}
