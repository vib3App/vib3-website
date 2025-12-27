# VIB3 Web Development Notes

## Phase 1: Project Setup (Dec 27, 2025) - COMPLETED

### Status: Build passing, core architecture established

### Decisions Made

**Why Next.js + React instead of Flutter Web?**
- Flutter web has poor video playback performance (relies on embedded HTML video)
- Flutter web bundle sizes are 2-4MB minimum
- SEO limitations with Flutter
- Better control over video player with native HTML5 + HLS.js

**Why HLS.js specifically?**
- Industry standard for adaptive streaming on web
- Bunny.net outputs HLS format
- Supports quality switching, ABR
- Lightweight (~50KB gzipped)
- Works on all modern browsers

**State Management Choice:**
- Zustand over Redux: Less boilerplate, simpler mental model
- React Query for server state: Automatic caching, background refetching
- This combination avoids the "one giant store" anti-pattern

### Architecture Rules Established
1. No file over 300 lines
2. Components only handle UI rendering
3. Business logic lives in hooks or services
4. API calls only in services layer
5. Each feature is self-contained module

### Packages Installed
- `hls.js` - HLS video playback
- `axios` - HTTP client
- `zustand` - Client state management
- `@tanstack/react-query` - Server state management
- `swr` - Alternative data fetching (for specific use cases)

---

## Phase 2: Core Architecture (Dec 27, 2025) - COMPLETED

### Completed
- [x] Set up folder structure (features, services, stores, hooks, types, utils, config)
- [x] Create API client with interceptors (src/services/api/client.ts)
- [x] Set up Zustand stores (authStore.ts, uiStore.ts)
- [x] Set up React Query provider (src/app/providers.tsx)
- [x] Create base video player component with HLS.js

### Video Player Architecture
The video player will be split into:
1. `VideoElement` - Pure HTML5 video wrapper
2. `HLSController` - HLS.js integration logic
3. `VideoControls` - UI controls
4. `useVideoPlayer` - Hook combining all logic
5. `VideoPlayer` - Main component composing above

This prevents a "god player" component.

---

## Phase 3: Features (TODO)

### Priority Order
1. Video feed with infinite scroll
2. Single video view
3. Authentication (login/signup)
4. User profile view
5. Video upload (later phase)
6. Live streaming view (later phase)

---

## Known Issues & Workarounds

### SSL Certificate Issues on macOS
When running npm commands, use:
```bash
SSL_CERT_FILE=/etc/ssl/cert.pem npm install <package>
```

---

## API Endpoints Reference

Base URL: `https://api.vib3app.net`

### Public Endpoints
- `GET /api/discover/for-you` - For You feed
- `GET /api/videos/:id` - Single video
- `GET /api/users/:id` - User profile

### Auth Required
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/user/profile` - Current user
- `POST /api/videos/:id/like` - Like video
- `POST /api/videos/:id/view` - Record view

---

## Performance Targets

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Video start playback: < 2s
- Bundle size: < 500KB (gzipped, excluding HLS.js)
