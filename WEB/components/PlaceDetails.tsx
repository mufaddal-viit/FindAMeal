import Image from "next/image";
import type { Place } from "@/types/place";

interface PlaceDetailsProps {
  place: Place;
}

export default function PlaceDetails({ place }: PlaceDetailsProps) {
  return (
    <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        <div className="relative h-[320px] overflow-hidden rounded-[2rem] shadow-lg shadow-stone-200">
          <Image
            src={place.imageUrl}
            alt={place.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 60vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <p className="text-sm uppercase tracking-[0.3em] text-white/75">Place detail</p>
            <h1 className="mt-3 text-4xl font-semibold">{place.name}</h1>
            <p className="mt-2 text-sm text-white/85">
              {place.city}, {place.country}
            </p>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-lg shadow-stone-200/70">
          <h2 className="text-2xl font-semibold text-slate-950">About this place</h2>
          <p className="mt-4 text-base leading-7 text-slate-700">{place.description}</p>
        </div>
      </div>

      <aside className="space-y-6 rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-lg shadow-stone-200/70">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-800">
            Snapshot
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[1.5rem] bg-stone-100 p-4">
              <p className="text-sm text-slate-500">Rating</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">
                {place.rating.toFixed(1)}
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-stone-100 p-4">
              <p className="text-sm text-slate-500">Price level</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">{place.priceLevel}</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-950">Cuisines</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {place.cuisines.map((cuisine) => (
              <span
                key={cuisine}
                className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-900"
              >
                {cuisine}
              </span>
            ))}
          </div>
        </div>
      </aside>
    </section>
  );
}

