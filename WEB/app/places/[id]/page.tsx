import PlaceDetailPageContent from "@/components/PlaceDetailPageContent";

interface PlaceDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PlaceDetailPage({
  params
}: PlaceDetailPageProps) {
  const { id } = await params;

  return <PlaceDetailPageContent id={id} />;
}
