# VIB3 Web App - Development Guide

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
