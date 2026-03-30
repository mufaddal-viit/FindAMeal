import type { PlaceSummary } from "../types/place";

export const demoPlaces: PlaceSummary[] = [
  {
    id: "demo-dubai-saffron-table",
    name: "Saffron Table",
    description:
      "Warm Middle Eastern plates with fresh grills, mezze, and house-made desserts.",
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
    coordinates: {
      latitude: 25.2048,
      longitude: 55.2708
    }
  },
  {
    id: "demo-abu-dhabi-harbor-bowl",
    name: "Harbor Bowl",
    description:
      "Casual seafood bowls, citrus salads, and bright coastal flavors near the corniche.",
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
    tags: ["seafood", "bowls", "healthy"],
    coordinates: {
      latitude: 24.4539,
      longitude: 54.3773
    }
  },
  {
    id: "demo-sharjah-cedar-corner",
    name: "Cedar Corner",
    description:
      "Comforting wraps, salads, and shared plates built for fast lunches and easy dinners.",
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
    coordinates: {
      latitude: 25.3463,
      longitude: 55.4209
    }
  },
  {
    id: "demo-dubai-noodle-yard",
    name: "Noodle Yard",
    description:
      "Fast comfort bowls, wok-fried noodles, and rich broths for casual late dinners.",
    address: "Jumeirah Lake Towers, Dubai, UAE",
    city: "Dubai",
    country: "UAE",
    cuisines: ["Asian", "Noodles", "Comfort Food"],
    imageUrl:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80",
    priceLevel: "$$",
    priceRange: "mid",
    rating: 4.4,
    openNow: true,
    distanceKm: null,
    sourceUrl: null,
    tags: ["asian", "noodles", "comfort food"],
    coordinates: {
      latitude: 25.1972,
      longitude: 55.2744
    }
  },
  {
    id: "demo-ajman-garden-brunch",
    name: "Garden Brunch",
    description:
      "Light breakfast plates, coffee, and bright salads in a relaxed all-day space.",
    address: "Al Nuaimia, Ajman, UAE",
    city: "Ajman",
    country: "UAE",
    cuisines: ["Cafe", "Breakfast", "Healthy"],
    imageUrl:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
    priceLevel: "$",
    priceRange: "budget",
    rating: 4.3,
    openNow: false,
    distanceKm: null,
    sourceUrl: null,
    tags: ["cafe", "breakfast", "healthy"],
    coordinates: {
      latitude: 25.4052,
      longitude: 55.5136
    }
  },
  {
    id: "demo-ras-al-khaimah-firewood-kitchen",
    name: "Firewood Kitchen",
    description:
      "Wood-fired mains, small plates, and hearty flavors built around shared dining.",
    address: "Al Hamra Village, Ras Al Khaimah, UAE",
    city: "Ras Al Khaimah",
    country: "UAE",
    cuisines: ["Steakhouse", "Shared Plates", "Grill"],
    imageUrl:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
    priceLevel: "$$$",
    priceRange: "premium",
    rating: 4.8,
    openNow: true,
    distanceKm: null,
    sourceUrl: null,
    tags: ["steakhouse", "shared plates", "grill"],
    coordinates: {
      latitude: 25.8007,
      longitude: 55.9762
    }
  }
];

export function findDemoPlaceById(id: string) {
  return demoPlaces.find((place) => place.id === id) ?? null;
}
