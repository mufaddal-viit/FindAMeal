"use client";

import { useState } from "react";
import {
  DISTANCE_FILTER_OPTIONS,
  PRICE_LEVEL_OPTIONS,
  RATING_FILTER_OPTIONS,
  isSearchCategory,
  isSearchSortValue,
  type SearchCategory,
  type SearchSortValue
} from "@/lib/searchFormOptions";
import type { PriceLevel } from "@/types/place";

interface UsePlaceFiltersOptions {
  initialCategory?: string;
  initialSort?: string;
  initialRadiusKm?: number;
  initialMinRating?: number;
  initialPriceLevels?: PriceLevel[];
  initialOpenNow?: boolean;
}

const DISTANCE_VALUES: readonly number[] = DISTANCE_FILTER_OPTIONS.flatMap((option) =>
  typeof option.value === "number" ? [option.value] : []
);
const RATING_VALUES: readonly number[] = RATING_FILTER_OPTIONS.flatMap((option) =>
  typeof option.value === "number" ? [option.value] : []
);

function sanitizePriceLevels(values?: PriceLevel[]) {
  if (!values) {
    return [];
  }

  return Array.from(
    new Set(values.filter((value) => PRICE_LEVEL_OPTIONS.includes(value)))
  );
}

export function usePlaceFilters({
  initialCategory = "All",
  initialSort = "rating",
  initialRadiusKm,
  initialMinRating,
  initialPriceLevels,
  initialOpenNow = false
}: UsePlaceFiltersOptions) {
  const [category, setCategory] = useState<SearchCategory>(
    isSearchCategory(initialCategory) ? initialCategory : "All"
  );
  const [sort, setSort] = useState<SearchSortValue>(
    isSearchSortValue(initialSort) ? initialSort : "rating"
  );
  const [radiusKm, setRadiusKm] = useState<number | undefined>(
    DISTANCE_VALUES.includes(initialRadiusKm ?? Number.NaN)
      ? initialRadiusKm
      : undefined
  );
  const [minRating, setMinRating] = useState<number | undefined>(
    RATING_VALUES.includes(initialMinRating ?? Number.NaN)
      ? initialMinRating
      : undefined
  );
  const [priceLevels, setPriceLevels] = useState<PriceLevel[]>(
    sanitizePriceLevels(initialPriceLevels)
  );
  const [openNow, setOpenNow] = useState(Boolean(initialOpenNow));

  function togglePriceLevel(priceLevel: PriceLevel) {
    setPriceLevels((current) =>
      current.includes(priceLevel)
        ? current.filter((value) => value !== priceLevel)
        : [...current, priceLevel]
    );
  }

  function resetFilters() {
    setCategory("All");
    setSort("rating");
    setRadiusKm(undefined);
    setMinRating(undefined);
    setPriceLevels([]);
    setOpenNow(false);
  }

  const activeFilterCount =
    (category !== "All" ? 1 : 0) +
    (sort !== "rating" ? 1 : 0) +
    (typeof radiusKm === "number" ? 1 : 0) +
    (typeof minRating === "number" ? 1 : 0) +
    (priceLevels.length > 0 ? 1 : 0) +
    (openNow ? 1 : 0);

  return {
    category,
    setCategory,
    sort,
    setSort,
    radiusKm,
    setRadiusKm,
    minRating,
    setMinRating,
    priceLevels,
    setPriceLevels,
    togglePriceLevel,
    openNow,
    setOpenNow,
    activeFilterCount,
    resetFilters
  };
}
