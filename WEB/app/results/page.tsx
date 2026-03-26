import ResultsPageContent from "@/components/ResultsPageContent";

interface ResultsPageProps {
  searchParams: Promise<{
    q?: string | string[];
  }>;
}

export default async function ResultsPage({
  searchParams
}: ResultsPageProps) {
  const resolvedSearchParams = await searchParams;
  const queryParam = resolvedSearchParams.q;
  const query = Array.isArray(queryParam) ? (queryParam[0] ?? "") : (queryParam ?? "");

  return <ResultsPageContent query={query} />;
}
