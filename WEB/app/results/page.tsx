import ResultsPageContent from "@/components/ResultsPageContent";
import {
  normalizeLocationInput,
  parseCoordinateParam
} from "@/lib/locationQuery";
import {
  isSearchCategory,
  isSearchSortValue
} from "@/lib/searchFormOptions";
import { sanitizeSearchQueryInput } from "@/lib/searchQuery";

interface ResultsPageProps {
  searchParams: Promise<{
    q?: string | string[];
    location?: string | string[];
    category?: string | string[];
    sort?: string | string[];
    lat?: string | string[];
    lng?: string | string[];
  }>;
}

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const resolvedSearchParams = await searchParams;
  const queryParam = resolvedSearchParams.q;
  const locationParam = resolvedSearchParams.location;
  const categoryParam = resolvedSearchParams.category;
  const sortParam = resolvedSearchParams.sort;
  const latitude = parseCoordinateParam(resolvedSearchParams.lat, -90, 90);
  const longitude = parseCoordinateParam(resolvedSearchParams.lng, -180, 180);
  const query = sanitizeSearchQueryInput(
    Array.isArray(queryParam) ? (queryParam[0] ?? "") : (queryParam ?? "")
  );
  const location = normalizeLocationInput(
    Array.isArray(locationParam)
      ? (locationParam[0] ?? "")
      : (locationParam ?? "")
  );
  const categoryValue = Array.isArray(categoryParam)
    ? (categoryParam[0] ?? "")
    : (categoryParam ?? "");
  const sortValue = Array.isArray(sortParam)
    ? (sortParam[0] ?? "")
    : (sortParam ?? "");
  const category = isSearchCategory(categoryValue) ? categoryValue : "All";
  const sort = isSearchSortValue(sortValue) ? sortValue : "rating";

  return (
    <ResultsPageContent
      query={query}
      location={location}
      category={category}
      sort={sort}
      latitude={latitude}
      longitude={longitude}
    />
  );
}
