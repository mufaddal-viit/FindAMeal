import Image from "next/image";
import Link from "next/link";
import type { Place } from "@/types/place";

interface PlaceCardProps {
  place: Place;
  distanceKm?: number | null;
}

function formatDistance(distanceKm: number) {
  if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)} km away`;
  }

  return `${Math.round(distanceKm)} km away`;
}

function formatRating(rating: number | null) {
  return rating === null ? "No rating" : `${rating.toFixed(1)} / 5`;
}

function formatPriceLevel(priceLevel: Place["priceLevel"]) {
  return priceLevel ?? "Unknown price";
}

export default function PlaceCard({ place, distanceKm }: PlaceCardProps) {
  const locationLabel = place.address || `${place.city}, ${place.country}`;

  return (
    <article className="overflow-hidden rounded-[2rem] border border-leaf/10 bg-paper shadow-lg shadow-leaf/10 backdrop-blur transition hover:-translate-y-1 hover:shadow-amber/20 dark:border-slate-700 dark:bg-slate-800 dark:shadow-slate-900/30 dark:hover:shadow-slate-700/50">
      <div className="relative h-56">
        <Image
          src={place.imageUrl}
          alt={place.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/65 to-transparent dark:from-slate-900/80" />
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center gap-2 text-paper dark:text-slate-200">
          <span className="rounded-full border border-paper bg-ink/40 px-3 py-1 text-xs font-semibold backdrop-blur dark:border-slate-500 dark:bg-slate-900/60">
            {formatPriceLevel(place.priceLevel)}
          </span>
          {typeof distanceKm === "number" ? (
            <span className="rounded-full border border-paper bg-ink/40 px-3 py-1 text-xs font-semibold backdrop-blur dark:border-slate-500 dark:bg-slate-900/60">
              {formatDistance(distanceKm)}
            </span>
          ) : null}
          <span className="rounded-full border border-paper bg-ink/40 px-3 py-1 text-xs font-semibold backdrop-blur dark:border-slate-500 dark:bg-slate-900/60">
            {formatRating(place.rating)}
          </span>
        </div>
      </div>

      <div className="space-y-5 p-6">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-2xl font-semibold text-ink dark:text-slate-100">{place.name}</h2>
            <p className="text-right text-sm text-leaf/80 dark:text-slate-400">{locationLabel}</p>
          </div>
          <p className="text-sm leading-6 text-leaf/80 dark:text-slate-400">{place.description}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {place.cuisines.map((cuisine) => (
            <span
              key={cuisine}
              className="rounded-full bg-sand px-3 py-1 text-xs font-medium text-ink/80 dark:bg-slate-700 dark:text-slate-300"
            >
              {cuisine}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/places/${place.id}`}
            className="inline-flex items-center rounded-full bg-amber px-4 py-2 text-sm font-semibold text-ink transition hover:bg-leaf hover:text-paper dark:bg-amber-600 dark:text-slate-900 dark:hover:bg-amber-500"
          >
            View place
          </Link>
          {place.sourceUrl ? (
            <a
              href={place.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full border border-leaf/15 bg-sand px-4 py-2 text-sm font-medium text-leaf transition hover:border-leaf hover:bg-paper hover:text-ink dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:bg-slate-600"
            >
              Source
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
