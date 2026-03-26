import Image from "next/image";
import Link from "next/link";
import type { Place } from "@/types/place";

interface PlaceCardProps {
  place: Place;
}

export default function PlaceCard({ place }: PlaceCardProps) {
  return (
    <article className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 shadow-lg shadow-stone-200/70 backdrop-blur transition hover:-translate-y-1">
      <div className="relative h-56">
        <Image
          src={place.imageUrl}
          alt={place.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
            {place.priceLevel}
          </span>
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
            {place.rating.toFixed(1)} / 5
          </span>
        </div>
      </div>

      <div className="space-y-5 p-6">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-2xl font-semibold text-slate-950">{place.name}</h2>
            <p className="text-sm text-slate-600">
              {place.city}, {place.country}
            </p>
          </div>
          <p className="text-sm leading-6 text-slate-600">{place.description}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {place.cuisines.map((cuisine) => (
            <span
              key={cuisine}
              className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-slate-700"
            >
              {cuisine}
            </span>
          ))}
        </div>

        <Link
          href={`/places/${place.id}`}
          className="inline-flex items-center rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-400"
        >
          View place
        </Link>
      </div>
    </article>
  );
}

