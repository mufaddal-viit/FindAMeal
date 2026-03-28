import ResultsPageContent from "@/components/ResultsPageContent";
import { fetchPlaces, getApiErrorMessage } from "@/lib/api";
import {
  parseFiltersFromSearchParams,
  toPlaceListFilters
} from "@/lib/placeFilterParams";
import type { Place, PlacesResponseMeta } from "@/types/place";

interface ResultsPageProps {
  searchParams: Promise<{
    q?: string | string[];
    location?: string | string[];
    category?: string | string[];
    sort?: string | string[];
    lat?: string | string[];
    lng?: string | string[];
    radiusKm?: string | string[];
    minRating?: string | string[];
    priceLevels?: string | string[];
    openNow?: string | string[];
    page?: string | string[];
    pageSize?: string | string[];
  }>;
}

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const resolvedSearchParams = await searchParams;
  const { values, error: filterError } =
    parseFiltersFromSearchParams(resolvedSearchParams);
  let places: Place[] = [];
  let meta: PlacesResponseMeta | null = null;
  let error = filterError;

  if (!error) {
    try {
      const response = await fetchPlaces(toPlaceListFilters(values));
      places = response.data;
      meta = response.meta;
    } catch (requestError) {
      error = getApiErrorMessage(requestError);
    }
  }

  return (
    <ResultsPageContent
      query={values.query}
      location={values.location}
      category={values.category}
      sort={values.sort}
      radiusKm={values.radiusKm}
      minRating={values.minRating}
      priceLevels={values.priceLevels}
      openNow={values.openNow}
      latitude={values.latitude}
      longitude={values.longitude}
      places={places}
      meta={meta}
      error={error}
    />
  );
}
