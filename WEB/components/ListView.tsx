"use client";

import Image from "next/image";
import Link from "next/link";
import type { Place } from "@/types/place";

interface ListViewProps {
  places: Place[];
  selectedPlaceId?: string;
  onSelectPlace?: (id: string) => void;
}

function formatDistance(distanceKm: number) {
  if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)} km`;
  }
  return `${Math.round(distanceKm)} km`;
}

export default function ListView({
  places,
  selectedPlaceId,
  onSelectPlace
}: ListViewProps) {
  if (places.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-leaf/10 bg-paper p-8 text-center dark:border-slate-600 dark:bg-slate-800">
        <p className="text-sm text-leaf/80 dark:text-slate-400">No places found. Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {places.map((place) => (
        <div
          key={place.id}
          onClick={() => onSelectPlace?.(place.id)}
          className={`group cursor-pointer rounded-[1.2rem] border transition ${
            selectedPlaceId === place.id
              ? "border-leaf bg-sand shadow-lg shadow-leaf/15 dark:border-emerald-500 dark:bg-slate-700 dark:shadow-emerald-500/20"
              : "border-leaf/10 bg-paper hover:border-leaf hover:bg-sand dark:border-slate-600 dark:bg-slate-800 dark:hover:border-emerald-500 dark:hover:bg-slate-700"
          }`}
        >
          <div className="flex gap-3 p-3">
            {/* Image */}
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-[0.8rem]">
              <Image
                src={place.imageUrl}
                alt={place.name}
                fill
                className="object-cover transition group-hover:scale-110"
                sizes="80px"
              />
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col justify-between gap-1">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-ink dark:text-slate-100">{place.name}</h3>
                  <span className="whitespace-nowrap rounded-full bg-accent/10 px-2 py-0.5 text-xs font-bold text-accent dark:bg-accent/20 dark:text-rose-400">
                    ⭐ {(place.rating ?? 0).toFixed(1)}
                  </span>
                </div>
                <p className="line-clamp-1 text-xs text-leaf/70 dark:text-slate-400">{place.address}</p>
              </div>

              {/* Tags */}
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {place.cuisines.slice(0, 2).map((cuisine) => (
                    <span
                      key={cuisine}
                      className="rounded-full bg-leaf/10 px-2 py-0.5 text-xs font-medium text-leaf"
                    >
                      {cuisine}
                    </span>
                  ))}
                  {place.cuisines.length > 2 && (
                    <span className="text-xs text-leaf/60">+{place.cuisines.length - 2}</span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-ink">
                  <span>{place.priceLevel}</span>
                  {place.distanceKm !== null && (
                    <>
                      <span className="text-leaf/50">•</span>
                      <span>{formatDistance(place.distanceKm)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex items-center text-leaf/50 transition group-hover:text-leaf">→</div>
          </div>
        </div>
      ))}
    </div>
  );
}
