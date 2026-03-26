# FindAMeal

Starter monorepo with:

- `API`: Express + TypeScript + Prisma + MongoDB
- `WEB`: Next.js App Router + TypeScript + Tailwind CSS

## Folder Structure

```text
FindAMeal/
|-- API/
|   |-- prisma/
|   |   `-- schema.prisma
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- data/
|   |   |-- prisma/
|   |   |-- routes/
|   |   |-- services/
|   |   |-- types/
|   |   `-- utils/
|   |-- .env.example
|   |-- package.json
|   `-- tsconfig.json
|-- WEB/
|   |-- app/
|   |   |-- places/[id]/
|   |   `-- results/
|   |-- components/
|   |-- hooks/
|   |-- lib/
|   |-- public/
|   |-- types/
|   |-- .env.local.example
|   |-- package.json
|   `-- tsconfig.json
`-- README.md
```

## Quick Start

1. Install backend dependencies:

   ```bash
   cd API
   npm install
   ```

2. Install frontend dependencies:

   ```bash
   cd ../WEB
   npm install
   ```

3. Create environment files:

   - Copy `API/.env.example` to `API/.env`
   - Copy `WEB/.env.local.example` to `WEB/.env.local`

4. Start the API:

   ```bash
   npm run dev
   ```

5. Start the frontend in a second terminal:

   ```bash
   cd ../WEB
   npm run dev
   ```

## Starter Routes

- Frontend:
  - `/`
  - `/results?q=Dubai`
  - `/places/demo-dubai-saffron-table`
- Backend:
  - `GET /api/health`
  - `GET /api/places`
  - `GET /api/places/:id`

## Notes

- The API currently uses local demo data from `API/src/data/demoPlaces.ts` instead of MongoDB.
- Prisma and the MongoDB schema are still scaffolded in the project, so you can switch back to the database later without rebuilding the structure.
- The frontend uses `axios` for API calls and shows loading and empty states.
- The project is intentionally simple so it is easier to extend.
