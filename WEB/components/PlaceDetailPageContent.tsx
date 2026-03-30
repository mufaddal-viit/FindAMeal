"use client";

import Link from "next/link";
import EmptyState from "@/components/EmptyState";
import PlaceDetails from "@/components/PlaceDetails";
import { usePlace } from "@/hooks/usePlace";

interface PlaceDetailPageContentProps {
  id: string;
}

export default function PlaceDetailPageContent({
  id
}: PlaceDetailPageContentProps) {
  const { place, loading, error, source } = usePlace(id);

  return (
    <main className="space-y-8 py-10">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/results?q=restaurants&location=Dubai%2C%20UAE"
          className="text-sm font-semibold text-leaf transition hover:text-ink"
        >
          Back to results
        </Link>
        {source ? (
          <p className="text-sm text-leaf/70">
            Data source: <span className="font-semibold text-ink">{source}</span>
          </p>
        ) : null}
      </div>

      {loading ? (
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="h-[420px] animate-pulse rounded-[2rem] border border-leaf/10 bg-paper" />
          <div className="h-[420px] animate-pulse rounded-[2rem] border border-leaf/10 bg-paper" />
        </div>
      ) : null}

      {!loading && error ? (
        <EmptyState
          title="Could not load this place"
          description={`${error} Check the API server or try one of the demo place IDs linked from the home page.`}
        />
      ) : null}

      {!loading && !error && !place ? (
        <EmptyState
          title="Place not found"
          description="This place is not available in the current AI search cache or demo fallback set."
        />
      ) : null}

      {!loading && !error && place ? <PlaceDetails place={place} /> : null}
    </main>
  );
}
