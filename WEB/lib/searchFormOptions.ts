export const SEARCH_CATEGORIES = [
  "All",
  "Italian",
  "Japanese",
  "Indian",
  "American",
  "Chinese",
  "Mexican",
  "Vegetarian"
] as const;

export type SearchCategory = (typeof SEARCH_CATEGORIES)[number];

export const SEARCH_SORT_OPTIONS = [
  { value: "rating", label: "Rating" },
  { value: "distance", label: "Distance" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" }
] as const;

export type SearchSortValue = (typeof SEARCH_SORT_OPTIONS)[number]["value"];

export function isSearchCategory(value: string): value is SearchCategory {
  return SEARCH_CATEGORIES.includes(value as SearchCategory);
}

export function isSearchSortValue(value: string): value is SearchSortValue {
  return SEARCH_SORT_OPTIONS.some((option) => option.value === value);
}

