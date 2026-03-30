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
    <article className="overflow-hidden rounded-[2rem] border border-leaf/10 bg-paper shadow-lg shadow-leaf/10 backdrop-blur transition hover:-translate-y-1 hover:shadow-amber/20">
      <div className="relative h-56">
        <Image
          src={place.imageUrl}
          alt={place.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/65 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center gap-2 text-paper">
          <span className="rounded-full border border-paper bg-ink/40 px-3 py-1 text-xs font-semibold backdrop-blur">
            {formatPriceLevel(place.priceLevel)}
          </span>
          {typeof distanceKm === "number" ? (
            <span className="rounded-full border border-paper bg-ink/40 px-3 py-1 text-xs font-semibold backdrop-blur">
              {formatDistance(distanceKm)}
            </span>
          ) : null}
          <span className="rounded-full border border-paper bg-ink/40 px-3 py-1 text-xs font-semibold backdrop-blur">
            {formatRating(place.rating)}
          </span>
        </div>
      </div>

      <div className="space-y-5 p-6">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-2xl font-semibold text-ink">{place.name}</h2>
            <p className="text-right text-sm text-leaf/80">{locationLabel}</p>
          </div>
          <p className="text-sm leading-6 text-leaf/80">{place.description}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {place.cuisines.map((cuisine) => (
            <span
              key={cuisine}
              className="rounded-full bg-sand px-3 py-1 text-xs font-medium text-ink/80"
            >
              {cuisine}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/places/${place.id}`}
            className="inline-flex items-center rounded-full bg-amber px-4 py-2 text-sm font-semibold text-ink transition hover:bg-leaf hover:text-paper"
          >
            View place
          </Link>
          {place.sourceUrl ? (
            <a
              href={place.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full border border-leaf/15 bg-sand px-4 py-2 text-sm font-medium text-leaf transition hover:border-leaf hover:bg-paper hover:text-ink"
            >
              Source
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
