export const PLACE_SORT_VALUES = [
  "distance",
  "rating",
  "price-low",
  "price-high"
] as const;

export type PlaceSort = (typeof PLACE_SORT_VALUES)[number];
