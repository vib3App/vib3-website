# VIB3: Flutter App vs Web App - Feature Gap Analysis

> Generated: 2026-02-15
> Purpose: Track features present in Flutter mobile app but missing/incomplete in web app

---

## TIER 1 - Major Features (Core user experiences)

### 1. Stories (Instagram-like)
- **Flutter:** Full implementation - 24-hour expiry stories, create photo/video stories, progress bar viewer, auto-advance, swipe to reply, emoji reactions, story groups by user, view counts, viewer list
- **Web:** Completely missing - No `/stories` route, no story creation, no story viewing
- **Status:** NOT STARTED

### 2. Location Map & Social Location
- **Flutter:** Comprehensive Google Maps integration with real-time friend location pins, Location Circles (friend groups), Meetups (events with location/time), Saved Places (Google Places API, OSM, Ticketmaster, Yelp), Geofencing with alerts, Ghost Zones, Proximity alerts, Background location tracking, Activity status indicators, Marker customization
- **Web:** Completely missing - No map page, no circles, no meetups, no places
- **Status:** NOT STARTED

### 3. Gauntlets (Tournament System)
- **Flutter:** Full tournament system with bracket visualization, round-based matchups, live battles (split-screen), audience voting, auto-advancement, champion badges, tournament history, replay battles
- **Web:** Has `/challenges` page but no gauntlet/tournament UI - missing bracket visualization, live battle mechanics, team management
- **Status:** NOT STARTED

### 4. Live Battles (1v1)
- **Flutter:** Split-screen live battles with real-time scoring, audience voting/participation, battle themes/effects, victory animations, rematch without disconnecting viewers, leaderboard
- **Web:** Has live streaming but no battle functionality - no split-screen, no voting, no scoring
- **Status:** NOT STARTED

### 5. Echo (Duet - Side-by-Side Recording)
- **Flutter:** Full implementation - record alongside another user's video in split-screen, layout options (left/right, top/bottom), camera switching, audio sync, FFmpeg-based rendering
- **Web:** Has `/echo` route but it's essentially just a remix alias - no actual side-by-side recording
- **Status:** NOT STARTED

### 6. Shopping / Product Commerce
- **Flutter:** Product catalog with search, categories (Electronics, Fitness, Beauty, Creator Gear, Fashion), affiliate links, creator commissions (8-12%), shopping overlay on videos
- **Web:** `/shop` page only has virtual gifts - no product commerce, no affiliate system, no product overlay on videos
- **Status:** NOT STARTED

---

## TIER 2 - Important Features (Differentiators)

### 7. Advanced Video Editor (FFmpeg-powered)
- **Flutter extras missing from web:** Speed ramping, beat detection/sync, custom transitions (3D picker, 30+ options), reverse video, green screen/chroma key, voice-over narration, AI auto-edit (beat sync, scene cuts, transitions, effect suggestions), templates with slot-based editing, audio extraction & multi-track mixing, 20+ text animation templates
- **Web:** Has basic trim, 9 filters, text overlay, sticker overlay, audio controls
- **Status:** NOT STARTED

### 8. Voice Messages in DMs
- **Flutter:** Record voice messages in DMs, waveform visualization during playback, voice transcription (speech-to-text)
- **Web:** Text-only messaging - no voice recording, no waveform playback
- **Status:** NOT STARTED

### 9. AR Filters (Snap Camera Kit)
- **Flutter:** Snap Camera Kit integration with 20+ lens groups, ML Kit face detection, real-time lens preview, beauty mode, background replacement (green screen), custom filter chaining
- **Web:** Has placeholder `useAR()` hook but no actual camera kit integration - just basic WebGL color overlay
- **Status:** NOT STARTED

### 10. Offline Capabilities
- **Flutter:** Video downloads for offline playback, local draft storage (survives crash/restart), offline message queuing with auto-send on reconnect, TUS upload state recovery, background sync via WorkManager
- **Web:** Has download UI and service worker for PWA but limited offline support - no offline video playback, no message queuing, no draft recovery
- **Status:** NOT STARTED

### 11. QR Code System (Full)
- **Flutter:** Generate QR codes for profiles, videos, sounds, challenges, gauntlets + dedicated QR scanner screen with deep linking
- **Web:** Has `/scan` route but QR generation is missing/limited for most content types
- **Status:** NOT STARTED

---

## TIER 3 - Enhancement Features

### 12. Onboarding / First-Run Experience
- **Flutter:** Animated onboarding flow, swipe tutorial overlay for new users
- **Web:** No onboarding flow - drops straight to landing/login
- **Status:** NOT STARTED

### 13. Playlists (Full UI)
- **Flutter:** Full playlist creation, drag-to-reorder, auto-play, cover image, share playlists
- **Web:** Has playlist API service but limited playlist management UI
- **Status:** NOT STARTED

### 14. Video Call Enhancements
- **Flutter:** CallKit integration (iOS native call UI), VoIP push notifications, incoming call overlay, call in background
- **Web:** Basic WebRTC calls but no native call notification integration, no incoming call overlay
- **Status:** NOT STARTED

### 15. Double-Tap Like Animation
- **Flutter:** TikTok-style double-tap on video shows large heart animation
- **Web:** Missing - only has like button click
- **Status:** NOT STARTED

### 16. Swipe Gestures on Feed
- **Flutter:** Full swipe gesture detector (up/down for next/prev video, left swipe for user profile, right swipe for camera)
- **Web:** Has keyboard shortcuts and scroll-snap but no swipe gesture navigation
- **Status:** NOT STARTED

### 17. Gift Animations (Rich)
- **Flutter:** 50+ animated gift options during live streams with flying/explosion animations, real-time gift notifications
- **Web:** Has gift sending but limited/no gift animations
- **Status:** NOT STARTED

### 18. Creator Fund Dashboard (Enhanced)
- **Flutter:** Detailed creator fund with eligibility requirements, tier progression visualization, minimum thresholds, detailed payout management
- **Web:** Has basic `/creator-fund` page but less detailed tier/eligibility UI
- **Status:** NOT STARTED

### 19. Data Usage / Cache Management
- **Flutter:** Cellular vs WiFi data usage stats, WiFi-only download option, cache size with clear button, storage usage display, auto-download settings
- **Web:** Has `/settings/data-usage` page but browser-based caching is limited compared to native
- **Status:** NOT STARTED

### 20. Advanced Notification Controls
- **Flutter:** Per-type push notification toggles (12+ types), quiet hours scheduling, DND mode, sound/vibration per notification type, notification grouping
- **Web:** Has notification settings but fewer granular controls
- **Status:** NOT STARTED

### 21. Background Upload Service
- **Flutter:** WorkManager-based background uploads that continue when app minimized/closed, automatic retry with exponential backoff
- **Web:** Uploads stop if tab is closed - service worker has limited upload capability
- **Status:** NOT STARTED

### 22. Snap Camera Kit / Social Login
- **Flutter:** Snapchat OAuth login, Snap Camera Kit lens integration
- **Web:** No Snapchat login - only email/password auth in web
- **Status:** NOT STARTED

### 23. Advanced Privacy Controls
- **Flutter:** Anonymous mode, follow request approval, hide from recommendations, content classification per-user, per-circle location privacy
- **Web:** Has basic privacy settings but missing anonymous mode, follow approvals, per-circle location privacy
- **Status:** NOT STARTED

---

## Summary Stats

| Category | Flutter App | Web App | Gap |
|----------|-----------|---------|-----|
| Screens/Pages | 90+ | 80+ | ~10 missing |
| Services | 133+ | 35+ | Major gap (many native-only) |
| Data Models | 48 | ~30 | ~18 missing models |
| Features (unique) | 25+ | ~15 | ~10 major features missing |

---

## Build Priority

**Phase 1 (highest user impact):**
1. Stories
2. Echo/Duet (real side-by-side recording)
3. Live Battles
4. Gauntlets/Tournaments
5. Voice Messages in DMs

**Phase 2 (platform differentiation):**
6. Location Map with Circles
7. Shopping/Product Integration
8. Advanced Video Editor (speed ramp, transitions, AI auto-edit)
9. AR Filters
10. Double-tap like + swipe gestures

**Phase 3 (polish):**
11. Rich gift animations
12. QR code generation
13. Onboarding flow
14. Offline capabilities
15. Playlist management UI
