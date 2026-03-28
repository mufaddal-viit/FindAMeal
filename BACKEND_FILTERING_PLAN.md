# Backend Filtering Plan

## Goal

Move restaurant filtering, sorting, and location-aware querying from the frontend into the backend so the API becomes the single source of truth for result lists.

This plan assumes the current stack:

- Node.js + Express
- TypeScript
- Prisma ORM
- MongoDB

## Recommended API Shape

Use one listing endpoint:

```http
GET /api/places
```

Supported query params:

```text
q=pizza
category=italian
city=dubai
country=uae
lat=25.2048
lng=55.2708
radiusKm=5
minRating=4
priceLevels=$,$$
openNow=true
sort=distance|rating|price-low|price-high
page=1
pageSize=20
```

## Why One Endpoint

Do not create separate endpoints like:

- `/places/nearby`
- `/places/top-rated`
- `/places/open-now`

Those patterns become hard to maintain once filters need to work together.

One endpoint with a strict query contract is cleaner because:

- filters compose naturally
- pagination stays consistent
- sorting rules stay centralized
- the frontend only integrates with one list API

## Backend Responsibilities

### `routes/places.ts`

Responsibility:

- expose `GET /places`
- delegate to controller

### `controllers/placeController.ts`

Responsibility:

- read `req.query`
- validate and normalize query params
- convert raw query strings into one typed filter object
- return HTTP errors for invalid inputs

Use `zod` here for request validation.

### `services/placeService.ts`

Responsibility:

- receive one normalized filter object
- build the database query
- apply filtering, sorting, and pagination
- return data plus metadata

This is where the real query logic should live.

### `utils/placeFilters.ts`

Responsibility:

- helper functions for parsing booleans, numbers, and enums
- price-level parsing
- sort parsing
- Mongo match builders
- reusable query helpers

Keep parsing and query-building helpers out of the controller and out of the service where possible.

## Normalized Filter Object

The controller should convert query params into one typed object like this:

```ts
export type PlaceSort = "distance" | "rating" | "price-low" | "price-high";

export interface PlaceFilters {
  q?: string;
  category?: string;
  city?: string;
  country?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  minRating?: number;
  priceLevels?: string[];
  openNow?: boolean;
  sort: PlaceSort;
  page: number;
  pageSize: number;
}
```

The service layer should only accept this object, not raw `req.query`.

## Validation Rules

Validate at the controller boundary.

Recommended rules:

- `q`
  - trim whitespace
  - max length
  - allow only expected characters
- `category`
  - enum or normalized string
- `city`
  - trimmed string
- `country`
  - trimmed string
- `lat`
  - number between `-90` and `90`
- `lng`
  - number between `-180` and `180`
- `radiusKm`
  - positive number with sane upper bound
- `minRating`
  - number between `0` and `5`
- `priceLevels`
  - limited to allowed values like `$`, `$$`, `$$$`, `$$$$`
- `openNow`
  - strict boolean
- `sort`
  - enum
- `page`
  - integer >= 1
- `pageSize`
  - integer >= 1 with a max, for example `100`

## Restaurant Data Model

For backend filtering to work properly, each restaurant record should store:

- `name`
- `description`
- `categories` or `cuisines`
- `priceLevel`
- `rating`
- `city`
- `country`
- `location`
- `openingHours`
- `isActive`

### Location Model

For geospatial querying in MongoDB, store location as GeoJSON:

```json
{
  "location": {
    "type": "Point",
    "coordinates": [55.2708, 25.2048]
  }
}
```

Important:

- GeoJSON uses `[longitude, latitude]`
- not `[latitude, longitude]`

### Required Mongo Index

Create a `2dsphere` index on the location field.

MongoDB docs:

- https://www.mongodb.com/docs/manual/core/indexes/index-types/index-geospatial/
- https://www.mongodb.com/docs/current/core/indexes/index-types/geospatial/2dsphere/create/

Without this, distance and nearby queries will not be reliable or efficient.

## Query Strategy

Split the service logic into two paths.

### 1. Standard Filtering Path

Use this when geospatial behavior is not needed.

Applies:

- `q`
- `category`
- `city`
- `country`
- `minRating`
- `priceLevels`
- `openNow`
- non-distance sorting
- pagination

This path can use normal Prisma queries if the filters are simple enough.

### 2. Geospatial Filtering Path

Use this when any of these are present:

- `lat` and `lng`
- `radiusKm`
- `sort=distance`

This path should:

- filter by proximity
- optionally filter by radius
- calculate distance
- sort by nearest when requested

## Prisma + MongoDB Note

Do not assume Prisma Client alone will handle all geospatial querying cleanly.

Prisma docs indicate raw Mongo queries are available for features Prisma Client does not model directly, using methods like `findRaw()` and `aggregateRaw()`.

Relevant docs:

- https://www.prisma.io/docs/orm/overview/databases/mongodb
- https://www.prisma.io/docs/orm/prisma-client/using-raw-sql/raw-queries

Pragmatic approach:

- use Prisma Client for normal CRUD and simple filters
- use Mongo raw aggregation for distance-based or advanced geospatial queries

## Search Behavior

### Text Search

For `q`, search across fields such as:

- `name`
- `description`
- `categories`
- `city`
- `country`

Prefer one of these:

- Mongo text index for full-text search
- carefully scoped regex if dataset is still small

For production scale, a proper text-search strategy is better than chaining regex across many fields.

## Category Filtering

Recommended storage:

```ts
categories: string[]
```

Then filter using normalized category values.

Do not rely on frontend labels as database values directly without normalization.

## Price Filtering

Two valid designs:

### Option A

Store symbolic levels:

```ts
priceLevel: "$" | "$$" | "$$$" | "$$$$"
```

Good for simple UI filters.

### Option B

Store numeric price band:

```ts
priceLevel: 1 | 2 | 3 | 4
```

Better for sorting and database comparisons.

For a real backend, numeric storage is usually cleaner.

## Open Now Filtering

Do not fake this filter.

To support `openNow` correctly, the backend needs structured opening-hours data, for example:

```ts
openingHours: {
  monday: [{ start: "09:00", end: "22:00" }],
  tuesday: [{ start: "09:00", end: "22:00" }]
}
```

Then the service can:

- determine the current day
- determine the current local time for the restaurant
- check whether the restaurant is currently open

If opening-hours data does not exist yet, keep `openNow` out of the backend contract until the model is ready.

## Sorting Rules

Supported sort values:

- `rating`
- `distance`
- `price-low`
- `price-high`

Recommended fallback rules:

- if `sort=distance` but no valid `lat/lng`, reject the request or fall back explicitly
- use stable tie-breakers such as:
  - rating
  - name

Do not leave sort behavior ambiguous.

## Pagination

Add pagination from the start.

Recommended query params:

- `page`
- `pageSize`

Recommended metadata:

```ts
{
  data: places,
  meta: {
    total,
    page,
    pageSize,
    totalPages,
    sort,
    appliedFilters
  }
}
```

Backend pagination becomes important once filtering moves server-side.

## Example Service Contract

```ts
export async function getPlaces(filters: PlaceFilters) {
  // choose query path
  // execute db query
  // return paginated result
}
```

The service should not know anything about Express request objects.

## Suggested Rollout Order

### Phase 1

Move simple filters to backend:

- `q`
- `category`
- `city`
- `country`
- `sort`
- `page`
- `pageSize`

### Phase 2

Move price and rating filters:

- `minRating`
- `priceLevels`

### Phase 3

Add proper location storage:

- GeoJSON `Point`
- `2dsphere` index

### Phase 4

Add geospatial querying:

- `lat`
- `lng`
- `radiusKm`
- `sort=distance`

### Phase 5

Add `openNow` only after opening-hours data is modeled correctly.

## What the Frontend Should Do After This

Once backend filtering is implemented, the frontend should stop doing result filtering locally.

The frontend should:

- collect filters
- serialize them into the request
- render whatever the API returns

That keeps behavior consistent across:

- mobile
- web
- pagination
- caching
- analytics

## Practical Recommendation

If implementation starts soon, begin with this backend contract:

```http
GET /api/places?q=&category=&city=&country=&sort=&page=&pageSize=
```

Then add geospatial filters only after the restaurant documents and indexes are ready.

That sequence keeps the codebase clean and avoids building distance logic on top of incomplete data.
