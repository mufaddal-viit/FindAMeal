"use client";

import { useState } from "react";
import Link from "next/link";
import EmptyState from "@/components/EmptyState";
import PageHeader from "@/components/PageHeader";

type PriceRange = "$" | "$$" | "$$$";
type Category =
  | "Cafe"
  | "Seafood"
  | "Lebanese"
  | "Asian"
  | "Desserts"
  | "Healthy";

interface FilterablePlace {
  id: string;
  name: string;
  city: string;
  category: Category;
  distanceKm: number;
  rating: number;
  priceRange: PriceRange;
  openNow: boolean;
  description: string;
}

const demoPlaces: FilterablePlace[] = [
  {
    id: "smart-1",
    name: "Morning Fold",
    city: "Dubai Marina",
    category: "Cafe",
    distanceKm: 1.1,
    rating: 4.7,
    priceRange: "$$",
    openNow: true,
    description: "Calm breakfast cafe with pastries, eggs, and strong coffee."
  },
  {
    id: "smart-2",
    name: "Harbor Catch",
    city: "Jumeirah",
    category: "Seafood",
    distanceKm: 3.8,
    rating: 4.5,
    priceRange: "$$$",
    openNow: true,
    description: "Fresh seafood plates and grilled mains near the beach."
  },
  {
    id: "smart-3",
    name: "Cedar Oven",
    city: "Al Nahda",
    category: "Lebanese",
    distanceKm: 1.9,
    rating: 4.3,
    priceRange: "$$",
    openNow: false,
    description: "Wraps, grills, and shared mezze for fast weekday dinners."
  },
  {
    id: "smart-4",
    name: "Noodle Quarter",
    city: "Business Bay",
    category: "Asian",
    distanceKm: 4.6,
    rating: 4.8,
    priceRange: "$$",
    openNow: true,
    description: "Comfort noodle bowls, dumplings, and bright wok flavors."
  },
  {
    id: "smart-5",
    name: "Sugar Window",
    city: "Downtown",
    category: "Desserts",
    distanceKm: 2.4,
    rating: 4.1,
    priceRange: "$",
    openNow: true,
    description: "Dessert bar with cakes, soft serve, and take-home boxes."
  },
  {
    id: "smart-6",
    name: "Green Plate",
    city: "Al Barsha",
    category: "Healthy",
    distanceKm: 0.9,
    rating: 4.6,
    priceRange: "$$",
    openNow: false,
    description: "Protein bowls, salads, and quick balanced lunch options."
  }
];

const distanceOptions = [
  { label: "Any", value: null as number | null },
  { label: "< 2 km", value: 2 },
  { label: "< 5 km", value: 5 },
  { label: "< 10 km", value: 10 }
];

const ratingOptions = [
  { label: "Any", value: 0 },
  { label: "4+ stars", value: 4 },
  { label: "4.5+ stars", value: 4.5 }
];

const priceOptions: PriceRange[] = ["$", "$$", "$$$"];
const categoryOptions: Array<"All" | Category> = [
  "All",
  "Cafe",
  "Seafood",
  "Lebanese",
  "Asian",
  "Desserts",
  "Healthy"
];

function FilterButton({
  active,
  children,
  onClick
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
        active
          ? "border-leaf bg-leaf text-paper"
          : "border-leaf/15 bg-paper text-ink hover:border-leaf hover:bg-sand"
      }`}
    >
      {children}
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-leaf">
      {children}
    </p>
  );
}

export default function SmartFilteringPageContent() {
  const [maxDistance, setMaxDistance] = useState<number | null>(null);
  const [minRating, setMinRating] = useState(0);
  const [selectedPrices, setSelectedPrices] = useState<PriceRange[]>([]);
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<"All" | Category>("All");

  function togglePrice(price: PriceRange) {
    setSelectedPrices((current) =>
      current.includes(price)
        ? current.filter((value) => value !== price)
        : [...current, price]
    );
  }

  function resetFilters() {
    setMaxDistance(null);
    setMinRating(0);
    setSelectedPrices([]);
    setOpenNowOnly(false);
    setSelectedCategory("All");
  }

  const filteredPlaces = demoPlaces.filter((place) => {
    if (maxDistance !== null && place.distanceKm >= maxDistance) {
      return false;
    }

    if (place.rating < minRating) {
      return false;
    }

    if (selectedPrices.length > 0 && !selectedPrices.includes(place.priceRange)) {
      return false;
    }

    if (openNowOnly && !place.openNow) {
      return false;
    }

    if (selectedCategory !== "All" && place.category !== selectedCategory) {
      return false;
    }

    return true;
  });

  const activeFilterCount =
    (maxDistance !== null ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (selectedPrices.length > 0 ? 1 : 0) +
    (openNowOnly ? 1 : 0) +
    (selectedCategory !== "All" ? 1 : 0);

  return (
    <main className="space-y-8 py-10">
      <section className="space-y-6 rounded-[2.5rem] border border-leaf/10 bg-paper p-8 shadow-lg shadow-leaf/10">
        <PageHeader
          eyebrow="Feature 1.5"
          title="Smart Filtering"
          description="A standalone UI page for refining meal results manually. This version uses local mock data only, so you can review the filter experience before wiring it to the backend."
        />
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-full bg-sand px-4 py-2 text-sm text-ink">
            {filteredPlaces.length} match(es)
          </div>
          <div className="rounded-full bg-sand px-4 py-2 text-sm text-ink">
            {activeFilterCount} active filter(s)
          </div>
          <Link
            href="/"
            className="rounded-full border border-leaf/15 bg-paper px-4 py-2 text-sm font-semibold text-leaf transition hover:border-leaf hover:text-ink"
          >
            Back home
          </Link>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-6 rounded-[2rem] border border-leaf/10 bg-paper p-6 shadow-lg shadow-leaf/10">
          <div className="flex items-center justify-between gap-3">
            <SectionLabel>Filters</SectionLabel>
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-full bg-amber px-4 py-2 text-sm font-semibold text-ink transition hover:bg-leaf hover:text-paper"
            >
              Clear all
            </button>
          </div>

          <div className="space-y-3">
            <SectionLabel>Distance</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {distanceOptions.map((option) => (
                <FilterButton
                  key={option.label}
                  active={maxDistance === option.value}
                  onClick={() => setMaxDistance(option.value)}
                >
                  {option.label}
                </FilterButton>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <SectionLabel>Rating</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {ratingOptions.map((option) => (
                <FilterButton
                  key={option.label}
                  active={minRating === option.value}
                  onClick={() => setMinRating(option.value)}
                >
                  {option.label}
                </FilterButton>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <SectionLabel>Price Range</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {priceOptions.map((price) => (
                <FilterButton
                  key={price}
                  active={selectedPrices.includes(price)}
                  onClick={() => togglePrice(price)}
                >
                  {price}
                </FilterButton>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <SectionLabel>Open Now</SectionLabel>
            <label className="flex items-center justify-between rounded-[1.5rem] border border-leaf/10 bg-sand px-4 py-3">
              <span className="text-sm font-medium text-ink">Show only open places</span>
              <input
                type="checkbox"
                checked={openNowOnly}
                onChange={(event) => setOpenNowOnly(event.target.checked)}
                className="h-5 w-5 accent-[var(--color-leaf)]"
              />
            </label>
          </div>

          <div className="space-y-3">
            <SectionLabel>Category</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((category) => (
                <FilterButton
                  key={category}
                  active={selectedCategory === category}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </FilterButton>
              ))}
            </div>
          </div>
        </aside>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SectionLabel>Filtered Results</SectionLabel>
            <p className="text-sm text-leaf/80">
              Distance, rating, price, open status, and category are all local UI filters on this page.
            </p>
          </div>

          {filteredPlaces.length === 0 ? (
            <EmptyState
              title="No places match these filters"
              description="Adjust one or two filters, or clear all, to see more demo results."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredPlaces.map((place) => (
                <article
                  key={place.id}
                  className="rounded-[2rem] border border-leaf/10 bg-paper p-6 shadow-lg shadow-leaf/10"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-leaf">
                        {place.category}
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold text-ink">{place.name}</h2>
                      <p className="mt-1 text-sm text-leaf/80">{place.city}</p>
                    </div>
                    <span className="rounded-full bg-amber px-3 py-1 text-xs font-semibold text-ink">
                      {place.priceRange}
                    </span>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-leaf/80">{place.description}</p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="rounded-full bg-sand px-3 py-1 text-xs font-medium text-ink">
                      {place.distanceKm.toFixed(1)} km
                    </span>
                    <span className="rounded-full bg-sand px-3 py-1 text-xs font-medium text-ink">
                      {place.rating.toFixed(1)} stars
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        place.openNow
                          ? "bg-leaf text-paper"
                          : "bg-ink/10 text-ink"
                      }`}
                    >
                      {place.openNow ? "Open now" : "Closed now"}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

