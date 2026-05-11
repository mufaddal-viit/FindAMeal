# FindAMeal Testing & Verification Guide

## Pre-Flight Checklist

Before running the app, verify these files are in place:

### Backend (`API/`)
- [ ] `.env` file created with API keys
- [ ] `node_modules/` directory exists (run `npm install`)
- [ ] `src/` directory with all source files
- [ ] `prisma/` directory with schema

### Frontend (`WEB/`)
- [ ] `.env.local` file created
- [ ] `node_modules/` directory exists (run `npm install`)
- [ ] `app/` directory with pages
- [ ] `components/` directory with React components

---

## Starting the Application

### Step 1: Start Backend (Port 4000)

```bash
cd API
npm run dev
```

**Check for:**
```
FindAMeal API listening on http://localhost:4000
```

**Test API health:**
```bash
curl http://localhost:4000/api/health
```

Expected response:
```json
{
  "message": "FindAMeal API is running.",
  "environment": "development",
  "source": "ai"
}
```

### Step 2: Start Frontend (Port 3001)

```bash
cd ../WEB
npm run dev
```

**Check for:**
```
▲ Next.js 16.2.1
- Local: http://localhost:3001
```

---

## Manual Testing Scenarios

### Scenario 1: Home Page Load

1. Open http://localhost:3001
2. Verify:
   - [ ] Page title is "FindAMeal"
   - [ ] Hero section with tagline displays
   - [ ] Featured places cards appear (3 cards visible)
   - [ ] Quick start links are clickable
   - [ ] "Late dinner in Dubai" link works

**Expected Behavior:** Page loads in < 2 seconds

---

### Scenario 2: Simple Search

1. On home page, enter search: **"pizza"**
2. Select location: **"Dubai, UAE"**
3. Click "Search" button
4. Verify:
   - [ ] Results page loads
   - [ ] Results show places with "pizza" in name/cuisine
   - [ ] Metadata shows data source (AI)
   - [ ] At least one place card displays

**Expected Behavior:** Results show within 5 seconds

---

### Scenario 3: Map View Integration

1. On results page, click "Map" button
2. Verify:
   - [ ] Map loads with Leaflet tiles
   - [ ] Place pins appear on map
   - [ ] Map is interactive (pan, zoom)
   - [ ] Clicking pins shows place names
   - [ ] Toggle back to list view works

**Expected Behavior:** Map renders smoothly without console errors

---

### Scenario 4: Location-Based Search

1. Search for: **"restaurants"** in **"Abu Dhabi"**
2. Click "Use my location" button
3. Allow geolocation when prompted
4. Verify:
   - [ ] Map centers on your location
   - [ ] Location coordinates appear in URL
   - [ ] Results show places near your location
   - [ ] Distance info appears on cards

**Expected Behavior:** Geolocation works and refines results

---

### Scenario 5: Filter Panel

1. On results page, click "Filter" button
2. Verify:
   - [ ] Rating filter options appear
   - [ ] Price level buttons are clickable
   - [ ] Open now checkbox toggles
   - [ ] Distance options are available

3. Select:
   - Rating: "4+ stars"
   - Price: "$$"
   - Open now: checked

4. Verify:
   - [ ] Filter button shows count badge
   - [ ] Results update (if backend filters implemented)
   - [ ] Can clear filters

**Expected Behavior:** Filters apply without page refresh

---

### Scenario 6: Place Detail Page

1. From results, click any place card
2. Verify:
   - [ ] Page displays full place name
   - [ ] Address and city info shown
   - [ ] Cuisine tags displayed
   - [ ] Rating and price level visible
   - [ ] Place image loads
   - [ ] "Back home" link works

3. Check URL: `/places/[some-id]`

**Expected Behavior:** Detail page loads in < 2 seconds

---

### Scenario 7: View Toggle (List/Map)

1. On results page with results
2. Click "List" button - verify list view
3. Click "Map" button - verify map view
4. Toggle between views rapidly
5. Verify:
   - [ ] View switches smoothly
   - [ ] No console errors
   - [ ] Both views show same results
   - [ ] Selection state preserved

**Expected Behavior:** View toggle works smoothly, <500ms transition

---

### Scenario 8: Responsive Design

1. Open http://localhost:3001 on mobile (use browser dev tools)
2. Test at widths: 375px, 640px, 1024px, 1440px
3. Verify:
   - [ ] Text is readable on all sizes
   - [ ] Buttons have sufficient touch targets (44px+)
   - [ ] No horizontal scrolling
   - [ ] Images scale properly
   - [ ] Layout reflows correctly

**Expected Behavior:** No layout shifts, content accessible at all sizes

---

### Scenario 9: API Error Handling

1. Stop the backend (Ctrl+C in API terminal)
2. On frontend, click search button
3. Verify:
   - [ ] Error message displays
   - [ ] No white blank page
   - [ ] Can retry search once backend restarts
   - [ ] Error is human-readable

**Expected Behavior:** Graceful error handling with recovery path

---

### Scenario 10: Different AI Providers

1. Update `API/.env`:
   ```env
   AI_PROVIDER=groq-llama-3.3-70b
   ```
2. Restart backend
3. Perform a search
4. Verify:
   - [ ] Results still appear
   - [ ] Metadata shows different provider
   - [ ] Results quality similar or better

**Expected Behavior:** Provider switching works without errors

---

## API Endpoint Testing

### Test with curl or Postman

#### Health Check
```bash
curl http://localhost:4000/api/health
```

#### List Places
```bash
curl -X POST http://localhost:4000/api/places \
  -H "Content-Type: application/json" \
  -d '{
    "query": "pizza",
    "location": "Dubai, UAE",
    "sort": "rating",
    "page": 1,
    "pageSize": 10
  }'
```

#### Get Place Details
```bash
curl http://localhost:4000/api/places/ai-abc123def456
```

#### With Filters
```bash
curl -X POST http://localhost:4000/api/places \
  -H "Content-Type: application/json" \
  -d '{
    "query": "cafe",
    "location": "Dubai",
    "minRating": 4,
    "priceLevels": ["$", "$$"],
    "sort": "rating",
    "page": 1,
    "pageSize": 10
  }'
```

---

## Performance Testing

### Page Load Times

Using Chrome DevTools:

1. **Home Page**
   - Largest Contentful Paint: < 2.5s
   - First Input Delay: < 100ms
   - Cumulative Layout Shift: < 0.1

2. **Results Page**
   - Largest Contentful Paint: < 3s
   - Time to Interactive: < 4s

### Network Activity

1. Open DevTools > Network tab
2. Perform search
3. Verify:
   - [ ] API request completes in < 5s
   - [ ] Images load progressively
   - [ ] No failed requests (404/500)
   - [ ] Total bundle < 5MB

---

## Browser Compatibility

Test on:

- [ ] Chrome/Edge 90+ ✅
- [ ] Firefox 88+ ✅
- [ ] Safari 14+ ✅
- [ ] Chrome Mobile (Android) ✅
- [ ] Safari Mobile (iOS) ✅

---

## Accessibility Checklist

1. Keyboard Navigation
   - [ ] Tab through all controls
   - [ ] Focus is visible
   - [ ] No keyboard traps

2. Screen Reader
   - [ ] Use screen reader on results
   - [ ] Place names are announced
   - [ ] Buttons are labeled

3. Color Contrast
   - [ ] All text meets WCAG AA (4.5:1)
   - [ ] Use Lighthouse to verify

---

## Common Issues & Solutions

### Issue: "Cannot GET /api/places"
**Solution:** Backend not running. Check terminal 1.

### Issue: "API connection refused"
**Solution:** Check `NEXT_PUBLIC_API_BASE_URL` in `.env.local`

### Issue: "Gemini API error: 401"
**Solution:** Invalid API key. Check `GEMINI_API_KEY` in `API/.env`

### Issue: "Map not loading"
**Solution:** Check browser console for errors. May be CORS issue.

### Issue: "Places undefined"
**Solution:** API might be returning empty results. Check query parameters.

---

## Success Criteria

All scenarios should pass:

- [ ] Home page loads without errors
- [ ] Search returns results
- [ ] Results display with proper styling
- [ ] Filters are clickable
- [ ] Map view works
- [ ] Detail page accessible
- [ ] Mobile view is responsive
- [ ] No console errors logged
- [ ] Error handling works
- [ ] Page load time < 5s

---

## Deployment Checklist

Before going live:

- [ ] All environment variables set
- [ ] Database connected (if using MongoDB)
- [ ] API keys validated
- [ ] Build succeeds without warnings
- [ ] All tests pass
- [ ] Performance acceptable
- [ ] Error logging configured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Security headers set

---

**Happy testing! 🚀**
