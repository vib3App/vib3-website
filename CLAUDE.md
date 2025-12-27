# VIB3 Web App - Development Guide

---

## CRITICAL EXPECTATIONS (READ FIRST)

**These rules are non-negotiable:**

### 1. One Step at a Time
- Complete ONE feature/page fully before moving to the next
- "Complete" means 100% functional, tested, and verified
- Do NOT move on until current work is confirmed working end-to-end

### 2. No Fake "Done"
- Never say something is "done" or "complete" if it's just code written
- Code written ≠ functional
- Must actually TEST and VERIFY before claiming completion
- If you can't test something, say so explicitly

### 3. No God Objects
- Every file under 300 lines (target under 200)
- Single responsibility per file
- Changing the landing page must NOT affect the feed page
- Changing auth must NOT break video player
- If components are coupled, they're wrong

### 4. Honest Status Updates
- Be direct about what works and what doesn't
- List specific things tested vs untested
- Don't oversell progress

### 5. Step-by-Step Verification
Before marking ANY feature complete:
- [ ] Code written
- [ ] Code compiles/builds
- [ ] Manually tested in browser
- [ ] All interactive elements work
- [ ] No console errors
- [ ] Responsive on mobile/desktop
- [ ] Documented what was done

---

## Project Overview
VIB3 Web is a standalone Next.js web application that provides a browser-based experience for the VIB3 social video platform. It shares the same backend API as the Flutter mobile app but is optimized for web browsers.

## Tech Stack
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Video Playback**: HLS.js for adaptive streaming
- **State Management**: Zustand (global state) + React Query (server state)
- **API Layer**: Axios with interceptors
- **Deployment**: DigitalOcean App Platform

## Architecture Principles

### NO GOD OBJECTS
This project MUST avoid god objects/classes. Every file should:
- Have a single, clear responsibility
- Be under 300 lines (target under 200)
- Not mix concerns (UI, business logic, API calls)

### Clean Architecture Layers
```
src/
├── app/                    # Next.js App Router pages
├── components/             # UI Components (presentation only)
│   ├── ui/                 # Generic reusable UI elements
│   ├── video/              # Video-specific components
│   ├── feed/               # Feed-related components
│   └── layout/             # Layout components
├── features/               # Feature modules (self-contained)
│   ├── auth/               # Authentication feature
│   ├── video-player/       # Video playback feature
│   ├── feed/               # Video feed feature
│   └── profile/            # User profile feature
├── hooks/                  # Custom React hooks
├── services/               # API service layer
│   ├── api/                # API client and endpoints
│   └── video/              # Video-related services
├── stores/                 # Zustand stores
├── types/                  # TypeScript type definitions
├── utils/                  # Pure utility functions
└── config/                 # Configuration
```

### Feature Module Structure
Each feature should be self-contained:
```
features/video-player/
├── components/             # Feature-specific components
├── hooks/                  # Feature-specific hooks
├── types.ts                # Feature types
├── constants.ts            # Feature constants
└── index.ts                # Public exports
```

## Key Decisions

### Video Playback
- Use HLS.js for adaptive bitrate streaming
- Native HTML5 video element (no heavy player libraries)
- Separate controller logic from UI

### State Management
- **Server State**: React Query for API data (caching, refetching)
- **Client State**: Zustand for UI state (minimal global state)
- **Component State**: useState for local UI state

### API Integration
- Backend URL: https://api.vib3app.net (production)
- All API calls go through services layer
- Error handling in service layer, not components

## Commands
```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
```

## Backend API
The web app connects to the same backend as the mobile app:
- Base URL: https://api.vib3app.net
- Auth: JWT tokens via Authorization header
- Video CDN: Bunny.net via pull zone

## Development Notes
All development notes and decisions are tracked in `DEVELOPMENT_NOTES.md`.
