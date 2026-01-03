# VIB3 Web App - Production Readiness TODO

**Generated:** 2026-01-02
**Last Updated:** 2026-01-02
**Goal:** Achieve feature parity with Flutter app and fix all broken functionality

---

## PRIORITY LEGEND
- 🟢 **EASY** (1-2 hours) - Quick fixes, enable existing code, minor additions
- 🟡 **MEDIUM** (4-8 hours) - New components, API integration, moderate complexity
- 🔴 **HARD** (1-3 days) - Complex features, external integrations, significant work
- ⚫ **VERY HARD** (3-7 days) - Major features, requires research/architecture

---

## PHASE 1: FIX BROKEN FEATURES (Critical)

### ✅ 1.1 Enable WebSocket for Real-Time Messaging - COMPLETED
**File:** `src/services/websocket.ts`
**Status:** WebSocket connection code enabled. Will attempt connection and fall back gracefully on error.

### ✅ 1.2 Enable Live Stream Discovery - COMPLETED
**File:** `src/services/api/live.ts`
**Status:** API calls enabled with graceful error handling if backend not ready.

### ✅ 1.3 Enable Friends Feed - COMPLETED
**File:** `src/services/api/feed.ts`
**Status:** Friends feed API call enabled with error handling.

---

## PHASE 2: COMPLETE PARTIAL FEATURES

### ✅ 2.1 Fix Camera Flash - COMPLETED
**File:** `src/hooks/useCamera.ts`, `src/components/camera/CameraTopControls.tsx`
**Status:** Flash/torch now properly detects device support and applies constraints. Shows disabled state when torch not available.

### 🟡 2.2 Fix Camera Speed Control
**File:** `src/hooks/useCamera.ts`
**Issue:** Speed UI exists but recording ignores it
**Fix:**
- [ ] Store speed setting
- [ ] Apply playbackRate to preview video
- [ ] For actual speed changes, need post-processing (see 3.1)
**Estimated:** 2 hours (UI only) or requires video processing

### 🟡 2.3 Add Video Stickers
**File:** `src/app/edit/page.tsx`
**Issue:** Shows "Coming soon!" at lines 108-113
**Fix:**
- [ ] Create sticker library (SVG/PNG assets)
- [ ] Create `StickerPicker` component
- [ ] Add sticker positioning/dragging on video
- [ ] Store sticker data with timestamps
**Estimated:** 6-8 hours

### 🔴 2.4 Fix Video Editor to Actually Edit Videos
**Files:** `src/hooks/useVideoEditor.ts`, `src/app/edit/page.tsx`
**Issue:** Editor saves settings but doesn't process video
**Fix Options:**

**Option A: Client-side (ffmpeg.wasm)**
- [ ] Install ffmpeg.wasm: `npm install @ffmpeg/ffmpeg @ffmpeg/core`
- [ ] Create `VideoProcessor` service
- [ ] Implement trim: `ffmpeg -ss {start} -to {end} -i input.mp4 output.mp4`
- [ ] Implement filters via ffmpeg filter graphs
- [ ] Show processing progress
- [ ] Handle large files (may need chunking)
**Estimated:** 2-3 days

**Option B: Server-side processing**
- [ ] Create `/api/videos/process` endpoint on backend
- [ ] Upload video + edit settings
- [ ] Process with server ffmpeg
- [ ] Return processed video URL
- [ ] Poll for completion
**Estimated:** 2-3 days (backend + frontend)

---

## PHASE 3: ADD MISSING CORE FEATURES

### 🟡 3.1 Sound/Music Library
**Flutter Reference:** `lib/screens/sound_screen.dart`, `lib/services/sound_search_service.dart`
**New Files Needed:**
- [ ] `src/app/sounds/page.tsx` - Sound browser
- [ ] `src/hooks/useSound.ts` - Sound selection hook
- [ ] `src/services/api/sounds.ts` - Sound API
- [ ] `src/components/audio/SoundPicker.tsx` - Sound picker modal
- [ ] `src/components/audio/AudioWaveform.tsx` - Waveform display
**Features:**
- [ ] Browse trending sounds
- [ ] Search sounds
- [ ] Preview sound
- [ ] Select sound for video
- [ ] Trim sound
- [ ] Adjust volume mix (original vs sound)
**Estimated:** 1-2 days

### 🟡 3.2 Remix (Duet) Feature
**Flutter Reference:** `lib/services/remix_service.dart`
**New Files Needed:**
- [ ] `src/app/remix/[videoId]/page.tsx` - Remix recording page
- [ ] `src/hooks/useRemix.ts` - Remix logic
- [ ] `src/components/remix/RemixLayout.tsx` - Side-by-side layout
**Features:**
- [ ] Load original video
- [ ] Record alongside original
- [ ] Split screen layout options
- [ ] Sync audio
- [ ] Combine videos (requires video processing)
**Estimated:** 2-3 days

### 🟡 3.3 Stitch Feature
**Flutter Reference:** `lib/screens/video_creator/`
**Features:**
- [ ] Select portion of original video (up to 5 seconds)
- [ ] Record continuation
- [ ] Combine clips
**Estimated:** 2 days

### 🟡 3.4 Echo (Response Videos)
**Flutter Reference:** `lib/services/echo_service.dart`
**Features:**
- [ ] View video responses to a video
- [ ] Create echo response
- [ ] Link echo to original
**Estimated:** 1 day

### 🔴 3.5 Push Notifications
**New Files Needed:**
- [ ] `public/sw.js` - Service worker
- [ ] `src/services/pushNotifications.ts` - Push service
- [ ] `src/hooks/usePushNotifications.ts` - Permission handling
**Features:**
- [ ] Request notification permission
- [ ] Register service worker
- [ ] Subscribe to push via backend
- [ ] Handle notification clicks
- [ ] Show notification badges
**Estimated:** 1-2 days

### 🔴 3.6 Video Download
**New Files Needed:**
- [ ] `src/services/videoDownload.ts`
- [ ] `src/components/video/DownloadButton.tsx`
**Features:**
- [ ] Download button on videos
- [ ] Check if download allowed (user setting)
- [ ] Fetch video blob
- [ ] Trigger browser download
- [ ] Show download progress
**Estimated:** 4-6 hours

---

## PHASE 4: PAYMENT & MONETIZATION

### 🔴 4.1 Stripe Integration for Coins
**File:** `src/app/coins/page.tsx` (currently UI only)
**New Files:**
- [ ] `src/services/api/payments.ts` - Extend existing
- [ ] `src/hooks/usePayment.ts`
**Features:**
- [ ] Initialize Stripe.js
- [ ] Create payment intent via backend
- [ ] Handle card input (Stripe Elements)
- [ ] Process payment
- [ ] Update coin balance
- [ ] Show purchase history
**Estimated:** 2-3 days

### 🔴 4.2 Creator Subscriptions
**Flutter Reference:** `lib/screens/settings/creator_subscription_screen.dart`
**Features:**
- [ ] Subscribe to creator for monthly fee
- [ ] Exclusive content access
- [ ] Subscriber badge
- [ ] Subscription management
**Estimated:** 2-3 days

### ⚫ 4.3 Stripe Connect for Creators
**Flutter Reference:** `lib/services/stripe_connect_service.dart`
**Features:**
- [ ] Creator onboarding flow
- [ ] Bank account connection
- [ ] Payout dashboard
- [ ] Earnings reports
**Estimated:** 3-5 days

---

## PHASE 5: ADVANCED FEATURES

### 🔴 5.1 DM Video Calls
**Flutter Reference:** `lib/screens/dm_video_call_screen.dart`, `lib/services/agora_service.dart`
**Options:**
- Use existing LiveKit (already integrated for live streams)
- Or integrate Agora (what Flutter uses)
**Features:**
- [ ] Call button in DM chat
- [ ] Incoming call notification
- [ ] Video/audio call UI
- [ ] Mute/camera toggle
- [ ] End call
**Estimated:** 2-3 days

### 🔴 5.2 Offline Mode / Video Caching
**New Files:**
- [ ] `src/services/offlineStorage.ts`
- [ ] `public/sw.js` - Service worker for caching
**Features:**
- [ ] Cache watched videos
- [ ] Save for offline button
- [ ] Detect offline state
- [ ] Serve cached content
- [ ] Sync when back online
**Estimated:** 2-3 days

### 🔴 5.3 Playlists
**Flutter Reference:** `lib/screens/playlists_screen.dart`, `lib/screens/playlist_detail_screen.dart`
**Features:**
- [ ] Create playlist
- [ ] Add videos to playlist
- [ ] View playlist
- [ ] Edit/delete playlist
- [ ] Share playlist
**Estimated:** 1-2 days

### 🟡 5.4 Message Requests
**Flutter Reference:** `lib/screens/message_requests_screen.dart`
**Features:**
- [ ] Separate tab for message requests
- [ ] Accept/decline requests
- [ ] Privacy settings for who can message
**Estimated:** 4-6 hours

### 🟡 5.5 Verification Request
**Flutter Reference:** `lib/screens/verification_request_screen.dart`
**Features:**
- [ ] Verification request form
- [ ] Document upload
- [ ] Status tracking
**Estimated:** 4-6 hours

### 🟡 5.6 Achievements System
**Flutter Reference:** `lib/services/achievement_service.dart`, `lib/screens/achievements_screen.dart`
**Features:**
- [ ] Achievement list display
- [ ] Progress tracking
- [ ] Unlock notifications
- [ ] Badge display on profile
**Estimated:** 1 day

### 🟡 5.7 QR Scanner
**New Files:**
- [ ] `src/app/scan/page.tsx`
- [ ] `src/hooks/useQRScanner.ts`
**Features:**
- [ ] Camera-based QR scanning
- [ ] Handle VIB3 QR codes (profiles, videos)
- [ ] Navigate to scanned content
**Estimated:** 4-6 hours

---

## PHASE 6: ENHANCED VIDEO CREATION

### ⚫ 6.1 Real-time Video Filters (WebGL)
**Flutter Reference:** `lib/services/real_time_filter_processor.dart`
**Current:** CSS filters only (limited)
**Upgrade:**
- [ ] Implement WebGL shader-based filters
- [ ] Use library like `gl-react` or custom shaders
- [ ] Beauty/smooth skin filter
- [ ] Color grading
- [ ] Vignette, blur, etc.
**Estimated:** 3-5 days

### ⚫ 6.2 AR Effects
**Flutter Reference:** `lib/screens/ar_recording_screen.dart`
**Options:**
- TensorFlow.js for face detection
- MediaPipe for face mesh
- Third-party SDK (Banuba, DeepAR)
**Features:**
- [ ] Face detection
- [ ] Overlay effects (glasses, hats, etc.)
- [ ] Background effects
- [ ] Face distortion
**Estimated:** 5-7 days

### ⚫ 6.3 Green Screen
**Flutter Reference:** `lib/services/green_screen_processor.dart`
**Features:**
- [ ] Chroma key detection
- [ ] Background replacement
- [ ] Real-time processing
**Estimated:** 3-5 days

### ⚫ 6.4 Voice Effects
**Flutter Reference:** `lib/services/voice_effects_processor.dart`
**Features:**
- [ ] Pitch shifting
- [ ] Voice effects (chipmunk, deep, echo)
- [ ] Real-time audio processing
**Estimated:** 2-3 days

---

## PHASE 7: MINOR FEATURES & POLISH

### ✅ 7.1 Tagged Videos Screen - COMPLETED
**File:** `src/app/tagged/page.tsx`
**Status:** Full page created with video grid, loading states, and empty state.

### 🟢 7.2 Vibe Meter Screen
**Flutter Reference:** `lib/screens/vibe_meter_screen.dart`
- [ ] Display user's vibe score
- [ ] Vibe history
**Estimated:** 2-3 hours

### ✅ 7.3 Blocked Users Management - COMPLETED
**File:** `src/app/settings/blocked/page.tsx`
**Status:** Full page created with blocked user list, unblock functionality, and info section.

### 🟡 7.4 Parental Controls
**Flutter Reference:** `lib/services/minor_privacy_service.dart`
- [ ] Age-restricted content filtering
- [ ] Screen time limits
- [ ] Restricted mode
**Estimated:** 1 day

### 🟡 7.5 Data Usage Settings
**Flutter Reference:** `lib/screens/settings/data_usage_screen.dart`
- [ ] Video quality on mobile data
- [ ] Autoplay settings
- [ ] Data saver mode
**Estimated:** 4-6 hours

### 🟡 7.6 Accessibility Settings
**Flutter Reference:** `lib/screens/settings/accessibility_screen.dart`
- [ ] Reduced motion
- [ ] High contrast
- [ ] Screen reader improvements
**Estimated:** 4-6 hours

---

## SUMMARY BY EFFORT

### 🟢 EASY (Can do in 1-2 hours each)
1. ~~Enable WebSocket~~ ✅ DONE
2. ~~Enable Live Discovery~~ ✅ DONE
3. ~~Enable Friends Feed~~ ✅ DONE
4. ~~Tagged Videos Screen~~ ✅ DONE
5. Vibe Meter Screen
6. ~~Blocked Users Management~~ ✅ DONE

### 🟡 MEDIUM (4-8 hours each)
7. ~~Fix Camera Flash~~ ✅ DONE
8. Fix Camera Speed
9. Video Stickers
10. Video Download
11. Sound/Music Library
12. Echo Feature
13. Message Requests
14. Verification Request
15. Achievements System
16. QR Scanner
17. Parental Controls
18. Data Usage Settings
19. Accessibility Settings

### 🔴 HARD (1-3 days each)
20. Fix Video Editor (ffmpeg)
21. Push Notifications
22. Remix/Duet Feature
23. Stitch Feature
24. Stripe Coins Integration
25. Creator Subscriptions
26. DM Video Calls
27. Offline Mode
28. Playlists

### ⚫ VERY HARD (3-7 days each)
29. Stripe Connect for Creators
30. Real-time WebGL Filters
31. AR Effects
32. Green Screen
33. Voice Effects

---

## RECOMMENDED ORDER OF IMPLEMENTATION

### Week 1: Fix Broken Features - ✅ MOSTLY COMPLETE
1. ~~Enable WebSocket (2h)~~ ✅ DONE
2. ~~Enable Live Discovery (1h)~~ ✅ DONE
3. ~~Enable Friends Feed (1h)~~ ✅ DONE
4. ~~Fix Camera Flash (2h)~~ ✅ DONE
5. Video Download (6h)

### Week 2: Core Missing Features
6. Sound/Music Library (2d)
7. Push Notifications (2d)
8. Playlists (1d)

### Week 3: Video Processing
9. Fix Video Editor with ffmpeg.wasm (3d)
10. Video Stickers (1d)

### Week 4: Monetization
11. Stripe Coins Integration (3d)
12. Creator Subscriptions (2d)

### Week 5: Social Features
13. Remix/Duet (3d)
14. Stitch (2d)

### Week 6: Advanced
15. DM Video Calls (3d)
16. Offline Mode (2d)

### Weeks 7-8: Polish
17. All remaining 🟢 and 🟡 items

### Weeks 9-10: Advanced Video
18. WebGL Filters
19. AR Effects
20. Green Screen
21. Voice Effects

---

## TOTAL ESTIMATED EFFORT

| Priority | Items | Time |
|----------|-------|------|
| 🟢 Easy | 6 | ~10 hours |
| 🟡 Medium | 13 | ~80 hours |
| 🔴 Hard | 9 | ~160 hours |
| ⚫ Very Hard | 5 | ~200 hours |
| **TOTAL** | **33** | **~450 hours** |

At 40 hours/week with 1 developer: **~11-12 weeks**
At 40 hours/week with 2 developers: **~6 weeks**

---

## FILES TO TRACK

When implementing features, update this checklist:

```
[ ] Phase 1 Complete (Fix Broken)
[ ] Phase 2 Complete (Partial Features)
[ ] Phase 3 Complete (Core Missing)
[ ] Phase 4 Complete (Payments)
[ ] Phase 5 Complete (Advanced)
[ ] Phase 6 Complete (Video Creation)
[ ] Phase 7 Complete (Polish)
```

---

*Last updated: 2026-01-02*
