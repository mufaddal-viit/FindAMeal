import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import PlaceCard from "@/components/PlaceCard";
import SearchForm from "@/components/SearchForm";
import StarterFlowCard from "@/components/StarterFlowCard";

const featuredPlaces = [
  {
    id: "demo-dubai-saffron-table",
    name: "Saffron Table",
    city: "Dubai",
    country: "UAE",
    description:
      "Fresh mezze, grilled mains, and a calm dining room for easy weeknight meals.",
    cuisines: ["Middle Eastern", "Grill", "Desserts"],
    imageUrl:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    priceLevel: "$$",
    rating: 4.7,
  },
  {
    id: "demo-abu-dhabi-harbor-bowl",
    name: "Harbor Bowl",
    city: "Abu Dhabi",
    country: "UAE",
    description: "Seafood bowls and bright sides with a fast, casual feel.",
    cuisines: ["Seafood", "Healthy", "Bowls"],
    imageUrl:
      "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=80",
    priceLevel: "$$$",
    rating: 4.5,
  },
  {
    id: "demo-sharjah-cedar-corner",
    name: "Cedar Corner",
    city: "Sharjah",
    country: "UAE",
    description: "Wraps, salads, and quick comfort food for lunch or dinner.",
    cuisines: ["Lebanese", "Wraps", "Salads"],
    imageUrl:
      "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=80",
    priceLevel: "$$",
    rating: 4.6,
  },
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
            href="/results?q=UAE"
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
