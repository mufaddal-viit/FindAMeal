import type { PlaceSummary } from "../types/place";

export const demoPlaces: PlaceSummary[] = [
  {
    id: "demo-dubai-saffron-table",
    name: "Saffron Table",
    city: "Dubai",
    country: "UAE",
    description: "Warm Middle Eastern plates with fresh grills, mezze, and house-made desserts.",
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
    description: "Casual seafood bowls, citrus salads, and bright coastal flavors near the corniche.",
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
    description: "Comforting wraps, salads, and shared plates built for fast lunches and easy dinners.",
    cuisines: ["Lebanese", "Wraps", "Salads"],
    imageUrl:
      "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=80",
    priceLevel: "$$",
    rating: 4.6
  },
  {
    id: "demo-dubai-noodle-yard",
    name: "Noodle Yard",
    city: "Dubai",
    country: "UAE",
    description: "Fast comfort bowls, wok-fried noodles, and rich broths for casual late dinners.",
    cuisines: ["Asian", "Noodles", "Comfort Food"],
    imageUrl:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80",
    priceLevel: "$$",
    rating: 4.4
  },
  {
    id: "demo-ajman-garden-brunch",
    name: "Garden Brunch",
    city: "Ajman",
    country: "UAE",
    description: "Light breakfast plates, coffee, and bright salads in a relaxed all-day space.",
    cuisines: ["Cafe", "Breakfast", "Healthy"],
    imageUrl:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
    priceLevel: "$",
    rating: 4.3
  },
  {
    id: "demo-ras-al-khaimah-firewood-kitchen",
    name: "Firewood Kitchen",
    city: "Ras Al Khaimah",
    country: "UAE",
    description: "Wood-fired mains, small plates, and hearty flavors built around shared dining.",
    cuisines: ["Steakhouse", "Shared Plates", "Grill"],
    imageUrl:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
    priceLevel: "$$$",
    rating: 4.8
  }
];

export function filterDemoPlaces(query?: string) {
  const normalizedQuery = query?.trim().toLowerCase();

  if (!normalizedQuery) {
    return demoPlaces;
  }

  return demoPlaces.filter((place) =>
    [
      place.name,
      place.city,
      place.country,
      place.description,
      ...place.cuisines
    ].some((value) => value.toLowerCase().includes(normalizedQuery))
  );
}

export function findDemoPlaceById(id: string) {
  return demoPlaces.find((place) => place.id === id) ?? null;
}

