import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import PlaceCard from "@/components/PlaceCard";
import SearchForm from "@/components/SearchForm";
import StarterFlowCard from "@/components/StarterFlowCard";
import type { Place } from "@/types/place";

const featuredPlaces: Place[] = [
  {
    id: "demo-dubai-saffron-table",
    name: "Saffron Table",
    description:
      "Fresh mezze, grilled mains, and a calm dining room for easy weeknight meals.",
    address: "Sheikh Mohammed bin Rashid Blvd, Downtown Dubai, UAE",
    city: "Dubai",
    country: "UAE",
    cuisines: ["Middle Eastern", "Grill", "Desserts"],
    imageUrl:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    priceLevel: "$$",
    priceRange: "mid",
    rating: 4.7,
    openNow: true,
    distanceKm: null,
    sourceUrl: null,
    tags: ["mezze", "grill", "desserts"],
    coordinates: null
  },
  {
    id: "demo-abu-dhabi-harbor-bowl",
    name: "Harbor Bowl",
    description: "Seafood bowls and bright sides with a fast, casual feel.",
    address: "Corniche Road, Abu Dhabi, UAE",
    city: "Abu Dhabi",
    country: "UAE",
    cuisines: ["Seafood", "Healthy", "Bowls"],
    imageUrl:
      "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=80",
    priceLevel: "$$$",
    priceRange: "premium",
    rating: 4.5,
    openNow: true,
    distanceKm: null,
    sourceUrl: null,
    tags: ["seafood", "healthy", "bowls"],
    coordinates: null
  },
  {
    id: "demo-sharjah-cedar-corner",
    name: "Cedar Corner",
    description: "Wraps, salads, and quick comfort food for lunch or dinner.",
    address: "Al Majaz Waterfront, Sharjah, UAE",
    city: "Sharjah",
    country: "UAE",
    cuisines: ["Lebanese", "Wraps", "Salads"],
    imageUrl:
      "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=80",
    priceLevel: "$$",
    priceRange: "mid",
    rating: 4.6,
    openNow: false,
    distanceKm: null,
    sourceUrl: null,
    tags: ["lebanese", "wraps", "salads"],
    coordinates: null
  }
];

export default function HomePage() {
  return (
    <main className="space-y-12">
      <section className=" flex flex-col gap-10 rounded-[2.5rem]  border-leaf/10 bg-gradient-to-br from-amber/90 via-amber/70 to-amber-30 p-8 shadow-xl shadow-leaf/10 lg:grid-cols-[1.05fr_0.95fr] lg:p-12">
        <div className="space-y-6">
          <PageHeader
            eyebrow="Simple starter"
            title="Find a meal without digging through ten tabs."
            description="Get you favourite foood nearest to you!"
          />
          <SearchForm />
        </div>

        <StarterFlowCard />
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-leaf">
              Featured
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-ink">
              Starter places
            </h2>
          </div>
          <Link
            href="/results?q=restaurants&location=Dubai%2C%20UAE"
            className="text-sm font-semibold text-amber transition hover:text-ink"
          >
            Browse all
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {featuredPlaces.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      </section>
    </main>
  );
}
