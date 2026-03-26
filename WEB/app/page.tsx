import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import PlaceCard from "@/components/PlaceCard";
import SearchForm from "@/components/SearchForm";

const featuredPlaces = [
  {
    id: "demo-dubai-saffron-table",
    name: "Saffron Table",
    city: "Dubai",
    country: "UAE",
    description: "Fresh mezze, grilled mains, and a calm dining room for easy weeknight meals.",
    cuisines: ["Middle Eastern", "Grill", "Desserts"],
    imageUrl:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    priceLevel: "$$",
    rating: 4.7
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
    rating: 4.5
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
    rating: 4.6
  }
];

export default function HomePage() {
  return (
    <main className="space-y-12 py-10">
      <section className="grid gap-10 rounded-[2.5rem] border border-white/70 bg-[var(--paper)] p-8 shadow-xl shadow-amber-100/70 lg:grid-cols-[1.05fr_0.95fr] lg:p-12">
        <div className="space-y-6">
          <PageHeader
            eyebrow="Simple starter"
            title="Find a meal without digging through ten tabs."
            description="This starter pairs a Next.js frontend with an Express backend so you can search demo places, browse results, and open a single place detail page."
          />
          <SearchForm />
          <div className="flex flex-wrap gap-3 text-sm text-slate-700">
            <span className="rounded-full bg-white/90 px-4 py-2">Next.js App Router</span>
            <span className="rounded-full bg-white/90 px-4 py-2">Express + Prisma</span>
            <span className="rounded-full bg-white/90 px-4 py-2">Demo data first</span>
          </div>
        </div>

        <div className="rounded-[2rem] bg-emerald-900 p-8 text-white shadow-lg shadow-emerald-950/15">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
            Starter flow
          </p>
          <div className="mt-6 space-y-5">
            <div className="rounded-[1.5rem] bg-white/10 p-5 backdrop-blur">
              <p className="text-sm text-white/70">1. Search</p>
              <p className="mt-2 text-xl font-semibold">Try a city or cuisine from the home page.</p>
            </div>
            <div className="rounded-[1.5rem] bg-white/10 p-5 backdrop-blur">
              <p className="text-sm text-white/70">2. Browse</p>
              <p className="mt-2 text-xl font-semibold">Review the results page with API-driven cards.</p>
            </div>
            <div className="rounded-[1.5rem] bg-white/10 p-5 backdrop-blur">
              <p className="text-sm text-white/70">3. Inspect</p>
              <p className="mt-2 text-xl font-semibold">Open a place detail page for the full snapshot.</p>
            </div>
          </div>
          <Link
            href="/results?q=Dubai"
            className="mt-8 inline-flex rounded-full bg-[var(--amber)] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-95"
          >
            View sample results
          </Link>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-800">
              Featured
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">Starter places</h2>
          </div>
          <Link href="/results?q=UAE" className="text-sm font-semibold text-emerald-900">
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
