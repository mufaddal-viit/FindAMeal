# FindAMeal Setup Guide

Follow these steps to get FindAMeal running locally.

## Prerequisites

- **Node.js 18+** ([Download](https://nodejs.org/))
- **npm or yarn** (comes with Node.js)
- **API Keys**:
  - [Google Gemini API](https://ai.google.dev/) - Free tier available
  - [Groq API](https://console.groq.com/) - Optional, for faster inference

## Step 1: Clone & Navigate

```bash
git clone <repository-url>
cd FindAMeal
```

## Step 2: Backend Setup

```bash
cd API

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env and add your API keys
# - GEMINI_API_KEY: Get from https://ai.google.dev/
# - GROQ_API_KEY: Get from https://console.groq.com/ (optional)
```

**Your `.env` should look like:**
```env
PORT=4000
NODE_ENV=development
CLIENT_URL=http://localhost:3001

DATABASE_URL=mongodb://localhost:27017/findameal

GEMINI_API_KEY=your_key_here
GROQ_API_KEY=your_key_here
AI_PROVIDER=gemini-flash
```

## Step 3: Frontend Setup

```bash
cd ../WEB

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local

# Update if your API is on a different port
```

**Your `.env.local` should look like:**
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
```

## Step 4: Start Development

**Terminal 1 - Start Backend:**
```bash
cd API
npm run dev
```

Expected output:
```
FindAMeal API listening on http://localhost:4000
```

**Terminal 2 - Start Frontend:**
```bash
cd WEB
npm run dev
```

Expected output:
```
▲ Next.js 16.2.1
- Local: http://localhost:3001
```

## Step 5: Open in Browser

Navigate to **http://localhost:3001** and start searching!

---

## Troubleshooting

### Issue: "API connection failed"
- Check that backend is running on port 4000
- Verify `NEXT_PUBLIC_API_BASE_URL` in WEB/.env.local
- Check CORS settings in API/src/app.ts

### Issue: "Gemini API error"
- Verify GEMINI_API_KEY is set correctly
- Check you have API quota remaining
- Try switching to Groq: `AI_PROVIDER=groq-llama-3.3-70b`

### Issue: "npm command not found"
- Restart your terminal after installing Node.js
- Or use `npx` prefix: `npx npm install`

---

## Building for Production

### Backend
```bash
cd API
npm run build
npm run start
```

### Frontend
```bash
cd WEB
npm run build
npm run start
```

---

## Available Scripts

### Backend
- `npm run dev` - Start dev server with hot reload
- `npm run build` - Build TypeScript
- `npm run start` - Run compiled code
- `npm run test:gemini` - Test Gemini integration

### Frontend
- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run start` - Serve built app
- `npm run lint` - Run ESLint

---

## Next Steps

1. **Explore the Home Page** - See featured places and quick search tips
2. **Try a Search** - "Late dinner in Dubai" or "Seafood in Abu Dhabi"
3. **Use Map View** - Click map view toggle to see locations on a map
4. **Test Filters** - Adjust rating, price, distance filters
5. **View Details** - Click a place card to see full information

---

## Project Structure

```
FindAMeal/
├── API/              # Express.js backend
│   ├── src/
│   │   ├── ai/       # AI providers (Gemini, Groq)
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   └── ...
│   └── package.json
│
└── WEB/              # Next.js 16 frontend
    ├── app/         # Pages & layout
    ├── components/  # React components
    ├── lib/        # Utilities
    ├── types/      # TypeScript types
    └── package.json
```

---

## Features to Try

✨ **AI Search**: Type natural language queries
📍 **Location**: Use geolocation or search by area
🗺️ **Map View**: Interactive map with clickable pins
🎚️ **Filters**: Rating, price, distance, open now
💰 **Price Levels**: $, $$, $$$, $$$$
⭐ **Ratings**: Real ratings from search results

---

**Questions?** Check the README.md for full documentation.
