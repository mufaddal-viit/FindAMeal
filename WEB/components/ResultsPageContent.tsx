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

export default function ResultsPageContent({
  query
}: ResultsPageContentProps) {
  const { places, loading, error, source } = usePlaces(query);

  return (
    <main className="space-y-8 py-10">
      <section className="space-y-6 rounded-[2.5rem] border border-white/70 bg-white/75 p-8 shadow-lg shadow-stone-200/70">
        <PageHeader
          eyebrow="Results"
          title={query ? `Places matching "${query}"` : "Browse places"}
          description="Results are fetched from the Express API with axios. Right now the API serves a local demo data file, so the search flow works without a database."
        />
        <SearchForm initialValue={query} compact />
        {source ? (
          <p className="text-sm text-slate-500">
            Data source: <span className="font-semibold text-slate-700">{source}</span>
          </p>
        ) : null}
      </section>

      {loading ? (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-[420px] animate-pulse rounded-[2rem] bg-white/70 shadow-sm"
            />
          ))}
        </section>
      ) : null}

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

      {!loading && !error && places.length > 0 ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">{places.length} place(s) found</p>
            <Link href="/" className="text-sm font-semibold text-emerald-900">
              Back home
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {places.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

