import type { PriceLevel } from "@/types/place";

export const SEARCH_CATEGORIES = [
  "All",
  "Cafe",
  "Seafood",
  "Lebanese",
  "Asian",
  "Desserts",
  "Healthy"
] as const;

export type SearchCategory = (typeof SEARCH_CATEGORIES)[number];

export const SEARCH_SORT_OPTIONS = [
  { value: "rating", label: "Rating" },
  { value: "distance", label: "Distance" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" }
] as const;

export type SearchSortValue = (typeof SEARCH_SORT_OPTIONS)[number]["value"];

export const DISTANCE_FILTER_OPTIONS = [
  { value: undefined, label: "Any distance" },
  { value: 2, label: "< 2 km" },
  { value: 5, label: "< 5 km" },
  { value: 10, label: "< 10 km" }
] as const;

export const RATING_FILTER_OPTIONS = [
  { value: undefined, label: "Any rating" },
  { value: 4, label: "4+ stars" },
  { value: 4.5, label: "4.5+ stars" }
] as const;

export const PRICE_LEVEL_OPTIONS: readonly PriceLevel[] = [
  "$",
  "$$",
  "$$$",
  "$$$$"
];

export function isSearchCategory(value: string): value is SearchCategory {
  return SEARCH_CATEGORIES.includes(value as SearchCategory);
}

export function isSearchSortValue(value: string): value is SearchSortValue {
  return SEARCH_SORT_OPTIONS.some((option) => option.value === value);
}
