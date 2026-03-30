import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import PlaceCard from "@/components/PlaceCard";
import SearchForm from "@/components/SearchForm";
import StarterFlowCard from "@/components/StarterFlowCard";
import type { Place } from "@/types/place";

const searchHighlights = [
  {
    label: "Location aware",
    description:
      "Search a typed area or pin the map when distance should drive the shortlist."
  },
  {
    label: "Filter first",
    description:
      "Rating, price, open-now, and category all travel with the same search."
  },
  {
    label: "Decision ready",
    description:
      "The homepage is built to get you from craving to shortlist with less noise."
  }
] as const;

const quickStarts = [
  {
    label: "Late dinner in Dubai",
    href: "/results?q=late%20dinner&location=Dubai%2C%20UAE"
  },
  {
    label: "Seafood near Abu Dhabi",
    href: "/results?q=seafood&location=Abu%20Dhabi%2C%20UAE&category=Seafood"
  },
  {
    label: "Desserts in Sharjah",
    href: "/results?q=desserts&location=Sharjah%2C%20UAE&category=Desserts"
  }
] as const;

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
    <main className="space-y-14 lg:space-y-16">
      <section className="relative overflow-hidden rounded-[2.75rem] border border-leaf/10 bg-gradient-to-br from-sand via-amber/55 to-paper px-6 py-8 shadow-2xl shadow-leaf/10 lg:px-8 lg:py-10 xl:px-10">
        <div className="absolute inset-x-0 top-0 h-28 bg-leaf/8" />
        <div className="absolute -left-16 top-24 h-52 w-52 rounded-full bg-amber/25 blur-3xl" />
        <div className="absolute bottom-8 right-8 h-56 w-56 rounded-full bg-leaf/10 blur-3xl" />

        <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.08fr)_minmax(20rem,0.92fr)]">
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-leaf/10 bg-paper px-3 py-1.5 text-xs font-medium text-leaf">
                  AI-assisted restaurant search
                </span>
                <span className="rounded-full border border-leaf/10 bg-paper px-3 py-1.5 text-xs font-medium text-leaf">
                  Location-aware results
                </span>
                <span className="rounded-full border border-leaf/10 bg-paper px-3 py-1.5 text-xs font-medium text-leaf">
                  Filters built into search
                </span>
              </div>

              <PageHeader
                eyebrow="Tonight's meal, decided faster"
                title="Pick somewhere good to eat before the group chat burns out."
                description="Search by craving, lock the area, and narrow the shortlist with filters before you even open the results page."
              />

              <div className="grid gap-3 sm:grid-cols-3">
                {searchHighlights.map((highlight) => (
                  <div
                    key={highlight.label}
                    className="rounded-[1.6rem] border border-leaf/10 bg-paper p-4 shadow-sm shadow-leaf/5"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-leaf/70">
                      {highlight.label}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-ink">
                      {highlight.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <SearchForm />
          </div>

          <div className="grid gap-5">
            <div className="rounded-[2rem] border border-leaf/10 bg-leaf p-6 text-paper shadow-lg shadow-ink/15">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-paper">
                Built for real plans
              </p>
              <h2 className="mt-3 text-3xl font-semibold">
                Less browsing. Better shortlists.
              </h2>
              <p className="mt-3 text-sm leading-7 text-paper">
                FindAMeal is structured for the moment when you already know the
                area, have a rough craving, and want the search to do the
                sorting work up front.
              </p>

              <div className="mt-6 space-y-3">
                <div className="rounded-[1.4rem] border border-paper bg-ink/10 px-4 py-3">
                  <p className="text-sm font-semibold">Start with intent</p>
                  <p className="mt-1 text-sm text-paper">
                    Search broad like &quot;date night&quot; or specific like
                    &quot;ramen&quot;.
                  </p>
                </div>
                <div className="rounded-[1.4rem] border border-paper bg-ink/10 px-4 py-3">
                  <p className="text-sm font-semibold">Pin the area</p>
                  <p className="mt-1 text-sm text-paper">
                    Typed location works, but map pinning unlocks better
                    distance sorting.
                  </p>
                </div>
                <div className="rounded-[1.4rem] border border-paper bg-ink/10 px-4 py-3">
                  <p className="text-sm font-semibold">Tighten only if needed</p>
                  <p className="mt-1 text-sm text-paper">
                    Use filters when you want higher quality, not more knobs.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {quickStarts.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="inline-flex rounded-full border border-paper bg-paper px-4 py-2 text-sm font-semibold text-ink transition hover:bg-amber"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <StarterFlowCard />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">
        <div className="rounded-[2rem] border border-leaf/10 bg-paper p-6 shadow-lg shadow-leaf/10">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-leaf">
            Quick starts
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-ink">
            Test the flow with a real search direction.
          </h2>
          <p className="mt-3 text-base leading-7 text-leaf/80">
            Each of these opens the live results view with a useful starting
            point. They are meant to show how the location-first search feels
            in practice.
          </p>

          <div className="mt-6 grid gap-3">
            {quickStarts.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-[1.4rem] border border-leaf/10 bg-sand px-4 py-4 text-sm font-semibold text-ink transition hover:border-leaf hover:bg-amber/25"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-leaf">
                Featured
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-ink">
                Starter places
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-leaf/75">
                Sample cards to show the shape of the shortlist before your own
                searches take over.
              </p>
            </div>
            <Link
              href="/results?q=restaurants&location=Dubai%2C%20UAE"
              className="rounded-full border border-leaf/10 bg-paper px-4 py-2 text-sm font-semibold text-leaf transition hover:border-leaf hover:text-ink"
            >
              Browse all
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {featuredPlaces.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
