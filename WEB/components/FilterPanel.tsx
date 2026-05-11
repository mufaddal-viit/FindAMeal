"use client";

import { useState } from "react";
import type { PriceLevel } from "@/types/place";

interface FilterPanelProps {
  minRating?: number;
  priceLevels?: PriceLevel[];
  openNow?: boolean;
  radiusKm?: number;
  onFilterChange?: (filters: {
    minRating?: number;
    priceLevels?: PriceLevel[];
    openNow?: boolean;
    radiusKm?: number;
  }) => void;
}

const PRICE_LEVELS: { label: string; value: PriceLevel }[] = [
  { label: "Budget", value: "$" },
  { label: "Mid-range", value: "$$" },
  { label: "Premium", value: "$$$" },
  { label: "Luxury", value: "$$$$" }
];

const RATING_OPTIONS = [
  { label: "Any rating", value: undefined },
  { label: "4+ stars", value: 4 },
  { label: "4.5+ stars", value: 4.5 }
];

export default function FilterPanel({
  minRating = undefined,
  priceLevels = [],
  openNow = false,
  radiusKm = undefined,
  onFilterChange
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const activeFiltersCount = [
    minRating !== undefined ? 1 : 0,
    priceLevels.length > 0 ? 1 : 0,
    openNow ? 1 : 0,
    radiusKm !== undefined ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  const handleRatingChange = (rating: number | undefined) => {
    onFilterChange?.({
      minRating: rating,
      priceLevels,
      openNow,
      radiusKm
    });
  };

  const handlePriceLevelToggle = (level: PriceLevel) => {
    const updated = priceLevels.includes(level)
      ? priceLevels.filter((p) => p !== level)
      : [...priceLevels, level];
    onFilterChange?.({
      minRating,
      priceLevels: updated,
      openNow,
      radiusKm
    });
  };

  const handleOpenNowToggle = () => {
    onFilterChange?.({
      minRating,
      priceLevels,
      openNow: !openNow,
      radiusKm
    });
  };

  const handleRadiusChange = (radius: number | undefined) => {
    onFilterChange?.({
      minRating,
      priceLevels,
      openNow,
      radiusKm: radius
    });
  };

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between rounded-[1.2rem] border border-leaf/10 bg-paper px-4 py-3 text-sm font-semibold text-ink transition hover:border-leaf hover:bg-sand dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-slate-500 dark:hover:bg-slate-700"
      >
        <span className="flex items-center gap-2">
          🎚️ Filter
          {activeFiltersCount > 0 && (
            <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-white">
              {activeFiltersCount}
            </span>
          )}
        </span>
        <span className={`transition ${isExpanded ? "rotate-180" : ""}`}>▼</span>
      </button>

      {isExpanded && (
        <div className="space-y-4 rounded-[1.5rem] border border-leaf/10 bg-paper p-4 shadow-lg shadow-leaf/5 animate-slide-in dark:border-slate-600 dark:bg-slate-800 dark:shadow-slate-900/10">
          {/* Rating Filter */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-leaf dark:text-emerald-400">Rating</p>
            <div className="space-y-1.5">
              {RATING_OPTIONS.map((option) => (
                <label key={option.label} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="rating"
                    checked={minRating === option.value}
                    onChange={() => handleRatingChange(option.value)}
                    className="h-4 w-4 cursor-pointer accent-leaf"
                  />
                  <span className="text-sm text-ink">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Level Filter */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-leaf">Price</p>
            <div className="flex flex-wrap gap-2">
              {PRICE_LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() => handlePriceLevelToggle(level.value)}
                  className={`rounded-full px-3 py-1 text-sm font-medium transition ${
                    priceLevels.includes(level.value)
                      ? "bg-leaf text-paper"
                      : "border border-leaf/10 bg-sand text-ink hover:border-leaf"
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          {/* Open Now Filter */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={openNow}
                onChange={handleOpenNowToggle}
                className="h-4 w-4 cursor-pointer accent-leaf"
              />
              <span className="text-sm font-medium text-ink">Open now</span>
            </label>
          </div>

          {/* Radius Filter */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-leaf">Distance</p>
            <div className="space-y-1.5">
              {[1, 2, 5, 10, 25].map((radius) => (
                <label key={radius} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="radius"
                    checked={radiusKm === radius}
                    onChange={() => handleRadiusChange(radius)}
                    className="h-4 w-4 cursor-pointer accent-leaf"
                  />
                  <span className="text-sm text-ink">Within {radius} km</span>
                </label>
              ))}
              {radiusKm !== undefined && ![1, 2, 5, 10, 25].includes(radiusKm) && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="radius"
                    checked={true}
                    className="h-4 w-4 cursor-pointer accent-leaf"
                  />
                  <span className="text-sm text-ink">Within {radiusKm} km</span>
                </label>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
