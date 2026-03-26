import ResultsPageContent from "@/components/ResultsPageContent";
import { sanitizeSearchQueryInput } from "@/lib/searchQuery";

interface ResultsPageProps {
  searchParams: Promise<{
    q?: string | string[];
  }>;
}

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const resolvedSearchParams = await searchParams;
  // console.log(resolvedSearchParams);
  const queryParam = resolvedSearchParams.q;
  const query = sanitizeSearchQueryInput(
    Array.isArray(queryParam) ? (queryParam[0] ?? "") : (queryParam ?? ""),
  );
  console.log(query);

  return <ResultsPageContent query={query} />;
}
