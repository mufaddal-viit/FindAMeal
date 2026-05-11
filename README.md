# FindAMeal 🍽️

**AI-Powered Nearby Business Finder** — Discover the perfect restaurant or cafe in seconds, not minutes.

FindAMeal is a modern full-stack application that combines natural language AI search with smart location-aware filtering to help users make food decisions faster. Built with Next.js, Express, and advanced AI models (Gemini & Groq), it's designed to showcase how AI transforms the discovery experience.

---

## ✨ Key Features

### 🤖 **AI-Powered Search**
- **Natural Language Understanding**: Search with conversational intent like "Best shawarma under 20 AED" instead of rigid filters
- **Multi-Provider AI**: Supports Google Gemini (Flash & Pro) and Groq Llama models
- **Smart Query Parsing**: Extracts category, budget, preferences from user input

### 📍 **Location Intelligence**
- **Browser Geolocation**: Auto-detect user's current location with permission
- **Map Integration**: Interactive Leaflet-based map with real-time pin placement
- **Distance-Aware Sorting**: Sort results by proximity to selected location
- **Radius Filtering**: Find places within 1km, 5km, 10km, or custom radius

### 🎯 **Smart Filtering**
- **Real-Time Filters**: Rating (4+, 4.5+), Price ($, $$, $$$, $$$$), Open Now status
- **Dual View System**: Toggle between elegant list view and interactive map view
- **Instant Backend Filtering**: Filters are applied server-side for consistent results across clients

### 🎨 **Modern, Gen-Z Inspired UI**
- **Elegant Design**: Soft gradients, glassmorphism effects, and smooth animations
- **Responsive Layout**: Beautiful on mobile, tablet, and desktop
- **Dark Mode Ready**: Light-first design with easy dark mode support
- **Micro-interactions**: Subtle animations and hover effects for engaging UX

### 📊 **Detailed Results**
- **Rich Place Cards**: Images, ratings, cuisines, price levels, distance
- **Place Details Page**: Full information including address, all cuisines, detailed ratings
- **Review Summary**: AI-powered summaries of reviews (extensible)

---

## 🏗️ Architecture

```
FindAMeal/
├── API/                          # Express backend
│   ├── src/
│   │   ├── ai/                  # AI providers & services
│   │   │   ├── gemini/          # Gemini Flash & Pro
│   │   │   ├── groq/            # Groq Llama 3.3
│   │   │   ├── providers/       # Provider configurations
│   │   │   ├── service.ts       # AI orchestration
│   │   │   └── types.ts         # AI interfaces
│   │   ├── controllers/         # Route handlers
│   │   ├── services/            # Business logic (filtering, ranking)
│   │   ├── routes/              # API routes
│   │   ├── data/                # Demo data (MongoDB-ready)
│   │   ├── utils/               # Helpers (validation, errors)
│   │   └── config/              # Configuration
│   └── prisma/                  # ORM schema (MongoDB)
│
└── WEB/                          # Next.js 16 frontend
    ├── app/                     # App router pages
    │   ├── page.tsx             # Home
    │   ├── results/             # Search results
    │   └── places/[id]/         # Detail page
    ├── components/              # React components
    │   ├── SearchForm.tsx       # Search with filters
    │   ├── MapView.tsx          # Interactive map
    │   ├── ListView.tsx         # Elegant list display
    │   ├── FilterPanel.tsx      # Advanced filtering
    │   ├── PlaceCard.tsx        # Result card
    │   └── [Other components]
    ├── lib/                     # Utilities (API, validation)
    ├── hooks/                   # Custom React hooks
    └── types/                   # TypeScript types
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** and npm/yarn
- **API Keys**:
  - Google Gemini API key ([get it here](https://ai.google.dev/))
  - Groq API key ([get it here](https://console.groq.com/)) *(optional)*

### Setup

#### 1. Clone & Install

```bash
git clone <repo-url>
cd FindAMeal

# Install backend dependencies
cd API
npm install

# Install frontend dependencies
cd ../WEB
npm install
```

#### 2. Configure Environment

**Backend** (`API/.env`):
```env
PORT=4000
NODE_ENV=development
CLIENT_URL=http://localhost:3001

# Database (for future MongoDB integration)
DATABASE_URL=mongodb://localhost:27017/findameal

# AI Configuration
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
AI_PROVIDER=gemini-flash
```

**Frontend** (`WEB/.env.local`):
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
```

> Copy `.env.example` files and fill in your API keys

#### 3. Start Development Servers

**Terminal 1 - Backend**:
```bash
cd API
npm run dev
# Server running on http://localhost:4000
```

**Terminal 2 - Frontend**:
```bash
cd WEB
npm run dev
# App running on http://localhost:3001
```

#### 4. Open Browser
Navigate to `http://localhost:3001` and start discovering!

---

## 📚 API Endpoints

### Search Places
```http
GET /api/places
POST /api/places
```

**Query Parameters / Body**:
```json
{
  "query": "Italian pizza",
  "location": "Dubai, UAE",
  "category": "Italian",
  "lat": 25.2048,
  "lng": 55.2708,
  "radiusKm": 5,
  "minRating": 4,
  "priceLevels": ["$$", "$$$"],
  "openNow": true,
  "sort": "rating",
  "page": 1,
  "pageSize": 10
}
```

**Response**:
```json
{
  "data": [
    {
      "id": "ai-hash123",
      "name": "Restaurant Name",
      "description": "...",
      "address": "...",
      "city": "Dubai",
      "country": "UAE",
      "cuisines": ["Italian", "Pizza"],
      "imageUrl": "...",
      "rating": 4.7,
      "priceLevel": "$$",
      "openNow": true,
      "distanceKm": 2.3,
      "coordinates": { "latitude": 25.2048, "longitude": 55.2708 }
    }
  ],
  "meta": {
    "total": 42,
    "page": 1,
    "pageSize": 10,
    "totalPages": 5,
    "sort": "rating",
    "source": "ai",
    "ai": {
      "provider": "gemini-flash",
      "model": "gemini-1.5-flash",
      "queryUsed": "Italian pizza in Dubai",
      "searchQueries": ["Italian pizza near Dubai"],
      "sources": ["Google Search"]
    }
  }
}
```

### Get Place Details
```http
GET /api/places/:id
```

---

## 🤖 AI Integration

### How It Works

1. **Query Understanding**: User's natural language query is passed to the AI provider (Gemini/Groq)
2. **Intent Extraction**: AI extracts intent, category, budget constraints, and preferences
3. **Structured Search**: Query is converted to structured parameters for backend filtering
4. **Result Ranking**: Results are ranked by AI relevance + distance + rating scores
5. **Optional Summarization**: Reviews can be summarized for quick insights

### Supported Providers

| Provider | Model | Speed | Cost | Best For |
|----------|-------|-------|------|----------|
| **Gemini Flash** | gemini-1.5-flash | ⚡⚡⚡ | 💰 | Production (default) |
| **Gemini Pro** | gemini-1.5-pro | ⚡⚡ | 💰💰 | Complex queries |
| **Groq Llama** | Llama 3.3 70B | ⚡⚡⚡⚡ | 💰💰💰 | Speed-critical |

**Switch Providers**:
```bash
# In API/.env
AI_PROVIDER=groq-llama-3.3-70b  # or gemini-pro
```

### Example Query Handling

**User Input**: "Best shawarma under 20 AED near me"

**AI Extraction**:
```json
{
  "category": "shawarma",
  "cuisine": "middle-eastern",
  "budget": "low",
  "location": "current",
  "priceLevel": "$"
}
```

**Backend Filtering**: Results are filtered and ranked by relevance

---

## 🎨 UI/UX Highlights

### Design System
- **Colors**: Warm earth tones (sand, leaf, paper) + modern accents (amber, red, green)
- **Typography**: Clean, modern sans-serif with strong contrast
- **Spacing**: Consistent 4px grid system
- **Borders**: Rounded corners (1.2rem - 2.5rem) for soft, modern feel
- **Effects**: Glassmorphism, soft shadows, smooth transitions

### Components

#### SearchForm
- Minimal, focused interface
- Query input with validation
- Location picker with geolocation
- Category & sort options
- Expandable filter panel

#### MapView
- Interactive Leaflet map
- Draggable location selection
- Click to place markers
- Auto-zoom on results

#### ListView
- Compact place previews
- Quick scan of key info
- Click to expand details
- Responsive grid layout

#### FilterPanel
- Collapsible advanced filters
- Filter count badge
- Smooth animations
- Mobile-friendly design

---

## 📱 Responsive Design

- **Mobile (< 640px)**: Single column, stacked filters, compact cards
- **Tablet (640px - 1024px)**: Two columns, side panel filters
- **Desktop (> 1024px)**: Three columns with sidebar, full map view

---

## 🔧 Tech Stack

### Backend
- **Node.js** with TypeScript
- **Express** 5.1 for REST API
- **Prisma** 6.15 ORM (MongoDB support)
- **Zod** for validation
- **AI APIs**: Google Gemini, Groq
- **CORS** enabled for frontend

### Frontend
- **Next.js** 16 (App Router)
- **React** 19 with TypeScript
- **Tailwind CSS** 4.1 for styling
- **Leaflet** + react-leaflet for maps
- **Axios** for HTTP requests
- **Image optimization** with next/image

### Data
- **MongoDB** (via Prisma)
- **Demo data** for development
- **Caching** with TTL

---

## 🚦 Development Workflow

### Running Tests
```bash
cd API
npm run test:gemini  # Test Gemini integration
```

### Building for Production
```bash
# Backend
cd API
npm run build
npm run start

# Frontend
cd WEB
npm run build
npm run start
```

### Code Quality
- TypeScript for type safety
- Zod for runtime validation
- Error handling with custom HttpError
- Async error handling with asyncHandler

---

## 🗺️ Future Roadmap

### Phase 2 Features
- ✅ MongoDB persistence (schema ready)
- ⏳ User accounts & saved places
- ⏳ Review summarization
- ⏳ Crowdedness indicators
- ⏳ Real business data integration (Google Places API)
- ⏳ Multi-language support

### Performance
- ⏳ Redis caching for results
- ⏳ CDN for images
- ⏳ Database indexing
- ⏳ Request deduplication

### Analytics
- ⏳ Search analytics
- ⏳ Popular places tracking
- ⏳ User behavior insights

---

## 🤝 Contributing

This project is a portfolio showcase, but improvements are welcome:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🎯 Project Goals

FindAMeal demonstrates:

1. **Full-Stack Capability**: Complete modern web app from database to UI
2. **AI Integration**: Practical use of LLMs in production applications
3. **UX Excellence**: Thoughtful design focusing on user decision-making
4. **Best Practices**: TypeScript, validation, error handling, responsive design
5. **Scalability**: Architecture ready for MongoDB, Redis, and horizontal scaling

---

## 📞 Support

- **Issues**: Check existing issues or create a new one
- **Questions**: Open a discussion or reach out
- **Features**: Submit feature requests through issues

---

## 🙏 Acknowledgments

- Google Gemini API for powerful AI capabilities
- Groq for blazing-fast LLM inference
- OpenStreetMap & Nominatim for mapping services
- Next.js & React communities for excellent tooling

---

**Built with ❤️ to showcase modern AI-powered full-stack development**
